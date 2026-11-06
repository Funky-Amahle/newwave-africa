import assert from 'node:assert/strict';
import {test} from 'node:test';

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

test('missing, invalid, and failed manifests return browser fallback without repeated requests', async () => {
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
  claimNarration(third,()=>stopped.push('third'));
  assert.deepEqual(stopped,['first','second']);
  releaseNarration(third);
  claimNarration(first,()=>stopped.push('unexpected'));
  claimNarration(first,()=>stopped.push('same-owner'));
  assert.deepEqual(stopped,['first','second']);
  releaseNarration(first);
});
