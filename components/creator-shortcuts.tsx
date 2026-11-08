'use client';
import styles from './experience.module.css';

const sections=[
  {id:'studio-plan',label:'Plan'},
  {id:'studio-draft',label:'Write'},
  {id:'studio-voice-answer',label:'Record'},
  {id:'studio-rights',label:'Save'},
  {id:'studio-narration',label:'Narration'},
  {id:'studio-visual',label:'Visuals'}
] as const;

/** All targets already exist in the shared Creator Studio. Native links retain
 * history, keyboard navigation and system reduced-motion behavior. */
export function CreatorShortcuts(){
  function jumpFromSelect(value:string){
    if(!value)return;
    const target=document.getElementById(value);
    if(!target)return;
    if(window.location.hash==='#'+value){
      target.scrollIntoView({block:'start'});
    }else{
      window.location.hash=value;
    }
    requestAnimationFrame(()=>target.focus({preventScroll:true}));
  }

  return <nav className={styles.studioShortcutBar} aria-label="Jump between Creator Studio sections">
    <span className={styles.studioShortcutTitle}>Jump to</span>
    <div className={styles.studioShortcutLinks}>
      {sections.map(({id,label})=><a key={id} href={'#'+id}>{label}</a>)}
    </div>
    <div className={styles.studioShortcutPicker}>
      <label htmlFor="studio-section-jump">Section</label>
      <select id="studio-section-jump" defaultValue="" onChange={event=>{
        jumpFromSelect(event.currentTarget.value);
        event.currentTarget.value='';
      }}>
        <option value="" disabled>Choose a section…</option>
        {sections.map(({id,label})=><option key={id} value={id}>{label}</option>)}
      </select>
    </div>
    <a className={styles.studioBackToTop} href="#studio-top" aria-label="Return to the top of Creator Studio">Top ↑</a>
  </nav>;
}
