'use client';
import {createContext,useContext,useEffect,useId,useRef,useState} from 'react';
import type {ReactNode} from 'react';
import {motion,MotionConfig,useReducedMotion} from 'motion/react';
import type {Story} from '../lib/discovery';
import styles from './experience.module.css';

const MotionContext = createContext(true);
export const useQuietMotion = () => useContext(MotionContext);
export function Experience({children}:{children:ReactNode}) {
  const preference = useReducedMotion();
  const [paused,setPaused] = useState(false);
  const quiet = paused || preference !== false;
  return <MotionContext.Provider value={quiet}><MotionConfig reducedMotion={quiet?'always':'user'}>
    <div className={styles.experience} data-quiet={quiet}>
      <div className={styles.utility}><span>Independent voices. Shared perspectives.</span>
        <button type="button" aria-pressed={quiet} disabled={preference===true} onClick={()=>setPaused(v=>!v)}>
          {preference ? 'Reduced effects: system' : quiet ? 'Reduced effects' : 'Full effects'}
          <span className={styles.srOnly}>. Toggle optional effects.</span>
        </button>
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
export function SectionHeading({eyebrow,title,description}:{eyebrow:string;title:string;description?:string}) {
  return <div className={styles.sectionHeading}><div><p className={styles.kicker}>{eyebrow}</p><h2>{title}</h2></div>{description&&<p>{description}</p>}</div>;
}

export function Spotlight({stories,onRead}:{stories:Story[];onRead:(story:Story)=>void}) {
  const [index,setIndex]=useState(0);
  const quiet=useQuietMotion();
  const story=stories[index%stories.length];
  if(!story)return null;
  return <section className={styles.spotlight} aria-label="Featured sample stories">
    <div className={styles.spotlightTop}><span>THE READING TABLE</span><span>Fictional sample</span></div>
    <div className={styles.printArt} aria-hidden="true"><span>Perspective</span><i/><b>{String(index+1).padStart(2,'0')}</b></div>
    <motion.div key={story.id} className={styles.spotlightCopy} initial={false}
      animate={quiet?{opacity:1}:{opacity:[.4,1]}} transition={{duration:quiet?0:.25}}>
      <p className={styles.kicker}>{story.category}</p><h2>{story.title}</h2>
      <p>{story.excerpt}</p><span className={styles.meta}>{story.country} / {story.language}</span>
      <button type="button" className={styles.lightButton} onClick={()=>onRead(story)}>Read this story <Arrow/></button>
    </motion.div>
    <div className={styles.spotlightBottom}><span aria-live="polite">{index+1} / {stories.length} perspectives</span>
      <button type="button" onClick={()=>setIndex(v=>(v+1)%stories.length)} aria-label="Show next featured sample story">Next perspective <span aria-hidden="true">&rarr;</span></button>
    </div>
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
    <div className={styles.inlineHeading}><h2 id="routes-heading">Follow a curiosity.</h2><p>A starting point, not a boundary.</p></div>
    <div className={styles.routeGrid}>{routes.map(route=><button type="button" key={route.category} className={styles.routeCard} onClick={()=>onChoose(route.category)}>
      <span className={styles.routeNumber}>{route.index}<Arrow/></span><strong>{route.name}</strong><span>{route.note}</span>
    </button>)}</div>
  </section>;
}

export function StudioInvitation({onCreate}:{onCreate:()=>void}) {
  return <section className={styles.studioInvite} aria-labelledby="invitation-heading">
    <div><p className={styles.kicker}>CREATION & CRAFT</p><h2 id="invitation-heading">An idea deserves<br/>a place to begin.</h2><p>Writing, film, reporting, music or interactive worlds. Use a planning canvas, keep your own words, and take an editable brief with you.</p><button type="button" className={styles.lightButton} onClick={onCreate}>Open creator studio <Arrow/></button></div>
    <ol className={styles.steps}><li><span>01</span><div><h3>Find your form</h3><p>Five canvases, shaped around different creative practices.</p></div></li><li><span>02</span><div><h3>Develop the work</h3><p>Make the creative decisions. Keep your context and voice.</p></div></li><li><span>03</span><div><h3>Take it forward</h3><p>Download a brief. Story drafts stay in this browser.</p></div></li></ol>
  </section>;
}

export function ExperienceHelp(){return <section className={styles.help} aria-labelledby="help-heading">
  <div><p className={styles.kicker}>GOOD TO KNOW</p><h2 id="help-heading">A little clarity<br/>goes a long way.</h2></div><div className={styles.accordion}>
    <details><summary>How does discovery work?</summary><p>Your selected interest changes the ranking, not a hard category filter. Search narrows the results. The diversity slider gives more weight to less-represented categories. This is a local demonstration, not a trained AI recommender.</p></details>
    <details><summary>Where are my saved stories?</summary><p>Reading-list bookmarks and saved story drafts stay in this browser, with no account or public publishing. Clearing browser data removes them. Storage may be unavailable in restricted browsing modes.</p></details>
    <details><summary>Why is narration sometimes unavailable?</summary><p>Only published, reviewed recordings can play. We do not substitute a robotic browser voice. Your own microphone recordings remain local and are not attached to published stories.</p></details>
  </div></section>}

export function StoryReader({story,saved,onSave,onClose}:{story:Story;saved:boolean;onSave:()=>void;onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement|null>(null);
  const titleId=useId();
  useEffect(()=>{
    const element=dialog.current;
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const overflow=document.body.style.overflow;
    element?.showModal();document.body.style.overflow='hidden';
    return ()=>{element?.close();document.body.style.overflow=overflow;previous?.focus()};
  },[]);
  return <dialog ref={dialog} className={styles.reader} aria-labelledby={titleId} onCancel={event=>{event.preventDefault();onClose()}} onClick={event=>{if(event.target===event.currentTarget)onClose()}}>
    <article><div className={styles.readerToolbar}><span>{story.sample?'Fictional sample / not reporting':'Your browser-local draft'}</span><button type="button" autoFocus onClick={onClose}>Close <span aria-hidden="true">&times;</span></button></div>
      <p className={styles.kicker}>{story.category}</p><h2 id={titleId}>{story.title}</h2><p className={styles.meta}>By {story.author} / {story.country} / {story.language}</p>
      <div className={styles.readerText}>{story.excerpt.split(/\n\s*\n/).map((p,i)=><p key={i}>{p}</p>)}</div>
      <button type="button" className={styles.outlineButton} aria-pressed={saved} onClick={onSave}><SaveIcon saved={saved}/>{saved?'Saved in reading list':'Save to reading list'}</button>
    </article>
  </dialog>;
}
