import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createTranscriptionHandler,MAX_AUDIO_BYTES} from '../server/transcription.ts';
const settings={key:'test-provider-key',accessCode:'test-pilot-access-code-at-least-24',origin:'https://example.test'};
const wav=Buffer.from('RIFF0000WAVEaudio');
const headers={'origin':settings.origin,'authorization':'Bearer '+settings.accessCode,'content-type':'audio/wav','x-transcription-consent':'yes'};
const request=(body=wav,extra={},method='POST')=>new Request('https://example.test/api/transcribe',{method,headers:{...headers,...extra},...(method==='POST'?{body}:{} )});
const success=()=>Response.json({results:{channels:[{alternatives:[{transcript:'My original answer.'}]}]}});
test('unconfigured endpoint and invalid auth/origin/consent never contact provider',async()=>{
 let calls=0;const handle=createTranscriptionHandler(async()=>{calls++;return success()});
 assert.equal((await handle(request(),{})).status,503);
 assert.equal((await handle(request(),{...settings,accessCode:'short'})).status,503);
 assert.equal((await handle(request(wav,{authorization:'Bearer incorrect'}),settings)).status,401);
 assert.equal((await handle(request(wav,{origin:'https://untrusted.test'}),settings)).status,403);
 assert.equal((await handle(request(wav,{'x-transcription-consent':'no'}),settings)).status,400);
 assert.equal(calls,0);
});
test('accepts only supported audio and bounds both declared and streamed body sizes',async()=>{
 let calls=0;const handle=createTranscriptionHandler(async()=>{calls++;return success()});
 assert.equal((await handle(request(wav,{'content-type':'application/json'}),settings)).status,415);
 assert.equal((await handle(request('https://attacker.test/file.wav'),settings)).status,415);
 assert.equal((await handle(request(wav,{'content-length':String(MAX_AUDIO_BYTES+1)}),settings)).status,413);
 assert.equal((await handle(request(new Uint8Array(MAX_AUDIO_BYTES+1)),settings)).status,413);
 assert.equal(calls,0);
});
test('forwards only raw selected audio with fixed model and server-only auth',async()=>{
 const handle=createTranscriptionHandler(async(url,options)=>{
  assert.equal(url,'https://api.deepgram.com/v1/listen?model=nova-3&language=en&smart_format=true&mip_opt_out=true');
  assert.equal(options.headers.Authorization,'Token test-provider-key');
  assert.deepEqual(new Uint8Array(options.body),new Uint8Array(wav));return success();
 });
 const response=await handle(request(),settings);assert.equal(response.status,200);assert.deepEqual(await response.json(),{transcript:'My original answer.'});assert.equal(response.headers.get('cache-control'),'no-store');
});
test('provider failure, malformed output and empty speech do not expose provider data',async()=>{
 for(const [provider,status] of [[()=>new Response('secret provider debug',{status:401}),502],[()=>Response.json({unexpected:true}),422],[()=>new Response('not-json'),502],[()=>Promise.reject(new Error('secret provider exception')),502]]){
  const r=await createTranscriptionHandler(provider)(request(),settings);assert.equal(r.status,status);assert.doesNotMatch(await r.text(),/secret provider/);
 }
});
test('rate and concurrency budgets bound private pilot requests and release failed slots',async()=>{
 const handle=createTranscriptionHandler(async()=>success());
 for(let i=0;i<5;i++)assert.equal((await handle(request(),settings)).status,200);
 assert.equal((await handle(request(),settings)).status,429);
 const resolves=[];const concurrent=createTranscriptionHandler(()=>new Promise(resolve=>resolves.push(resolve)));
 const a=concurrent(request(),settings),b=concurrent(request(),settings);
 await new Promise(resolve=>setImmediate(resolve));assert.equal((await concurrent(request(),settings)).status,429);
 resolves.splice(0).forEach(resolve=>resolve(new Response('bad',{status:503})));await Promise.all([a,b]);
 const c=concurrent(request(),settings);await new Promise(resolve=>setImmediate(resolve));resolves.splice(0).forEach(resolve=>resolve(success()));assert.equal((await c).status,200);
});
test('canceled upload does not contact provider',async()=>{
 let calls=0;const handle=createTranscriptionHandler(async()=>{calls++;return success()});
 const abort=new AbortController();abort.abort();const r=new Request('https://example.test/api/transcribe',{method:'POST',headers,body:wav,signal:abort.signal});
 assert.equal((await handle(r,settings)).status,502);assert.equal(calls,0);
});
test('bounds upstream output and releases slots after a mid-request cancellation',async()=>{
 const oversized=createTranscriptionHandler(async()=>new Response(new Uint8Array(1_000_001)));
 assert.equal((await oversized(request(),settings)).status,413);
 let calls=0;const handle=createTranscriptionHandler(async(_url,options)=>{
  calls++;if(calls>1)return success();
  return new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new Error('canceled')),{once:true}));
 });
 const controller=new AbortController();const req=new Request('https://example.test/api/transcribe',{method:'POST',headers,body:wav,signal:controller.signal});
 const pending=handle(req,settings);await new Promise(resolve=>setImmediate(resolve));controller.abort();assert.equal((await pending).status,502);
 assert.equal((await handle(request(),settings)).status,200);
});
test('audio signature checks use byte offsets even when WAV length contains UTF-8-looking bytes',async()=>{
 const audio=Buffer.concat([Buffer.from('RIFF'),Buffer.from([0xc2,0xa9,0,0]),Buffer.from('WAVEaudio')]);
 const handle=createTranscriptionHandler(async()=>success());
 assert.equal((await handle(request(audio),settings)).status,200);
});
