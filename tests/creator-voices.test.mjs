import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {CREATOR_VOICES,DEFAULT_CREATOR_VOICE,narrationBrief} from '../lib/creator-voices.ts';
test('catalog contains all 36 unique English Flux voices and defaults to Haley',()=>{
  assert.equal(CREATOR_VOICES.length,36);
  assert.equal(new Set(CREATOR_VOICES.map(v=>v.id)).size,36);
  for(const voice of CREATOR_VOICES)assert.equal(voice.id,`flux-${voice.name.toLowerCase()}-en`);
  assert.equal(CREATOR_VOICES.find(v=>v.id===DEFAULT_CREATOR_VOICE).name,'Haley');
  assert.equal(CREATOR_VOICES.at(-1).name,'Wes');
  assert.equal(CREATOR_VOICES.find(v=>v.name==='Gemma').accent,'British');
});
test('brief binds the selected model to the exact authored text',()=>{
  const text='  My own story.\n\nKeep this spacing.  ';
  const brief=narrationBrief('flux-meena-en','My title',text);
  assert.match(brief,/Meena — Indian feminine/);
  assert.match(brief,/Model: flux-meena-en/);
  assert.ok(brief.endsWith(text));
  assert.match(brief,/not generated audio/);
});
test('brief rejects unknown models and empty drafts',()=>{
  assert.throws(()=>narrationBrief('aura-madeup','title','Story'),/listed Deepgram/);
  assert.throws(()=>narrationBrief(DEFAULT_CREATOR_VOICE,'title','  '),/Write your story/);
});


test('voice selection uses a bounded searchable radio group with keyboard dismissal',()=>{
  const picker=readFileSync(new URL('../components/creator-voice-picker.tsx',import.meta.url),'utf8');
  const css=readFileSync(new URL('../components/creator-studio.module.css',import.meta.url),'utf8');
  assert.match(picker,/type="search"/);
  assert.match(picker,/role="radiogroup"/);
  assert.match(picker,/type="radio"/);
  assert.match(picker,/event\.key==='Escape'/);
  assert.match(picker,/onOutsideClick/);
  assert.match(picker,/setSearch\(''\)/);
  assert.match(picker,/onChange\(item\.id\)/);
  assert.match(css,/\.voiceOptionList\{[^}]*max-height:/);
  assert.match(css,/\.voiceOptionList\{[^}]*overflow-y:auto/);
});
test('native selectors keep a consistent mobile-safe interaction surface',()=>{
  const css=readFileSync(new URL('../components/experience.module.css',import.meta.url),'utf8');
  assert.match(css,/\.siteLanguagePanel \{ position:fixed; top:58px; left:12px; right:12px/);
  assert.match(css,/\.experience :global\(\.creator select\)/);
  assert.match(css,/\.experience :global\(\.creator \.formrow\)/);
  assert.match(css,/appearance:none/);
});
