'use client';
import {useState} from 'react';
import {CREATOR_VOICES,narrationBrief} from '../lib/creator-voices';
import styles from './creator-studio.module.css';

export function CreatorVoicePicker({voice,onChange,title,content}:{voice:string;onChange:(value:string)=>void;title:string;content:string}){
  const [message,setMessage]=useState('');
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
    <p>Find a voice to carry your words. Choose from 36 Deepgram English voices, then keep your choice with your story in a narration brief.</p>
    <label htmlFor="creator-narration-voice">Narration voice</label>
    <select id="creator-narration-voice" value={voice} aria-describedby="narration-help" onChange={event=>{onChange(event.target.value);setMessage('');}}>
      {CREATOR_VOICES.map(item=><option key={item.id} value={item.id}>{item.name} — {item.accent} {item.presentation}</option>)}
    </select>
    <p id="narration-help">Your selection stays while you explore this app, until you refresh. The brief downloads your current written story and voice choice; it does not generate audio or change the sample recordings.</p>
    <div className={styles.actions}>
      <a className={styles.download} href="https://talk.deepgram.com/" target="_blank" rel="noopener noreferrer">Audition voices on Deepgram (new tab)</a>
      <button type="button" onClick={download} disabled={!content.trim()}>Download narration brief</button>
    </div>
    {!content.trim()&&<p>Write in “Your story” to enable the brief download.</p>}
    <p>The audition opens Deepgram’s separate demo. Your draft and voice selection are not sent there.</p>
    {message&&<p className={styles.message} role="status">{message}</p>}
  </section>;
}
