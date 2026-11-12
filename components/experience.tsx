'use client';
import {createContext,useContext,useEffect,useId,useRef,useState} from 'react';
import type {ReactNode} from 'react';
import {AnimatePresence,motion,MotionConfig,useReducedMotion} from 'motion/react';
import type {Story} from '../lib/discovery';
import styles from './experience.module.css';
import {StoryArtwork} from './story-artwork';
import {TRANSLATION_LANGUAGES,sampleGoogleTranslateUrl,blankGoogleTranslateUrl} from '../lib/translation';
import {SiteLanguageSelector} from './site-language-selector';
import {getFlagshipStory,estimatedReadingMinutes} from '../lib/flagship-story';

const MotionContext = createContext(true);
export const useQuietMotion = () => useContext(MotionContext);
export function Experience({children,theme}:{children:ReactNode;theme?:'studio'}) {
  const preference = useReducedMotion();
  const [ready,setReady] = useState(false);
  const [paused,setPaused] = useState(false);
  useEffect(()=>setReady(true),[]);
  // Keep server markup and the first client render identical. Respect the
  // device preference before enabling optional effects after hydration.
  const systemReduced = ready && preference === true;
  const quiet = !ready || paused || preference !== false;
  return <MotionContext.Provider value={quiet}><MotionConfig reducedMotion={quiet?'always':'user'}>
    <div className={styles.experience} data-quiet={quiet} data-theme={theme}>
      <div className={styles.utility}><span>Independent voices. Shared perspectives.</span>
        <div className={styles.utilityActions}><SiteLanguageSelector/>
        <button type="button" aria-pressed={quiet} disabled={!ready||systemReduced} onClick={()=>setPaused(v=>!v)}>
          {systemReduced ? 'Reduced effects: system' : quiet ? 'Reduced effects' : 'Full effects'}
          <span className={styles.srOnly}>. Toggle optional effects.</span>
        </button></div>
      </div>{children}
    </div>
  </MotionConfig></MotionContext.Provider>;
}
export function Arrow(){return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5"/></svg>}
export function SaveIcon({saved=false}:{saved?:boolean}){return <svg viewBox="0 0 24 24" width="18" height="18" fill={saved?'currentColor':'none'} aria-hidden="true"><path d="M6 4h12v16l-6-4-6 4V4Z" stroke="currentColor" strokeWidth="1.5"/></svg>}
export function Reveal({children,className=''}:{children:ReactNode;className?:string}) {
  const quiet=useQuietMotion();
  return <motion.div className={className} initial={false}
    whileInView={quiet?{opacity:1,y:0}:{opacity:[.6,1],y:[10,0]}}
    viewport={{once:true,amount:.08}} transition={{duration:quiet?0:.35}}>{children}</motion.div>;
}
export function SectionHeading({title,description}:{title:string;description?:string}) {
  return <div className={styles.sectionHeading}><div><h2>{title}</h2></div>{description&&<p>{description}</p>}</div>;
}

export function Spotlight({stories,onRead}:{stories:Story[];onRead:(story:Story)=>void}) {
  // Base44-inspired carousel controls, adapted to a fictional collection.
  // Auto-rotation is opt-in and pauses when a reader engages with the feature.
  const [index,setIndex]=useState(2);
  const [rotating,setRotating]=useState(false);
  const [visible,setVisible]=useState(false);
  const [pageVisible,setPageVisible]=useState(false);
  const [hovered,setHovered]=useState(false);
  const [focused,setFocused]=useState(false);
  const [announcement,setAnnouncement]=useState('');
  const spotlightRef=useRef<HTMLElement|null>(null);
  const quiet=useQuietMotion();

  useEffect(()=>{
    const element=spotlightRef.current;
    const update=()=>setPageVisible(!document.hidden);
    update();
    document.addEventListener('visibilitychange',update);
    if(!element)return()=>document.removeEventListener('visibilitychange',update);
    if(typeof IntersectionObserver==='undefined')setVisible(true);
    else {
      const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.3});
      observer.observe(element);
      return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update)};
    }
    return()=>document.removeEventListener('visibilitychange',update);
  },[]);
  useEffect(()=>{if(quiet)setRotating(false)},[quiet]);
  useEffect(()=>{
    if(!rotating||quiet||!visible||!pageVisible||hovered||focused||stories.length<2)return;
    const timer=window.setTimeout(()=>setIndex(current=>(current+1)%stories.length),8500);
    return()=>window.clearTimeout(timer);
  },[rotating,quiet,visible,pageVisible,hovered,focused,stories.length,index]);

  function showStory(next:number){
    if(!stories.length)return;
    const selected=(next+stories.length)%stories.length;
    setIndex(selected);
    setRotating(false);
    setAnnouncement('Showing fictional story '+(selected+1)+' of '+stories.length+': '+stories[selected].title);
  }

  const story=stories[index%stories.length];
  if(!story)return null;
  return <section ref={spotlightRef} className={styles.spotlight} aria-label="Featured sample stories"
    onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
    onFocusCapture={()=>setFocused(true)}
    onBlurCapture={event=>{
      const next=event.relatedTarget;
      if(!(next instanceof Node)||!event.currentTarget.contains(next))setFocused(false);
    }}>
    <div className={styles.spotlightTop}><span>THE READING TABLE</span><span>{getFlagshipStory(story)?'Featured fictional long read':'Fictional sample'}</span></div>
    <div className={styles.printArt}><StoryArtwork key={story.id} category={story.category} quiet={quiet} featured/></div>
    <AnimatePresence initial={false} mode="wait">
      <motion.div key={story.id} className={styles.spotlightCopy}
        initial={quiet?false:{opacity:0,y:9}} animate={{opacity:1,y:0}}
        exit={quiet?undefined:{opacity:0,y:-7}}
        transition={{duration:quiet?0:.26,ease:'easeOut'}}>
        <p className={styles.kicker}>{story.category}</p><h2>{story.title}</h2>
        <p>{story.excerpt}</p><span className={styles.meta}>{story.country} / {story.language}</span>
        <button type="button" className={styles.lightButton} onClick={()=>{setRotating(false);onRead(story)}}>
          {getFlagshipStory(story)?'Read the full story':'Read this story'} <Arrow/>
        </button>
      </motion.div>
    </AnimatePresence>
    <div className={styles.spotlightBottom}>
      <div className={styles.spotlightNav}>
        <span>{index+1} / {stories.length} fictional perspectives</span>
        <div className={styles.spotlightArrows}>
          <button type="button" onClick={()=>showStory(index-1)} aria-label="Previous featured fictional story">Previous</button>
          <button type="button" onClick={()=>showStory(index+1)} aria-label="Next featured fictional story">Next <span aria-hidden="true">→</span></button>
        </div>
      </div>
      <div className={styles.spotlightPagination} role="group" aria-label="Choose a featured fictional story">
        {stories.map((item,i)=><button type="button" key={item.id}
          aria-label={'Show '+item.title+' ('+(i+1)+' of '+stories.length+')'}
          aria-current={i===index?'true':undefined}
          onClick={()=>showStory(i)}><span aria-hidden="true"/></button>)}
      </div>
      <button type="button" className={styles.spotlightAuto} aria-pressed={rotating}
        disabled={quiet||stories.length<2}
        onClick={()=>{setRotating(value=>!value);setAnnouncement(rotating?'Story rotation paused.':'Story rotation enabled.')}}>
        {quiet?'Motion paused':rotating?'Pause rotation':'Play rotation'}
      </button>
    </div>
    <span className={styles.srOnly} role="status">{announcement}</span>
  </section>;
}

const routes=[
  {category:'Culture & Heritage',name:'Keep memory alive',note:'Oral history, heritage & identity',index:'01'},
  {category:'Technology & Innovation',name:'Imagine what comes next',note:'Ideas, invention & possibility',index:'02'},
  {category:'Agriculture & Climate',name:'Listen to the land',note:'Growing, climate & local knowledge',index:'03'},
  {category:'Community & Society',name:'See the everyday differently',note:'Neighbourhoods, care & belonging',index:'04'},
];
export function DiscoveryRoutes({onChoose}:{onChoose:(category:string)=>void}) {
  return <section className={styles.routes} aria-labelledby="routes-heading">
    <div className={styles.inlineHeading}><h2 id="routes-heading">Follow a curiosity</h2><p>A starting point, not a boundary.</p></div>
    <div className={styles.routeGrid}>{routes.map(route=><button type="button" key={route.category} className={styles.routeCard} onClick={()=>onChoose(route.category)}>
      <span className={styles.routeNumber}>{route.index}<Arrow/></span><strong>{route.name}</strong><span>{route.note}</span>
    </button>)}</div>
  </section>;
}

export function StudioInvitation({onCreate}:{onCreate:()=>void}) {
  return <section className={styles.studioInvite} aria-labelledby="invitation-heading">
    <div><h2 id="invitation-heading">Creation &amp; Craft</h2><p>For African storytellers, writers, filmmakers, journalists, animators, musicians and game makers. Turn your ideas into work you can produce and share, with the human author at the centre.</p><p>Our priority is to extend your craft, lower the cost and complexity of production, and help you take the next step. Start with a free planning canvas and an editable brief that stays yours.</p><button type="button" className={styles.lightButton} onClick={onCreate}>Open creator studio <Arrow/></button></div>
    <ol className={styles.steps}><li><span>01</span><div><h3>Extend your craft</h3><p>Develop your own stories, scenes, reporting, music or interactive worlds.</p></div></li><li><span>02</span><div><h3>Keep production practical</h3><p>Plan around available equipment, collaborators, permissions and your next steps.</p></div></li><li><span>03</span><div><h3>Make it shareable</h3><p>Download an editable production brief. Keep your words, decisions and creator credits.</p></div></li></ol>
  </section>;
}

export function ExperienceHelp(){return <section className={styles.help} aria-labelledby="help-heading">
  <div><h2 id="help-heading">A little clarity<br/>goes a long way.</h2></div><div className={styles.accordion}>
    <details><summary>How does discovery work?</summary><p>Your selected interest changes the ranking, not a hard category filter. Search narrows the results. The diversity slider gives more weight to less-represented categories. This is a local demonstration, not a trained AI recommender.</p></details>
    <details><summary>Where are my saved stories?</summary><p>Reading-list bookmarks and saved story drafts stay in this browser, with no account or public publishing. Clearing browser data removes them. Storage may be unavailable in restricted browsing modes.</p></details>
    <details><summary>Why is narration sometimes unavailable?</summary><p>Only published, reviewed recordings can play. We do not substitute a robotic browser voice. Your recordings stay in this tab unless you explicitly send selected audio to Deepgram for transcription. On Pages, the demo uses your own session key and quota; no shared key is supplied. Review the transcript before adding it; recordings and visuals are not attached to saved text drafts.</p></details>
  </div></section>}

export function StoryReader({story,saved,onSave,onClose}:{story:Story;saved:boolean;onSave:()=>void;onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement|null>(null);
  const titleId=useId();
  const languageId=useId();
  const translationHeadingId=useId();
  const [targetLanguage,setTargetLanguage]=useState('sw');
  const [copyStatus,setCopyStatus]=useState('');
  const [readingSize,setReadingSize]=useState<'regular'|'large'>('regular');
  const flagship=getFlagshipStory(story);
  const textToRead=flagship?flagship.paragraphs.join('\n\n'):story.excerpt;
  const sampleTranslation=sampleGoogleTranslateUrl(story,targetLanguage);
  async function copyForTranslation(){
    try {
      await navigator.clipboard.writeText(story.title+'\n\n'+textToRead);
      setCopyStatus('Copied locally. Paste into Google Translate only if you choose to share these words.');
    } catch {
      setCopyStatus('Clipboard unavailable. Select and copy the text manually if you wish.');
    }
  }
  useEffect(()=>{
    const element=dialog.current;
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const overflow=document.body.style.overflow;
    element?.showModal();document.body.style.overflow='hidden';
    return ()=>{element?.close();document.body.style.overflow=overflow;previous?.focus()};
  },[]);
  return <dialog ref={dialog} className={styles.reader} aria-labelledby={titleId} onCancel={event=>{event.preventDefault();onClose()}} onClick={event=>{if(event.target===event.currentTarget)onClose()}}>
    <article><div className={styles.readerToolbar}><span>{story.sample?'Fictional sample / not reporting':'Your browser-local draft'}</span><button type="button" autoFocus onClick={onClose}>Close <span aria-hidden="true">&times;</span></button></div>
      <p className={styles.kicker}>{story.category}</p><h2 id={titleId}>{story.title}</h2>
      <p className={styles.meta}>By {story.author} / {story.country} / {story.language}</p>
      {flagship&&<div className={styles.readerPreferences} role="group" aria-label="Story text size">
        <span>Reading comfort</span>
        <button type="button" aria-pressed={readingSize==='regular'} onClick={()=>setReadingSize('regular')}>Standard text</button>
        <button type="button" aria-pressed={readingSize==='large'} onClick={()=>setReadingSize('large')}>Larger text</button>
      </div>}
      {flagship&&<>
        <div className={styles.readerHeroArt}><StoryArtwork category={story.category} quiet featured/></div>
        <p className={styles.readerDeck}>{flagship.deck}</p>
        <div className={styles.readerReadingMeta}>
          <span>{estimatedReadingMinutes(flagship.paragraphs)} min read</span>
          <span>Original fictional story</span>
          <span>Written sample, not full-length narration</span>
        </div>
      </>}
      <div className={styles.readerText} data-reading-size={flagship?readingSize:'regular'}>{textToRead.split(/\n\s*\n/).map((p,i)=><p key={i}>{p}</p>)}</div>
      {flagship&&<aside className={styles.readerEditorialNote} aria-label="About this fictional story">
        <strong>About this story</strong><p>{flagship.editorialNote}</p>
        <p>Existing audio on the story card narrates the original short preview only, not this full written story. Do not infer that real people or places were interviewed.</p>
      </aside>}
      <section className={styles.translationPanel} aria-labelledby={translationHeadingId}>
        <h3 id={translationHeadingId}>Read in another language</h3>
        <p className={styles.translationHelp}>{flagship?'Google Translate opens the short fictional preview, not this complete long read. The full story remains in NewWave Africa.':story.sample?'Choose a language to open this fictional sample in Google Translate. Only the title and excerpt are shared when you select the link.':'Your browser-local draft is not sent automatically. Copy it locally and paste into Google Translate only if you decide to share it.'} Machine translation may lose cultural nuance; always check with a fluent speaker before reusing it.</p>
        <div className={styles.translationControls}>
          <label htmlFor={languageId}>Target language
            <select id={languageId} value={targetLanguage} onChange={event=>{setTargetLanguage(event.target.value);setCopyStatus('')}}>
              {TRANSLATION_LANGUAGES.map(language=><option key={language.code} value={language.code}>{language.label}</option>)}
            </select>
          </label>
          {sampleTranslation
            ? <a href={sampleTranslation} target="_blank" rel="noopener noreferrer">Open sample in Google Translate <span aria-hidden="true">↗</span></a>
            : <>
                <button type="button" onClick={copyForTranslation}>Copy story text</button>
                <a href={blankGoogleTranslateUrl(targetLanguage)} target="_blank" rel="noopener noreferrer">Open Google Translate <span aria-hidden="true">↗</span></a>
              </>}
        </div>
        {copyStatus&&<p className={styles.translationStatus} role="status">{copyStatus}</p>}
      </section>
      <button type="button" className={styles.outlineButton} aria-pressed={saved} onClick={onSave}><SaveIcon saved={saved}/>{saved?'Saved in reading list':'Save to reading list'}</button>
    </article>
  </dialog>;
}
