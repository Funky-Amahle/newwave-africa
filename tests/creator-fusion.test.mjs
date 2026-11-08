import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {workspaceHash,workspaceFromHash} from '../lib/workspace-navigation.ts';
import {countAnsweredSections} from '../lib/craft-progress.ts';

test('workspace views have stable shareable fragments',()=>{
  assert.equal(workspaceHash('discover'),'#discover');
  assert.equal(workspaceHash('create'),'#creator-studio');
  assert.equal(workspaceHash('impact'),'#discovery-insights');
  for(const view of ['discover','create','impact'])assert.equal(workspaceFromHash(workspaceHash(view)),view);
});
test('studio tool links select the creator workspace on direct entry',()=>{
  for(const hash of ['#studio-plan','#studio-visual','#studio-draft','#studio-voice-answer','#studio-rights'])assert.equal(workspaceFromHash(hash),'create');
});
test('unrelated fragments are not treated as workspace links',()=>{
  for(const hash of ['','#top','#workspace','#unknown','https://example.invalid/#creator-studio'])assert.equal(workspaceFromHash(hash),null);
  assert.equal(workspaceFromHash('  #CREATOR-STUDIO '),'create');
});
test('progress counts only nonblank answers for the active format',()=>{
  const sections=['Beginning','Context','Ending'];
  const notes={'story:0':' A story ','story:1':' \n ','story:2':'The ending','film:1':'A scene'};
  assert.equal(countAnsweredSections('story',sections,notes),2);
  assert.equal(countAnsweredSections('film',sections,notes),1);
  assert.equal(countAnsweredSections('game',sections,notes),0);
  assert.equal(countAnsweredSections('story',[],notes),0);
  assert.equal(notes['story:0'],' A story ');
});
test('homepage offers linkable views and Back/Forward state restoration',()=>{
  const src=readFileSync(new URL('../components/home-content.tsx',import.meta.url),'utf8');
  assert.match(src,/window\.history\.pushState/);
  assert.match(src,/addEventListener\('popstate'/);
  assert.match(src,/addEventListener\('hashchange'/);
  const shell=readFileSync(new URL('../components/site-shell.tsx',import.meta.url),'utf8');
  assert.match(shell,/href="\/"/);
  assert.match(shell,/href="\/discover\/"/);
  assert.match(shell,/href="\/creator-studio\/"/);
  assert.match(shell,/href="\/our-approach\/"/);
});
test('creator progress uses a truthful status and retains local notes messaging',()=>{
  const src=readFileSync(new URL('../components/creator-craft-toolkit.tsx',import.meta.url),'utf8');
  assert.match(src,/countAnsweredSections\(/);
  assert.match(src,/role="status">\{drafted\} of \{active\.sections\.length\} prompts drafted/);
  assert.match(src,/Notes remain in this page's memory until you refresh or leave/);
});


test('guided journey links existing draft, review, consent and save controls',()=>{
  const src=readFileSync(new URL('../components/creator-studio.tsx',import.meta.url),'utf8');
  for(const id of ['studio-plan','studio-draft','studio-voice-answer','studio-rights']){
    assert.match(src,new RegExp('href="#'+id+'"'));
    assert.match(src,new RegExp('id="'+id+'"'));
  }
  assert.match(src,/Save written draft locally/);
  assert.match(src,/nothing is automatically published/);
});

test('four ordered primary navigation routes keep direct entries and legacy discovery hashes',()=>{
  const shell=readFileSync(new URL('../components/site-shell.tsx',import.meta.url),'utf8');
  const discover=readFileSync(new URL('../app/discover/page.tsx',import.meta.url),'utf8');
  const landing=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
  const shared=readFileSync(new URL('../components/home-content.tsx',import.meta.url),'utf8');
  const expected=['Home','Discover','Creator Studio','Our Approach'];
  const targets=['/','/discover/','/creator-studio/','/our-approach/'];
  const nav=shell.slice(shell.indexOf('<nav '),shell.indexOf('</nav>'));
  let previous=-1;
  for(let i=0;i<expected.length;i++){
    const target='href="'+targets[i]+'"';
    const p=nav.indexOf(target);
    assert.ok(p>previous,'Expected navigation '+expected[i]+' after previous link');
    previous=p;
  }
  assert.match(discover,/HomeContent mode="discover"/);
  assert.match(landing,/HomeContent mode="home"/);
  assert.match(shared,/id="discover"/);
  assert.match(shared,/addEventListener\('hashchange'/);
  assert.match(shared,/addEventListener\('popstate'/);
  assert.equal(workspaceFromHash('#discover'),'discover');
  assert.equal(workspaceFromHash('#discovery-insights'),'impact');
});
