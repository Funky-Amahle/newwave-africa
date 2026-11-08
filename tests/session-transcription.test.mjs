import assert from 'node:assert/strict';
import {test} from 'node:test';
import {transcribeWithSessionKey,SESSION_TRANSCRIPTION_URL} from '../lib/session-transcription.ts';

const audio=new Blob(['RIFF0000WAVEaudio'],{type:'audio/wav'});
const key='fictional-session-key';
class FakeSocket{
  readyState=1;bufferedAmount=0;sent=[];closed=false;
  send(value){this.sent.push(value)}
  close(){this.closed=true}
  message(value){this.onmessage?.({data:JSON.stringify(value)})}
  result(text,start=0,duration=1){this.message({type:'Results',is_final:true,start,duration,channel:{alternatives:[{transcript:text}]}})}
  end(code=1000){this.onclose?.({code})}
}
async function session(blob=audio){
  const socket=new FakeSocket();const abort=new AbortController();let connection;
  const pending=transcribeWithSessionKey(blob,key,abort.signal,true,(url,protocols)=>{connection={url,protocols};return socket});
  await new Promise(r=>setImmediate(r));
  return {socket,abort,pending,connection};
}
test('requires consent, valid bounded audio and a session key before connecting',async()=>{
  let calls=0;const factory=()=>{calls++;return new FakeSocket()};
  for(const [blob,credential,consent] of [[audio,key,false],[audio,'',true],[new Blob([],{type:'audio/wav'}),key,true],[new Blob(['not audio'],{type:'audio/wav'}),key,true],[new Blob(['x'],{type:'text/plain'}),key,true],[new Blob([new Uint8Array(8_000_001)],{type:'audio/wav'}),key,true]]){
    await assert.rejects(transcribeWithSessionKey(blob,credential,new AbortController().signal,consent,factory));
  }
  assert.equal(calls,0);
});
test('uses only the fixed provider URL, protocol auth and selected audio, then CloseStream',async()=>{
  const s=await session();assert.equal(s.connection.url,SESSION_TRANSCRIPTION_URL);assert.ok(!s.connection.url.includes(key));assert.deepEqual(s.connection.protocols,['token',key]);
  await s.socket.onopen();
  assert.deepEqual(new Uint8Array(await s.socket.sent[0].arrayBuffer()),new Uint8Array(await audio.arrayBuffer()));
  assert.equal(s.socket.sent.at(-1),'\u007b"type":"CloseStream"\u007d');
  s.socket.result('My original answer.');s.socket.message({type:'Metadata'});s.socket.end();
  assert.equal(await s.pending,'My original answer.');assert.equal(s.socket.closed,true);
});
test('final results are sorted, repeated segments replaced and interim text ignored',async()=>{
  const s=await session();await s.socket.onopen();
  s.socket.result('Ending.',2);s.socket.result('Old beginning.',0);s.socket.result('Beginning.',0);
  s.socket.message({type:'Results',is_final:false,channel:{alternatives:[{transcript:'interim'}]}});
  s.socket.message({type:'Metadata'});s.socket.end();
  assert.equal(await s.pending,'Beginning. Ending.');
});
test('cancellation before connection or during transfer rejects and removes late callbacks',async()=>{
  const abort=new AbortController();abort.abort();let calls=0;
  await assert.rejects(transcribeWithSessionKey(audio,key,abort.signal,true,()=>{calls++;return new FakeSocket()}),/canceled/);assert.equal(calls,0);
  const s=await session();const rejection=assert.rejects(s.pending,/canceled/);await s.socket.onopen();const late=s.socket.onmessage;s.abort.abort();
  late({data:JSON.stringify({type:'Results',is_final:true,start:0,duration:1,channel:{alternatives:[{transcript:'late'}]}})});
  await rejection;assert.equal(s.socket.onmessage,null);assert.equal(s.socket.closed,true);
});
test('errors, incomplete closes and empty speech never return partial transcripts or provider debug',async()=>{
  for(const fail of [s=>s.socket.onerror(),s=>{s.socket.result('Partial');s.socket.end(1006)},s=>{s.socket.message({type:'Metadata'});s.socket.end()},s=>s.socket.message({type:'Error',description:'secret provider diagnostic'})]){
    const s=await session();const rejection=assert.rejects(s.pending,error=>!error.message.includes('secret provider'));await s.socket.onopen();fail(s);await rejection;
  }
});
test('oversized and malformed responses fail without truncating author text',async()=>{
  for(const fail of [s=>s.socket.result('x'.repeat(5001)),s=>s.socket.onmessage({data:'x'.repeat(1_000_001)}),s=>s.socket.onmessage({data:'bad json'})]){
    const s=await session();const rejection=assert.rejects(s.pending);await s.socket.onopen();fail(s);await rejection;assert.equal(s.socket.closed,true);
  }
});
test('audio is split into bounded chunks and no data follows the close-stream command',async()=>{
  const large=new Blob(['RIFF0000WAVE',new Uint8Array(200_000)],{type:'audio/wav'});const s=await session(large);await s.socket.onopen();
  const chunks=s.socket.sent.slice(0,-1);assert.ok(chunks.length>1);assert.equal(chunks.reduce((n,b)=>n+b.size,0),large.size);assert.ok(chunks.every(b=>b.size<=64_000));
  s.socket.result('Words.');s.socket.message({type:'Metadata'});s.socket.end();assert.equal(await s.pending,'Words.');
});
test('deadline closes the connection and returns a recoverable timeout',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});const s=await session();const rejection=assert.rejects(s.pending,/timed out/);t.mock.timers.tick(75_001);await rejection;assert.equal(s.socket.closed,true);
});
test('canceling a backpressured upload stops before sending any more audio',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const s=await session();s.socket.bufferedAmount=300_000;
  const rejection=assert.rejects(s.pending,/canceled/);
  const pumping=s.socket.onopen();
  s.abort.abort();t.mock.timers.tick(10);
  await pumping;await rejection;
  assert.deepEqual(s.socket.sent,[]);assert.equal(s.socket.closed,true);
});
