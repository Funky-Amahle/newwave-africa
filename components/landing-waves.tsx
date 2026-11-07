'use client';
import {useVisibleMotion} from './story-artwork';
import styles from './landing-waves.module.css';
export function LandingWaves({quiet}:{quiet:boolean}){
  const {ref,animate}=useVisibleMotion(quiet);
  return <div ref={ref} className={styles.waves} data-animate={animate} aria-hidden="true"><svg viewBox="0 0 720 100" fill="none"><g>{[0,1,2,3,4].map(i=><path key={i} d={`M-180 ${22+i*12}C-60 ${-30+i*12} 60 ${110+i*12} 180 ${35+i*12}S420 ${-20+i*12} 540 ${35+i*12}S780 ${110+i*12} 900 ${22+i*12}`} stroke={i%2?'#a54629':'#193b2c'} strokeWidth={i===2?4:1.6}/>)}</g></svg></div>;
}
