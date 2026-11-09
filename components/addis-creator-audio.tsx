'use client';

import {useEffect,useId,useRef,useState} from 'react';
import {ADDIS_MAX_TEXT} from '../lib/addis-languages';
import {AddisLanguagePicker} from './addis-language-picker';
import {claimNarration,releaseNarration} from '../lib/narration';
import styles from './creator-studio.module.css';

type Voice={id:string;name:string;style:string};
type Estimate={estimatedCost:number;currency:string;canGenerate:boolean};
type Result={error?:string;available?:boolean;voices?:Voice[];audioUrl?:string;estimatedCost?:number;currency?:string;canGenerate?:boolean};

export function AddisCreatorAudio({content}:{content:string}){
  const [available,setAvailable]=useState<boolean|null>(null);
  const [code,setCode]=useState('');
  const [language,setLanguage]=useState('sw');
  const [voices,setVoices]=useState<Voice[]>([]);
  const [voice,setVoice]=useState('');
  const [open,setOpen]=useState(false);
  const [search,setSearch]=useState('');
  const [consent,setConsent]=useState(false);
  const [estimate,setEstimate]=useState<Estimate|null>(null);
  const [audioUrl,setAudioUrl]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const pickerId=useId();
  const abort=useRef<AbortController|null>(null);
  const owner=useRef({});
  const player=useRef<HTMLAudioElement|null>(null);
  const pickerRef=useRef<HTMLDivElement|null>(null);
  const triggerRef=useRef<HTMLButtonElement|null>(null);
  const searchRef=useRef<HTMLInputElement|null>(null);
  const staticSite=process.env.NEXT_PUBLIC_STATIC_SITE==='true';
  const text=content.trim();
  const withinLimit=!!text&&text.length<=ADDIS_MAX_TEXT;
  const selected=voices.find(item=>item.id===voice);
  const matches=voices.filter(item=>[item.name,item.style].join(' ').toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a,b)=>a.name.localeCompare(b.name));
  const canSubmit=available===true&&code.trim().length>0&&!busy;

  useEffect(()=>{
    if(staticSite){setAvailable(false);return;}
    const controller=new AbortController();
    void fetch('/api/addis-voice',{signal:controller.signal,cache:'no-store'})
      .then(response=>response.ok?response.json():null)
      .then((data:Result|null)=>{if(!controller.signal.aborted)setAvailable(data?.available===true);})
      .catch(()=>{if(!controller.signal.aborted)setAvailable(false);});
    return()=>controller.abort();
  },[staticSite]);

  useEffect(()=>{
    if(!open)return;
    searchRef.current?.focus();
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){
        event.preventDefault();setOpen(false);setSearch('');triggerRef.current?.focus();
      }
    };
    const onOutsideClick=(event:PointerEvent)=>{
      if(!pickerRef.current?.contains(event.target as Node)){setOpen(false);setSearch('');}
    };
    document.addEventListener('keydown',onKeyDown);
    document.addEventListener('pointerdown',onOutsideClick);
    return()=>{document.removeEventListener('keydown',onKeyDown);document.removeEventListener('pointerdown',onOutsideClick);};
  },[open]);

  useEffect(()=>()=>{abort.current?.abort();player.current?.pause();releaseNarration(owner.current);},[]);
  // A changed story or voice invalidates an estimate and any in-flight response.
  useEffect(()=>{
    abort.current?.abort();abort.current=null;
    setBusy(false);setEstimate(null);setAudioUrl('');
    player.current?.pause();releaseNarration(owner.current);
  },[text,language,voice]);

  function resetOutput(){
    abort.current?.abort();abort.current=null;setBusy(false);
    setEstimate(null);setAudioUrl('');player.current?.pause();releaseNarration(owner.current);
  }

  async function request(action:'voices'|'estimate'|'generate'){
    if(!canSubmit)return;
    if(action!=='voices'&&(!consent||!selected||!withinLimit))return;
    if(action==='generate'&&!estimate?.canGenerate)return;
    const controller=new AbortController();abort.current=controller;setBusy(true);setMessage('');
    if(action!=='voices')setAudioUrl('');
    try{
      const response=await fetch('/api/addis-voice',{
        method:'POST',
        headers:{'content-type':'application/json','authorization':'Bearer '+code.trim()},
        body:JSON.stringify({action,language,voiceId:voice,text,consent,requestId:crypto.randomUUID()}),
        signal:controller.signal,cache:'no-store',credentials:'same-origin',redirect:'error'
      });
      const data=await response.json() as Result;
      if(!response.ok)throw new Error(data.error||'The Addis request failed.');
      if(controller!==abort.current)return;
      if(action==='voices'){
        const next=data.voices||[];
        setVoices(next);setVoice(current=>next.some(v=>v.id===current)?current:next[0]?.id||'');
        setOpen(false);setSearch('');setEstimate(null);
        setMessage(next.length?next.length+' available voices loaded. Choose one below.':'No Addis voices are available for this language.');
      }else if(action==='estimate'){
        if(typeof data.estimatedCost!=='number'||typeof data.currency!=='string'||typeof data.canGenerate!=='boolean')
          throw new Error('The provider estimate was incomplete.');
        setEstimate({estimatedCost:data.estimatedCost,currency:data.currency,canGenerate:data.canGenerate});
        setMessage(data.canGenerate?'Review the estimated cost and approve generation below.':'Insufficient provider balance. Audio was not requested.');
      }else if(data.audioUrl){
        setAudioUrl(data.audioUrl);setEstimate(null);
        setMessage('Your narration is ready. Listen and check pronunciation before sharing.');
      }else throw new Error('The provider did not return an audio link.');
    }catch(error){
      if(controller===abort.current)setMessage(controller.signal.aborted
        ?'Request cancelled. A generation already started may still be billed.'
        :error instanceof Error?error.message:'Addis request failed.');
    }finally{if(abort.current===controller){abort.current=null;setBusy(false);}}
  }

  return <section id="studio-narration" tabIndex={-1} className={styles.panel} aria-labelledby={pickerId+'-heading'}>
    <h3 id={pickerId+'-heading'}>Choose your narration voice</h3>
    <p>Addis AI · African-language narration. Choose the language of your written story, then select a voice. Addis does not translate your text, and Deepgram remains the default provider.</p>
    {staticSite||available===false
      ? <p role="status" id={pickerId+'-availability'} className={styles.message}>Addis narration needs a privately hosted NewWave server. GitHub Pages cannot safely hold an Addis API key. You can browse the seven languages below, but narration generation is unavailable here. Deepgram is still available.</p>
      : available===null?<p role="status" id={pickerId+'-availability'}>Checking Addis pilot availability…</p>
      : <p id={pickerId+'-availability'}>Private pilot available. Use the separate pilot access code below, not your Addis API key.</p>}

    <AddisLanguagePicker value={language} disabled={busy} onChange={next=>{
      resetOutput();setLanguage(next);setVoices([]);setVoice('');setOpen(false);setSearch('');
    }}/>
    <div className={styles.voicePicker} ref={pickerRef}>
      <span id={pickerId+'-label'} className={styles.voicePickerLabel}>Narration voice</span>
      <button ref={triggerRef} type="button" className={styles.voicePickerTrigger}
        disabled={available!==true||busy||voices.length===0}
        aria-expanded={open} aria-controls={pickerId+'-panel'}
        aria-labelledby={pickerId+'-label '+pickerId+'-value'}
        aria-describedby={pickerId+'-help'}
        onClick={()=>{setOpen(value=>!value);setSearch('');}}>
        <span id={pickerId+'-value'} className={styles.voicePickerValue}>
          <strong>{selected?.name||'Load available voices'}</strong>
          <small>{selected?.style||'Choose a voice from the live Addis catalog'}</small>
        </span>
        <span className={styles.voicePickerChevron} aria-hidden="true">⌄</span>
      </button>
      {open&&<div id={pickerId+'-panel'} className={styles.voicePickerPopover}>
        <label htmlFor={pickerId+'-search'}>Find a voice</label>
        <input ref={searchRef} id={pickerId+'-search'} type="search" autoComplete="off"
          value={search} onChange={event=>setSearch(event.target.value)}
          placeholder="Search name or style"/>
        <p className={styles.voicePickerCount} role="status">{matches.length} of {voices.length} voices</p>
        <div className={styles.voiceOptionList} role="radiogroup" aria-label="Available Addis narration voices">
          {matches.map(item=><label key={item.id}
            className={styles.voiceOption+' '+(voice===item.id?styles.voiceOptionSelected:'')}>
            <input type="radio" name={pickerId+'-voice'} value={item.id}
              checked={voice===item.id}
              onChange={()=>{setVoice(item.id);setMessage('');setOpen(false);setSearch('');triggerRef.current?.focus();}}/>
            <span><strong>{item.name}</strong><small>{item.style||'Available voice'}</small></span>
          </label>)}
        </div>
        {matches.length===0&&<p className={styles.voicePickerEmpty}>No matches. Try another name or style.</p>}
      </div>}
    </div>
    <p id={pickerId+'-help'}>The voice catalog is loaded for the selected language. Your voice choice is temporary and no text is sent until you give consent and request an estimate.</p>
    <div className={styles.actions}>
      <button type="button" disabled={!canSubmit} onClick={()=>void request('voices')}>Load available voices</button>
    </div>

    <div className={styles.review}>
      <h4>Hear your story</h4>
      <p>Generate up to {ADDIS_MAX_TEXT.toLocaleString()} characters of original text in the language selected above. Review the provider cost before generating an MP3. No charge is requested merely by choosing a voice.</p>
      <label htmlFor={pickerId+'-code'}>Your Addis pilot access code (this session)</label>
      <input id={pickerId+'-code'} type="password" autoComplete="off" spellCheck={false}
        value={code} disabled={busy||available!==true}
        onChange={event=>{resetOutput();setCode(event.target.value);setVoices([]);setVoice('');setOpen(false);setMessage('');}}/>
      <p>This is a separate pilot access code, not the Addis API key. The code stays in this panel’s memory. The provider key remains on the private server; neither is saved with your draft.</p>
      <button type="button" disabled={!code&&!audioUrl}
        onClick={()=>{resetOutput();setCode('');setConsent(false);setVoices([]);setVoice('');setOpen(false);setMessage('Pilot access code cleared.');}}>Clear pilot access code</button>
      <p>{withinLimit?text.length+' of '+ADDIS_MAX_TEXT+' characters ready.':text?'Shorten your story to 1,000 characters for this pilot.':'Write a story in the editor to enable narration.'} Your text is not translated automatically.</p>
      <label className={styles.check}>
        <input type="checkbox" checked={consent} disabled={busy||available!==true}
          onChange={event=>{resetOutput();setConsent(event.target.checked);}}/>
        <span>I have permission to use this story and agree to send its text to Addis AI for a cost estimate and optional paid narration.</span>
      </label>
      <div className={styles.actions}>
        <button type="button" disabled={!canSubmit||!consent||!selected||!withinLimit}
          onClick={()=>void request('estimate')}>{busy?'Contacting Addis…':'Estimate narration cost'}</button>
        {busy&&<button type="button" onClick={()=>{
          abort.current?.abort();abort.current=null;setBusy(false);setMessage('Request cancelled. A generation already started may still be billed.');
        }}>Cancel request</button>}
      </div>
      {estimate&&<div className={styles.review}>
        <p><strong>Estimated cost: {estimate.estimatedCost} {estimate.currency}.</strong> The actual amount may differ.</p>
        <button type="button" className={styles.primary} disabled={!canSubmit||!estimate.canGenerate||!consent||!selected||!withinLimit}
          onClick={()=>void request('generate')}>Approve cost and generate narration</button>
      </div>}
      {message&&<p role="status" className={styles.message}>{message}</p>}
      {audioUrl&&<div className={styles.review}>
        <audio ref={player} controls src={audioUrl} aria-label="Generated Addis story narration"
          onPlay={event=>{const currentPlayer=event.currentTarget;claimNarration(owner.current,()=>currentPlayer.pause());}}
          onPause={()=>releaseNarration(owner.current)} onEnded={()=>releaseNarration(owner.current)}
          onError={()=>setMessage('Unable to play this provider clip. Check the link expiration or open it in another audio player.')}/>
        <a href={audioUrl} className={styles.download} target="_blank" rel="noopener noreferrer" download>Open or save generated MP3</a>
        <p>Generated audio is not saved with your written draft. This provider link may expire. Check pronunciation before sharing.</p>
      </div>}
    </div>
  </section>;
}
