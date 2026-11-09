import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateElevenLabsAudio} from '../lib/elevenlabs-audio.ts';
import {ELEVENLABS_LANGUAGES,ELEVENLABS_VOICES,ELEVENLABS_SAMPLES,elevenLabsBrief} from '../lib/elevenlabs-voices.ts';
const input=()=>({text:'Sanibonani. Yonke indaba ibalulekile.',language:'zu',voiceId:ELEVENLABS_VOICES[0].id,key:'offline-test-key',consent:true,signal:new AbortController().signal});
test('rights, supported selections and bounds block requests before quota can be used',async()=>{
 let calls=0;const request=async()=>{calls++;throw Error('must not send');};
 for(const patch of [{consent:false},{language:'xh'},{voiceId:'unknown'},{key:' '},{text:' '},{text:'a'.repeat(5001)}])await assert.rejects(generateElevenLabsAudio({...input(),...patch,request}));
 const signal=AbortSignal.abort();await assert.rejects(generateElevenLabsAudio({...input(),signal,request}),/abort/i);assert.equal(calls,0);
});
test('chosen language and original text use one provider-only request; key is header-only',async()=>{
 const calls=[];const request=async(url,options)=>{calls.push({url,options});return new Response(new Uint8Array([73,68,51]),{headers:{'content-type':'audio/mpeg'}});};
 const i=input(),audio=await generateElevenLabsAudio({...i,request});assert.equal(calls.length,1);assert.equal(audio.type,'audio/mpeg');assert.equal(audio.size,3);
 const {url,options}=calls[0];assert.equal(new URL(url).origin,'https://api.elevenlabs.io');assert.ok(!url.includes(i.key));assert.ok(!options.body.includes(i.key));assert.equal(options.headers['xi-api-key'],i.key);
 const body=JSON.parse(options.body);assert.equal(body.text,i.text);assert.equal(body.language_code,'zu');assert.equal(body.model_id,'eleven_v4');assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');assert.equal(options.cache,'no-store');
});
test('provider errors are not exposed or automatically retried',async()=>{
 for(const status of [401,403,429,500]){let calls=0;await assert.rejects(generateElevenLabsAudio({...input(),request:async()=>{calls++;return new Response('secret provider diagnostic',{status});}}),error=>!error.message.includes('secret provider diagnostic'));assert.equal(calls,1);}
});
test('invalid or empty provider bodies cannot become recordings',async()=>{
 for(const response of [new Response('{}',{headers:{'content-type':'application/json'}}),new Response(new Uint8Array(),{headers:{'content-type':'audio/mpeg'}})])await assert.rejects(generateElevenLabsAudio({...input(),request:async()=>response}));
});
test('oversized and cancelled streams stop without exposing partial audio',async()=>{
 let cancelled=false;const stream=new ReadableStream({pull(c){c.enqueue(new Uint8Array(4_000_000));},cancel(){cancelled=true;}});
 await assert.rejects(generateElevenLabsAudio({...input(),request:async()=>new Response(stream,{headers:{'content-type':'audio/mpeg'}})}),/12 MB/);assert.equal(cancelled,true);
 const controller=new AbortController();let reading;const ready=new Promise(resolve=>reading=resolve);
 const pending=new ReadableStream({pull(){reading();}});const result=generateElevenLabsAudio({...input(),signal:controller.signal,request:async()=>new Response(pending,{headers:{'content-type':'audio/mpeg'}})});
 await ready;controller.abort();await assert.rejects(result,/abort/i);
});
test('sample catalog and production briefs identify the correct language and voice',()=>{
 assert.equal(new Set(ELEVENLABS_LANGUAGES.map(l=>l.code)).size,16);assert.equal(Object.keys(ELEVENLABS_SAMPLES).length,11);
 for(const code of ['af','zu'])assert.ok(ELEVENLABS_LANGUAGES.some(l=>l.code===code));
 for(const [code,sample] of Object.entries(ELEVENLABS_SAMPLES)){assert.ok(ELEVENLABS_LANGUAGES.some(l=>l.code===code));assert.ok(ELEVENLABS_VOICES.some(v=>v.name===sample.voice));assert.equal(sample.file,code+'.mp3');}
 const brief=elevenLabsBrief('zu',ELEVENLABS_VOICES[0].id,'My story','Original text');assert.match(brief,/isiZulu/);assert.match(brief,/Sarah/);assert.match(brief,/Original text/);assert.throws(()=>elevenLabsBrief('xh',ELEVENLABS_VOICES[0].id,'Title','Text'));
});
