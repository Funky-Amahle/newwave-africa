'use client';
import {useEffect,useId,useRef,useState} from 'react';
const MAX_BYTES=8_000_000;
let captureOwner:object|null=null;
export function VoiceRecorder({onRecorded,onDiscard}:{onRecorded?:(blob:Blob)=>void;onDiscard?:()=>void}){
  const titleId=useId();const [supported,setSupported]=useState(false);
  const [state,setState]=useState<'idle'|'requesting'|'recording'|'preview'>('idle');
  const [error,setError]=useState('');const [url,setUrl]=useState('');const [seconds,setSeconds]=useState(0);
  const owner=useRef({});const recorder=useRef<MediaRecorder|null>(null);const stream=useRef<MediaStream|null>(null);
  const mounted=useRef(true);const revision=useRef(0);const timer=useRef<ReturnType<typeof setInterval>|null>(null);
  const currentUrl=useRef('');const chunks=useRef<Blob[]>([]);const callbacks=useRef({onRecorded,onDiscard});callbacks.current={onRecorded,onDiscard};
  function cleanup(){stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;if(timer.current)clearInterval(timer.current);timer.current=null;if(captureOwner===owner.current)captureOwner=null}
  useEffect(()=>{mounted.current=true;setSupported(!!navigator.mediaDevices?.getUserMedia&&typeof MediaRecorder!=='undefined');return()=>{mounted.current=false;revision.current++;if(recorder.current?.state==='recording')recorder.current.stop();cleanup();if(currentUrl.current)URL.revokeObjectURL(currentUrl.current)}},[]);
  async function start(){
    if(captureOwner){setError('Finish the other recording first.');return}
    captureOwner=owner.current;const ticket=++revision.current;setError('');setState('requesting');
    try{
      const mic=await navigator.mediaDevices.getUserMedia({audio:true});
      if(!mounted.current||ticket!==revision.current){mic.getTracks().forEach(t=>t.stop());return}
      stream.current=mic;const mr=new MediaRecorder(mic);recorder.current=mr;chunks.current=[];let size=0;let oversized=false;let failed=false;
      mr.ondataavailable=e=>{if(size+e.data.size>MAX_BYTES){oversized=true;if(mr.state==='recording')mr.stop();return}size+=e.data.size;if(e.data.size)chunks.current.push(e.data)};
      mr.onstop=()=>{cleanup();if(!mounted.current)return;if(failed)return;
        if(oversized){setError('Recording exceeded 8 MB. Try a shorter answer.');setState(currentUrl.current?'preview':'idle');return}
        const blob=new Blob(chunks.current,{type:mr.mimeType||'audio/webm'});
        if(!blob.size){setError('No audio was captured.');setState(currentUrl.current?'preview':'idle');return}
        if(currentUrl.current)URL.revokeObjectURL(currentUrl.current);currentUrl.current=URL.createObjectURL(blob);setUrl(currentUrl.current);setState('preview');callbacks.current.onRecorded?.(blob);
      };
      mr.onerror=()=>{failed=true;cleanup();if(mounted.current){setError('Recording failed. Try again.');setState(currentUrl.current?'preview':'idle')}};
      setSeconds(0);mr.start(1000);setState('recording');let elapsed=0;
      timer.current=setInterval(()=>{elapsed++;setSeconds(elapsed);if(elapsed>=180&&mr.state==='recording')mr.stop()},1000);
    }catch{cleanup();if(mounted.current){setState(currentUrl.current?'preview':'idle');setError('Microphone access was unavailable. Check permission or upload an audio file.')}}
  }
  function discard(){if(currentUrl.current)URL.revokeObjectURL(currentUrl.current);currentUrl.current='';setUrl('');setState('idle');callbacks.current.onDiscard?.()}
  return <section className="voice-studio" aria-labelledby={titleId}>
    <div className="voice-studio-head"><h3 id={titleId}>Record an answer</h3><span className="voice-privacy">Up to 3 minutes · stays in this tab</span></div>
    <p className="note">Speak naturally, then review the recording. Nothing is sent for transcription until you choose to send it.</p>
    <div className="voice-actions">
      {state!=='recording'&&<button type="button" onClick={start} disabled={!supported||state==='requesting'}>{state==='requesting'?'Waiting for microphone…':url?'Record again':'Start recording'}</button>}
      {state==='recording'&&<><span role="status">Recording · {seconds}s</span><button type="button" onClick={()=>recorder.current?.stop()}>Stop recording</button></>}
      {url&&state!=='recording'&&<><audio controls src={url} aria-label="Your recorded answer preview"/><a href={url} download={'newwave-answer.'+(recorder.current?.mimeType.includes('mp4')?'m4a':recorder.current?.mimeType.includes('ogg')?'ogg':'webm')}>Download recording</a><button type="button" onClick={discard}>Discard recording</button></>}
    </div>
    {!supported&&<p role="status" className="note">Microphone recording is unavailable here. You can upload audio or type your answer.</p>}
    {error&&<p role="alert" className="notice">{error}</p>}
  </section>;
}
