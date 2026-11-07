'use client';
import {CreatorStudio} from './creator-studio';
import {useSiteState} from './site-state';
import styles from './experience.module.css';

export function CreatorPage(){
  const {creator}=useSiteState();
  return <div className={styles.frame}>
    <div className={styles.pageHeading}><h1>Creator studio</h1><p>Plan, record and shape your work. Download a brief or keep a written draft in this browser.</p></div>
    <CreatorStudio draft={creator}/>
  </div>;
}
