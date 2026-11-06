'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import type {FormEvent} from 'react';
import {Brand} from '../components/brand';
import {Hero} from '../components/hero';
import {StoryCard} from '../components/story-card';
import {VoiceRecorder} from '../components/voice-recorder';
import {CreatorCraftToolkit} from '../components/creator-craft-toolkit';
import {categorizeLocally} from '../lib/demo-categorize';
import sampleStories from '../lib/sample-stories.json';
import {CATEGORIES,STORY_KEY,SAVED_KEY,parseStories,parseSaved,toggleSaved,getDiscovery} from '../lib/discovery';
import type {Story} from '../lib/discovery';
import {Experience,Reveal,SectionHeading,Spotlight,DiscoveryRoutes,StudioInvitation,ExperienceHelp,StoryReader,Arrow,SaveIcon,useQuietMotion} from '../components/experience';
import styles from '../components/experience.module.css';

const samples:Story[]=sampleStories;
type Workspace='discover'|'create'|'impact';
export default function Home(){return <Experience><HomeContent/></Experience>}

function HomeContent(){
  const quiet=useQuietMotion();
  const workspace=useRef<HTMLElement|null>(null);
  const [added,setAdded]=useState<Story[]>([]);
  const [saved,setSaved]=useState<string[]>([]);
  const [savedOnly,setSavedOnly]=useState(false);
  const [savedMessage,setSavedMessage]=useState('');
  const [tab,setTab]=useState<Workspace>('discover');
  const [interest,setInterest]=useState('All categories');
  const [diversity,setDiversity]=useState(60);
  const [query,setQuery]=useState('');
  const [showAll,setShowAll]=useState(false);
  const [reader,setReader]=useState<Story|null>(null);
  const [title,setTitle]=useState('');
  const [content,setContent]=useState('');
  const [author,setAuthor]=useState('');
  const [country,setCountry]=useState('South Africa');
  const [rightsConfirmed,setRightsConfirmed]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');

  useEffect(()=>{
    try {setAdded(parseStories(localStorage.getItem(STORY_KEY)));setSaved(parseSaved(localStorage.getItem(SAVED_KEY)))}
    catch {setSavedMessage('Browser storage is unavailable. Your reading list will last for this visit only.')}
  },[]);
  const stories=useMemo(()=>[...added,...samples],[added]);
  const discovery=useMemo(()=>getDiscovery(stories,{query,interest,diversity,savedOnly,saved}),[stories,query,interest,diversity,savedOnly,saved]);
  const feed=showAll?discovery.ranked:discovery.ranked.slice(0,6);
  const savedCount=stories.filter(s=>saved.includes(s.id)).length;

  function openWorkspace(next:Workspace){
    setTab(next);
    requestAnimationFrame(()=>{
      workspace.current?.focus({preventScroll:true});
      workspace.current?.scrollIntoView({behavior:quiet?'auto':'smooth',block:'start'});
    });
  }
  function chooseInterest(category:string){setInterest(category);setQuery('');setSavedOnly(false);setShowAll(false);openWorkspace('discover')}
  function resetFilters(){setQuery('');setInterest('All categories');setDiversity(60);setShowAll(false);setSavedOnly(false)}
  function bookmark(story:Story){
    const next=toggleSaved(saved,story.id);
    setSaved(next);
    const action=next.includes(story.id)?'Added to':'Removed from';
    try {localStorage.setItem(SAVED_KEY,JSON.stringify(next));setSavedMessage(action+' your reading list. Bookmarks are stored in this browser only.')}
    catch {setSavedMessage(action+' your reading list for this visit. Browser storage is unavailable.')}
  }
  function publish(event:FormEvent){
    event.preventDefault();
    if(!rightsConfirmed){setMessage('Confirm authorship or permission before saving.');return}
    if(title.trim().length<3||content.trim().length<20||!country.trim()){setMessage('Add a title, country and at least 20 characters of story text.');return}
    setBusy(true);setMessage('');
    try {
      const result=categorizeLocally(title,content);
      const story:Story={id:globalThis.crypto?.randomUUID?.()||String(Date.now()),title:title.trim(),excerpt:content.trim(),author:author.trim()||'Anonymous creator',country:country.trim(),language:'English',category:result.category,tags:[],date:new Date().toISOString().slice(0,10)};
      const next=[story,...added].slice(0,100);
      localStorage.setItem(STORY_KEY,JSON.stringify(next));setAdded(next);
      setTitle('');setContent('');setRightsConfirmed(false);
      setMessage('Saved in this browser only. Suggested category: '+story.category+'. Local keyword rules, not AI.');
    }catch{setMessage('Unable to save in browser storage. Copy your text somewhere safe before leaving this page.')}
    finally{setBusy(false)}
  }

  return <main id="top">
    <a className="skip-link" href="#workspace">Skip to stories and tools</a>
    <header className={styles.header}>
      <Brand/>
      <nav className={styles.nav} aria-label="Primary navigation">{(['discover','create','impact'] as const).map(item=><a key={item} href="#workspace" aria-current={tab===item?'page':undefined} onClick={event=>{event.preventDefault();openWorkspace(item)}}>{item==='discover'?'Discover':item==='create'?'Creator studio':'Our approach'}</a>)}</nav>
      <a className={styles.navCta} href="#workspace" onClick={event=>{event.preventDefault();openWorkspace('create')}}>Start a story <Arrow/></a>
    </header>
    <Hero onExplore={()=>openWorkspace('discover')} onCreate={()=>openWorkspace('create')}><Spotlight stories={samples} onRead={setReader}/></Hero>
    <div className={styles.frame}>
      <div className={styles.metrics} aria-label="Current demonstration collection">
        <div><strong>{stories.length}</strong><span>Stories in this browser<br/>Includes 8 fictional samples</span></div>
        <div><strong>{new Set(stories.map(s=>s.category)).size}</strong><span>Story categories<br/>More than one perspective</span></div>
        <div><strong>5</strong><span>Creative planning canvases<br/>Human authorship first</span></div>
      </div>
      <Reveal><DiscoveryRoutes onChoose={chooseInterest}/></Reveal>
      <section className={styles.workspace} ref={workspace} id="workspace" tabIndex={-1} aria-label="Story discovery and creator tools">
        <div className={styles.tabs} role="group" aria-label="Workspace sections">{(['discover','create','impact'] as const).map(item=><button key={item} type="button" aria-pressed={tab===item} onClick={()=>setTab(item)}>{item==='discover'?'Discover stories':item==='create'?'Creator studio':'Discovery insights'}</button>)}</div>
        {tab==='discover'&&<>
          <SectionHeading eyebrow="THE OPEN EDITION" title="Beyond your usual scroll." description="Stay close to an interest. Leave room for something you did not expect."/>
          <div className={styles.filters}>
            <label>Your interest<select value={interest} onChange={event=>{setInterest(event.target.value);setShowAll(false)}}><option>All categories</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select><small>Prioritises a category without excluding other voices.</small></label>
            <label>Search the collection<input type="search" value={query} onChange={event=>{setQuery(event.target.value);setShowAll(false)}} placeholder="Try community, science or a country"/><small>Search titles, text, countries and themes.</small></label>
            <label><span className={styles.rangeTitle}>Make room for variety <output>{diversity}%</output></span><input type="range" aria-label="Discovery diversity percentage" min="0" max="100" step="10" value={diversity} onChange={event=>setDiversity(Number(event.target.value))}/><small>Higher values favour less-represented categories.</small></label>
          </div>
          <div className={styles.results}>
            <p role="status">{discovery.ranked.length} {discovery.ranked.length===1?'story':'stories'} / {feed.length} shown{savedOnly?' / Reading list':''}</p>
            <div className={styles.resultActions}><button type="button" className={styles.outlineButton} aria-pressed={savedOnly} onClick={()=>{setSavedOnly(v=>!v);setShowAll(false)}}><SaveIcon saved={savedOnly}/>Reading list ({savedCount})</button><button type="button" className={styles.textButton} onClick={resetFilters}>Reset discovery</button></div>
          </div>
          {savedMessage&&<p className={styles.status} role="status">{savedMessage}</p>}
          <p className={styles.interestNote}>{interest==='All categories'?'An open mix of themes.':'Prioritising '+interest+', with room for other perspectives.'} Samples are fictional. Your saved drafts are private to this browser.</p>
          <div className={styles.storyGrid}>{feed.map((story,index)=><div key={story.id} className={styles.storyFrame}>
            <StoryCard story={story} index={index}/>
            <div className={styles.cardActions}><button type="button" aria-label={'Read '+story.title} onClick={()=>setReader(story)}>Read story <Arrow/></button><button type="button" aria-pressed={saved.includes(story.id)} aria-label={'Save '+story.title+' to reading list'} onClick={()=>bookmark(story)}><SaveIcon saved={saved.includes(story.id)}/>{saved.includes(story.id)?'Saved':'Save'}</button></div>
          </div>)}</div>
          {feed.length===0&&<div className={styles.empty}><h3>{savedOnly?'A little space for your favourites.':'No stories here just yet.'}</h3><p>{savedOnly?'Save a story from the collection, or clear your search to see saved items.':'Try a different search or return to the complete collection.'}</p><button type="button" className={styles.solidButton} onClick={resetFilters}>Explore all stories <Arrow/></button></div>}
          {discovery.ranked.length>6&&<div className={styles.more}><button type="button" className={styles.outlineButton} onClick={()=>setShowAll(v=>!v)}>{showAll?'Show fewer stories':'Explore all '+discovery.ranked.length+' stories'} <Arrow/></button></div>}
        </>}
        {tab==='create'&&<>
          <SectionHeading eyebrow="CREATION & CRAFT" title="Your words. Your next chapter." description="A practical space to plan, write and record. No account and no automatic publishing."/>
          <CreatorCraftToolkit/>
          <SectionHeading eyebrow="A BROWSER-LOCAL DRAFT" title="Make space for your story."/>
          <div className={styles.creatorFrame}><form className="creator" onSubmit={publish}>
            <label>Story title<input required minLength={3} maxLength={180} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Give your story a title"/></label>
            <div className="formrow"><label>Creator name<input maxLength={180} value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Your name (optional)"/></label><label>Country<input required maxLength={120} value={country} onChange={e=>setCountry(e.target.value)}/></label></div>
            <label>Your story<textarea required minLength={20} maxLength={5000} rows={8} value={content} onChange={e=>setContent(e.target.value)} placeholder="Write an original story about an experience, idea or community..."/></label>
            <div className="draft-preview"><span className="eyebrow dark">LIVE DRAFT PREVIEW</span><h3>{title.trim()||'Your story begins here'}</h3><p>{content.trim()?content.trim().slice(0,220)+(content.trim().length>220?'...':''):'Your words will appear here as you write.'}</p><small>{author.trim()||'Anonymous creator'} / {country}</small></div>
            <VoiceRecorder/>
            <label className="rights-check"><input type="checkbox" checked={rightsConfirmed} onChange={e=>setRightsConfirmed(e.target.checked)} required/><span>This is my original story or I have permission to use it. I understand this saves a draft only in this browser.</span></label>
            <p className="note">There are no accounts or public publishing. Category suggestions use local keyword rules, not AI. No story text is sent to OpenAI or Deepgram. Recordings remain separate from the saved draft.</p>
            <button className="primary" type="submit" disabled={busy}>{busy?'Saving...':'Categorise & save locally'}</button>{message&&<p className="notice" role="status">{message}</p>}
          </form></div>
        </>}
        {tab==='impact'&&<>
          <SectionHeading eyebrow="TRANSPARENT, NOT MAGIC" title="Make discovery visible." description="An illustrative category comparison using your current search and reading-list settings."/>
          <div className={styles.compare}>
            <div><span>RELEVANCE-ONLY BASELINE</span><strong>{discovery.baselineCoverage} / {CATEGORIES.length}</strong><p>Categories in the first {discovery.windowSize} matching stories</p></div>
            <div><span>DIVERSITY-AWARE ORDER</span><strong>{discovery.diverseCoverage} / {CATEGORIES.length}</strong><p>Categories in the same {discovery.windowSize}-story window</p></div>
          </div>
          <p className={styles.interestNote}>Same collection. Same window. Different weighting. Diversity is set to {diversity}%. These counts do not measure fairness, audience reach or real-world impact.</p>
          <h3>Available story categories</h3><div className="bars" role="list" aria-label="Story counts by category">{CATEGORIES.map(c=><div role="listitem" key={c}><div className="bar-label"><span>{c}</span><b>{discovery.counts[c]}</b></div><div className="bar" aria-hidden="true"><span style={{width:(100*discovery.counts[c]/Math.max(1,...Object.values(discovery.counts)))+'%'}}/></div></div>)}</div>
        </>}
      </section>
      <Reveal><StudioInvitation onCreate={()=>openWorkspace('create')}/></Reveal>
      <ExperienceHelp/>
    </div>
    <footer className={styles.footer}><div><Brand inverse/><p>Stories are richer when more people get to tell them.</p></div><div><a href="#top">Back to the beginning <Arrow/></a><br/>NewWave Africa / Hackathon prototype<br/>Fictional samples. Local drafts. Your authorship.</div></footer>
    {reader&&<StoryReader key={reader.id} story={reader} saved={saved.includes(reader.id)} onSave={()=>bookmark(reader)} onClose={()=>setReader(null)}/>}
  </main>;
}
