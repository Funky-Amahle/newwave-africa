export function narrationChunks(text:string):string[]{
  if(!text.trim()||text.length>5000)throw new Error('Add between 1 and 5,000 characters of story text.');
  const parts:string[]=[];let rest=text;
  while(rest.length>1800){
    let cut=rest.lastIndexOf(' ',1800);
    if(cut<900)cut=1800;
    if(cut===1800&&/[\uD800-\uDBFF]/.test(rest[cut-1]))cut--;
    parts.push(rest.slice(0,cut));rest=rest.slice(cut);
  }
  if(rest)parts.push(rest);
  return parts;
}
export function pcmToWav(parts:Uint8Array[]):Blob{
  const size=parts.reduce((sum,part)=>sum+part.byteLength,0);
  if(!size||size%2||size>30_000_000)throw new Error('Deepgram returned invalid audio. Please try again.');
  const bytes=new Uint8Array(44+size),view=new DataView(bytes.buffer);
  const word=(offset:number,value:string)=>{for(let i=0;i<value.length;i++)bytes[offset+i]=value.charCodeAt(i);};
  word(0,'RIFF');view.setUint32(4,size+36,true);word(8,'WAVE');word(12,'fmt ');view.setUint32(16,16,true);
  view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,24000,true);view.setUint32(28,48000,true);
  view.setUint16(32,2,true);view.setUint16(34,16,true);word(36,'data');view.setUint32(40,size,true);
  let offset=44;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
  return new Blob([bytes],{type:'audio/wav'});
}
export async function generateCreatorAudio({text,model,key,signal,onProgress,request=fetch}:{text:string;model:string;key:string;signal:AbortSignal;onProgress?:(done:number,total:number)=>void;request?:typeof fetch}):Promise<Blob>{
  if(!/^flux-[a-z]+-en$/.test(model))throw new Error('Choose an English Deepgram voice.');
  if(!key.trim())throw new Error('Enter your Deepgram key for this session.');
  const chunks=narrationChunks(text).filter(part=>part.trim()),parts:Uint8Array[]=[];let size=0;
  for(let i=0;i<chunks.length;i++){
    signal.throwIfAborted();onProgress?.(i,chunks.length);
    const response=await request(`https://api.deepgram.com/v2/speak?model=${encodeURIComponent(model)}&encoding=linear16&sample_rate=24000&container=none&mip_opt_out=true`,{method:'POST',headers:{Authorization:`Token ${key.trim()}`,'Content-Type':'application/json'},body:JSON.stringify({text:chunks[i]}),signal,credentials:'omit',cache:'no-store',redirect:'error'});
    if(!response.ok)throw new Error(response.status===401||response.status===403?'Deepgram rejected this key or voice access. Check your key permissions.':response.status===429?'Deepgram quota or rate limit reached. Check your account before trying again.':`Deepgram could not generate narration (HTTP ${response.status}). Try a shorter story or try again later.`);
    if(!/^(audio\/|application\/octet-stream)/i.test(response.headers.get('content-type')||''))throw new Error('Deepgram returned an unexpected response. Please try again.');
    if(!response.body)throw new Error('Deepgram returned no audio. Please try again.');
    const reader=response.body.getReader(),buffers:Uint8Array[]=[];let partSize=0;
    try{
      while(true){
        signal.throwIfAborted();const {done,value}=await reader.read();if(done)break;
        partSize+=value.length;
        if(size+partSize>30_000_000)throw new Error('Audio exceeded the supported size. Shorten your story and try again.');
        buffers.push(value);
      }
    }catch(error){await reader.cancel().catch(()=>{});throw error;}
    finally{reader.releaseLock();}
    const part=new Uint8Array(partSize);let offset=0;
    for(const buffer of buffers){part.set(buffer,offset);offset+=buffer.length;}
    size+=part.length;
    if(!part.length||part.length%2||size>30_000_000)throw new Error('Audio exceeded the supported size or was incomplete. Shorten your story and try again.');
    parts.push(part);
  }
  signal.throwIfAborted();onProgress?.(chunks.length,chunks.length);return pcmToWav(parts);
}
