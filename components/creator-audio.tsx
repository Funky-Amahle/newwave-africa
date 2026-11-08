'use client';
import {useEffect,useRef,useState} from 'react';
import {generateCreatorAudio} from '../lib/creator-audio';
import {claimNarration,releaseNarration} from '../lib/narration';
import styles from './creator-studio.module.css';
export function CreatorAudio({voice,content}:{voice:string;content:string}){
  const [key,setKey]=useState(''),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[url,setUrl]=useState('');
  const controller=useRef<AbortController|null>(null),audio=useRef<HTMLAudioElement|null>(null),owner=useRef({});
  useEffect(()=>()=>{controller.current?.abort();controller.current=null;},[]);
  useEffect(()=>{const player=audio.current,token=owner.current;return ()=>{player?.pause();releaseNarration(token);if(url)URL.revokeObjectURL(url);};},[url]);
  function cancel(){controller.current?.abort();controller.current=null;setBusy(false);setMessage('Generation cancelled. Any text already sent may still count toward your Deepgram usage.');}
  async function generate(){
    if(!consent||busy)return;
    const request=new AbortController();controller.current=request;setBusy(true);audio.current?.pause();releaseNarration(owner.current);setUrl('');setMessage('Preparing narration…');
    const timeout=window.setTimeout(()=>request.abort(),180000);
    try{
      const blob=await generateCreatorAudio({text:content,model:voice,key,signal:request.signal,onProgress:(done,total)=>setMessage(`Generating section ${Math.min(done+1,total)} of ${total}…`)});
      if(controller.current!==request)return;
      setUrl(URL.createObjectURL(blob));setMessage('Your narration is ready. Listen and check pronunciation before sharing.');
    }catch(error){if(controller.current===request)setMessage(request.signal.aborted?'Generation timed out. Try again with a shorter story.':error instanceof TypeError?'Could not connect to Deepgram. Check your connection and browser access, then try again.':error instanceof Error?error.message:'Narration failed. Please try again.');}
    finally{window.clearTimeout(timeout);if(controller.current===request){controller.current=null;setBusy(false);}}
  }
  return <div className={styles.review}>
    <h4>Hear your story</h4>
    <p>Generate the English text in “Your story” using the voice above. Longer stories use several requests and become one WAV download. Your Deepgram account is charged for generation; replay and download do not generate again.</p>
    <label htmlFor="narration-session-key">Your Deepgram narration key (this session)</label>
    <input id="narration-session-key" type="password" autoComplete="off" spellCheck={false} value={key} disabled={busy} onChange={event=>setKey(event.target.value)}/>
    <p>Your key stays in this panel’s memory and goes only to Deepgram. It is not saved. Changing the story or voice, leaving Creator Studio, or refreshing clears it and the generated recording.</p>
    <button type="button" disabled={!key} onClick={()=>{if(busy)cancel();setKey('');setConsent(false);}}>Clear narration key</button>
    <label className={styles.check}><input type="checkbox" checked={consent} disabled={busy} onChange={event=>setConsent(event.target.checked)}/><span>I have permission to use this story and agree to send its text to Deepgram to generate narration using my account quota.</span></label>
    <div className={styles.actions}><button type="button" disabled={busy||!key.trim()||!consent||!content.trim()} onClick={generate}>{busy?'Generating narration…':'Generate story audio'}</button>{busy&&<button type="button" onClick={cancel}>Cancel generation</button>}</div>
    {message&&<p role="status" className={styles.message}>{message}</p>}
    {url&&<div className={styles.review}><audio ref={audio} controls src={url} aria-label="Generated story narration" onPlay={event=>{const player=event.currentTarget;claimNarration(owner.current,()=>player.pause());}} onPause={()=>releaseNarration(owner.current)} onEnded={()=>releaseNarration(owner.current)} onError={()=>setMessage('This browser could not play the WAV recording. Download it to listen in an audio player.')}/><a className={styles.download} href={url} download={`newwave-story-${voice}.wav`}>Download story audio (WAV)</a><p>AI-generated narration. Download to keep it; recordings are not saved with your written draft.</p></div>}
  </div>;
}
