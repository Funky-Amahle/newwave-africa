import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
const recorder=readFileSync(new URL('../components/voice-recorder.tsx',import.meta.url),'utf8');
const recCss=readFileSync(new URL('../components/voice-recorder.module.css',import.meta.url),'utf8');
const studio=readFileSync(new URL('../components/voice-to-text.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../components/creator-studio.module.css',import.meta.url),'utf8');

test('recording states remain explicit, time and byte budgets are unchanged',()=>{
  assert.match(recorder,/MAX_BYTES=8_000_000/);
  assert.match(recorder,/elapsed>=180/);
  assert.match(recorder,/getUserMedia\(\{audio:true\}\)/);
  assert.match(recorder,/captureOwner/);
  assert.match(recorder,/Recording duration/);
  assert.match(recorder,/previewMode='inline'/);
  assert.match(recorder,/previewMode==='inline'/);
  assert.match(recorder,/disabled\|\|state==='recording'/);
  assert.match(recorder,/revokeObjectURL/);
  assert.match(recorder,/forEach\(track=>track.stop\(\)\)/);
});

test('two audio source modes feed one shared review player',()=>{
  assert.match(studio,/sourceMode==='record'/);
  assert.match(studio,/sourceMode==='upload'/);
  assert.match(studio,/aria-pressed=\{sourceMode==='record'\}/);
  assert.match(studio,/aria-pressed=\{sourceMode==='upload'\}/);
  assert.match(studio,/previewMode="shared"/);
  assert.equal((studio.match(/<audio controls/g)||[]).length,1);
  assert.match(studio,/setRecorderKey\(v=>v\+1\)/);
  assert.match(studio,/selectAudio\(new Blob\(\[file\]/);
  assert.match(studio,/disabled=\{pending\}/);
  assert.match(studio,/8_000_000/);
  assert.match(studio,/onPlay=\{\(\)=>setPlaying\(true\)\}/);
  assert.match(studio,/setConsent\(false\)/);
  assert.match(studio,/!audio\|\|!consent\|\|!code\|\|pending/);
  assert.match(studio,/transcribeWithSessionKey/);
});

test('switching recording source cannot interrupt an active capture',()=>{
  assert.match(recorder,/onCaptureBusyChange/);
  assert.match(recorder,/state==='recording'\|\|state==='requesting'/);
  assert.match(studio,/onCaptureBusyChange=\{setCaptureBusy\}/);
  assert.equal((studio.match(/aria-controls=\{sourceId\} disabled=\{pending\|\|captureBusy\}/g)||[]).length,2);
  assert.match(css,/studio-mode-arrive/);
});

test('motion is decorative, modest and disabled for reduced motion',()=>{
  assert.match(recCss,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(recorder,/decorative, not a measurement of audio volume/);
  assert.match(studio,/bars are decorative/);
  assert.match(recorder,/role="status"/);
  assert.match(studio,/aria-label="Selected audio preview"/);
  assert.match(css,/@media\(max-width:700px\)/);
  assert.match(recCss,/@media\(max-width:540px\)/);
});
