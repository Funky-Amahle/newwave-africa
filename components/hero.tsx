'use client';
import type {ReactNode} from 'react';
import {Arrow,Reveal} from './experience';
import styles from './experience.module.css';

type Props={onExplore:()=>void;onCreate?:()=>void;children?:ReactNode};
export function Hero({onExplore,onCreate,children}:Props) {
  return <section className={styles.hero} aria-labelledby="hero-heading">
    <Reveal className={styles.heroCopy}>
      <h1 id="hero-heading">Many voices.<br/>New <em>perspectives.</em></h1>
      <p className={styles.heroDescription}>A place for the stories that broaden our world. Follow your curiosity, find a different perspective, or begin something of your own.</p>
      <div className={styles.heroActions}><button type="button" className={styles.solidButton} onClick={onExplore}>Explore stories <Arrow/></button>{onCreate&&<button type="button" className={styles.textButton} onClick={onCreate}>Make something <span aria-hidden="true">&rarr;</span></button>}</div>
      <div className={styles.heroFootnote}><span>DISCOVER / CREATE / OWN</span><span>A human-first prototype.<br/>Fictional stories, real possibilities.</span></div>
    </Reveal>
    <Reveal className={styles.heroFeature}>{children}</Reveal>
  </section>;
}
