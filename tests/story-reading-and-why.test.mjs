import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {CATEGORIES,getDiscovery,explainStoryPlacement} from '../lib/discovery.ts';

const sample=(id,category=CATEGORIES[0])=>({
  id,title:'Sample '+id,excerpt:'Invented fictional text',category,country:'South Africa',
  author:'Sample storyteller',language:'English',tags:['demo'],date:'2026-11-08',sample:true
});
const defaults={query:'',interest:'All categories',diversity:60,savedOnly:false,saved:[]};

test('explanation uses exactly the same category counts and diversity setting as ranker',()=>{
  const items=[sample('a'),sample('b'),sample('c',CATEGORIES[2])];
  const ranked=getDiscovery(items,defaults);
  const rare=items[2];
  assert.equal(ranked.counts[rare.category],1);
  const lines=explainStoryPlacement(rare,defaults,ranked.counts).join(' ');
  assert.match(lines,/Diversity is set to 60%/);
  assert.match(lines,/Culture & Heritage has 1 story/);
  assert.match(lines,/All categories is selected/);
  assert.match(lines,/deterministic local ranking/);
  assert.doesNotMatch(lines,/personalized for you by AI|AI recommended/);
});
test('interest preference does not pretend to exclude other categories',()=>{
  const chosen=sample('a',CATEGORIES[1]),other=sample('b',CATEGORIES[2]);
  const opts={...defaults,interest:CATEGORIES[1],diversity:0};
  const counts=getDiscovery([chosen,other],opts).counts;
  assert.match(explainStoryPlacement(chosen,opts,counts).join(' '),/matches your selected interest/);
  const reason=explainStoryPlacement(other,opts,counts).join(' ');
  assert.match(reason,/other categories stay eligible/);
  assert.match(reason,/Diversity is set to 0%/);
});
test('search and reading list are described as selection constraints only',()=>{
  const item=sample('x');
  const opts={...defaults,query:'  sample  ',savedOnly:true,saved:['x']};
  const reasons=explainStoryPlacement(item,opts,getDiscovery([item],opts).counts).join(' ');
  assert.match(reasons,/Search filters which stories can appear/);
  assert.match(reasons,/only stories you saved in this browser/);
});
test('invalid diversity weights use the same default or clamping as ranker',()=>{
  const item=sample('x'), counts={[item.category]:1};
  assert.match(explainStoryPlacement(item,{...defaults,diversity:Number.NaN},counts).join(' '),/60%/);
  assert.match(explainStoryPlacement(item,{...defaults,diversity:500},counts).join(' '),/100%/);
  assert.match(explainStoryPlacement(item,{...defaults,diversity:-500},counts).join(' '),/0%/);
});
test('reader and cards distinguish short narration from complete original fictional story',()=>{
  const reader=readFileSync(new URL('../components/experience.tsx',import.meta.url),'utf8');
  const card=readFileSync(new URL('../components/story-card.tsx',import.meta.url),'utf8');
  const home=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
  const css=readFileSync(new URL('../components/experience.module.css',import.meta.url),'utf8');
  assert.match(card,/Short preview audio only/);
  assert.match(card,/Short fictional sample excerpt, not a full-length story/);
  assert.match(reader,/Story text size/);
  assert.match(reader,/aria-pressed=\{readingSize==='large'\}/);
  assert.match(reader,/data-reading-size=\{flagship\?readingSize:'regular'\}/);
  assert.match(home,/Why am I seeing this story\?/);
  assert.match(home,/explainStoryPlacement\(story,/);
  assert.match(css,/\.readerText\[data-reading-size='large'\]/);
  assert.match(css,/\.whyStory summary:focus-visible/);
  assert.match(css,/@media\(max-width:540px\)/);
});
