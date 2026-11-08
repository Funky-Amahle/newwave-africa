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
