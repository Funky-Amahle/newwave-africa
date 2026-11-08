'use client';

import {useId,useState} from 'react';
import {usePathname} from 'next/navigation';
import {TRANSLATION_LANGUAGES,googleWebsiteTranslatorUrl,publicSitePageUrl} from '../lib/translation';
import styles from './experience.module.css';

/** A human-initiated handoff to Google's Websites translator, not embedded translation. */
export function SiteLanguageSelector(){
  const pathname=usePathname()||'/';
  const selectId=useId();
  const [language,setLanguage]=useState('en');
  const [copyStatus,setCopyStatus]=useState('');
  const pageUrl=publicSitePageUrl(pathname);
  const translatorUrl=googleWebsiteTranslatorUrl(language);
  const selectedLabel=TRANSLATION_LANGUAGES.find(item=>item.code===language)?.label||'English';

  async function copyPublicUrl(){
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopyStatus('Public page link copied. Paste it in the Website field on Google Translate.');
    } catch {
      setCopyStatus('Clipboard access is unavailable. Select the public page link below and copy it manually.');
    }
  }

  return <details className={styles.siteLanguage}>
    <summary>Language <strong>{selectedLabel}</strong></summary>
    <div className={styles.siteLanguagePanel}>
      <label htmlFor={selectId}>Translate public website to</label>
      <select id={selectId} value={language} onChange={event=>{setLanguage(event.target.value);setCopyStatus('')}}>
        <option value="en">English (original)</option>
        {TRANSLATION_LANGUAGES.map(item=><option key={item.code} value={item.code}>{item.label}</option>)}
      </select>
      {translatorUrl
        ? <>
            <p>Google Translate opens in a new tab. Copy the public page link and paste it into the <strong>Websites</strong> field there. This does not translate inside NewWave Africa.</p>
            <label className={styles.siteLanguageUrlLabel} htmlFor={selectId+'-url'}>Public page link</label>
            <input id={selectId+'-url'} type="text" readOnly value={pageUrl} onFocus={event=>event.currentTarget.select()} aria-label="Public page link, selectable for manual copying"/>
            <div className={styles.siteLanguageActions}>
              <button type="button" onClick={copyPublicUrl}>Copy link</button>
              <a href={translatorUrl} target="_blank" rel="noopener noreferrer">Open Google Translate <span aria-hidden="true">↗</span></a>
            </div>
            <p className={styles.siteLanguageDisclaimer}>External machine translation can miss cultural nuance and may be unavailable in some regions. Private browser drafts are not sent automatically.</p>
            {copyStatus&&<p className={styles.siteLanguageStatus} role="status">{copyStatus}</p>}
          </>
        : <p>NewWave Africa's original interface is in English. Choose another language to open an optional external translation service.</p>}
    </div>
  </details>;
}
