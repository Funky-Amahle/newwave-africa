import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createAddisVoiceHandler,ADDIS_MAX_TEXT} from '../server/addis-voice.ts';
const settings={key:'test-provider-key',accessCode:'addis-pilot-code-at-least-24-characters',origin:'https://newwave.example',quoteSecret:'unit-test-signing-secret-with-more-than-32-characters',maxCostEtb:2};
const validHeaders={'origin':settings.origin,'authorization':'Bearer '+settings.accessCode,'content-type':'application/json'};
const catalog={data:{voices:[{id:'sw-rashid',name:'Rashid',style:'Narration',language:'sw',is_available:true},{id:'sw-old',name:'Old',language:'sw',is_available:false},{id:'am-hamen',name:'Hamen',language:'am',is_available:true}]}};
const estimate={data:{estimated_cost:1.25,currency:'ETB',can_generate:true}};
const generate={data:{id:'clip_123',audio_url:'https://cdn.addisassistant.com/clip/123.mp3'}};
const req=(body,headers={})=>new Request('https://newwave.example/api/addis-voice',{method:'POST',headers:{...validHeaders,...headers},body:JSON.stringify(body)});
const input={action:'generate',language:'sw',voiceId:'sw-rashid',text:'Habari kutoka kwetu',consent:true};
test('missing configuration, unauthorized origin, code or consent never contacts Addis',async()=>{
 let calls=0;const handle=createAddisVoiceHandler(async()=>{calls++;return Response.json(catalog);});
 assert.equal((await handle(req({action:'voices',language:'sw'}),{})).status,503);
 assert.equal((await handle(req({action:'voices',language:'sw'},{origin:'https://bad.example'}),settings)).status,403);
 assert.equal((await handle(req({action:'voices',language:'sw'},{authorization:'Bearer wrong'}),settings)).status,401);
 assert.equal((await handle(req({...input,consent:false}),settings)).status,400);
 assert.equal((await handle(req({...input,language:'xx'}),settings)).status,400);
 assert.equal((await handle(req({...input,text:'x'.repeat(ADDIS_MAX_TEXT+1)}),settings)).status,400);
 assert.equal((await handle(req(input),settings)).status,409);
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
   if(url.endsWith('/generations')){const b=JSON.parse(options.body);assert.match(b.client_request_id,/^[a-f0-9-]{36}$/);return Response.json(generate);}
   return Response.json(catalog);
 });
 const quotation=await handle(req({...input,action:'estimate'}),settings);
 assert.equal(quotation.status,200);
 const quote=(await quotation.json()).quote;
 assert.equal(typeof quote,'string');
 const response=await handle(req({...input,quote}),settings);
 assert.equal(response.status,200);
 assert.deepEqual(await response.json(),{audioUrl:'https://cdn.addisassistant.com/clip/123.mp3',clipId:'clip_123'});
 assert.equal(calls.length,5);
 assert.equal(calls[4],'https://api.addisassistant.com/api/v1/voice/generations');
 assert.equal((await handle(req({...input,quote}),settings)).status,409);
});
test('no billing when wallet rejects estimate; provider errors never leak secrets',async()=>{
 let generated=0;
 const insufficient=createAddisVoiceHandler(async(url)=>{
   if(url.endsWith('/generations')){generated++;return Response.json(generate);}
   if(url.endsWith('/estimate'))return Response.json({data:{...estimate.data,can_generate:false}});
   return Response.json(catalog);
 });
 const quoteResponse=await insufficient(req({...input,action:'estimate'}),settings);
 assert.equal(quoteResponse.status,200);
 assert.equal((await quoteResponse.json()).quote,null);
 assert.equal((await insufficient(req(input),settings)).status,409);
 assert.equal(generated,0);
 const bad=createAddisVoiceHandler(async(url)=>{
   if(url.endsWith('/estimate'))return new Response('provider confidential test key',{status:403});
   return Response.json(catalog);
 });
 const r=await bad(req({...input,action:'estimate'}),settings);assert.equal(r.status,502);
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
 assert.match(source,/useState<[^>]+>\('deepgram'\)/);
 assert.match(source,/<CreatorVoicePicker/);
 assert.match(source,/<AddisCreatorAudio/);
 assert.match(addis,/NEXT_PUBLIC_STATIC_SITE/);
 assert.match(addis,/Estimate narration cost/);
 assert.match(addis,/Approve cost and generate narration/);
 assert.match(adapter,/process\.env\.ADDIS_API_KEY/);
 assert.doesNotMatch(addis,/process\.env\.ADDIS_API_KEY/);
});

test('Addis matches the Deepgram narrator structure and interaction semantics',()=>{
 const addis=readFileSync(new URL('../components/addis-creator-audio.tsx',import.meta.url),'utf8');
 const deepgram=readFileSync(new URL('../components/creator-voice-picker.tsx',import.meta.url),'utf8');
 const style=readFileSync(new URL('../components/creator-studio.module.css',import.meta.url),'utf8');
 for(const className of ['panel','voicePicker','voicePickerTrigger','voicePickerPopover','voiceOptionList','voiceOption','review','actions','check','download']){
   if(className!=='review'&&className!=='actions'&&className!=='check'&&className!=='download')assert.match(deepgram,new RegExp('styles\\.'+className));
   assert.match(addis,new RegExp('styles\\.'+className));
 }
 assert.match(addis,/Choose your narration voice/);
 assert.match(addis,/Hear your story/);
 assert.match(addis,/aria-expanded=\{open\}/);
 assert.match(addis,/onKeyDown/);
 assert.match(addis,/Escape/);
 assert.match(addis,/role="radiogroup"/);
 assert.match(addis,/minlength|1,000 characters/i);
 assert.match(addis,/separate pilot access code, not the service API key/);
 assert.match(addis,/NEXT_PUBLIC_STATIC_SITE/);
 assert.match(style,/\.addisLanguageMenu/);
 assert.doesNotMatch(addis,/ADDIS_API_KEY|localStorage|sessionStorage/);
});


test('Addis screenshot language dropdown includes reference ordering, semantics and visible offline choice',()=>{
 const picker=readFileSync(new URL('../components/addis-language-picker.tsx',import.meta.url),'utf8');
 const langs=readFileSync(new URL('../lib/addis-languages.ts',import.meta.url),'utf8');
 const addis=readFileSync(new URL('../components/addis-creator-audio.tsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../components/creator-studio.module.css',import.meta.url),'utf8');
 const expected=['Amharic','Afaan Oromo','Tigrinya','Sidama','Wolaytta','Swahili','Hausa'];
 const positions=expected.map(name=>langs.indexOf("name:'"+name+"'"));
 assert.ok(positions.every((value,i)=>value>=0&&(i===0||value>positions[i-1])));
 assert.match(picker,/aria-haspopup="listbox"/);
 assert.match(picker,/role="listbox"/);
 assert.match(picker,/role="option"/);
 assert.match(picker,/aria-selected=\{value===item.code\}/);
 assert.match(picker,/event.key==='ArrowDown'/);
 assert.match(picker,/event.key==='ArrowUp'/);
 assert.match(picker,/event.key==='Home'/);
 assert.match(picker,/event.key==='End'/);
 assert.match(picker,/event.key==='Escape'/);
 assert.match(picker,/event.key==='Tab'/);
 assert.match(picker,/pointerdown/);
 assert.match(picker,/setOpen\(false\)/);
 assert.match(addis,/<AddisLanguagePicker/);
 assert.match(addis,/disabled=\{busy\}/);
 assert.doesNotMatch(addis,/addisLanguageSelect/);
 assert.match(css,/#087df2/);
 assert.match(css,/\.addisLanguageOptionSelected/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(picker,/fetch\(|localStorage|sessionStorage/);
});

test('signed quote is required and binds text, voice, amount and secret',async()=>{
 let generated=0;
 const handle=createAddisVoiceHandler(async(url)=>{
   if(url.endsWith('/generations')){generated++;return Response.json(generate);}
   if(url.endsWith('/estimate'))return Response.json(estimate);
   return Response.json(catalog);
 });
 const quote=(await (await handle(req({...input,action:'estimate'}),settings)).json()).quote;
 assert.equal(typeof quote,'string');
 assert.equal((await handle(req({...input,text:'different story',quote}),settings)).status,409);
 assert.equal((await handle(req({...input,voiceId:'sw-old',quote}),settings)).status,409);
 const dot=quote.indexOf('.');
 const tampered=quote.slice(0,dot+1)+(quote[dot+1]==='A'?'B':'A')+quote.slice(dot+2);
 assert.equal((await handle(req({...input,quote:tampered}),settings)).status,409);
 assert.equal((await handle(req({...input,quote}),{...settings,quoteSecret:'another-secret-with-more-than-thirty-two-characters'})).status,409);
 assert.equal(generated,0);
});
test('estimate and generation reject increases above the approved cost or pilot ceiling',async()=>{
 let total=0,generated=0;
 const handle=createAddisVoiceHandler(async(url)=>{
   if(url.endsWith('/generations')){generated++;return Response.json(generate);}
   if(url.endsWith('/estimate'))return Response.json({data:{estimated_cost:++total===1?1.25:1.5,currency:'ETB',can_generate:true}});
   return Response.json(catalog);
 });
 const quote=(await (await handle(req({...input,action:'estimate'}),settings)).json()).quote;
 const r=await handle(req({...input,quote}),settings);
 assert.equal(r.status,409);assert.equal(generated,0);
 const capped=createAddisVoiceHandler(async(url)=>{
   if(url.endsWith('/generations')){generated++;return Response.json(generate);}
   if(url.endsWith('/estimate'))return Response.json({data:{estimated_cost:2.5,currency:'ETB',can_generate:true}});
   return Response.json(catalog);
 });
 assert.equal((await capped(req({...input,action:'estimate'}),settings)).status,422);
 assert.equal(generated,0);
});
test('bad configuration fails closed, including signing secret and cost cap',async()=>{
 const handler=createAddisVoiceHandler(async()=>{throw Error('should not reach Addis')});
 assert.deepEqual(await (await handler(new Request('https://newwave.example/api/addis-voice'),{...settings,quoteSecret:''})).json(),{available:false});
 assert.equal((await handler(req({...input,action:'estimate'}),{...settings,maxCostEtb:100})).status,503);
});
