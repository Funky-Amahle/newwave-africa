import {createHash,createHmac,randomUUID,timingSafeEqual} from 'node:crypto';

export const ADDIS_LANGUAGES = [
  {code:'am',name:'Amharic'},
  {code:'om',name:'Afaan Oromo'},
  {code:'ti',name:'Tigrinya'},
  {code:'sw',name:'Swahili'},
  {code:'ha',name:'Hausa'},
  {code:'sid',name:'Sidama'},
  {code:'wal',name:'Wolaytta'},
] as const;
export const ADDIS_MAX_TEXT = 1000;
const allowed=new Set<string>(ADDIS_LANGUAGES.map(item=>item.code));
const base='https://api.addisassistant.com/api/v1/voice';
type Settings={key?:string;accessCode?:string;origin?:string;quoteSecret?:string;maxCostEtb?:number};
type Voice={id:string;name:string;style:string};
type Payload={action?:unknown;language?:unknown;voiceId?:unknown;text?:unknown;consent?:unknown;quote?:unknown};
type Quote={v:number;expires:number;amount:number;currency:string;digest:string;requestId:string};
const reply=(status:number,value:object)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
const object=(value:unknown):Record<string,unknown>|null=>value!==null&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:null;

const textFingerprint=(language:string,voiceId:string,text:string)=>createHash('sha256')
  .update(JSON.stringify({language,voiceId,text})).digest('hex');

/** Bind a short-lived approval to exact text, selected voice, amount and one provider idempotency ID. */
function issueQuote(secret:string,language:string,voiceId:string,text:string,amount:number){
  const quote:Quote={v:1,expires:Date.now()+5*60_000,amount,currency:'ETB',
    digest:textFingerprint(language,voiceId,text),requestId:randomUUID()};
  const encoded=Buffer.from(JSON.stringify(quote),'utf8').toString('base64url');
  const signature=createHmac('sha256',secret).update(encoded).digest('base64url');
  return encoded+'.'+signature;
}
function approvedQuote(value:unknown,secret:string,language:string,voiceId:string,text:string):Quote|null{
  if(typeof value!=='string'||value.length>2048)return null;
  const parts=value.split('.');
  if(parts.length!==2||!/^[A-Za-z0-9_-]+$/.test(parts[0])||!/^[A-Za-z0-9_-]{43}$/.test(parts[1]))return null;
  const expected=createHmac('sha256',secret).update(parts[0]).digest();
  const signature=Buffer.from(parts[1],'base64url');
  if(signature.length!==expected.length||!timingSafeEqual(expected,signature))return null;
  try{
    const quote=JSON.parse(Buffer.from(parts[0],'base64url').toString('utf8')) as Quote;
    if(quote.v!==1||!Number.isSafeInteger(quote.expires)||quote.expires<=Date.now()
      ||quote.expires>Date.now()+5*60_000||quote.currency!=='ETB'
      ||!Number.isFinite(quote.amount)||quote.amount<0
      ||quote.digest!==textFingerprint(language,voiceId,text)
      ||typeof quote.requestId!=='string'||!/^[a-f0-9-]{36}$/.test(quote.requestId))return null;
    return quote;
  }catch{return null;}
}

async function limited(stream:ReadableStream<Uint8Array>|null,max:number,signal:AbortSignal){
  if(!stream)throw new Error('empty');
  const reader=stream.getReader(),parts:Uint8Array[]=[];let length=0;
  const abort=()=>{void reader.cancel().catch(()=>{})};signal.addEventListener('abort',abort,{once:true});
  try{
    if(signal.aborted)throw new Error('aborted');
    while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>max){await reader.cancel();throw new Error('too-large');}parts.push(value);}
  }finally{signal.removeEventListener('abort',abort);reader.releaseLock();}
  if(signal.aborted)throw new Error('aborted');
  const bytes=new Uint8Array(length);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
  return bytes;
}
async function providerJson(response:Response,signal:AbortSignal){
  if(!response.ok){await response.body?.cancel();throw new Error('provider');}
  const bytes=await limited(response.body,100_000,signal);
  return object(JSON.parse(new TextDecoder().decode(bytes)));
}
function availableVoices(payload:Record<string,unknown>|null,language:string):Voice[]{
  const data=payload?.data,root=object(data);
  const items=Array.isArray(data)?data:Array.isArray(root?.voices)?root.voices:Array.isArray(payload?.voices)?payload.voices:[];
  const result:Voice[]=[];
  for(const item of items){const voice=object(item);if(!voice)continue;
    const id=voice.id??voice.voice_id;
    const lang=voice.language??voice.language_code;
    const isAvailable=voice.is_available??voice.isAvailable;
    if(typeof id!=='string'||!id.startsWith(language+'-')||!/^([a-z]+)-[a-z0-9-]{2,70}$/.test(id))continue;
    if(lang!==undefined&&lang!==language)continue;
    if(isAvailable!==true)continue;
    result.push({id,name:typeof voice.name==='string'?voice.name.slice(0,90):id,style:typeof voice.style==='string'?voice.style.slice(0,70):''});
  }
  return result.slice(0,80);
}
export function createAddisVoiceHandler(fetcher:typeof fetch=fetch){
  let start=0,requests=0,active=0;
  const consumed=new Set<string>(); // Pilot-only, per-process replay barrier; not distributed quota enforcement.
  return async function handle(request:Request,settings:Settings):Promise<Response>{
    const costCap=settings.maxCostEtb??2;
    const configured=!!(settings.key&&settings.accessCode&&settings.accessCode.length>=24&&settings.origin
      &&settings.quoteSecret&&settings.quoteSecret.length>=32&&Number.isFinite(costCap)&&costCap>0&&costCap<=20);
    if(request.method==='GET')return reply(200,{available:configured});
    if(request.method!=='POST')return reply(405,{error:'Use POST for the private Addis voice pilot.'});
    if(!configured)return reply(503,{error:'Addis narration is not configured on this server. Deepgram remains available.'});
    if(request.headers.get('origin')!==settings.origin)return reply(403,{error:'This origin is not allowed to use the Addis pilot.'});
    const expected=createHash('sha256').update(settings.accessCode!).digest();
    const actual=createHash('sha256').update((request.headers.get('authorization')||'').replace(/^Bearer /,'')).digest();
    if(!timingSafeEqual(expected,actual))return reply(401,{error:'Check your private Addis pilot access code.'});
    if(!(request.headers.get('content-type')||'').startsWith('application/json'))return reply(415,{error:'Use JSON for Addis pilot requests.'});
    if(Number(request.headers.get('content-length'))>8192)return reply(413,{error:'Request is too large.'});
    const signal=AbortSignal.any([request.signal,AbortSignal.timeout(50_000)]);
    let input:Payload;
    try{input=JSON.parse(new TextDecoder().decode(await limited(request.body,8192,signal))) as Payload;}
    catch(error){return reply(error instanceof Error&&error.message==='too-large'?413:400,{error:'Invalid or oversized request.'});}
    if(!object(input))return reply(400,{error:'Invalid request.'});
    const action=input.action,language=input.language;
    if(action!=='voices'&&action!=='estimate'&&action!=='generate')return reply(400,{error:'Unsupported Addis action.'});
    if(typeof language!=='string'||!allowed.has(language))return reply(400,{error:'Select a supported Addis language.'});
    if(action!=='voices'&&input.consent!==true)return reply(400,{error:'Explicit permission to send your story text to Addis AI is required.'});
    const text=input.text,voiceId=input.voiceId;
    if(action!=='voices'&&(typeof text!=='string'||!text.trim()||text.length>ADDIS_MAX_TEXT||typeof voiceId!=='string'||!voiceId.startsWith(language+'-')))
      return reply(400,{error:'Choose an available voice and provide 1–1,000 characters in its language.'});
    const approved=action==='generate'?approvedQuote(input.quote,settings.quoteSecret!,language,voiceId as string,text as string):null;
    if(action==='generate'&&!approved)return reply(409,{error:'The narration cost approval is missing, expired or does not match this text and voice. Get a fresh estimate.'});
    if(Date.now()-start>60_000){start=Date.now();requests=0;}
    if(requests>=6||active>=2)return reply(429,{error:'Private Addis pilot request limit reached. Try again later.'});
    requests++;active++;
    const headers={'x-api-key':settings.key!,'content-type':'application/json'};
    const opts={headers,signal,cache:'no-store' as const,credentials:'omit' as const,redirect:'error' as const};
    try{
      const catalog=await providerJson(await fetcher(base+'/voices?language='+encodeURIComponent(language),{...opts,method:'GET'}),signal);
      const voices=availableVoices(catalog,language);
      if(action==='voices')return reply(200,{voices});
      if(!voices.some(voice=>voice.id===voiceId))return reply(400,{error:'That voice is unavailable. Reload the live voice list.'});
      const body={text,voice_id:voiceId,language,output_format:'mp3_44100'};
      const estimate=await providerJson(await fetcher(base+'/estimate',{...opts,method:'POST',body:JSON.stringify(body)}),signal);
      const e=object(estimate?.data)||estimate;
      const cost=e?.estimated_cost??e?.estimatedCost;
      const canGenerate=e?.can_generate??e?.canGenerate;
      const currency=e?.currency;
      if(typeof cost!=='number'||!Number.isFinite(cost)||cost<0||currency!=='ETB'||typeof canGenerate!=='boolean')
        return reply(502,{error:'Addis cost estimate was unavailable or used an unexpected currency. No generation was requested.'});
      if(cost>costCap)return reply(422,{error:'This narration exceeds the private pilot cost limit. Shorten the text before estimating again.'});
      if(action==='estimate')return reply(200,{estimatedCost:cost,currency:'ETB',canGenerate,
        quote:canGenerate?issueQuote(settings.quoteSecret!,language,voiceId as string,text as string,cost):null});
      if(!canGenerate)return reply(402,{error:'The Addis account has insufficient balance; audio was not requested.'});
      if(!approved||cost>approved.amount+0.000001)
        return reply(409,{error:'The Addis estimate changed. Review and approve a fresh cost before generating.'});
      // Mark before the paid call. Never retry automatically when its outcome is uncertain.
      if(consumed.has(approved.requestId))return reply(409,{error:'This quote has already been used. Check Addis clips before requesting another.'});
      if(consumed.size>=1000)return reply(503,{error:'Pilot generation memory limit reached. Restart after reconciling provider clips.'});
      consumed.add(approved.requestId);
      // The quote's stable request ID is sent to Addis for reconciliation; it does not prove provider-side deduplication.
      const generated=await providerJson(await fetcher(base+'/generations',{...opts,method:'POST',body:JSON.stringify({...body,client_request_id:approved.requestId})}),signal);
      const g=object(generated?.data)||generated,link=g?.audio_url??g?.audioUrl;
      let audioUrl:string;
      try{const url=new URL(String(link));if(url.protocol!=='https:')throw Error('invalid');audioUrl=url.toString();}
      catch{return reply(502,{error:'Generation may have been billed, but no safe audio URL was returned. Check your Addis clips.'});}
      return reply(200,{audioUrl,clipId:typeof g?.id==='string'?g.id.slice(0,120):null});
    }catch{
      return reply(502,{error:'Addis could not complete the request. A generation may still have been billed; check your provider clips before retrying.'});
    }finally{active--;}
  };
}
