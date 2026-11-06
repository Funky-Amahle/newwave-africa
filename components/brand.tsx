import artwork from '../lib/brand-artwork.json';
import styles from './brand.module.css';

type BrandProps = { inverse?: boolean };

/** Approved NW identity. SVG outlines keep the wordmark consistent without font requests. */
export function Brand({inverse = false}: BrandProps = {}) {
  return (
    <a className={styles.root} data-inverse={inverse || undefined} href="#top" aria-label="NewWave Africa home">
      <svg className={styles.mark} viewBox={artwork.markViewBox} aria-hidden="true" focusable="false">
        <path d={artwork.markInk} fill="currentColor"/>
        <path className={styles.accent} d={artwork.markAccent}/>
      </svg>
      <span className={styles.divider} aria-hidden="true"/>
      <svg className={styles.wordmark} viewBox={artwork.wordViewBox} aria-hidden="true" focusable="false">
        <path d={artwork.wordmark} fill="currentColor" fillRule="evenodd"/>
      </svg>
    </a>
  );
}
