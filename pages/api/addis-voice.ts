import type {NextApiRequest,NextApiResponse} from 'next';
import {Readable} from 'node:stream';
import {createAddisVoiceHandler} from '../../server/addis-voice';
export const config={api:{bodyParser:false,responseLimit:'32kb'}};
const handle=createAddisVoiceHandler();
export default async function addisVoice(req:NextApiRequest,res:NextApiResponse){
  const abort=new AbortController();
  req.on('aborted',()=>abort.abort());
  res.on('close',()=>{if(!res.writableEnded)abort.abort();});
  const headers=new Headers();
  for(const [key,value] of Object.entries(req.headers))if(value)headers.set(key,Array.isArray(value)?value.join(','):value);
  const request=new Request('http://localhost/api/addis-voice',{
    method:req.method,headers,signal:abort.signal,
    ...(req.method!=='GET'&&req.method!=='HEAD'?{body:Readable.toWeb(req) as ReadableStream,duplex:'half'}:{})
  } as RequestInit);
  const response=await handle(request,{
    key:process.env.ADDIS_API_KEY,
    accessCode:process.env.ADDIS_PILOT_ACCESS_CODE,
    origin:process.env.APP_ORIGIN,
    quoteSecret:process.env.ADDIS_QUOTE_SECRET,
    maxCostEtb:process.env.ADDIS_MAX_COST_ETB===undefined?undefined:Number(process.env.ADDIS_MAX_COST_ETB),
  });
  res.setHeader('Cache-Control','no-store');
  res.status(response.status).json(await response.json());
}
