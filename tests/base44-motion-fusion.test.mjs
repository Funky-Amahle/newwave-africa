import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
const ui=readFileSync(new URL('../components/experience.tsx',import.meta.url),'utf8');
const css=readFileSync(new URL('../components/experience.module.css',import.meta.url),'utf8');
const hero=readFileSync(new URL('../components/hero.tsx',import.meta.url),'utf8');
const wave=readFileSync(new URL('../components/wave-field.tsx',import.meta.url),'utf8');
const reader=readFileSync(new URL('../lib/flagship-story.ts',import.meta.url),'utf8');

test('featured stories remain explicit fictional samples with original reader navigation',()=>{
  assert.match(ui,/Featured sample stories/);
  assert.match(ui,/Featured fictional long read/);
  assert.match(ui,/onRead\(story\)/);
  assert.match(ui,/getFlagshipStory\(story\)/);
  assert.match(reader,/FLAGSHIP_STORY_ID = 's3'/);
});
test('carousel navigation has previous, next, dot labels and accessible current position',()=>{
  assert.match(ui,/Previous featured fictional story/);
  assert.match(ui,/Next featured fictional story/);
  assert.match(ui,/Choose a featured fictional story/);
  assert.match(ui,/aria-current=\{i===index\?'true':undefined\}/);
  assert.match(ui,/setIndex\(selected\)/);
  assert.match(ui,/role="status">\{announcement\}/);
});
test('rotation is opt-in and stops while page hidden, hovered, focused, offscreen or quiet',()=>{
  assert.match(ui,/useState\(false\)/);
  assert.match(ui,/onClick=\{\(\)=>\{setRotating\(value=>!value\)/);
  assert.match(ui,/document\.hidden/);
  assert.match(ui,/IntersectionObserver/);
  assert.match(ui,/!visible\|\|!pageVisible\|\|hovered\|\|focused/);
  assert.match(ui,/window\.clearTimeout\(timer\)/);
  assert.match(ui,/if\(quiet\)setRotating\(false\)/);
  assert.match(ui,/disabled=\{quiet\|\|stories\.length<2\}/);
  assert.match(ui,/AnimatePresence initial=\{false\} mode="wait"/);
});
test('existing wave visual and motion controls remain and responsive styles cover 540px',()=>{
  assert.match(hero,/LandingWaves quiet=\{quiet\}/);
  assert.match(hero,/<WaveField\/>/);
  assert.match(wave,/useVisibleMotion\(useQuietMotion\(\)\)/);
  assert.match(css,/\.spotlightPagination/);
  assert.match(css,/\.spotlightArrows/);
  assert.match(css,/@media\(max-width:540px\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/data-quiet='true'/);
  assert.match(css,/focus-visible/);
});
