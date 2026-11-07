'use client';
import {useEffect,useRef,useState} from 'react';
import styles from './story-artwork.module.css';

// Motion runs only while the artwork is on screen and its tab is visible.
export function useVisibleMotion(quiet:boolean) {
  const ref=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false);
  const [pageVisible,setPageVisible]=useState(false);
  useEffect(()=>{
    const update=()=>setPageVisible(!document.hidden);
    update();document.addEventListener('visibilitychange',update);
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.15});
    if(ref.current)observer.observe(ref.current);
    return ()=>{observer.disconnect();document.removeEventListener('visibilitychange',update)};
  },[]);
  return {ref,animate:!quiet&&visible&&pageVisible};
}

const categories=['Technology & Innovation','Business & Entrepreneurship','Culture & Heritage','Agriculture & Climate','Education & Science','Arts & Entertainment','Sports & Gaming','Community & Society'];

export function StoryArtwork({category,quiet=false,featured=false}:{category:string;quiet?:boolean;featured?:boolean}) {
  const {ref,animate}=useVisibleMotion(quiet);
  const theme=Math.max(0,categories.indexOf(category));
  return <div ref={ref} className={styles.artwork} data-theme={theme} data-featured={featured} data-animate={animate} aria-hidden="true">
    <svg viewBox="0 0 600 300" fill="none" preserveAspectRatio="xMidYMid slice">
      <g className={styles.sheet}>
        <path d="M-30 260 240-10h190L160 260Z" fill="var(--art-paper)"/>
        <path d="m190 320 300-300h150L340 320Z" fill="var(--art-ink)" opacity=".13"/>
      </g>
      <g className={styles.orbit} stroke="var(--art-ink)" strokeWidth="2">
        {[0,1,2,3,4,5].map(i=><ellipse key={i} cx="410" cy="135" rx={55+i*22} ry={55+i*12} transform={`rotate(-28 410 135)`}/>)}
      </g>
      <g className={styles.lines} stroke="var(--art-accent)" strokeWidth="7" strokeLinecap="round">
        {[0,1,2,3,4].map(i=><path key={i} d={`M ${-50+i*9} ${195+i*20} C 130 ${40+i*20}, 190 ${330+i*15}, 360 ${170+i*20} S 560 ${80+i*20}, 670 ${170+i*20}`}/>) }
      </g>
      <circle className={styles.disc} cx="170" cy="91" r="43" fill="var(--art-accent)"/>
      <path className={styles.rule} d="M38 262h110m-110-9v18m110-18v18" stroke="var(--art-ink)" strokeWidth="1.5"/>
    </svg>
  </div>;
}

export function NarrationVisual({playing,quiet}:{playing:boolean;quiet:boolean}) {
  const {ref,animate}=useVisibleMotion(quiet);
  return <div ref={ref} className={styles.narration} data-playing={playing} data-animate={playing&&animate} aria-hidden="true">
    {[0,1,2,3,4].map(i=><i key={i}/>)}
  </div>;
}
