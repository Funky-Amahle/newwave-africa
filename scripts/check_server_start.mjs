/** Start the real standalone artifact without secrets; never calls a provider. */
import {spawn} from 'node:child_process';
import {cp} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {setTimeout as pause} from 'node:timers/promises';
await cp('.next/static','.next/standalone/.next/static',{recursive:true});
await cp('public','.next/standalone/public',{recursive:true});
const origin='http://127.0.0.1:18881';
const child=spawn(process.execPath,['.next/standalone/server.js'],{env:{...process.env,PORT:'18881',HOSTNAME:'127.0.0.1',APP_ORIGIN:origin,DEEPGRAM_API_KEY:'',TRANSCRIPTION_ACCESS_CODE:''},stdio:'ignore'});
try{
 let ready=false;
 for(let i=0;i<50;i++){
  if(child.exitCode!==null)throw new Error('Standalone server exited before readiness.');
  try{const r=await fetch(origin+'/api/transcribe',{signal:AbortSignal.timeout(1000)});if(r.ok){assert.deepEqual(await r.json(),{available:false});ready=true;break}}catch{}
  await pause(200);
 }
 assert.ok(ready,'Standalone server did not become ready.');
 const post=await fetch(origin+'/api/transcribe',{method:'POST',headers:{'Content-Type':'audio/wav'},body:'not-a-real-recording'});
 assert.equal(post.status,503);assert.match((await post.json()).error,/not available/);
 assert.equal((await fetch(origin)).status,200);
 assert.equal((await fetch(origin+'/story-visuals/clay.svg')).status,200);
 console.log('Standalone startup, unavailable transcription, home and visual delivery passed.');
}finally{child.kill('SIGTERM')}
