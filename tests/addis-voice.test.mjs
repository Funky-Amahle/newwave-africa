import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createAddisVoiceHandler,ADDIS_MAX_TEXT} from '../server/addis-voice.ts';
const settings={key:'test-provider-key',accessCode:'addis-pilot-code-at-least-24-characters',origin:'https://newwave.example'};
const validHeaders={'origin':settings.origin,'authorization':'Bearer '+settings.accessCode,'content-type':'application/json'};
const catalog={data:{voices:[{id:'sw-rashid',name:'Rashid',style:'Narration',language:'sw',is_available:true},{id:'sw-old',name:'Old',language:'sw',is_available:false},{id:'am-hamen',name:'Hamen',language:'am',is_available:true}]}};
const estimate={data:{estimated_cost:1.25,currency:'ETB',can_generate:true}};
const generate={data:{id:'clip_123',audio_url:'https://cdn.addisassistant.com/clip/123.mp3'}};
const req=(body,headers={})=>new Request('https://newwave.example/api/addis-voice',{method:'POST',headers:{...validHeaders,...headers},body:JSON.stringify(body)});
const input={action:'generate',language:'sw',voiceId:'sw-rashid',text:'Habari kutoka kwetu',consent:true,requestId:'generated-uuid-0001'};
test('missing configuration, unauthorized origin, code or consent never contacts Addis',async()=>{
 let calls=0;const handle=createAddisVoiceHandler(async()=>{calls++;return Response.json(catalog);});
 assert.equal((await handle(req({action:'voices',language:'sw'}),{})).status,503);
 assert.equal((await handle(req({action:'voices',language:'sw'},{origin:'https://bad.example'}),settings)).status,403);
 assert.equal((await handle(req({action:'voices',language:'sw'},{authorization:'Bearer wrong'}),settings)).status,401);
 assert.equal((await handle(req({...input,consent:false}),settings)).status,400);
 assert.equal((await handle(req({...input,language:'xx'}),settings)).status,400);
 assert.equal((await handle(req({...input,text:'x'.repeat(ADDIS_MAX_TEXT+1)}),settings)).status,400);
 assert.equal((await handle(req({...input,requestId:'bad'}),settings)).status,400);
 assert.equal(calls,0);
});
test('GET exposes only availability; no credential or model details',async()=>{
 const handle=createAddisVoiceHandler();
 const res=await handle(new Request('https://newwave.example/api/addis-voice'),settings);
 assert.deepEqual(await res.json(),{available:true});
 assert.equal(res.headers.get('cache-control'),'no-store');
});
test('live catalog filters unavailable voices and other languages',async()=>{
 const requests=[];
 const handle=createAddisVoiceHandler(async(url,options)=>{
   requests.push({url,options});
   return Response.json(catalog);
 });
 const response=await handle(req({action:'voices',language:'sw'}),settings);
 assert.equal(response.status,200);
 assert.deepEqual(await response.json(),{voices:[{id:'sw-rashid',name:'Rashid',style:'Narration'}]});
 assert.equal(requests.length,1);
 assert.equal(requests[0].url,'https://api.addisassistant.com/api/v1/voice/voices?language=sw');
 assert.equal(requests[0].options.headers['x-api-key'],'test-provider-key');
});
test('estimate checks catalog and returns cost without generation',async()=>{
 let called=0;
 const handle=createAddisVoiceHandler(async(url,options)=>{
   called++;
   if(url.endsWith('/estimate')){assert.equal(JSON.parse(options.body).voice_id,'sw-rashid');return Response.json(estimate);}
   assert.ok(url.endsWith('/voices?language=sw'));return Response.json(catalog);
 });
 assert.equal((await handle(req({...input,action:'estimate'}),settings)).status,200);
 assert.equal(called,2);
 const reject=await handle(req({...input,action:'estimate',voiceId:'sw-old'}),settings);
 assert.equal(reject.status,400);assert.equal(called,3);
});
test('generation occurs only after valid catalog and positive estimate',async()=>{
 const calls=[];
 const handle=createAddisVoiceHandler(async(url,options)=>{
   calls.push(url);
   if(url.endsWith('/estimate'))return Response.json(estimate);
   if(url.endsWith('/generations')){const b=JSON.parse(options.body);assert.equal(b.client_request_id,input.requestId);return Response.json(generate);}
   return Response.json(catalog);
 });
 const response=await handle(req(input),settings);
 assert.equal(response.status,200);
 assert.deepEqual(await response.json(),{audioUrl:'https://cdn.addisassistant.com/clip/123.mp3',clipId:'clip_123'});
 assert.equal(calls.length,3);
 assert.equal(calls[2],'https://api.addisassistant.com/api/v1/voice/generations');
});
test('no billing when wallet rejects estimate; provider errors never leak secrets',async()=>{
 let generated=0;
 const insufficient=createAddisVoiceHandler(async(url)=>{
   if(url.endsWith('/generations')){generated++;return Response.json(generate);}
   if(url.endsWith('/estimate'))return Response.json({data:{...estimate.data,can_generate:false}});
   return Response.json(catalog);
 });
 assert.equal((await insufficient(req(input),settings)).status,402);
 assert.equal(generated,0);
 const bad=createAddisVoiceHandler(async(url)=>{
   if(url.endsWith('/estimate'))return new Response('provider confidential test key',{status:403});
   return Response.json(catalog);
 });
 const r=await bad(req(input),settings);assert.equal(r.status,502);
 assert.doesNotMatch(await r.text(),/provider confidential|test-provider-key/);
});
test('invalid JSON, unsupported content types, and excessive payloads fail closed',async()=>{
 const handle=createAddisVoiceHandler(async()=>{throw Error('should not reach upstream');});
 let response=await handle(new Request('https://newwave.example/api/addis-voice',{method:'POST',headers:{...validHeaders,'content-type':'text/plain'},body:'x'}),settings);
 assert.equal(response.status,415);
 response=await handle(new Request('https://newwave.example/api/addis-voice',{method:'POST',headers:validHeaders,body:'not json'}),settings);
 assert.equal(response.status,400);
 response=await handle(new Request('https://newwave.example/api/addis-voice',{method:'POST',headers:validHeaders,body:'a'.repeat(8193)}),settings);
 assert.equal(response.status,413);
});
test('Creator Studio preserves Deepgram as default and Addis uses server-only credentials',()=>{
 const source=readFileSync(new URL('../components/creator-studio.tsx',import.meta.url),'utf8');
 const addis=readFileSync(new URL('../components/addis-creator-audio.tsx',import.meta.url),'utf8');
 const adapter=readFileSync(new URL('../pages/api/addis-voice.ts',import.meta.url),'utf8');
 assert.match(source,/useState<'deepgram'\|'addis'>\('deepgram'\)/);
 assert.match(source,/<CreatorVoicePicker/);
 assert.match(source,/<AddisCreatorAudio/);
 assert.match(addis,/NEXT_PUBLIC_STATIC_SITE/);
 assert.match(addis,/Estimate narration cost/);
 assert.match(addis,/Approve cost and generate narration/);
 assert.match(adapter,/process\.env\.ADDIS_API_KEY/);
 assert.doesNotMatch(addis,/process\.env\.ADDIS_API_KEY/);
});
