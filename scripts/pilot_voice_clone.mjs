#!/usr/bin/env node
/**
 * NW-31: single-owner, local-only voice narration pilot.
 * The owner creates/verifies their own clone in the provider dashboard first.
 * This script never uploads voice samples or provisions a clone.
 * No request is sent unless --execute and --confirm-own-voice are both supplied.
 */
import {access, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';

export const PILOT_TEXT = 'This is a fictional NewWave Africa story. At dawn, a small library opened beside the market. By evening, neighbours were sharing stories, songs and hopes for the future.';
export const MAX_AUDIO_BYTES = 12_000_000;
const VOICE_ID_RE = /^[A-Za-z0-9_-]{8,128}$/;

export function validVoiceId(id) {
  return typeof id === 'string' && VOICE_ID_RE.test(id);
}

async function assertOutputAvailable(output) {
  if (typeof output !== 'string' || !output.toLowerCase().endsWith('.mp3')) {
    throw new Error('Provide an MP3 output path.');
  }
  await access(dirname(resolve(output)));
  try {
    await access(output);
  } catch (error) {
    if (error?.code === 'ENOENT') return;
    throw error;
  }
  throw new Error('Output file already exists. Choose a new path to avoid overwriting work.');
}

export async function generatePilotNarration({
  voiceId, output, apiKey, ownVoiceConfirmed = false, paidRequestApproved = false,
  request = fetch,
}) {
  if (!ownVoiceConfirmed) throw new Error('Confirm that you own and have verified this voice in your provider account.');
  if (!paidRequestApproved) throw new Error('A paid provider request requires the explicit --execute flag.');
  if (!validVoiceId(voiceId)) throw new Error('Provide a valid voice ID from your provider account.');
  if (typeof apiKey !== 'string' || !apiKey.trim()) throw new Error('Set ELEVENLABS_API_KEY privately in your environment.');
  await assertOutputAvailable(output);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);
  try {
    const url = 'https://api.elevenlabs.io/v1/text-to-speech/' + encodeURIComponent(voiceId) + '?output_format=mp3_44100_128';
    const response = await request(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey.trim(),
        'content-type': 'application/json',
        accept: 'audio/mpeg',
      },
      body: JSON.stringify({text: PILOT_TEXT, model_id: 'eleven_multilingual_v2'}),
      signal: controller.signal,
      redirect: 'error',
      cache: 'no-store',
      credentials: 'omit',
    });
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      throw new Error('Provider did not generate audio (HTTP ' + response.status + '). No automatic retry or second charge was attempted.');
    }
    const type = response.headers.get('content-type') || '';
    if (!/^(audio\/|application\/octet-stream)/i.test(type) || !response.body) {
      await response.body?.cancel().catch(() => {});
      throw new Error('Provider returned an unexpected audio response.');
    }
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    try {
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_AUDIO_BYTES) {
          await reader.cancel();
          throw new Error('Provider audio exceeded the 12 MB pilot limit.');
        }
        chunks.push(Buffer.from(value));
      }
    } finally {
      reader.releaseLock();
    }
    if (!size) throw new Error('Provider returned empty audio.');
    await writeFile(output, Buffer.concat(chunks), {flag: 'wx', mode: 0o600});
    return {output: resolve(output), bytes: size};
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const {values} = parseArgs({
    options: {
      'voice-id': {type: 'string'},
      output: {type: 'string'},
      execute: {type: 'boolean'},
      'confirm-own-voice': {type: 'boolean'},
    },
    strict: true,
    allowPositionals: false,
  });
  if (!values.execute) {
    console.log('NW-31 dry run: no provider call and no audio generation.');
    console.log('Create/verify your own voice in ElevenLabs, review usage costs, then run:');
    console.log('node scripts/pilot_voice_clone.mjs --voice-id YOUR_VOICE_ID --output /private/path/test.mp3 --confirm-own-voice --execute');
    return;
  }
  const result = await generatePilotNarration({
    voiceId: values['voice-id'],
    output: values.output,
    apiKey: process.env.ELEVENLABS_API_KEY,
    ownVoiceConfirmed: values['confirm-own-voice'] === true,
    paidRequestApproved: values.execute === true,
  });
  console.log('Private pilot narration saved: ' + result.output + ' (' + result.bytes + ' bytes).');
  console.log('Review the narration locally before optionally importing the MP3 into Creator Studio.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : 'Pilot failed.');
    process.exitCode = 1;
  });
}
