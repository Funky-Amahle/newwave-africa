'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {transcribeWithSessionKey} from '../lib/session-transcription';
import {VoiceRecorder} from './voice-recorder';
import styles from './creator-studio.module.css';
type Field={id:string;label:string};
export function VoiceToText({fields,onInsert,onAudio}:{fields:Field[];onInsert:(id:string,text:string)=>string|void;onAudio?:(audio:Blob|null)=>void}){
  const direct=process.env.NEXT_PUBLIC_STATIC_SITE==='true';
  const titleId=useId();const sourceId=useId();const uploadId=useId();
  const [target,setTarget]=useState(fields[0]?.id||'');
  const [sourceMode,setSourceMode]=useState<'record'|'upload'>('record');
  const [audioOrigin,setAudioOrigin]=useState<'recorded'|'uploaded'|null>(null);
  const [captureBusy,setCaptureBusy]=useState(false);
  const [playing,setPlaying]=useState(false);
  const [audio,setAudio]=useState<Blob|null>(null);const [recorderKey,setRecorderKey]=useState(0);const [audioName,setAudioName]=useState('');const [previewUrl,setPreviewUrl]=useState('');const [available,setAvailable]=useState<boolean|null>(null);
  const [code,setCode]=useState('');const [consent,setConsent]=useState(false);const [pending,setPending]=useState(false);
  const [transcript,setTranscript]=useState('');const [message,setMessage]=useState('');const abort=useRef<AbortController|null>(null);
  const signature=fields.map(f=>f.id).join('|');
  useEffect(()=>{setTarget(fields[0]?.id||'');setTranscript('');setMessage('');abort.current?.abort();setPending(false)},[signature]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(()=>{
    const controller=new AbortController();
    if(direct)setAvailable(typeof WebSocket!=='undefined');
    else void fetch('/api/transcribe',{signal:AbortSignal.any([controller.signal,AbortSignal.timeout(10_000)]),cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>setAvailable(data?.available===true)).catch(()=>{if(!controller.signal.aborted)setAvailable(false)});
    return()=>{controller.abort();abort.current?.abort()};
  },[]);
  useEffect(()=>{if(!audio){setPreviewUrl('');return}const url=URL.createObjectURL(audio);setPreviewUrl(url);return()=>URL.revokeObjectURL(url)},[audio]);
  function selectAudio(blob:Blob|null){abort.current?.abort();setPending(false);setPlaying(false);setAudio(blob);setConsent(false);setTranscript('');setMessage('');onAudio?.(blob)}
  const audioExtension=audio?.type.includes('mp4')?'m4a':audio?.type.includes('mpeg')?'mp3':audio?.type.includes('ogg')?'ogg':audio?.type.includes('wav')?'wav':'webm';
  const downloadName=audioOrigin==='uploaded'&&audioName?audioName:'newwave-answer.'+audioExtension;
  async function transcribe(){
    if(!audio||!consent||!code||!available||pending)return;
    setPending(true);setMessage('');setTranscript('');const controller=new AbortController();abort.current=controller;
    try{
      let result:string;
      if(direct)result=await transcribeWithSessionKey(audio,code,controller.signal,consent);
      else {
      const response=await fetch('/api/transcribe',{method:'POST',headers:{'Content-Type':audio.type||'audio/webm','Authorization':'Bearer '+code,'X-Transcription-Consent':'yes'},body:audio,signal:controller.signal});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Transcription could not finish.');
      if(typeof data.transcript!=='string'||data.transcript.length>5000)throw new Error('The transcript could not be read safely.');
      result=data.transcript;
      }
      if(!controller.signal.aborted){setTranscript(result);setMessage('Review and correct the words before adding them to your answer.')}
    }catch(error){if(!controller.signal.aborted)setMessage(error instanceof Error?error.message:'Connection failed. Your writing is unchanged.')}
    finally{if(abort.current===controller){setPending(false);abort.current=null}}
  }
  return <section className={styles.panel+' '+styles.transcriptionPanel} aria-labelledby={titleId}>
    <div className={styles.headingRow}><h3 id={titleId}>Speak your answer</h3><span>English transcription</span></div>
    <p>Choose a question, record or upload a short answer, then turn your voice into editable text. You review every word and decide what to add.</p>
    <label>Which question are you answering?<select value={target} disabled={pending} onChange={e=>{abort.current?.abort();setPending(false);setTarget(e.target.value);setTranscript('');setConsent(false);setMessage('')}}>{fields.map(field=><option key={field.id} value={field.id}>{field.label}</option>)}</select></label>
    <div className={styles.modeCards} role="group" aria-label="Choose how to add audio">
      <button type="button" aria-pressed={sourceMode==='record'} aria-controls={sourceId} disabled={pending||captureBusy}
        onClick={()=>setSourceMode('record')}>
        <span className={styles.modeIcon} aria-hidden="true">●</span>
        <span className={styles.modeCopy}><strong>Record a new take</strong><small>Use your microphone · up to 3 min</small></span>
        <span className={styles.modeChoice}>{sourceMode==='record'?'Selected':'Choose'}</span>
      </button>
      <button type="button" aria-pressed={sourceMode==='upload'} aria-controls={sourceId} disabled={pending||captureBusy}
        onClick={()=>setSourceMode('upload')}>
        <span className={styles.modeIcon} aria-hidden="true">↑</span>
        <span className={styles.modeCopy}><strong>Upload an audio file</strong><small>Use an existing recording · max 8 MB</small></span>
        <span className={styles.modeChoice}>{sourceMode==='upload'?'Selected':'Choose'}</span>
      </button>
    </div>
    <div id={sourceId} className={styles.captureModePanel}>
      {sourceMode==='record'
        ? <VoiceRecorder key={recorderKey} previewMode="shared" disabled={pending} onCaptureBusyChange={setCaptureBusy}
            onRecorded={blob=>{selectAudio(blob);setAudioName('Recorded answer');setAudioOrigin('recorded')}}
            onDiscard={()=>{selectAudio(null);setAudioName('');setAudioOrigin(null)}}/>
        : <div className={styles.uploadWell}>
            <span className={styles.uploadEyebrow}>YOUR AUDIO / YOUR CONTROL</span>
            <h4>Bring a recording into your story</h4>
            <p>Choose your own voice note or interview excerpt. Nothing uploads automatically.</p>
            <label htmlFor={uploadId}>Choose an audio file
              <input id={uploadId} type="file" accept="audio/webm,audio/ogg,audio/wav,audio/mpeg,audio/mp4,.m4a" disabled={pending}
              onChange={e=>{
                const file=e.target.files?.[0];e.target.value='';if(!file)return;
                if(!file.size||file.size>8_000_000){setMessage('Choose a non-empty audio file of 8 MB or less.');return}
                const mime=file.type||({mp3:'audio/mpeg',wav:'audio/wav',m4a:'audio/mp4',webm:'audio/webm',ogg:'audio/ogg'}[file.name.split('.').pop()?.toLowerCase()||'']);
                if(!mime||!['audio/webm','audio/ogg','audio/wav','audio/x-wav','audio/mpeg','audio/mp4','audio/x-m4a'].includes(mime.split(';')[0])){setMessage('Use WebM, Ogg, WAV, MP3 or M4A audio.');return}
                setRecorderKey(v=>v+1);
                selectAudio(new Blob([file],{type:mime==='audio/x-m4a'?'audio/mp4':mime}));
                setAudioName(file.name);setAudioOrigin('uploaded');
                setMessage('Audio selected. It has not been sent for transcription.');
              }}/>
            </label>
            <p className={styles.uploadHint}>WebM, Ogg, WAV, MP3 or M4A · 8 MB maximum · permission required before sending</p>
          </div>}
    </div>
    {audio&&<section className={styles.selectedMedia} aria-label="Selected audio preview">
      <div className={styles.selectedHeading}>
        <div><span className={styles.selectedEyebrow}>{audioOrigin==='uploaded'?'UPLOADED AUDIO':'RECORDED TAKE'}</span>
          <h4>{audioName||'Audio ready to review'}</h4>
          <p>Listen and keep this take, or clear it before transcription.</p></div>
        <span className={styles.localOnly}>In this tab only</span>
      </div>
      <div className={styles.selectedPlayer} data-playing={playing}>
        <div className={styles.playbackBars} aria-hidden="true">
          {Array.from({length:13},(_,i)=><i key={i} style={{height:(8+((i*5)%22))+'px',animationDelay:(-i*0.08)+'s'}}/>)}
        </div>
        <audio controls src={previewUrl} aria-label="Selected audio for transcription"
          onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)}/>
      </div>
      <div className={styles.selectedActions}>
        <a className={styles.download} href={previewUrl} download={downloadName}>Download audio</a>
        <button type="button" disabled={pending} onClick={()=>{setRecorderKey(v=>v+1);selectAudio(null);setAudioName('');setAudioOrigin(null)}}>Clear selected audio</button>
      </div>
      <p className={styles.selectedNote}>Preview playback stays on this device. The animated bars are decorative and move only while the audio plays.</p>
    </section>}
    {!available?<p className={styles.message} role="status">{available===null?'Checking transcription availability…':'Transcription is unavailable here. You can still record, upload audio or type your answers.'}</p>:<>
      <div className={styles.row}><label>Your access code (this session)<input type="password" autoComplete="off" spellCheck={false} maxLength={2048} value={code} onChange={e=>{setCode(e.target.value);setConsent(false)}} disabled={pending}/></label><p>{direct?'Use your own restricted key. This demo uses your account quota. The key stays in this panel’s memory and is sent only to the transcription service when you transcribe. It is not saved in browser storage or included in the site files.':'Ask the project owner for a pilot access code. It stays in this tab.'}</p></div>
      {direct&&<div className={styles.actions}><button type="button" disabled={!code&&!pending} onClick={()=>{abort.current?.abort();setPending(false);setCode('');setConsent(false);setMessage('Session key cleared. Your writing is unchanged.')}}>Clear session key</button></div>}
      <label className={styles.check}><input type="checkbox" checked={consent} disabled={pending} onChange={e=>setConsent(e.target.checked)}/><span>I have permission to use this recording and agree to send this audio to the transcription service for transcription. My written draft and visual are not sent.</span></label>
      <div className={styles.actions}><button type="button" className={styles.primary} disabled={!audio||!consent||!code||pending} onClick={transcribe}>{pending?'Transcribing…':'Transcribe selected audio'}</button>{pending&&<button type="button" onClick={()=>{abort.current?.abort();setPending(false);setMessage('Transcription canceled. Your writing is unchanged.')}}>Cancel transcription</button>}</div>
    </>}
    {transcript&&<div className={styles.review}><p>Your draft stays unchanged until you add these words. Copy any transcript you want to keep before closing this panel.</p><label>Review your transcript<textarea value={transcript} maxLength={5000} rows={5} onChange={e=>setTranscript(e.target.value)}/></label><div className={styles.actions}><button type="button" disabled={!transcript.trim()} onClick={()=>{const error=onInsert(target,transcript.trim());if(error){setMessage(error);return}setTranscript('');setMessage('Added to your answer. You can keep editing it.')}}>Add to selected answer</button><button type="button" onClick={()=>{setTranscript('');setMessage('Transcript discarded. Your writing is unchanged.')}}>Discard transcript</button></div></div>}
    {message&&<p className={styles.message} role="status">{message.replace(/\b(?:Deepgram|ElevenLabs|Addis(?: AI)?)\b/gi,'the voice service')}</p>}
  </section>;
}
