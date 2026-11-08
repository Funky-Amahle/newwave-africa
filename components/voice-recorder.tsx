'use client';
import {useEffect,useId,useRef,useState} from 'react';
import styles from './voice-recorder.module.css';

const MAX_BYTES=8_000_000;
let captureOwner:object|null=null;

type RecorderState='idle'|'requesting'|'recording'|'preview';
type Props={
  onRecorded?:(blob:Blob)=>void;
  onDiscard?:()=>void;
  /** The transcription studio owns a single shared player; standalone use keeps its own preview. */
  previewMode?:'inline'|'shared';
  disabled?:boolean;
};
const pad=(n:number)=>String(n).padStart(2,'0');
const clock=(seconds:number)=>pad(Math.floor(seconds/60))+':'+pad(seconds%60);

export function VoiceRecorder({onRecorded,onDiscard,previewMode='inline',disabled=false}:Props){
  const titleId=useId();
  const [supported,setSupported]=useState(false);
  const [state,setState]=useState<RecorderState>('idle');
  const [error,setError]=useState('');
  const [url,setUrl]=useState('');
  const [seconds,setSeconds]=useState(0);
  const owner=useRef({});
  const recorder=useRef<MediaRecorder|null>(null);
  const stream=useRef<MediaStream|null>(null);
  const mounted=useRef(true);
  const revision=useRef(0);
  const timer=useRef<ReturnType<typeof setInterval>|null>(null);
  const currentUrl=useRef('');
  const chunks=useRef<Blob[]>([]);
  const callbacks=useRef({onRecorded,onDiscard});
  callbacks.current={onRecorded,onDiscard};

  function cleanup(){
    stream.current?.getTracks().forEach(track=>track.stop());
    stream.current=null;
    if(timer.current)clearInterval(timer.current);
    timer.current=null;
    if(captureOwner===owner.current)captureOwner=null;
  }

  useEffect(()=>{
    mounted.current=true;
    setSupported(!!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder!=='undefined');
    return ()=>{
      mounted.current=false;
      revision.current++;
      if(recorder.current?.state==='recording')recorder.current.stop();
      cleanup();
      if(currentUrl.current)URL.revokeObjectURL(currentUrl.current);
    };
  },[]);

  async function start(){
    if(disabled||state==='recording'||state==='requesting')return;
    if(captureOwner){setError('Finish the other recording first.');return}
    captureOwner=owner.current;
    const ticket=++revision.current;
    setError('');
    setState('requesting');
    try{
      const mic=await navigator.mediaDevices.getUserMedia({audio:true});
      if(!mounted.current||ticket!==revision.current){
        mic.getTracks().forEach(track=>track.stop());
        return;
      }
      stream.current=mic;
      const mr=new MediaRecorder(mic);
      recorder.current=mr;
      chunks.current=[];
      let size=0,oversized=false,failed=false;
      mr.ondataavailable=event=>{
        if(size+event.data.size>MAX_BYTES){
          oversized=true;
          if(mr.state==='recording')mr.stop();
          return;
        }
        size+=event.data.size;
        if(event.data.size)chunks.current.push(event.data);
      };
      mr.onstop=()=>{
        cleanup();
        if(!mounted.current||failed)return;
        if(oversized){
          setError('Recording exceeded 8 MB. Try a shorter answer.');
          setState(currentUrl.current?'preview':'idle');
          return;
        }
        const blob=new Blob(chunks.current,{type:mr.mimeType||'audio/webm'});
        if(!blob.size){
          setError('No audio was captured. Please try again.');
          setState(currentUrl.current?'preview':'idle');
          return;
        }
        if(currentUrl.current)URL.revokeObjectURL(currentUrl.current);
        currentUrl.current=URL.createObjectURL(blob);
        setUrl(currentUrl.current);
        setState('preview');
        callbacks.current.onRecorded?.(blob);
      };
      mr.onerror=()=>{
        failed=true;
        cleanup();
        if(mounted.current){
          setError('Recording failed. Try again.');
          setState(currentUrl.current?'preview':'idle');
        }
      };
      setSeconds(0);
      mr.start(1000);
      setState('recording');
      let elapsed=0;
      timer.current=setInterval(()=>{
        elapsed++;
        setSeconds(elapsed);
        if(elapsed>=180&&mr.state==='recording')mr.stop();
      },1000);
    }catch{
      cleanup();
      if(mounted.current){
        setState(currentUrl.current?'preview':'idle');
        setError('Microphone access was unavailable. Check permission or choose Upload audio.');
      }
    }
  }

  function discard(){
    if(currentUrl.current)URL.revokeObjectURL(currentUrl.current);
    currentUrl.current='';
    setUrl('');
    setSeconds(0);
    setState('idle');
    callbacks.current.onDiscard?.();
  }

  const ready=state==='preview';
  const status=state==='requesting'?'Requesting microphone permission':
    state==='recording'?'Recording your answer':
    ready?'Take captured — review it below':'Ready when you are';

  return <section className={styles.recorder} aria-labelledby={titleId}>
    <div className={styles.heading}>
      <div><h4 id={titleId}>Record an answer</h4><p>Speak naturally. Review before you transcribe.</p></div>
      <span className={styles.limit}>03:00 max · Local preview</span>
    </div>
    <div className={styles.capture} data-phase={state}>
      <div className={styles.captureVisual} aria-hidden="true">
        <span className={styles.pulse}><span/></span>
        <div className={styles.wave}>
          {Array.from({length:19},(_,i)=><i key={i} style={{height:(10+((i*7)%24))+'px',animationDelay:(-i*0.07)+'s'}}/>)}
        </div>
      </div>
      <div className={styles.captureInfo}>
        <span className={styles.stateLabel} role="status">{status}</span>
        <strong className={styles.time} aria-label={'Recording duration '+clock(seconds)}>{clock(seconds)}</strong>
      </div>
      <div className={styles.buttons}>
        {state==='recording'
          ? <button type="button" className={styles.stopButton} onClick={()=>recorder.current?.stop()}>
              <span className={styles.stopIcon} aria-hidden="true"/>Stop recording
            </button>
          : <button type="button" className={styles.recordButton} onClick={start} disabled={disabled||!supported||state==='requesting'}>
              <span className={styles.recordIcon} aria-hidden="true"/>{state==='requesting'?'Waiting for microphone…':ready?'Record another take':'Start recording'}
            </button>}
      </div>
    </div>
    {ready&&previewMode==='inline'&&<div className={styles.inlinePreview}>
      <strong>Your take is ready</strong>
      <audio controls src={url} aria-label="Your recorded answer preview"/>
      <div className={styles.previewActions}>
        <a href={url} download={'newwave-answer.'+(recorder.current?.mimeType.includes('mp4')?'m4a':recorder.current?.mimeType.includes('ogg')?'ogg':'webm')}>Download recording</a>
        <button type="button" onClick={discard}>Discard recording</button>
      </div>
    </div>}
    {!supported&&<p role="status" className={styles.message}>Microphone recording is unavailable here. You can upload audio or type your answer.</p>}
    {error&&<p role="alert" className={styles.error}>{error}</p>}
    <p className={styles.privacy}>Your recording stays in this tab unless you explicitly consent to transcription. The animated signal is decorative, not a measurement of audio volume.</p>
  </section>;
}
