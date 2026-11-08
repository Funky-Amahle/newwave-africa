import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {CATEGORIES,parseStories,prependDraft,parseSaved,toggleSaved,getDiscovery} from '../lib/discovery.ts';
import {DISCOVERY_SCENARIO_STORIES,SCENARIO_CATEGORY_COUNT} from '../lib/discovery-scenario.ts';
const story=(id,category=CATEGORIES[0],title=id)=>({id,title,category,excerpt:'An original demonstration story with enough detail.',country:'South Africa',author:'Demo author',language:'English',tags:['community'],date:'2026-11-06'});
const options={query:'',interest:'All categories',diversity:60,savedOnly:false,saved:[]};

test('malformed storage never breaks discovery',()=>{
  for(const value of [null,'{','null','{}','42','[null,{},1]'])assert.deepEqual(parseStories(value),[]);
});
test('stored drafts are validated, deduplicated and never trusted as samples',()=>{
  const original=story('local-1');
  assert.deepEqual(parseStories(JSON.stringify([original,original,{...original,id:'s1'},{...original,id:'bad',tags:9},{...original,id:'long',title:'x'.repeat(181)}])),[{...original,sample:false}]);
  assert.equal(parseStories(JSON.stringify([{...original,sample:true}]))[0].sample,false);
});
test('restored draft collection is bounded',()=>assert.equal(parseStories(JSON.stringify(Array.from({length:130},(_,i)=>story('local-'+i)))).length,100));
test('saved IDs are bounded, valid and unique',()=>{
  assert.deepEqual(parseSaved('["s1","s1",2,null,"","s2"]'),['s1','s2']);
  assert.deepEqual(parseSaved('not JSON'),[]);
  assert.equal(parseSaved(JSON.stringify(Array.from({length:250},(_,i)=>'id-'+i))).length,200);
});
test('reading list toggle adds and removes without mutating inputs',()=>{
  const ids=['s1'];assert.deepEqual(toggleSaved(ids,'s2'),['s1','s2']);assert.deepEqual(toggleSaved(ids,'s1'),[]);assert.deepEqual(ids,['s1']);
});
test('search trims whitespace and matches countries, tags and story text',()=>{
  assert.equal(getDiscovery([story('a')],{...options,query:'  SOUTH africa  '}).ranked.length,1);
  assert.equal(getDiscovery([story('a')],{...options,query:'community'}).ranked.length,1);
  assert.equal(getDiscovery([story('a')],{...options,query:'no-match'}).ranked.length,0);
});
test('interest is a ranking preference, not a category exclusion',()=>{
  const a=story('a',CATEGORIES[0]),b=story('b',CATEGORIES[1]);
  const result=getDiscovery([a,b],{...options,interest:CATEGORIES[1],diversity:0});
  assert.deepEqual(result.ranked.map(s=>s.id),['b','a']);
});
test('reading-list view intersects current search',()=>{
  const stories=[story('a',CATEGORIES[0],'First'),story('b',CATEGORIES[1],'Second')];
  assert.deepEqual(getDiscovery(stories,{...options,saved:['b'],savedOnly:true}).ranked.map(s=>s.id),['b']);
  assert.equal(getDiscovery(stories,{...options,saved:['b'],savedOnly:true,query:'First'}).ranked.length,0);
});
test('dashboard compares the same eligible population and top-eight window',()=>{
  const stories=Array.from({length:12},(_,i)=>story('local-'+i,CATEGORIES[i%8]));
  const all=getDiscovery(stories,options);assert.equal(all.windowSize,8);assert.ok(all.diverseCoverage<=8);
  const only=getDiscovery(stories,{...options,savedOnly:true,saved:['local-3','local-7']});
  assert.equal(only.windowSize,2);assert.equal(only.baselineCoverage,2);assert.equal(only.diverseCoverage,2);
  const empty=getDiscovery(stories,{...options,query:'missing'});assert.equal(empty.windowSize,0);assert.equal(empty.baselineCoverage,0);assert.equal(empty.diverseCoverage,0);
});
test('scarcity weighting raises an underrepresented category at full diversity',()=>{
  const stories=[story('a'),story('b'),story('c'),story('rare',CATEGORIES[3])];
  assert.equal(getDiscovery(stories,{...options,diversity:100}).ranked[0].id,'rare');
});
test('ranker is deterministic, does not mutate collection and clamps weighting',()=>{
  const stories=[story('b'),story('a')];const before=JSON.stringify(stories);
  assert.deepEqual(getDiscovery(stories,{...options,diversity:NaN}),getDiscovery(stories,options));
  assert.deepEqual(getDiscovery(stories,{...options,diversity:999}),getDiscovery(stories,{...options,diversity:100}));
  assert.equal(JSON.stringify(stories),before);
});
test('new UI has native dialog/help, motion preferences, and no synthetic speech',()=>{
  const ui=readFileSync(new URL('../components/experience.tsx',import.meta.url),'utf8');
  const hero=readFileSync(new URL('../components/hero.tsx',import.meta.url),'utf8');
  assert.match(ui,/<dialog/);assert.match(ui,/<details>/);assert.match(ui,/useReducedMotion/);assert.match(ui,/MotionConfig/);
  assert.doesNotMatch(ui+hero,/repeat:\s*Infinity|speechSynthesis|SpeechSynthesisUtterance/);
});
test('all referenced CSS module classes exist',()=>{
  const css=readFileSync(new URL('../components/experience.module.css',import.meta.url),'utf8');
  for(const file of ['../components/hero.tsx','../components/creator-studio.tsx','../components/experience.tsx','../app/page.tsx']){
    const src=readFileSync(new URL(file,import.meta.url),'utf8');
    for(const [,name] of src.matchAll(/styles\.([A-Za-z]\w*)/g))assert.match(css,new RegExp('\\.'+name+'(?![\\w-])'),name);
  }
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
});
test('saving a draft preserves existing drafts from the latest storage snapshot',()=>{
  const original=story('existing');const next=story('new');
  assert.deepEqual(prependDraft(JSON.stringify([original]),next),[next,{...original,sample:false}]);
  assert.deepEqual(prependDraft(null,next),[next]);
});
test('saving refuses malformed or incomplete storage rather than overwriting it',()=>{
  for(const raw of ['{','{}','null','[null]',JSON.stringify([story('existing'),{}])])assert.throws(()=>prependDraft(raw,story('new')));
});
test('saving at the draft limit never evicts an older story',()=>{
  const raw=JSON.stringify(Array.from({length:100},(_,i)=>story('old-'+i)));
  assert.throws(()=>prependDraft(raw,story('new')),/100-draft limit/);
});
test('saving rejects duplicate and reserved draft IDs',()=>{
  assert.throws(()=>prependDraft(JSON.stringify([story('same')]),story('same')),/validate/);
  assert.throws(()=>prependDraft('[]',story('s1')),/validate/);
});


test('uneven fictional scenario visibly demonstrates the deterministic ranking tradeoff',()=>{
  assert.equal(DISCOVERY_SCENARIO_STORIES.length,12);
  assert.equal(SCENARIO_CATEGORY_COUNT,5);
  assert.ok(DISCOVERY_SCENARIO_STORIES.every(s=>s.sample===true));
  const compare=(diversity)=>getDiscovery(DISCOVERY_SCENARIO_STORIES,{...options,diversity});
  const zero=compare(0),illustrative=compare(60);
  assert.deepEqual(zero.ranked.map(s=>s.id),zero.baseline.map(s=>s.id));
  assert.equal(illustrative.windowSize,8);
  assert.equal(illustrative.baselineCoverage,1);
  assert.equal(illustrative.diverseCoverage,5);
  assert.deepEqual(illustrative.ranked.map(s=>s.id).sort(),illustrative.baseline.map(s=>s.id).sort());
});
