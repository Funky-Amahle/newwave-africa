import type {NextApiRequest,NextApiResponse} from 'next';
import {Readable} from 'node:stream';
import {createTranscriptionHandler} from '../../server/transcription';
export const config={api:{bodyParser:false,responseLimit:'1mb'}};
const handle=createTranscriptionHandler();
export default async function transcribe(req:NextApiRequest,res:NextApiResponse){
  const abort=new AbortController();req.on('aborted',()=>abort.abort());
  res.on('close',()=>{if(!res.writableEnded)abort.abort()});
  const headers=new Headers();
  for(const [key,value] of Object.entries(req.headers))if(value)headers.set(key,Array.isArray(value)?value.join(','):value);
  const request=new Request('http://localhost/api/transcribe',{method:req.method,headers,signal:abort.signal,
    ...(req.method!=='GET'&&req.method!=='HEAD'?{body:Readable.toWeb(req) as ReadableStream,duplex:'half'}:{})} as RequestInit);
  const response=await handle(request,{key:process.env.DEEPGRAM_API_KEY,accessCode:process.env.TRANSCRIPTION_ACCESS_CODE,origin:process.env.APP_ORIGIN});
  res.setHeader('Cache-Control','no-store');res.status(response.status).json(await response.json());
}
