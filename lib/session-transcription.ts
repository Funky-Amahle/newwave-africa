/** Static-site demo transport. The caller supplies a key held only in page memory. */
export const SESSION_TRANSCRIPTION_URL='wss://api.deepgram.com/v1/listen?model=nova-3&language=en&smart_format=true&interim_results=false&mip_opt_out=true';
type SocketFactory=(url:string,protocols:string[])=>WebSocket;
const audioTypes=new Set(['audio/webm','audio/ogg','audio/wav','audio/x-wav','audio/mpeg','audio/mp4']);
const canceled=()=>new Error('Transcription canceled. Your writing is unchanged.');

export async function transcribeWithSessionKey(audio:Blob,key:string,signal:AbortSignal,consent:boolean,makeSocket:SocketFactory=(url,protocols)=>new WebSocket(url,protocols)):Promise<string>{
  if(!consent)throw new Error('Consent is required before sending audio to Deepgram.');
  if(signal.aborted)throw canceled();
  if(!audio.size||audio.size>8_000_000)throw new Error('Choose non-empty audio of 8 MB or less.');
  const mime=audio.type.split(';')[0].toLowerCase();
  if(!audioTypes.has(mime))throw new Error('Use WebM, Ogg, WAV, MP3 or M4A audio.');
  if(!/^[A-Za-z0-9._~-]{8,2048}$/.test(key.trim()))throw new Error('Enter a valid Deepgram API key for this session.');
  const head=new Uint8Array(await audio.slice(0,12).arrayBuffer());
  const text=Array.from(head,b=>String.fromCharCode(b)).join('');
  const container=(mime.includes('wav')&&text.startsWith('RIFF')&&text.slice(8,12)==='WAVE')||(mime==='audio/webm'&&head[0]===0x1a&&head[1]===0x45&&head[2]===0xdf&&head[3]===0xa3)||(mime==='audio/ogg'&&text.startsWith('OggS'))||(mime==='audio/mp4'&&text.slice(4,8)==='ftyp')||(mime==='audio/mpeg'&&(text.startsWith('ID3')||(head[0]===0xff&&(head[1]&0xe0)===0xe0)));
  if(!container)throw new Error('This file does not match a supported audio container.');
  if(signal.aborted)throw canceled();
  return new Promise((resolve,reject)=>{
    let socket:WebSocket;
    try{socket=makeSocket(SESSION_TRANSCRIPTION_URL,['token',key.trim()])}catch{reject(new Error('The transcription connection could not be opened.'));return}
    const segments=new Map<string,{start:number;text:string}>();
    let settled=false,finishedSending=false,metadata=false,responseBytes=0;
    const timer=setTimeout(()=>finish(undefined,new Error('Transcription timed out. Try a shorter recording.')),75_000);
    function finish(value?:string,error?:Error){
      if(settled)return;settled=true;clearTimeout(timer);signal.removeEventListener('abort',abort);
      socket.onopen=null;socket.onmessage=null;socket.onclose=null;socket.onerror=null;
      try{socket.close()}catch{/* The connection may already be closed. */}
      if(error)reject(error);else resolve(value!);
    }
    function abort(){finish(undefined,canceled())}
    signal.addEventListener('abort',abort,{once:true});
    if(signal.aborted){abort();return}
    socket.onopen=async()=>{
      try{
        for(let offset=0;offset<audio.size;offset+=64_000){
          while(socket.bufferedAmount>256_000&&!settled)await new Promise(r=>setTimeout(r,10));
          if(settled||signal.aborted)return;
          if(socket.readyState!==1)throw new Error('closed');
          socket.send(audio.slice(offset,offset+64_000));
        }
        if(!settled){socket.send(JSON.stringify({type:'CloseStream'}));finishedSending=true}
      }catch{finish(undefined,new Error('The audio connection was interrupted. Try again.'))}
    };
    socket.onmessage=event=>{
      if(settled)return;
      if(typeof event.data!=='string'){finish(undefined,new Error('The transcription response could not be read safely.'));return}
      responseBytes+=new TextEncoder().encode(event.data).length;
      if(responseBytes>1_000_000){finish(undefined,new Error('The transcription response exceeded the size limit.'));return}
      try{
        const message=JSON.parse(event.data);
        if(message.type==='Error'){finish(undefined,new Error('Deepgram rejected this request. Check the key permissions, quota and audio format.'));return}
        if(message.type==='Metadata'){metadata=true;return}
        if(message.type!=='Results'||message.is_final!==true)return;
        if(Array.isArray(message.channel_index)&&message.channel_index[0]!==0)return;
        const words=message.channel?.alternatives?.[0]?.transcript;
        if(typeof words!=='string'||!Number.isFinite(message.start)||!Number.isFinite(message.duration))throw new Error('invalid');
        if(words.trim())segments.set(message.start+':'+message.duration,{start:message.start,text:words.trim()});
        const length=Array.from(segments.values()).reduce((n,s)=>n+s.text.length+1,0);
        if(length>5001)finish(undefined,new Error('The transcript exceeds 5,000 characters. Try a shorter recording.'));
      }catch{finish(undefined,new Error('The transcription response could not be read safely.'))}
    };
    socket.onerror=()=>finish(undefined,new Error('Could not connect to Deepgram. Check your key, permissions, quota and connection.'));
    socket.onclose=event=>{
      if(settled)return;
      if(event.code!==1000||!metadata||!finishedSending){finish(undefined,new Error('Transcription ended before it completed. Check your key and connection, then try again.'));return}
      const transcript=Array.from(segments.values()).sort((a,b)=>a.start-b.start).map(s=>s.text).join(' ');
      if(!transcript)finish(undefined,new Error('No clear speech was found. Try a clearer recording or type your answer.'));
      else if(transcript.length>5000)finish(undefined,new Error('The transcript exceeds 5,000 characters. Try a shorter recording.'));
      else finish(transcript);
    };
  });
}
