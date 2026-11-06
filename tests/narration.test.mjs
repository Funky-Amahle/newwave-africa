import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {createRecordedNarration} from '../lib/narration.ts';

let revision = 0;
async function withManifest(response, check) {
  const previous = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => { requests++; if(response instanceof Error)throw response; return response; };
  try {
    const module = await import(`../lib/narration.ts?case=${++revision}`);
    await check(module, () => requests);
  } finally { globalThis.fetch = previous; }
}

test('cards share one manifest request and accept the generated filenames', async () => {
  await withManifest({ok:true,json:async()=>({version:1,clips:{s1:'s1.mp3',s8:'s8.mp3'}})}, async (module, requests) => {
    const clips = await Promise.all(Array.from({length:8}, () => module.loadNarrationClips('/newwave-africa')));
    assert.equal(requests(),1);
    assert.equal(clips[0].s1,'/newwave-africa/narration/s1.mp3');
    assert.equal(clips[0].s8,'/newwave-africa/narration/s8.mp3');
    await module.loadNarrationClips('/newwave-africa');
    assert.equal(requests(),1);
  });
});

test('manifest paths cannot redirect a story to another story or external URL', async () => {
  await withManifest({ok:true,json:async()=>({version:1,clips:{s1:'s2.mp3',s2:'../s2.mp3',s3:'https://example.com/s3.mp3',s4:'s4.mp3',s9:'s9.mp3'}})}, async module => {
    assert.deepEqual(await module.loadNarrationClips(''), {s4:'/narration/s4.mp3'});
  });
});

test('missing, invalid, and failed manifests return no recordings without repeated requests', async () => {
  for (const response of [{ok:false}, {ok:true,json:async()=>({version:2,clips:{s1:'s1.mp3'}})},
    {ok:true,json:async()=>{throw new SyntaxError('invalid JSON')}}, new Error('network unavailable')]) {
    await withManifest(response, async (module, requests) => {
      assert.deepEqual(await module.loadNarrationClips(''), {});
      assert.deepEqual(await module.loadNarrationClips(''), {});
      assert.equal(requests(),1);
    });
  }
});

test('starting a new card stops only the prior owner; stale releases do not cancel the new owner', async () => {
  const {claimNarration,releaseNarration} = await import('../lib/narration.ts');
  const first={},second={},third={};
  const stopped=[];
  claimNarration(first,()=>{stopped.push('first');releaseNarration(first)});
  claimNarration(second,()=>{stopped.push('second');releaseNarration(second)});
  assert.deepEqual(stopped,['first']);
  releaseNarration(first);
  claimNarration(third,()=>{stopped.push('third');releaseNarration(third)});
  assert.deepEqual(stopped,['first','second']);
  releaseNarration(third);
  claimNarration(first,()=>stopped.push('unexpected'));
  claimNarration(first,()=>stopped.push('same-owner'));
  assert.deepEqual(stopped,['first','second']);
  releaseNarration(first);
});

const flush = () => new Promise(resolve => setImmediate(resolve));
function media(play = () => Promise.resolve()) {
  return {currentTime:12,plays:0,pauses:0,play(){this.plays++;return play()},pause(){this.pauses++}};
}
function controller() {
  const states=[];
  return {states,player:createRecordedNarration(state=>states.push(state))};
}

test('missing recordings stay silent with an unavailable status', () => {
  const {states,player}=controller();
  player.toggle(null);
  assert.deepEqual(states.at(-1),{status:'idle',error:'Narration unavailable. You can still read this story.'});
  player.dispose();
});

test('recorded audio supports play, pause, resume, end and stop', async () => {
  const {states,player}=controller();const sound=media();
  player.toggle(sound);assert.equal(states.at(-1).status,'loading');
  await flush();assert.equal(states.at(-1).status,'speaking');
  sound.currentTime=7;
  player.toggle(sound);assert.equal(states.at(-1).status,'paused');
  player.toggle(sound);await flush();
  assert.equal(sound.currentTime,7);assert.equal(sound.plays,2);
  player.ended(sound);assert.equal(states.at(-1).status,'idle');
  player.toggle(sound);await flush();player.stop();
  assert.equal(sound.currentTime,0);assert.equal(states.at(-1).status,'idle');
  player.dispose();
});

test('play rejection stays silent and permits a recorded-audio retry', async () => {
  let reject=true;
  const sound=media(()=>reject?Promise.reject(new Error('unavailable')):Promise.resolve());
  const {states,player}=controller();
  player.toggle(sound);await flush();
  assert.equal(states.at(-1).status,'idle');assert.match(states.at(-1).error,/could not be played/);
  assert.equal(sound.plays,1);
  reject=false;player.toggle(sound);await flush();
  assert.equal(states.at(-1).status,'speaking');assert.equal(states.at(-1).error,'');
  player.dispose();
});

test('network media errors release ownership without synthesizing a fallback', async () => {
  const {states,player}=controller();const sound=media();
  player.toggle(sound);await flush();player.failed(sound);
  assert.equal(states.at(-1).status,'idle');assert.match(states.at(-1).error,/could not be played/);
  assert.equal(sound.currentTime,0);assert.equal(sound.plays,1);
  player.dispose();
});

test('switching cards stops only the previous recorded clip', async () => {
  const first=controller(),second=controller();const a=media(),b=media();
  first.player.toggle(a);await flush();a.currentTime=9;
  second.player.toggle(b);await flush();
  assert.equal(a.currentTime,0);assert.equal(first.states.at(-1).status,'idle');
  assert.equal(second.states.at(-1).status,'speaking');
  first.player.dispose();assert.equal(b.pauses,0);
  second.player.dispose();assert.equal(b.pauses,1);
});

test('stop ignores pending play resolution and media errors', async () => {
  let resolve;const sound=media(()=>new Promise(done=>{resolve=done}));
  const {states,player}=controller();
  player.toggle(sound);player.toggle(sound);assert.equal(sound.plays,1);
  player.stop();const length=states.length;resolve();await flush();player.failed(sound);
  assert.equal(states.length,length);assert.equal(states.at(-1).status,'idle');
  player.dispose();
});

test('unmount stops audio and rejects later callbacks without updating the UI', async () => {
  let reject;const sound=media(()=>new Promise((_,fail)=>{reject=fail}));
  const {states,player}=controller();
  player.toggle(sound);const length=states.length;player.dispose();
  reject(new Error('aborted'));await flush();player.toggle(sound);
  assert.equal(states.length,length);assert.equal(sound.currentTime,0);assert.equal(sound.plays,1);
});

test('story playback code has no executable browser speech integration', () => {
  // Inspect syntax nodes rather than matching words inside explanatory comments.
  for(const path of ['components/story-card.tsx','lib/narration.ts']) {
    const source=ts.createSourceFile(path,readFileSync(new URL('../'+path,import.meta.url),'utf8'),ts.ScriptTarget.Latest,true,path.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
    const forbidden=[];
    function visit(node) {
      if(ts.isIdentifier(node)&&['speechSynthesis','SpeechSynthesisUtterance'].includes(node.text))forbidden.push(node.text);
      if(ts.isElementAccessExpression(node)&&ts.isStringLiteral(node.argumentExpression)&&node.argumentExpression.text==='speechSynthesis')forbidden.push(node.argumentExpression.text);
      ts.forEachChild(node,visit);
    }
    visit(source);assert.deepEqual(forbidden,[],path);
  }
});
