'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import type {ReactNode} from 'react';
import {Brand} from './brand';
import {Experience,Arrow} from './experience';
import {SiteStateProvider} from './site-state';
import styles from './experience.module.css';

/** Persistent layout preserves written draft state across client-side page changes. */
export function SiteShell({children}:{children:ReactNode}){
  const pathname=usePathname()||'/';
  const creator=pathname.replace(/\/$/,'').endsWith('/creator-studio');
  const approach=pathname.replace(/\/$/,'').endsWith('/our-approach');
  return <Experience><SiteStateProvider>
    <a className="skip-link" href="#page-content">Skip to page content</a>
    <header id="top" className={styles.header}>
      <Brand/>
      <nav className={styles.nav} aria-label="Primary navigation">
        <Link href="/#discover" aria-current={!creator&&!approach?'page':undefined}>Discover</Link>
        <Link href="/creator-studio/" aria-current={creator?'page':undefined}>Creator studio</Link>
        <Link href="/our-approach/" aria-current={approach?'page':undefined}>Our approach</Link>
      </nav>
      <Link className={styles.navCta} href="/creator-studio/">Start a story <Arrow/></Link>
    </header>
    <main id="page-content" tabIndex={-1}>{children}</main>
    <footer className={styles.footer}>
      <div><Brand inverse/><p>Stories are richer when more people get to tell them.</p></div>
      <div><Link href="/creator-studio/">Creator studio <Arrow/></Link><br/><Link href="/our-approach/">Our approach <Arrow/></Link><br/>NewWave Africa / Hackathon prototype<br/>Fictional samples. Local drafts. Your authorship.</div>
    </footer>
  </SiteStateProvider></Experience>;
}
