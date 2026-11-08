import Link from 'next/link';
import type {Metadata} from 'next';
import {Arrow} from '../../components/experience';
import styles from '../../components/experience.module.css';

export const metadata:Metadata={title:'Our approach — NewWave Africa',description:'Human-centred African storytelling, transparent discovery and practical tools that extend the craft.'};
const principles=[
  {title:'Extend the craft',body:'The tools help you plan, record and organise your own work. Your experience, words and creative decisions lead.'},
  {title:'Keep production practical',body:'Start with a browser, the equipment available to you and a clear outline. Download an editable brief and separate media assets for your next production step.'},
  {title:'Keep ownership visible',body:'Credit collaborators, check rights and confirm authorship or permission before saving a written draft. Nothing is automatically published.'},
  {title:'Make choices understandable',body:'See how discovery is weighted, review your words and choose what to keep. A demonstration count is not a measure of fairness or real audience reach.'},
];
export default function Page(){return <>
  <div className={styles.frame}>
    <section className={styles.approachIntro} aria-labelledby="approach-title">
      <h1 id="approach-title">Every story changes the <em>narrative.</em></h1>
      <div><p>NewWave Africa pairs discovery with craft: helping audiences encounter African perspectives beyond their usual feed, and helping creators shape work in their own voice.</p><p>Our wave theme is original abstract linework. It represents a shared current of individual voices, without claiming to represent a particular place or cultural tradition.</p></div>
    </section>
    <section className={styles.approachColumns} aria-label="Discovery and creation">
      <div><h2>Discovery &amp; Audience</h2><p>Stay close to an interest while leaving room for another perspective. Search the collection, choose a category preference and adjust the diversity weighting.</p><p>The ranking uses illustrative relevance and category-scarcity rules. Categories are prioritised rather than excluded. The eight starter stories are fictional examples, not verified reporting.</p><Link className={styles.textButton} href="/discover/">Explore the collection <Arrow/></Link><br/><Link className={styles.textButton} href="/discover/#discovery-insights">Inspect the discovery comparison <Arrow/></Link></div>
      <div><h2>Creation &amp; Craft</h2><p>For African storytellers, writers, filmmakers, journalists, animators, musicians and game makers. Practical tools help you take an idea towards finished, shareable work while keeping the human author at the centre.</p><p>Five planning canvases support writing, film and animation, journalism, music and audio, and games and interactive stories. Type your answers, record a voice note, choose a visual and download an editable production brief.</p><Link className={styles.textButton} href="/creator-studio/">Open creator studio <Arrow/></Link></div>
    </section>
  </div>
  <section className={styles.approachPrinciples} aria-labelledby="principles-title"><div className={styles.frame}>
    <h2 id="principles-title">The author stays at the centre.</h2>
    <div className={styles.principleGrid}>{principles.map(p=><div key={p.title}><h3>{p.title}</h3><p>{p.body}</p></div>)}</div>
  </div></section>
  <section className={`${styles.frame} ${styles.approachBoundaries}`} aria-labelledby="boundaries-title">
    <h2 id="boundaries-title">Know where your work lives.</h2>
    <dl><div><dt>Written drafts &amp; reading list</dt><dd>Saved only in this browser. There are no accounts or public publishing. Clearing browser data removes saved work.</dd></div><div><dt>Planning notes &amp; media</dt><dd>Temporary in-page work. Download your brief, recording and visual separately before leaving. Media is not attached to saved text drafts, and downloads are not a rendered video.</dd></div><div><dt>Voice tools</dt><dd>Recording, audio upload and playback run in your browser. The Pages demo can send selected audio for transcription, or your story text for generated narration, directly to Deepgram using a key you enter for this session and separate consent. Generated narration can be played and downloaded as WAV; it is not publicly published. It uses your Deepgram quota. A shared service with an owner-managed private key still needs a backend.</dd></div><div><dt>Classification &amp; evidence</dt><dd>Category suggestions use local keyword rules. Transcription is not verification, and illustrative discovery counts are not real-world impact metrics.</dd></div></dl>
    <Link className={styles.solidButton} href="/creator-studio/">Bring your next story <Arrow/></Link>
  </section>
</>}
