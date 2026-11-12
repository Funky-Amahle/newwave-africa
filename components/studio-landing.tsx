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
      <Reveal><p className={styles.eyebrow}>Many voices. New perspectives.</p><h1 id="studio-hero-title">Stories<br/><em>move us.</em></h1></Reveal>
      <div className={styles.heroBottom}>
        <Reveal><p>African stories move us. Discover perspectives beyond your usual feed, then shape a story of your own through words, voice and visuals. Your experience leads. The tools help you bring it to life.</p></Reveal>
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

    <section className={styles.craft} aria-labelledby="craft-heading">
      <Reveal className={styles.sectionTop}><h2 id="craft-heading">Creation<br/>&amp; <em>Craft.</em></h2><p>For African storytellers, writers, filmmakers, journalists, animators, musicians and game makers. Turn your ideas into work you can produce and share, with the human author at the centre.</p></Reveal>
      <div className={styles.craftLayout}>
        <div><p>Our priority is to extend your craft, lower the cost and complexity of production, and help you take the next step. Start with a free planning canvas and an editable brief that stays yours.</p><Link className={styles.secondary} href="/creator-studio/#studio-plan">Choose a planning canvas <Arrow/></Link></div>
        <ol className={styles.craftSteps}>
          <li><span aria-hidden="true">01</span><div><h3>Extend your craft</h3><p>Develop your own stories, scenes, reporting, music or interactive worlds.</p></div></li>
          <li><span aria-hidden="true">02</span><div><h3>Keep production practical</h3><p>Plan around available equipment, collaborators, permissions and your next steps.</p></div></li>
          <li><span aria-hidden="true">03</span><div><h3>Make it shareable</h3><p>Download an editable production brief. Keep your words, decisions and creator credits.</p></div></li>
        </ol>
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

    <section className={styles.clarity} aria-labelledby="clarity-heading">
      <Reveal className={styles.sectionTop}><h2 id="clarity-heading">A little clarity<br/>goes a long way.</h2><p>Discover, create and keep your work. Understand what the prototype does before you begin.</p></Reveal>
      <div className={styles.questions}>
        <details><summary>How does discovery work?</summary><p>Your selected interest changes the ranking, rather than excluding every other category. Search narrows the results. The diversity slider gives more weight to less-represented categories. This is a local demonstration, not a trained AI recommender.</p><Link className={styles.secondary} href="/discover/#discovery-insights">Explore discovery insights <Arrow/></Link></details>
        <details><summary>Where are my saved stories?</summary><p>Reading-list bookmarks and saved text drafts stay in this browser, with no account or public publishing. Clearing browser data removes them. Download your brief to keep a separate copy; recordings and visuals are not attached to saved text drafts.</p></details>
        <details><summary>Can I use my own voice?</summary><p>Write or record in Creator Studio, then review your words. Optional transcription and narration use your own provider key and quota. Only send selected content with permission; voice cloning requires your own verified voice.</p><Link className={styles.secondary} href="/creator-studio/#studio-voice-answer">Bring your voice <Arrow/></Link></details>
      </div>
    </section>

    <section className={styles.invitation} aria-labelledby="invitation-heading"><Reveal><h2 id="invitation-heading">What’s<br/><em>your story?</em></h2></Reveal><div><p>Start with a moment, a memory or a question. Make space for your perspective.</p><Link className={styles.primary} href="/creator-studio/">Open Creator Studio <Arrow/></Link></div></section>
    <p className={styles.credit}>Original NewWave illustrations · Fictional story collection · <a href="https://github.com/Funky-Amahle/newwave-africa" target="_blank" rel="noopener noreferrer">Built in the open <Arrow/></a></p>
    {notice&&<p className={styles.notice} role="status">{notice}</p>}
  </div>{reader&&<div className={styles.readerFrame} data-ui><StoryReader story={reader} saved={saved.includes(reader.id)} onSave={()=>bookmark(reader)} onClose={()=>setReader(null)}/></div>}</>;
}
