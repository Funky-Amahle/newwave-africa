'use client';
import type {ReactNode} from 'react';
import {Arrow,Reveal,useQuietMotion} from './experience';
import {WaveField} from './wave-field';
import {LandingWaves} from './landing-waves';
import styles from './experience.module.css';

type Props={onExplore:()=>void;onCreate?:()=>void;children?:ReactNode};
export function Hero({onExplore,onCreate,children}:Props) {
  const quiet=useQuietMotion();
  return <section className={styles.hero} aria-labelledby="hero-heading">
    <Reveal className={styles.heroCopy}>
      <h1 id="hero-heading">Many voices.<br/>New <em>perspectives.</em></h1>
      <p className={styles.heroDescription}>African stories move us. Discover perspectives beyond your usual feed, then shape a story of your own through words, voice and visuals. Your experience leads. The tools help you bring it to life.</p>
      <LandingWaves quiet={quiet}/>
      <div className={styles.heroActions}><button type="button" className={styles.solidButton} onClick={onExplore}>Explore stories <Arrow/></button>{onCreate&&<button type="button" className={styles.textButton} onClick={onCreate}>Make something <span aria-hidden="true">&rarr;</span></button>}</div>
      <div className={styles.heroFootnote}><span>DISCOVER / CREATE / OWN</span><span>A human-first prototype.<br/>Fictional stories, real possibilities.</span></div>
    </Reveal>
    <div className={styles.heroField}><WaveField/><Reveal className={styles.heroFeature}>{children}</Reveal></div>
  </section>;
}
