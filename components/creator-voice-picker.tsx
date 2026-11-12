'use client';

import {useEffect,useId,useRef,useState} from 'react';
import {CreatorAudio} from './creator-audio';
import {CREATOR_VOICES,narrationBrief} from '../lib/creator-voices';
import styles from './creator-studio.module.css';

export function CreatorVoicePicker({voice,onChange,title,content}:{voice:string;onChange:(value:string)=>void;title:string;content:string}){
  const [message,setMessage]=useState('');
  const [open,setOpen]=useState(false);
  const [search,setSearch]=useState('');
  const pickerId=useId();
  const triggerRef=useRef<HTMLButtonElement>(null);
  const searchRef=useRef<HTMLInputElement>(null);
  const pickerRef=useRef<HTMLDivElement>(null);
  const selected=CREATOR_VOICES.find(item=>item.id===voice)??CREATOR_VOICES[0];
  const matches=CREATOR_VOICES.filter(item=>
    [item.name,item.accent,item.presentation].join(' ').toLowerCase().includes(search.trim().toLowerCase())
  ).sort((a,b)=>a.name.localeCompare(b.name));

  useEffect(()=>{
    if(!open)return;
    searchRef.current?.focus();
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){
        event.preventDefault();
        setOpen(false);
        setSearch('');
        triggerRef.current?.focus();
      }
    };
    const onOutsideClick=(event:PointerEvent)=>{
      if(!pickerRef.current?.contains(event.target as Node)){
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('keydown',onKeyDown);
    document.addEventListener('pointerdown',onOutsideClick);
    return()=>{
      document.removeEventListener('keydown',onKeyDown);
      document.removeEventListener('pointerdown',onOutsideClick);
    };
  },[open]);

  function download(){
    let url:string|undefined;
    try{
      url=URL.createObjectURL(new Blob([narrationBrief(voice,title,content)],{type:'text/plain;charset=utf-8'}));
      const link=document.createElement('a');link.href=url;link.download='newwave-narration-brief.txt';
      document.body.appendChild(link);link.click();link.remove();
      setMessage('Narration brief prepared with your chosen voice and current story text.');
    }catch(error){setMessage(error instanceof Error?error.message:'Could not prepare the brief. Try again.');}
    finally{if(url){const savedUrl=url;window.setTimeout(()=>URL.revokeObjectURL(savedUrl),1000);}}
  }

  return <section id="studio-narration" tabIndex={-1} className={styles.panel} aria-labelledby="narration-heading">
    <h3 id="narration-heading">Choose your narration voice</h3>
    <p>Find a voice to carry your words. Choose from 36 English voices, then generate a recording or keep your choice in a narration brief.</p>
    <div className={styles.voicePicker} ref={pickerRef}>
      <span id={pickerId+'-label'} className={styles.voicePickerLabel}>Narration voice</span>
      <button ref={triggerRef} type="button" className={styles.voicePickerTrigger}
        aria-expanded={open} aria-controls={pickerId+'-panel'}
        aria-labelledby={pickerId+'-label '+pickerId+'-value'}
        aria-describedby="narration-help"
        onClick={()=>{setOpen(value=>!value);setSearch('');}}>
        <span id={pickerId+'-value'} className={styles.voicePickerValue}>
          <strong>{selected.name}</strong>
          <small>{selected.accent} · {selected.presentation}</small>
        </span>
        <span className={styles.voicePickerChevron} aria-hidden="true">⌄</span>
      </button>
      {open&&<div id={pickerId+'-panel'} className={styles.voicePickerPopover}>
        <label htmlFor={pickerId+'-search'}>Find a voice</label>
        <input ref={searchRef} id={pickerId+'-search'} type="search" autoComplete="off"
          value={search} onChange={event=>setSearch(event.target.value)}
          placeholder="Search name, accent or style"/>
        <p className={styles.voicePickerCount} role="status">{matches.length} of {CREATOR_VOICES.length} voices</p>
        <div className={styles.voiceOptionList} role="radiogroup" aria-label="Available narration voices">
          {matches.map(item=><label key={item.id}
            className={styles.voiceOption+' '+(voice===item.id?styles.voiceOptionSelected:'')}>
            <input type="radio" name={pickerId+'-voice'} value={item.id}
              checked={voice===item.id}
              onChange={()=>{onChange(item.id);setMessage('');}}
              onClick={()=>{setOpen(false);setSearch('');triggerRef.current?.focus();}}/>
            <span><strong>{item.name}</strong><small>{item.accent} · {item.presentation}</small></span>
          </label>)}
        </div>
        {matches.length===0&&<p className={styles.voicePickerEmpty}>No matches. Try another name or accent.</p>}
      </div>}
    </div>
    <p id="narration-help">Your selection stays while you explore this app, until you refresh. The brief downloads your current written story and voice choice. Use “Hear your story” below to generate audio. Existing sample recordings stay unchanged.</p>
    <div className={styles.actions}>
      <button type="button" onClick={download} disabled={!content.trim()}>Download narration brief</button>
    </div>
    {!content.trim()&&<p>Write in “Your story” to enable the brief download.</p>}
    <CreatorAudio key={voice+content} voice={voice} content={content}/>
    {message&&<p className={styles.message} role="status">{message}</p>}
  </section>;
}
