'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {useSiteState} from '../components/site-state';
import {Hero} from '../components/hero';
import {StoryCard} from '../components/story-card';
import sampleStories from '../lib/sample-stories.json';
import {CATEGORIES,SAVED_KEY,parseSaved,toggleSaved,getDiscovery} from '../lib/discovery';
import type {Story} from '../lib/discovery';
import {Reveal,SectionHeading,Spotlight,DiscoveryRoutes,StudioInvitation,ExperienceHelp,StoryReader,Arrow,SaveIcon,useQuietMotion} from '../components/experience';
import styles from '../components/experience.module.css';
import {workspaceHash,workspaceFromHash} from '../lib/workspace-navigation';
import type {Workspace} from '../lib/workspace-navigation';

const samples:Story[]=sampleStories;
export default function Home(){return <HomeContent/>}

function HomeContent(){
  const quiet=useQuietMotion();
  const workspace=useRef<HTMLElement|null>(null);
  const router=useRouter();
  const {added}=useSiteState();
  const [saved,setSaved]=useState<string[]>([]);
  const savedRef=useRef<string[]>([]);
  const [savedOnly,setSavedOnly]=useState(false);
  const [savedMessage,setSavedMessage]=useState('');
  const [tab,setTab]=useState<Workspace>('discover');
  const [interest,setInterest]=useState('All categories');
  const [diversity,setDiversity]=useState(60);
  const [query,setQuery]=useState('');
  const [showAll,setShowAll]=useState(false);
  const [reader,setReader]=useState<Story|null>(null);

  useEffect(()=>{
    try {savedRef.current=parseSaved(localStorage.getItem(SAVED_KEY));setSaved(savedRef.current)}
    catch {setSavedMessage('Browser storage is unavailable. Your reading list will last for this visit only.')}
  },[]);
  useEffect(()=>{
    let frame=0;
    const syncFromUrl=()=>{
      const linked=workspaceFromHash(window.location.hash);
      if(!linked){
        if(!window.location.hash)setTab('discover');
        return;
      }
      if(linked==='create'){
        const fragment=window.location.hash;
        router.replace('/creator-studio/'+(fragment.startsWith('#studio-')?fragment:''));
        return;
      }
      setTab(linked);
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        const destination=document.getElementById(window.location.hash.slice(1))||workspace.current;
        destination?.focus({preventScroll:true});
        destination?.scrollIntoView({behavior:'auto',block:'start'});
      });
    };
    syncFromUrl();
    window.addEventListener('hashchange',syncFromUrl);
    window.addEventListener('popstate',syncFromUrl);
    return ()=>{
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange',syncFromUrl);
      window.removeEventListener('popstate',syncFromUrl);
    };
  },[]);
  const stories=useMemo(()=>[...added,...samples],[added]);
  const discovery=useMemo(()=>getDiscovery(stories,{query,interest,diversity,savedOnly,saved}),[stories,query,interest,diversity,savedOnly,saved]);
  const feed=showAll?discovery.ranked:discovery.ranked.slice(0,6);
  const savedCount=stories.filter(s=>saved.includes(s.id)).length;

  function selectWorkspace(next:Workspace){
    setTab(next);
    const hash=workspaceHash(next);
    if(window.location.hash!==hash)window.history.pushState(null,'',hash);
  }
  function openWorkspace(next:Workspace){
    selectWorkspace(next);
    requestAnimationFrame(()=>{
      workspace.current?.focus({preventScroll:true});
      workspace.current?.scrollIntoView({behavior:quiet?'auto':'smooth',block:'start'});
    });
  }
  function chooseInterest(category:string){setInterest(category);setQuery('');setSavedOnly(false);setShowAll(false);openWorkspace('discover')}
  function resetFilters(){setQuery('');setInterest('All categories');setDiversity(60);setShowAll(false);setSavedOnly(false)}
  function bookmark(story:Story){
    const next=toggleSaved(savedRef.current,story.id);
    savedRef.current=next;
    setSaved(next);
    const action=next.includes(story.id)?'Added to':'Removed from';
    try {localStorage.setItem(SAVED_KEY,JSON.stringify(next));setSavedMessage(action+' your reading list. Bookmarks are stored in this browser only.')}
    catch {setSavedMessage(action+' your reading list for this visit. Browser storage is unavailable.')}
  }

  return <>
    <Hero onExplore={()=>openWorkspace('discover')} onCreate={()=>router.push('/creator-studio/')}><Spotlight stories={samples} onRead={setReader}/></Hero>
    <div className={styles.frame}>
      <div className={styles.metrics} aria-label="Current demonstration collection">
        <div><strong>{stories.length}</strong><span>Stories in this browser<br/>Includes 8 fictional samples</span></div>
        <div><strong>{new Set(stories.map(s=>s.category)).size}</strong><span>Story categories<br/>More than one perspective</span></div>
        <div><strong>5</strong><span>Creative planning canvases<br/>Human authorship first</span></div>
      </div>
      <Reveal><DiscoveryRoutes onChoose={chooseInterest}/></Reveal>
      <section className={styles.workspace} ref={workspace} id="workspace" tabIndex={-1} aria-label="Story discovery and creator tools">
        <div className={styles.tabs} role="group" aria-label="Workspace sections">{(['discover','create','impact'] as const).map(item=><button key={item} type="button" aria-pressed={tab===item} onClick={()=>item==='create'?router.push('/creator-studio/'):selectWorkspace(item)}>{item==='discover'?'Discover stories':item==='create'?'Creator studio':'Discovery insights'}</button>)}</div>
        {tab==='discover'&&<>
          <SectionHeading title="Beyond your usual scroll" description="Stay close to an interest. Leave room for something you did not expect."/>
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
        {tab==='impact'&&<>
          <SectionHeading title="Make discovery visible" description="An illustrative category comparison using your current search and reading-list settings."/>
          <div className={styles.compare}>
            <div><span>RELEVANCE-ONLY BASELINE</span><strong>{discovery.baselineCoverage} / {CATEGORIES.length}</strong><p>Categories in the first {discovery.windowSize} matching stories</p></div>
            <div><span>DIVERSITY-AWARE ORDER</span><strong>{discovery.diverseCoverage} / {CATEGORIES.length}</strong><p>Categories in the same {discovery.windowSize}-story window</p></div>
          </div>
          <p className={styles.interestNote}>Same collection. Same window. Different weighting. Diversity is set to {diversity}%. These counts do not measure fairness, audience reach or real-world impact.</p>
          <h3>Available story categories</h3><div className="bars" role="list" aria-label="Story counts by category">{CATEGORIES.map(c=><div role="listitem" key={c}><div className="bar-label"><span>{c}</span><b>{discovery.counts[c]}</b></div><div className="bar" aria-hidden="true"><span style={{width:(100*discovery.counts[c]/Math.max(1,...Object.values(discovery.counts)))+'%'}}/></div></div>)}</div>
        </>}
      </section>
      <Reveal><StudioInvitation onCreate={()=>router.push('/creator-studio/')}/></Reveal>
      <ExperienceHelp/>
    </div>
    {reader&&<StoryReader key={reader.id} story={reader} saved={saved.includes(reader.id)} onSave={()=>bookmark(reader)} onClose={()=>setReader(null)}/>}
  </>;
}
