import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';

const shortcuts=readFileSync(new URL('../components/creator-shortcuts.tsx',import.meta.url),'utf8');
const page=readFileSync(new URL('../components/creator-page.tsx',import.meta.url),'utf8');
const studio=readFileSync(new URL('../components/creator-studio.tsx',import.meta.url),'utf8');
const voices=readFileSync(new URL('../components/creator-voice-picker.tsx',import.meta.url),'utf8');
const visuals=readFileSync(new URL('../components/story-visuals.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../components/experience.module.css',import.meta.url),'utf8');

test('long studio has six real and stable shortcut destinations',()=>{
  for(const id of ['studio-plan','studio-draft','studio-voice-answer','studio-rights','studio-narration','studio-visual']){
    assert.match(shortcuts,new RegExp("id:'"+id+"'"));
    assert.ok(studio.includes('id="'+id+'"')||voices.includes('id="'+id+'"')||visuals.includes('id="'+id+'"'),'missing '+id);
  }
  assert.match(page,/<CreatorShortcuts\/>/);
  assert.match(page,/id="studio-top" tabIndex=\{-1\}/);
  assert.match(shortcuts,/href="#studio-top"/);
});
test('mobile section picker uses a native fragment, keyboard focus and keeps same-page links',()=>{
  assert.match(shortcuts,/<nav className=\{styles\.studioShortcutBar\} aria-label="Jump between Creator Studio sections"/);
  assert.match(shortcuts,/href=\{'#'\+id\}/);
  assert.match(shortcuts,/window\.location\.hash=value/);
  assert.match(shortcuts,/target\.focus\(\{preventScroll:true\}\)/);
  assert.match(shortcuts,/requestAnimationFrame/);
  assert.match(shortcuts,/defaultValue=""/);
  assert.match(shortcuts,/event\.currentTarget\.value=''/);
  assert.match(studio,/id="studio-rights" tabIndex=\{-1\}/);
});
test('sticky jump controls and compact journey remain responsive without extra animation',()=>{
  assert.match(css,/\.studioShortcutBar\s*\{[^}]*position:sticky/);
  assert.match(css,/\.studioShortcutLinks/);
  assert.match(css,/\.studioShortcutPicker/);
  assert.match(css,/@media\(max-width:900px\)/);
  assert.match(css,/@media\(max-width:540px\)/);
  assert.match(css,/scroll-margin-top:92px/);
  assert.match(css,/\.creatorJourney ol\s*\{\s*grid-template-columns:repeat\(2/);
  assert.doesNotMatch(shortcuts,/setInterval|IntersectionObserver/);
});

test('visuals shortcut targets actual editor rather than the two-panel sidebar',()=>{
  assert.doesNotMatch(studio,/<aside[^>]*id="studio-visual"/);
  assert.match(visuals,/<section id="studio-visual" tabIndex=\{-1\}/);
  assert.match(voices,/<section id="studio-narration" tabIndex=\{-1\}/);
});
test('uploaded image downloads retain a supported extension and clear on replacement',()=>{
  assert.match(visuals,/setUploadExtension\(/);
  for(const ext of ['jpg','png','webp'])assert.ok(visuals.includes("'"+ext+"'"));
  assert.match(visuals,/download=\{upload\?'newwave-visual\.'\+uploadExtension:/);
  assert.match(visuals,/setUploadExtension\(''\)/);
});
