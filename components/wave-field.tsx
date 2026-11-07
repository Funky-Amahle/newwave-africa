'use client';
import {useQuietMotion} from './experience';
import {useVisibleMotion} from './story-artwork';
import styles from './wave-field.module.css';

/** Base44's forest wave field, using the shared visibility and motion policy. */
export function WaveField(){
  const {ref,animate}=useVisibleMotion(useQuietMotion());
  return <div ref={ref} className={styles.field} data-animate={animate} aria-hidden="true">
    <svg viewBox="0 0 900 900" preserveAspectRatio="xMidYMid slice" fill="none">
      <circle cx="710" cy="120" r="84" fill="#c68a73" opacity=".25"/>
      <g>{Array.from({length:11},(_,i)=><path key={i} d={`M-180 ${210+i*36}C80 ${50+i*36} 240 ${390+i*36} 430 ${230+i*36}S700 ${40+i*36} 1080 ${240+i*36}`} stroke={i%3===1?'#f5f3ed':'#c68a73'} strokeWidth={i===4?2.5:1.2} opacity={i%2?.35:.6}/>)}</g>
    </svg>
  </div>;
}
