'use client';

import {useEffect,useRef,useState} from 'react';
import {ADDIS_LANGUAGES,ADDIS_MAX_TEXT} from '../lib/addis-languages';
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
  const [consent,setConsent]=useState(false);
  const [estimate,setEstimate]=useState<Estimate|null>(null);
  const [audioUrl,setAudioUrl]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const abort=useRef<AbortController|null>(null);
  const owner=useRef({});
  const player=useRef<HTMLAudioElement|null>(null);
  const staticSite=process.env.NEXT_PUBLIC_STATIC_SITE==='true';
  const text=content.trim();
  const withinLimit=!!text&&text.length<=ADDIS_MAX_TEXT;
  const selected=voices.some(item=>item.id===voice);
  useEffect(()=>{
    if(staticSite){setAvailable(false);return;}
    const c=new AbortController();
    void fetch('/api/addis-voice',{signal:c.signal,cache:'no-store'})
      .then(r=>r.ok?r.json():null)
      .then((data:Result|null)=>{if(!c.signal.aborted)setAvailable(data?.available===true);})
      .catch(()=>{if(!c.signal.aborted)setAvailable(false);});
    return()=>c.abort();
  },[staticSite]);
  useEffect(()=>()=>{abort.current?.abort();player.current?.pause();releaseNarration(owner.current);},[]);
  function resetOutput(){abort.current?.abort();abort.current=null;setBusy(false);setEstimate(null);setAudioUrl('');player.current?.pause();releaseNarration(owner.current);}
  useEffect(()=>{setEstimate(null);setAudioUrl('');player.current?.pause();releaseNarration(owner.current);},[text]);
  useEffect(()=>{setEstimate(null);setAudioUrl('');player.current?.pause();releaseNarration(owner.current);},[language,voice]);
  async function request(action:'voices'|'estimate'|'generate'){
    if(!available||!code.trim()||busy)return;
    if(action!=='voices'&&(!consent||!selected||!withinLimit))return;
    if(action==='generate'&&(!estimate?.canGenerate))return;
    const c=new AbortController();abort.current=c;setBusy(true);setMessage('');
    if(action!=='voices')setAudioUrl('');
    try{
      const response=await fetch('/api/addis-voice',{method:'POST',
        headers:{'content-type':'application/json','authorization':'Bearer '+code.trim()},
        body:JSON.stringify({action,language,voiceId:voice,text,consent,requestId:crypto.randomUUID()}),
        signal:c.signal,cache:'no-store',credentials:'same-origin',redirect:'error'});
      const data=await response.json() as Result;
      if(!response.ok)throw new Error(data.error||'The Addis request failed.');
      if(c!==abort.current)return;
      if(action==='voices'){
        const next=data.voices||[];
        setVoices(next);setVoice(current=>next.some(v=>v.id===current)?current:next[0]?.id||'');
        setEstimate(null);
        setMessage(next.length?next.length+' available voice options loaded.':'No Addis voices are available for this language.');
      }else if(action==='estimate'){
        if(typeof data.estimatedCost!=='number'||typeof data.currency!=='string'||typeof data.canGenerate!=='boolean')throw new Error('The provider estimate was incomplete.');
        setEstimate({estimatedCost:data.estimatedCost,currency:data.currency,canGenerate:data.canGenerate});
        setMessage(data.canGenerate?'Review the cost and approve generation below.':'Insufficient provider balance. Audio was not requested.');
      }else if(data.audioUrl){
        setAudioUrl(data.audioUrl);setEstimate(null);
        setMessage('The clip is ready. Listen carefully and download it before the signed link expires.');
      }else throw new Error('The provider did not return an audio link.');
    }catch(e){
      if(c===abort.current)setMessage(c.signal.aborted?'Request cancelled. A generation already started may still be billed.':e instanceof Error?e.message:'Addis request failed.');
    }finally{if(abort.current===c){abort.current=null;setBusy(false);}}
  }
  const canSubmit=available&&code.trim()&&!busy;
  return <section className={styles.review} aria-label="Optional Addis AI narration">
    <h4>Addis AI — African-language narration</h4>
    {staticSite||available===false
      ? <p role="status">Addis narration requires a separately hosted, access-controlled NewWave server. This static GitHub Pages site cannot store an Addis key. Deepgram remains available above.</p>
      : available===null?<p role="status">Checking Addis pilot availability…</p>:<>
      <p>Private pilot only. Enter its separate access code, choose the language of your written story, and load available voices. Your story is not translated. The Addis API key stays on the server.</p>
      <label htmlFor="addis-code">Private pilot access code</label>
      <input id="addis-code" type="password" autoComplete="off" spellCheck={false} value={code} disabled={busy} onChange={e=>{resetOutput();setCode(e.target.value);setVoices([]);setVoice('');setMessage('');}}/>
      <label htmlFor="addis-language">Narration language</label>
      <select id="addis-language" value={language} disabled={busy} onChange={e=>{resetOutput();setLanguage(e.target.value);setVoices([]);setVoice('');}}>
        {ADDIS_LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.name}</option>)}
      </select>
      <div className={styles.actions}><button type="button" disabled={!canSubmit} onClick={()=>void request('voices')}>Load available voices</button></div>
      {voices.length>0&&<>
        <label htmlFor="addis-voice">Available voice</label>
        <select id="addis-voice" value={voice} disabled={busy} onChange={e=>{resetOutput();setVoice(e.target.value);}}>
          {voices.map(v=><option key={v.id} value={v.id}>{v.name}{v.style?' — '+v.style:''}</option>)}
        </select>
      </>}
      <p>{withinLimit?text.length+' of '+ADDIS_MAX_TEXT+' characters ready.':text?'Shorten your story to 1,000 characters for this private pilot.':'Write a story in the editor to enable Addis narration.'} Only submit text written in the selected language.</p>
      <label className={styles.check}><input type="checkbox" checked={consent} disabled={busy} onChange={e=>{resetOutput();setConsent(e.target.checked);}}/><span>I own this text or have permission to use it, and I consent to sending it to Addis AI for an audio estimate and optional paid narration.</span></label>
      <div className={styles.actions}>
        <button type="button" disabled={!canSubmit||!consent||!selected||!withinLimit} onClick={()=>void request('estimate')}>Estimate narration cost</button>
        {busy&&<button type="button" onClick={()=>{abort.current?.abort();setBusy(false);setMessage('Request cancelled. Generation may still be billed.');}}>Cancel</button>}
      </div>
      {estimate&&<div className={styles.review}>
        <p><strong>Estimated cost: {estimate.estimatedCost} {estimate.currency}.</strong> This estimate may differ from the final charge.</p>
        <button type="button" className={styles.primary} disabled={!canSubmit||!estimate.canGenerate||!consent||!selected||!withinLimit} onClick={()=>void request('generate')}>Approve cost and generate narration</button>
      </div>}
      {message&&<p role="status" className={styles.message}>{message}</p>}
      {audioUrl&&<div className={styles.review}>
        <audio ref={player} controls src={audioUrl} aria-label="Addis generated narration" onPlay={e=>claimNarration(owner.current,()=>e.currentTarget.pause())} onPause={()=>releaseNarration(owner.current)} onEnded={()=>releaseNarration(owner.current)}/>
        <a href={audioUrl} className={styles.download} target="_blank" rel="noopener noreferrer" download>Open or save generated MP3</a>
        <p>Provider-generated signed links expire. Audio is not stored with your browser-local draft; review pronunciation before sharing.</p>
      </div>}
      <div className={styles.actions}><button type="button" disabled={!code&&!audioUrl} onClick={()=>{resetOutput();setCode('');setConsent(false);setVoices([]);setVoice('');setMessage('Pilot access code cleared.');}}>Clear pilot session</button></div>
      </>}
  </section>;
}
