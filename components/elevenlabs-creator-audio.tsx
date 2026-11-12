'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {ELEVENLABS_LANGUAGES,ELEVENLABS_VOICES,ELEVENLABS_SAMPLES,ELEVENLABS_MAX_TEXT,elevenLabsBrief} from '../lib/elevenlabs-voices';
import {generateElevenLabsAudio} from '../lib/elevenlabs-audio';
import {claimNarration,releaseNarration} from '../lib/narration';
import styles from './creator-studio.module.css';

export function ElevenLabsCreatorAudio({title,content,storyLanguage}:{title:string;content:string;storyLanguage:string}){
  const [language,setLanguage]=useState<string>(()=>ELEVENLABS_LANGUAGES.find(item=>item.name===storyLanguage)?.code||'en'),[voice,setVoice]=useState<string>(ELEVENLABS_VOICES[0].id);
  const [key,setKey]=useState(''),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[url,setUrl]=useState('');
  const id=useId(),controller=useRef<AbortController|null>(null),player=useRef<HTMLAudioElement|null>(null),preview=useRef<HTMLAudioElement|null>(null),owner=useRef({}),previewOwner=useRef({});
  const sample=ELEVENLABS_SAMPLES[language],base=process.env.NEXT_PUBLIC_SITE_BASE_PATH||'';
  const withinLimit=!!content.trim()&&content.length<=ELEVENLABS_MAX_TEXT;
  useEffect(()=>{
    controller.current?.abort();controller.current=null;setBusy(false);setKey('');setConsent(false);setUrl('');setMessage('');
    player.current?.pause();releaseNarration(owner.current);
  },[content,voice,language]);
  useEffect(()=>()=>{controller.current?.abort();controller.current=null;preview.current?.pause();releaseNarration(previewOwner.current);},[]);
  useEffect(()=>{const audio=player.current,token=owner.current;return()=>{audio?.pause();releaseNarration(token);if(url)URL.revokeObjectURL(url);};},[url]);
  useEffect(()=>{const audio=preview.current,token=previewOwner.current;return()=>{audio?.pause();releaseNarration(token);};},[language]);
  function cancel(){controller.current?.abort();controller.current=null;setBusy(false);setMessage('Request cancelled. Text already sent may still count toward your account usage.');}
  async function generate(){
    if(busy||!consent||!withinLimit||!key.trim())return;
    const request=new AbortController();controller.current=request;setBusy(true);setUrl('');setMessage('Generating your narration…');
    player.current?.pause();preview.current?.pause();releaseNarration(owner.current);releaseNarration(previewOwner.current);
    const timer=window.setTimeout(()=>request.abort(),120000);
    try{
      const blob=await generateElevenLabsAudio({text:content,language,voiceId:voice,key,consent,signal:request.signal});
      if(controller.current!==request)return;
      setUrl(URL.createObjectURL(blob));setMessage('Your recording is ready. Check tone and pronunciation before sharing.');
    }catch(error){if(controller.current===request)setMessage(request.signal.aborted?'Generation timed out. Check your account history before requesting another recording.':error instanceof TypeError?'Could not reach the narration service. Check your connection and browser access; no automatic retry was made.':error instanceof Error?error.message:'Narration could not be completed.');}
    finally{window.clearTimeout(timer);if(controller.current===request){controller.current=null;setBusy(false);}}
  }
  function downloadBrief(){
    let briefUrl:string|undefined;
    try{briefUrl=URL.createObjectURL(new Blob([elevenLabsBrief(language,voice,title,content)],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=briefUrl;link.download='newwave-multilingual-narration-brief.txt';document.body.appendChild(link);link.click();link.remove();setMessage('Your narration brief is ready. No story text was sent.');}
    catch(error){setMessage(error instanceof Error?error.message:'Could not prepare the narration brief.');}
    finally{if(briefUrl){const saved=briefUrl;window.setTimeout(()=>URL.revokeObjectURL(saved),1000);}}
  }
  return <section id="studio-narration" tabIndex={-1} className={styles.panel} aria-labelledby={id+'-heading'}>
    <h3 id={id+'-heading'}>Narrate in your language</h3>
    <p>Choose from {ELEVENLABS_LANGUAGES.length} languages and {ELEVENLABS_VOICES.length} voices, including Afrikaans and isiZulu. Write your story in the chosen language; narration does not translate it.</p>
    <label htmlFor={id+'-language'}>Narration language</label>
    <select id={id+'-language'} value={language} disabled={busy} onChange={event=>setLanguage(event.target.value)}>{ELEVENLABS_LANGUAGES.map(item=><option key={item.code} value={item.code}>{item.name}</option>)}</select>
    <label htmlFor={id+'-voice'}>Narration voice</label>
    <select id={id+'-voice'} value={voice} disabled={busy} onChange={event=>setVoice(event.target.value)}>{ELEVENLABS_VOICES.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select>
    <div className={styles.review}>
      <h4>Listen to a language sample</h4>
      {sample?<>
        <p>Fixed preview · {sample.voice}. The preview voice may differ from your selection above.</p>
        <p lang={language} dir={language==='ar'?'rtl':'auto'}>{sample.text}</p>
        <audio key={language} ref={preview} controls preload="none" src={base+'/voice-samples/elevenlabs/'+sample.file} aria-label={'Narration '+sample.voice+' '+language+' sample'}
          onPlay={event=>{const audio=event.currentTarget;claimNarration(previewOwner.current,()=>audio.pause());}}
          onPause={()=>releaseNarration(previewOwner.current)} onEnded={()=>releaseNarration(previewOwner.current)} onError={()=>setMessage('This sample could not play. Try downloading it or choose another language.')}/>
        <a className={styles.download} href={base+'/voice-samples/elevenlabs/'+sample.file} download>Download sample MP3</a>
      </>:<p>No bundled preview for this language yet. You can still use it for narration.</p>}
      <p>Samples are synthetic and need native-speaker pronunciation review. Listening does not send your story or use your account quota.</p>
    </div>
    <div className={styles.actions}><button type="button" disabled={!content.trim()} onClick={downloadBrief}>Download narration brief</button></div>
    <div className={styles.review}>
      <h4>Hear your story</h4>
      <p>Generate up to 5,000 characters using your connected account. Each generation uses your quota; replay and download do not generate again.</p>
      <label htmlFor={id+'-key'}>Your access code (this session)</label>
      <input id={id+'-key'} type="password" autoComplete="off" spellCheck={false} disabled={busy} value={key} onChange={event=>setKey(event.target.value)}/>
      <p>The key goes only to the selected narration service and stays in this panel’s memory. Changing the story, language or voice, leaving the panel, or refreshing clears the key and recording. Use a restricted Text to Speech key with a spending limit.</p>
      <button type="button" disabled={!key&&!url} onClick={()=>{if(busy)cancel();setKey('');setConsent(false);setUrl('');setMessage('Your narration key and recording have been cleared.');}}>Clear key and recording</button>
      <label className={styles.check}><input type="checkbox" disabled={busy} checked={consent} onChange={event=>setConsent(event.target.checked)}/><span>I have permission to use this story and agree to send its text to the selected narration service for paid narration using my account quota.</span></label>
      <p>{content.length.toLocaleString()} of {ELEVENLABS_MAX_TEXT.toLocaleString()} characters. Check that your text matches the selected language.</p>
      <div className={styles.actions}><button type="button" disabled={busy||!key.trim()||!consent||!withinLimit} onClick={()=>void generate()}>{busy?'Generating narration…':'Generate story MP3'}</button>{busy&&<button type="button" onClick={cancel}>Cancel generation</button>}</div>
      {message&&<p role="status" className={styles.message}>{message.replace(/\b(?:Deepgram|ElevenLabs|Addis(?: AI)?)\b/gi,'the voice service')}</p>}
      {url&&<div className={styles.review}><audio ref={player} controls src={url} aria-label="Generated story narration"
        onPlay={event=>{const audio=event.currentTarget;claimNarration(owner.current,()=>audio.pause());}} onPause={()=>releaseNarration(owner.current)} onEnded={()=>releaseNarration(owner.current)} onError={()=>setMessage('This browser could not play the recording. Download the MP3 to listen elsewhere.')}/>
        <a className={styles.download} href={url} download={'newwave-story-'+language+'.mp3'}>Download story MP3</a><p>Download to keep it. Narration is not saved with your written draft.</p></div>}
    </div>
  </section>;
}
