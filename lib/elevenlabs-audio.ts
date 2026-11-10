import {ELEVENLABS_LANGUAGES,ELEVENLABS_VOICES,ELEVENLABS_MAX_TEXT} from './elevenlabs-voices.ts';
const MAX_BYTES=12_000_000;
type Input={text:string;language:string;voiceId:string;key:string;consent:boolean;signal:AbortSignal;request?:typeof fetch};
/** One bounded browser-to-provider request. No key persistence or automatic retry. */
export async function generateElevenLabsAudio({text,language,voiceId,key,consent,signal,request=fetch}:Input):Promise<Blob>{
  if(!consent)throw new Error('Agree to send your story to ElevenLabs first.');
  if(!ELEVENLABS_LANGUAGES.some(item=>item.code===language))throw new Error('Choose a supported narration language.');
  if(!ELEVENLABS_VOICES.some(item=>item.id===voiceId))throw new Error('Choose a listed narration voice.');
  if(!text.trim()||text.length>ELEVENLABS_MAX_TEXT)throw new Error('Provide 1–5,000 characters in your selected language.');
  if(!key.trim())throw new Error('Enter your ElevenLabs narration key for this session.');
  signal.throwIfAborted();
  const response=await request('https://api.elevenlabs.io/v1/text-to-speech/'+encodeURIComponent(voiceId)+'?output_format=mp3_44100_128',{
    method:'POST',headers:{'xi-api-key':key.trim(),'content-type':'application/json',accept:'audio/mpeg'},
    body:JSON.stringify({text,language_code:language,model_id:'eleven_v4',voice_settings:{stability:0.7,similarity_boost:0.8}}),
    signal,cache:'no-store',credentials:'omit',redirect:'error',
  });
  if(!response.ok){
    await response.body?.cancel();
    if(response.status===401||response.status===403)throw new Error('Check your ElevenLabs key, Text to Speech permission and voice access.');
    if(response.status===402||response.status===429)throw new Error('Your ElevenLabs quota or request limit was reached. Check your account before trying again.');
    throw new Error('ElevenLabs could not generate this recording. Check your account history before requesting another.');
  }
  if(!/^audio\/(mpeg|mp3)(;|$)/i.test(response.headers.get('content-type')||'')||!response.body){
    await response.body?.cancel();throw new Error('ElevenLabs returned an unexpected audio response.');
  }
  const reader=response.body.getReader(),parts:Uint8Array[]=[];let size=0;
  const abort=()=>{void reader.cancel().catch(()=>{});};signal.addEventListener('abort',abort,{once:true});
  try{
    signal.throwIfAborted();
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BYTES){await reader.cancel();throw new Error('Generated audio exceeded the 12 MB limit.');}parts.push(value);}
  }finally{signal.removeEventListener('abort',abort);reader.releaseLock();}
  signal.throwIfAborted();if(!size)throw new Error('ElevenLabs returned empty audio.');
  const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
  return new Blob([bytes.buffer],{type:'audio/mpeg'});
}
