import {createHash,timingSafeEqual} from 'node:crypto';
export const MAX_AUDIO_BYTES=8_000_000;
const types=new Set(['audio/webm','audio/ogg','audio/wav','audio/x-wav','audio/mpeg','audio/mp4']);
type Settings={key?:string;accessCode?:string;origin?:string};
const reply=(status:number,value:object)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
async function bounded(stream:ReadableStream<Uint8Array>|null,max:number,signal?:AbortSignal){
  if(!stream)throw new Error('empty');
  const reader=stream.getReader();const chunks:Uint8Array[]=[];let size=0;
  const cancel=()=>{void reader.cancel().catch(()=>{})};signal?.addEventListener('abort',cancel,{once:true});
  try{if(signal?.aborted)throw new Error('aborted');while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new Error('large')}chunks.push(value)}}finally{signal?.removeEventListener('abort',cancel);reader.releaseLock()}
  if(signal?.aborted)throw new Error('aborted');
  const data=new Uint8Array(size);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.length}return data;
}
export function createTranscriptionHandler(fetcher:typeof fetch=fetch){
  let windowStart=0,requests=0,active=0;
  return async function handle(request:Request,settings:Settings):Promise<Response>{
    const configured=!!(settings.key&&settings.accessCode&&settings.accessCode.length>=24&&settings.origin);
    if(request.method==='GET')return reply(200,{available:configured});
    if(request.method!=='POST')return reply(405,{error:'Use POST to transcribe an audio clip.'});
    if(!configured)return reply(503,{error:'Transcription is not available yet. Your recording has not been sent.'});
    if(request.headers.get('origin')!==settings.origin)return reply(403,{error:'This site is not allowed to request transcription.'});
    const expected=createHash('sha256').update(settings.accessCode!).digest();
    const actual=createHash('sha256').update(request.headers.get('authorization')?.replace(/^Bearer /,'')||'').digest();
    if(!timingSafeEqual(expected,actual))return reply(401,{error:'Check the transcription access code and try again.'});
    if(request.headers.get('x-transcription-consent')!=='yes')return reply(400,{error:'Consent is required before sending audio to Deepgram.'});
    const mime=(request.headers.get('content-type')||'').split(';')[0].toLowerCase();
    if(!types.has(mime))return reply(415,{error:'Use WebM, Ogg, WAV, MP3 or M4A audio.'});
    if(Number(request.headers.get('content-length'))>MAX_AUDIO_BYTES)return reply(413,{error:'Audio must be 8 MB or smaller.'});
    if(Date.now()-windowStart>60_000){windowStart=Date.now();requests=0}
    if(requests>=5||active>=2)return reply(429,{error:'Transcription is busy. Wait a minute and try again.'});
    requests++;active++;
    try{
      const signal=AbortSignal.any([request.signal,AbortSignal.timeout(65_000)]);
      const body=await bounded(request.body,MAX_AUDIO_BYTES,signal);
      if(!body.length)return reply(400,{error:'The audio file is empty.'});
      const head=Array.from(body.slice(0,12),byte=>String.fromCharCode(byte)).join('');
      const valid=(mime.includes('wav')&&head.startsWith('RIFF')&&head.slice(8,12)==='WAVE')||(mime==='audio/webm'&&body[0]===0x1a&&body[1]===0x45&&body[2]===0xdf&&body[3]===0xa3)||(mime==='audio/ogg'&&head.startsWith('OggS'))||(mime==='audio/mp4'&&head.slice(4,8)==='ftyp')||(mime==='audio/mpeg'&&(head.startsWith('ID3')||(body[0]===0xff&&(body[1]&0xe0)===0xe0)));
      if(!valid)return reply(415,{error:'This file does not match a supported audio container.'});
      const result=await fetcher('https://api.deepgram.com/v1/listen?model=nova-3&language=en&smart_format=true&mip_opt_out=true',{
        method:'POST',headers:{Authorization:'Token '+settings.key,'Content-Type':mime},body:body as BodyInit,signal
      });
      if(!result.ok){await result.body?.cancel();return reply(502,{error:'Deepgram could not transcribe this recording. Your writing is unchanged.'})}
      const payload=await bounded(result.body,1_000_000,signal);
      const data=JSON.parse(new TextDecoder().decode(payload));
      const transcript=data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
      if(typeof transcript!=='string'||!transcript.trim())return reply(422,{error:'No clear speech was found. Try a clearer recording or type your answer.'});
      if(transcript.length>5000)return reply(422,{error:'The transcript is too long. Try a shorter recording.'});
      return reply(200,{transcript:transcript.trim()});
    }catch(error){return reply(error instanceof Error&&error.message==='large'?413:502,{error:error instanceof Error&&error.message==='large'?'The response or audio exceeded the size limit.':'Transcription could not finish. Your recording and writing are unchanged.'})}
    finally{active--}
  };
}
