import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {FLAGSHIP_STORY_ID,getFlagshipStory,estimatedReadingMinutes} from '../lib/flagship-story.ts';
import sampleStories from '../lib/sample-stories.json' with {type:'json'};
import {sampleGoogleTranslateUrl} from '../lib/translation.ts';

test('only the existing explicitly fictional Culture & Heritage sample has a full read',()=>{
  assert.equal(FLAGSHIP_STORY_ID,'s3');
  assert.equal(sampleStories.length,8);
  for(const story of sampleStories){
    const content=getFlagshipStory(story);
    assert.equal(Boolean(content),story.id==='s3');
    if(content){
      assert.equal(story.category,'Culture & Heritage');
      assert.equal(story.country,'South Africa');
      assert.equal(content.paragraphs.length,9);
      assert.ok(content.paragraphs.join(' ').split(/\s+/).length>400);
      assert.match(content.editorialNote,/fictional/i);
      assert.match(content.paragraphs.join(' '),/permission|agreed|Ask me first/i);
      assert.equal(estimatedReadingMinutes(content.paragraphs),3);
    }
  }
});
test('local drafts and untrusted sample IDs never receive editorial long read',()=>{
  for(const draft of [
    {id:FLAGSHIP_STORY_ID,sample:false},
    {id:FLAGSHIP_STORY_ID},
    {id:'local-1',sample:false},
    {id:'s4',sample:true}
  ])assert.equal(getFlagshipStory(draft),null);
});
test('all eight original excerpts and narration associations remain unchanged',()=>{
  const clips=JSON.parse(readFileSync(new URL('../public/narration/manifest.json',import.meta.url),'utf8'));
  assert.deepEqual(Object.keys(clips.clips),sampleStories.map(s=>s.id));
  const original=sampleStories.find(x=>x.id==='s3');
  assert.equal(original.excerpt,'An illustrative reflection on oral history, memory, and cultural inheritance.');
  const url=new URL(sampleGoogleTranslateUrl(original,'zu'));
  assert.equal(url.searchParams.get('text'),original.title+'\n\n'+original.excerpt);
  assert.doesNotMatch(url.searchParams.get('text'),/Gogo Nomsa/);
});
test('accessible editorial reader exposes original full text and distinct audio and translation disclaimers',()=>{
  const ui=readFileSync(new URL('../components/experience.tsx',import.meta.url),'utf8');
  const css=readFileSync(new URL('../components/experience.module.css',import.meta.url),'utf8');
  assert.match(ui,/getFlagshipStory\(story\)/);
  assert.match(ui,/flagship\.paragraphs\.join/);
  assert.match(ui,/textToRead\.split/);
  assert.match(ui,/Written sample, not full-length narration/);
  assert.match(ui,/Existing audio on the story card narrates the original short preview only/);
  assert.match(ui,/Google Translate opens the short fictional preview/);
  assert.match(ui,/className=\{styles\.readerEditorialNote\}/);
  assert.match(css,/\.readerDeck/);
  assert.match(css,/\.readerHeroArt/);
  assert.match(css,/@media\(max-width:540px\)/);
});
