import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {TRANSLATION_LANGUAGES,googleWebsiteTranslatorUrl,publicSitePageUrl} from '../lib/translation.ts';

test('only official public NewWave routes are copied for external translation',()=>{
  assert.equal(publicSitePageUrl('/'),'https://funky-amahle.github.io/newwave-africa/');
  assert.equal(publicSitePageUrl('/creator-studio/'),'https://funky-amahle.github.io/newwave-africa/creator-studio/');
  assert.equal(publicSitePageUrl('/newwave-africa/our-approach'),'https://funky-amahle.github.io/newwave-africa/our-approach/');
  assert.equal(publicSitePageUrl('/private?draft=secret'),'https://funky-amahle.github.io/newwave-africa/');
  assert.equal(publicSitePageUrl('/creator-studio/#secret'),'https://funky-amahle.github.io/newwave-africa/');
});
test('language selection never sends authored text or opens an unsupported language',()=>{
  assert.equal(googleWebsiteTranslatorUrl('en'),null);
  assert.equal(googleWebsiteTranslatorUrl('unknown'),null);
  for(const language of TRANSLATION_LANGUAGES){
    const url=new URL(googleWebsiteTranslatorUrl(language.code));
    assert.equal(url.origin,'https://translate.google.com');
    assert.equal(url.searchParams.get('tl'),language.code);
    assert.equal(url.searchParams.get('op'),'websites');
    assert.equal(url.searchParams.get('text'),null);
    assert.equal(url.searchParams.get('u'),null);
  }
});
test('shared homepage layout shows a language disclosure with explicit external action',()=>{
  const shell=readFileSync(new URL('../components/experience.tsx',import.meta.url),'utf8');
  const selector=readFileSync(new URL('../components/site-language-selector.tsx',import.meta.url),'utf8');
  const css=readFileSync(new URL('../components/experience.module.css',import.meta.url),'utf8');
  assert.match(shell,/<SiteLanguageSelector\/>/);
  assert.match(selector,/<details/);
  assert.match(selector,/<label htmlFor=\{selectId\}>/);
  assert.match(selector,/href=\{translatorUrl\} target="_blank" rel="noopener noreferrer"/);
  assert.match(selector,/onClick=\{copyPublicUrl\}/);
  assert.match(selector,/Private browser drafts are not sent automatically/);
  assert.match(css,/\.siteLanguagePanel/);
  assert.match(css,/@media\(max-width:540px\)/);
});
