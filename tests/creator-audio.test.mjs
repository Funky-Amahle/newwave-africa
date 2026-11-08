import assert from 'node:assert/strict';
import {test} from 'node:test';
import {narrationChunks,pcmToWav,generateCreatorAudio} from '../lib/creator-audio.ts';
test('long stories split without dropping or changing text',()=>{
 for(const text of ['word '.repeat(1000),'a'.repeat(1799)+'😀'+'b'.repeat(2000)]){const chunks=narrationChunks(text);assert.equal(chunks.join(''),text);assert.ok(chunks.every(c=>c.length<=1800));}
 assert.throws(()=>narrationChunks(' '));assert.throws(()=>narrationChunks('a'.repeat(5001)));
});
test('PCM becomes one correctly sized mono 24kHz WAV',async()=>{
 const blob=pcmToWav([new Uint8Array([1,2]),new Uint8Array([3,4])]);const bytes=await blob.arrayBuffer(),v=new DataView(bytes);
 assert.equal(blob.type,'audio/wav');assert.equal(bytes.byteLength,48);assert.equal(v.getUint32(24,true),24000);assert.equal(v.getUint32(40,true),4);assert.deepEqual([...new Uint8Array(bytes).slice(44)],[1,2,3,4]);
 assert.throws(()=>pcmToWav([new Uint8Array(1)]));
});
test('selected model and text sent only to Deepgram; auth stays in header',async()=>{
 const calls=[];const request=async(url,options)=>{calls.push({url,options});return new Response(new Uint8Array([0,0,1,0]),{headers:{'content-type':'audio/linear16'}});};
 const text='word '.repeat(1000),blob=await generateCreatorAudio({text,model:'flux-gemma-en',key:'test-only',signal:new AbortController().signal,request});
 assert.equal(calls.length,3);assert.equal(calls.map(c=>JSON.parse(c.options.body).text).join(''),text);
 for(const c of calls){assert.ok(c.url.startsWith('https://api.deepgram.com/v2/speak?model=flux-gemma-en'));assert.ok(!c.url.includes('test-only'));assert.equal(c.options.headers.Authorization,'Token test-only');assert.equal(c.options.redirect,'error');}
 assert.equal(blob.size,56);
});
test('errors do not expose provider response or silently retry',async()=>{
 let count=0;
 await assert.rejects(generateCreatorAudio({text:'Hello',model:'flux-haley-en',key:'test-only',signal:new AbortController().signal,request:async()=>{count++;return new Response('private diagnostic',{status:403});}}),/key or voice access/);
 assert.equal(count,1);
 const controller=new AbortController();controller.abort();await assert.rejects(generateCreatorAudio({text:'Hello',model:'flux-haley-en',key:'test-only',signal:controller.signal,request:async()=>{throw Error('must not send')}}),/abort/i);
});
test('unexpected or empty audio cannot become a download',async()=>{
 for(const response of [new Response('{}',{headers:{'content-type':'application/json'}}),new Response(new Uint8Array(),{headers:{'content-type':'audio/linear16'}})])await assert.rejects(generateCreatorAudio({text:'Hello',model:'flux-haley-en',key:'test-only',signal:new AbortController().signal,request:async()=>response}));
});

test('whitespace-only sections are not submitted or charged',async()=>{
 const calls=[];await generateCreatorAudio({text:'a'.repeat(1800)+' '.repeat(100),model:'flux-haley-en',key:'test-only',signal:new AbortController().signal,request:async(url,options)=>{calls.push(JSON.parse(options.body).text);return new Response(new Uint8Array([0,0]),{headers:{'content-type':'audio/linear16'}});}});
 assert.equal(calls.length,1);assert.equal(calls[0].length,1800);
});
test('oversized streamed response is cancelled before retaining the body',async()=>{
 let cancelled=false;const stream=new ReadableStream({pull(c){c.enqueue(new Uint8Array(10_000_000));},cancel(){cancelled=true;}});
 await assert.rejects(generateCreatorAudio({text:'Hello',model:'flux-haley-en',key:'test-only',signal:new AbortController().signal,request:async()=>new Response(stream,{headers:{'content-type':'audio/linear16'}})}),/exceeded/);
 assert.equal(cancelled,true);
});
