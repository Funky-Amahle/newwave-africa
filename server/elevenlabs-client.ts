import 'server-only';
import {ElevenLabsClient} from '@elevenlabs/elevenlabs-js';

/** Lazy, server-only SDK setup. Next.js loads ELEVENLABS_API_KEY from .env.local. */
export function createElevenLabsClient():ElevenLabsClient{
  if(!process.env.ELEVENLABS_API_KEY?.trim()){
    throw new Error('ElevenLabs is not configured. Complete CLI onboarding first.');
  }
  return new ElevenLabsClient();
}
