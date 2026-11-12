'use client';

import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {Arrow,Reveal,StoryReader,useQuietMotion} from './experience';
import sampleStories from '../lib/sample-stories.json';
import {parseSaved,SAVED_KEY,toggleSaved} from '../lib/discovery';
import type {Story} from '../lib/discovery';
import {workspaceFromHash} from '../lib/workspace-navigation';
import styles from './studio-landing.module.css';

const stories:Story[]=sampleStories;
const selections=[
  {label:'Culture',id:'s3',cover:'memory',title:'Stories we carry'},
  {label:'Innovation',id:'s1',cover:'makers',title:'Made in the neighbourhood'},
  {label:'Community',id:'s8',cover:'library',title:'A place to belong'},
  {label:'Climate',id:'s4',cover:'land',title:'Learning from the land'}
];
const base=process.env.NEXT_PUBLIC_SITE_BASE_PATH||'';

/** Reference-inspired presentation; all content and interactions belong to NewWave. */
export function StudioLanding(){
  const router=useRouter();
  const quiet=useQuietMotion();
  const [selected,setSelected]=useState(0);
  const [reader,setReader]=useState<Story|null>(null);
  const [saved,setSaved]=useState<string[]>([]);
  const [notice,setNotice]=useState('');
  const selection=selections[selected];
  const story=stories.find(item=>item.id===selection.id)!;

  useEffect(()=>{
    try{setSaved(parseSaved(localStorage.getItem(SAVED_KEY)))}catch{}
    const followLegacyHash=()=>{
      const fragment=window.location.hash;
      const workspace=workspaceFromHash(fragment);
      if(workspace)router.replace((workspace==='create'?'/creator-studio/':'/discover/')+fragment);
    };
    followLegacyHash();window.addEventListener('hashchange',followLegacyHash);
    return()=>window.removeEventListener('hashchange',followLegacyHash);
  },[router]);

  function bookmark(item:Story){
    const next=toggleSaved(saved,item.id);setSaved(next);
    try{localStorage.setItem(SAVED_KEY,JSON.stringify(next));setNotice('Reading list updated in this browser.')}
    catch{setNotice('Reading list updated for this visit. Browser storage is unavailable.')}
  }

  return <><div className={styles.landing} data-quiet={quiet}>
    <section className={styles.hero} aria-labelledby="studio-hero-title">
      <Reveal><h1 id="studio-hero-title">Stories<br/><em>move us.</em></h1></Reveal>
      <div className={styles.heroBottom}>
        <Reveal><p>A home for African perspectives. Discover stories beyond your usual feed, then shape your own with words, voice and visuals.</p></Reveal>
        <Reveal className={styles.heroActions}><Link className={styles.primary} href="/creator-studio/">Start your story <Arrow/></Link><a className={styles.secondary} href="#perspectives">Find a perspective <span aria-hidden="true">↓</span></a></Reveal>
      </div>
      <p className={styles.prototype}>A human-first prototype. Fictional samples. Your authorship.</p>
    </section>

    <div className={styles.ribbon} aria-hidden="true"><div><span>Many voices</span><i>—</i><span>New perspectives</span><i>—</i><span>Your story, your way</span><i>—</i><span>Many voices</span><i>—</i><span>New perspectives</span><i>—</i><span>Your story, your way</span><i>—</i></div></div>

    <section className={styles.perspectives} id="perspectives" aria-labelledby="perspective-heading">
      <Reveal className={styles.sectionTop}><h2 id="perspective-heading">A different<br/>view.</h2><p>One continent is never one story. Start with an interest, and leave room for something unexpected.</p></Reveal>
      <div className={styles.previewLayout}>
        <div className={styles.previewChoices}>
          <div role="group" aria-label="Choose a story perspective">{selections.map((item,index)=><button type="button" key={item.id} aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{item.label}</span><Arrow/></button>)}</div>
          <p>Explore a fictional story from our demonstration collection. Eight themes, with room for more voices.</p>
          <Link className={styles.secondary} href="/discover/">Explore all stories <Arrow/></Link>
        </div>
        <Reveal className={styles.preview}>
          <div className={styles.cover}><img src={`${base}/studio-covers/${selection.cover}.png`} alt="" width="1152" height="800"/></div>
          <div className={styles.previewCopy} aria-live="polite"><p>{story.country} · Fictional sample</p><h3>{selection.title}</h3><p>{story.excerpt}</p></div>
          <button className={styles.secondary} type="button" onClick={()=>setReader(story)}>Read this story <Arrow/></button>
        </Reveal>
      </div>
    </section>

    <section className={styles.tools} aria-labelledby="tools-heading">
      <Reveal className={styles.sectionTop}><h2 id="tools-heading">Make it<br/><em>your own.</em></h2><p>You bring the experience. The tools help you find its shape.</p></Reveal>
      <div className={styles.toolIndex}>
        {[
          {title:'Find the story',copy:'Explore eight themes. Search by place or interest, and adjust how much variety appears.',href:'/discover/',action:'Discover'},
          {title:'Shape the idea',copy:'Five planning canvases help you build a brief, choose a format and develop your point of view.',href:'/creator-studio/#studio-plan',action:'Plan'},
          {title:'Bring your voice',copy:'Write, record and review. Optional narration uses your own provider key and explicit permission.',href:'/creator-studio/#studio-voice-answer',action:'Create'},
          {title:'Keep your work',copy:'Save a draft in this browser and download your brief. Your story and authorship stay with you.',href:'/creator-studio/#studio-rights',action:'Keep'}
        ].map(item=><Reveal key={item.title}><Link className={styles.toolRow} href={item.href}><h3>{item.title}</h3><p>{item.copy}</p><span>{item.action} <Arrow/></span></Link></Reveal>)}
      </div>
    </section>

    <section className={styles.collection} aria-labelledby="collection-heading">
      <Reveal className={styles.sectionTop}><h2 id="collection-heading">Room for<br/>more stories.</h2><p>A glimpse of the fictional collection. The places are real; these sample stories are illustrations.</p></Reveal>
      <div className={styles.coverGrid}>{selections.map(item=>{
        const sample=stories.find(s=>s.id===item.id)!;
        return <Reveal key={item.id} className={styles.coverItem}><button type="button" onClick={()=>setReader(sample)}><span className={styles.srOnly}>Read fictional sample. </span><div className={styles.cover}><img src={`${base}/studio-covers/${item.cover}.png`} alt="" width="1152" height="800" loading="lazy"/></div><div className={styles.coverCaption}><div><p>{sample.country} · {item.label}</p><h3>{item.title}</h3></div><Arrow/></div></button></Reveal>;
      })}</div>
    </section>

    <section className={styles.ownership} aria-labelledby="ownership-heading">
      <Reveal><h2 id="ownership-heading">Your work.<br/><em>Your say.</em></h2></Reveal>
      <div className={styles.principles}><Reveal><h3>Authorship first</h3><p>Your perspective leads. Review what you create and choose what to keep.</p></Reveal><Reveal><h3>Private by default</h3><p>Written drafts stay in this browser. Saving a draft does not publish it.</p></Reveal><Reveal><h3>Permission matters</h3><p>Voice services are optional. Choose what to send, using your own key and consent.</p></Reveal><Link className={styles.secondary} href="/our-approach/">Read our approach <Arrow/></Link></div>
    </section>

    <section className={styles.invitation} aria-labelledby="invitation-heading"><Reveal><h2 id="invitation-heading">What’s<br/><em>your story?</em></h2></Reveal><div><p>Start with a moment, a memory or a question. Make space for your perspective.</p><Link className={styles.primary} href="/creator-studio/">Open Creator Studio <Arrow/></Link></div></section>
    <p className={styles.credit}>Original NewWave illustrations · Fictional story collection · <a href="https://github.com/Funky-Amahle/newwave-africa" target="_blank" rel="noopener noreferrer">Built in the open <Arrow/></a></p>
    {notice&&<p className={styles.notice} role="status">{notice}</p>}
  </div>{reader&&<div className={styles.readerFrame} data-ui><StoryReader story={reader} saved={saved.includes(reader.id)} onSave={()=>bookmark(reader)} onClose={()=>setReader(null)}/></div>}</>;
}
