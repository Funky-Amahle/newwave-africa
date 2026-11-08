import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {TRANSLATION_LANGUAGES,sampleGoogleTranslateUrl,blankGoogleTranslateUrl} from '../lib/translation.ts';

const sample={sample:true,title:'A fictional story',excerpt:'A short invented community story.'};
const draft={...sample,sample:false,excerpt:'Private draft text never belongs in a URL.'};

test('African-language choices use distinct, explicitly allowlisted codes',()=>{
  const codes=TRANSLATION_LANGUAGES.map(language=>language.code);
  assert.equal(new Set(codes).size,codes.length);
  for(const code of ['zu','xh','af','st','tn','sw','rw','am','ha','yo','fr','pt'])assert.ok(codes.includes(code));
});
test('only fictional samples are included in explicitly requested external translation links',()=>{
  const link=sampleGoogleTranslateUrl(sample,'xh');
  const url=new URL(link);
  assert.equal(url.origin,'https://translate.google.com');
  assert.equal(url.searchParams.get('sl'),'en');
  assert.equal(url.searchParams.get('tl'),'xh');
  assert.equal(url.searchParams.get('text'),sample.title+'\n\n'+sample.excerpt);
  assert.equal(url.searchParams.get('op'),'translate');
  assert.equal(sampleGoogleTranslateUrl(draft,'xh'),null);
  assert.equal(sampleGoogleTranslateUrl({...sample,sample:undefined},'xh'),null);
  assert.equal(sampleGoogleTranslateUrl({...sample,excerpt:'x'.repeat(1600)},'xh'),null);
  assert.equal(sampleGoogleTranslateUrl(sample,'<invalid>'),null);
});
test('the external manual translator link contains no authored or draft text',()=>{
  const url=new URL(blankGoogleTranslateUrl('zu'));
  assert.equal(url.origin,'https://translate.google.com');
  assert.equal(url.searchParams.get('tl'),'zu');
  assert.equal(url.searchParams.get('text'),null);
  assert.equal(new URL(blankGoogleTranslateUrl('not-a-language')).searchParams.get('tl'),'sw');
});
test('reader requires user interaction and explains provider and privacy boundary',()=>{
  const reader=readFileSync(new URL('../components/experience.tsx',import.meta.url),'utf8');
  assert.match(reader,/sampleGoogleTranslateUrl\(story,targetLanguage\)/);
  assert.match(reader,/target="_blank" rel="noopener noreferrer"/);
  assert.match(reader,/onClick=\{copyForTranslation\}/);
  assert.match(reader,/not sent automatically/);
  assert.match(reader,/Machine translation may lose cultural nuance/);
  assert.doesNotMatch(reader,/fetch\(['"]https:\/\/translate\.google/);
});
