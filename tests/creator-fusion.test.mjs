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
  const src=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
  assert.match(src,/window\.history\.pushState/);
  assert.match(src,/addEventListener\('popstate'/);
  assert.match(src,/addEventListener\('hashchange'/);
  assert.match(src,/href=\{workspaceHash\(item\)\}/);
  assert.match(src,/href=\{workspaceHash\('create'\)\}/);
});
test('creator progress uses a truthful status and retains local notes messaging',()=>{
  const src=readFileSync(new URL('../components/creator-craft-toolkit.tsx',import.meta.url),'utf8');
  assert.match(src,/countAnsweredSections\(/);
  assert.match(src,/role="status">\{drafted\} of \{active\.sections\.length\} prompts drafted/);
  assert.match(src,/Notes remain in this page's memory until you refresh or leave/);
});
