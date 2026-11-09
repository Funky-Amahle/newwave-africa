import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {generatePilotNarration, MAX_AUDIO_BYTES, PILOT_TEXT, validVoiceId} from '../scripts/pilot_voice_clone.mjs';

const VOICE = 'ValidVoiceId12345678';
async function workspace(t) {
  const dir = await mkdtemp(join(tmpdir(), 'nw31-voice-'));
  t.after(async () => rm(dir, {recursive: true, force: true}));
  return join(dir, 'narration.mp3');
}
const options = output => ({
  voiceId: VOICE, output, apiKey: 'TEST-KEY-DO-NOT-USE',
  ownVoiceConfirmed: true, paidRequestApproved: true,
});

test('voice ID validation rejects path and URL injection', () => {
  assert.equal(validVoiceId(VOICE), true);
  assert.equal(validVoiceId('../../not-a-voice'), false);
  assert.equal(validVoiceId('https://example.org'), false);
  assert.equal(validVoiceId(''), false);
});

test('no provider request without both ownership and paid-request approval', async t => {
  const output = await workspace(t);
  let calls = 0;
  const request = async () => {calls++; throw new Error('should never be called');};
  await assert.rejects(generatePilotNarration({...options(output), ownVoiceConfirmed: false, request}), /Confirm/);
  await assert.rejects(generatePilotNarration({...options(output), paidRequestApproved: false, request}), /explicit/);
  assert.equal(calls, 0);
});

test('generates exactly one private MP3 with a fixed fictional story', async t => {
  const output = await workspace(t);
  const audio = new Uint8Array([73, 68, 51, 4, 0, 0, 1, 2, 3]);
  const calls = [];
  const result = await generatePilotNarration({
    ...options(output),
    request: async (url, init) => {
      calls.push({url, init});
      return new Response(audio, {status: 200, headers: {'content-type': 'audio/mpeg'}});
    },
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.elevenlabs.io/v1/text-to-speech/' + VOICE + '?output_format=mp3_44100_128');
  assert.equal(calls[0].init.headers['xi-api-key'], 'TEST-KEY-DO-NOT-USE');
  assert.equal(calls[0].init.redirect, 'error');
  assert.equal(calls[0].init.credentials, 'omit');
  assert.deepEqual(JSON.parse(calls[0].init.body), {text: PILOT_TEXT, model_id: 'eleven_multilingual_v2'});
  assert.deepEqual(await readFile(output), Buffer.from(audio));
  assert.equal(result.bytes, audio.length);
});

test('never sends a chargeable request when the output file already exists', async t => {
  const output = await workspace(t);
  await writeFile(output, Buffer.from('keep'));
  let calls = 0;
  await assert.rejects(generatePilotNarration({
    ...options(output), request: async () => {calls++; throw new Error('unexpected');},
  }), /already exists/);
  assert.equal(calls, 0);
  assert.equal((await readFile(output)).toString(), 'keep');
});

test('provider error is surfaced without retrying or saving a clip', async t => {
  const output = await workspace(t);
  let calls = 0;
  await assert.rejects(generatePilotNarration({
    ...options(output),
    request: async () => {
      calls++;
      return new Response(JSON.stringify({detail: 'sensitive provider response'}), {
        status: 429, headers: {'content-type': 'application/json'},
      });
    },
  }), /HTTP 429/);
  assert.equal(calls, 1);
  await assert.rejects(readFile(output), {code: 'ENOENT'});
});

test('oversized and non-audio responses fail without writing a file', async t => {
  const output = await workspace(t);
  await assert.rejects(generatePilotNarration({
    ...options(output),
    request: async () => new Response(new Uint8Array(MAX_AUDIO_BYTES + 1), {
      headers: {'content-type': 'audio/mpeg'},
    }),
  }), /12 MB/);
  await assert.rejects(readFile(output), {code: 'ENOENT'});
  await assert.rejects(generatePilotNarration({
    ...options(output),
    request: async () => new Response(JSON.stringify({error: 'not audio'}), {
      headers: {'content-type': 'application/json'},
    }),
  }), /unexpected audio/);
});
