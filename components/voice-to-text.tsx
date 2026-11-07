'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {VoiceRecorder} from './voice-recorder';
import styles from './creator-studio.module.css';
type Field={id:string;label:string};
export function VoiceToText({fields,onInsert,onAudio}:{fields:Field[];onInsert:(id:string,text:string)=>string|void;onAudio?:(audio:Blob|null)=>void}){
  const titleId=useId();const [target,setTarget]=useState(fields[0]?.id||'');
  const [audio,setAudio]=useState<Blob|null>(null);const [recorderKey,setRecorderKey]=useState(0);const [audioName,setAudioName]=useState('');const [previewUrl,setPreviewUrl]=useState('');const [available,setAvailable]=useState<boolean|null>(null);
  const [code,setCode]=useState('');const [consent,setConsent]=useState(false);const [pending,setPending]=useState(false);
  const [transcript,setTranscript]=useState('');const [message,setMessage]=useState('');const abort=useRef<AbortController|null>(null);
  const signature=fields.map(f=>f.id).join('|');
  useEffect(()=>{setTarget(fields[0]?.id||'');setTranscript('');setMessage('');abort.current?.abort();setPending(false)},[signature]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{
    const controller=new AbortController();
    if(process.env.NEXT_PUBLIC_STATIC_SITE==='true')setAvailable(false);
    else void fetch('/api/transcribe',{signal:AbortSignal.any([controller.signal,AbortSignal.timeout(10_000)]),cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>setAvailable(data?.available===true)).catch(()=>{if(!controller.signal.aborted)setAvailable(false)});
    return()=>{controller.abort();abort.current?.abort()};
  },[]);
  useEffect(()=>{if(!audio){setPreviewUrl('');return}const url=URL.createObjectURL(audio);setPreviewUrl(url);return()=>URL.revokeObjectURL(url)},[audio]);
  function selectAudio(blob:Blob|null){abort.current?.abort();setPending(false);setAudio(blob);setConsent(false);setTranscript('');setMessage('');onAudio?.(blob)}
  async function transcribe(){
    if(!audio||!consent||!code||!available||pending)return;
    setPending(true);setMessage('');setTranscript('');const controller=new AbortController();abort.current=controller;
    try{
      const response=await fetch('/api/transcribe',{method:'POST',headers:{'Content-Type':audio.type||'audio/webm','Authorization':'Bearer '+code,'X-Transcription-Consent':'yes'},body:audio,signal:controller.signal});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Transcription could not finish.');
      if(typeof data.transcript!=='string'||data.transcript.length>5000)throw new Error('The transcript could not be read safely.');
      if(!controller.signal.aborted){setTranscript(data.transcript);setMessage('Review and correct the words before adding them to your answer.')}
    }catch(error){if(!controller.signal.aborted)setMessage(error instanceof Error?error.message:'Connection failed. Your writing is unchanged.')}
    finally{if(abort.current===controller){setPending(false);abort.current=null}}
  }
  return <section className={styles.panel} aria-labelledby={titleId}>
    <div className={styles.headingRow}><h3 id={titleId}>Speak your answer</h3><span>Deepgram transcription · English</span></div>
    <p>Choose a question, record or upload a short answer, then turn your voice into editable text. You review every word and decide what to add.</p>
    <label>Which question are you answering?<select value={target} disabled={pending} onChange={e=>{setTarget(e.target.value);setMessage('')}}>{fields.map(field=><option key={field.id} value={field.id}>{field.label}</option>)}</select></label>
    <VoiceRecorder key={recorderKey} onRecorded={blob=>{selectAudio(blob);setAudioName('Recorded answer')}} onDiscard={()=>{selectAudio(null);setAudioName('')}}/>
    <label>Or upload an audio answer<input type="file" accept="audio/webm,audio/ogg,audio/wav,audio/mpeg,audio/mp4,.m4a" disabled={pending} onChange={e=>{
      const file=e.target.files?.[0];e.target.value='';if(!file)return;
      if(!file.size||file.size>8_000_000){setMessage('Choose a non-empty audio file of 8 MB or less.');return}
      const mime=file.type||({mp3:'audio/mpeg',wav:'audio/wav',m4a:'audio/mp4',webm:'audio/webm',ogg:'audio/ogg'}[file.name.split('.').pop()?.toLowerCase()||'']);
      if(!mime||!['audio/webm','audio/ogg','audio/wav','audio/x-wav','audio/mpeg','audio/mp4','audio/x-m4a'].includes(mime.split(';')[0])){setMessage('Use WebM, Ogg, WAV, MP3 or M4A audio.');return}
      setRecorderKey(v=>v+1);selectAudio(new Blob([file],{type:mime==='audio/x-m4a'?'audio/mp4':mime}));setAudioName(file.name);setMessage('Audio selected. It has not been sent for transcription.');
    }}/></label>
    {audio&&<div className={styles.review}><p>Selected audio: {audioName}</p><audio controls src={previewUrl} aria-label="Selected audio for transcription"/><div className={styles.actions}><button type="button" disabled={pending} onClick={()=>{setRecorderKey(v=>v+1);selectAudio(null);setAudioName('')}}>Clear selected audio</button></div></div>}
    {!available?<p className={styles.message} role="status">{available===null?'Checking transcription availability…':'Transcription is not available on this site yet. You can still record, upload audio or type your answers.'}</p>:<>
      <div className={styles.row}><label>Transcription access code<input type="password" autoComplete="off" value={code} onChange={e=>setCode(e.target.value)} disabled={pending}/></label><p>Ask the project owner for a pilot access code. It stays in this tab.</p></div>
      <label className={styles.check}><input type="checkbox" checked={consent} disabled={pending} onChange={e=>setConsent(e.target.checked)}/><span>I have permission to use this recording and agree to send this audio to Deepgram for transcription. My written draft and visual are not sent.</span></label>
      <div className={styles.actions}><button type="button" className={styles.primary} disabled={!audio||!consent||!code||pending} onClick={transcribe}>{pending?'Transcribing…':'Transcribe selected audio'}</button>{pending&&<button type="button" onClick={()=>{abort.current?.abort();setPending(false);setMessage('Transcription canceled. Your writing is unchanged.')}}>Cancel transcription</button>}</div>
    </>}
    {transcript&&<div className={styles.review}><p>Your draft stays unchanged until you add these words. Copy any transcript you want to keep before closing this panel.</p><label>Review your transcript<textarea value={transcript} maxLength={5000} rows={5} onChange={e=>setTranscript(e.target.value)}/></label><div className={styles.actions}><button type="button" disabled={!transcript.trim()} onClick={()=>{const error=onInsert(target,transcript.trim());if(error){setMessage(error);return}setTranscript('');setMessage('Added to your answer. You can keep editing it.')}}>Add to selected answer</button><button type="button" onClick={()=>{setTranscript('');setMessage('Transcript discarded. Your writing is unchanged.')}}>Discard transcript</button></div></div>}
    {message&&<p className={styles.message} role="status">{message}</p>}
  </section>;
}
