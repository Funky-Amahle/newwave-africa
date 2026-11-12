import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createHash, webcrypto} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createUnsignedCreatorPassport, verifyUnsignedCreatorPassport, canonicalWrittenDraft, sha256WrittenDraft} from '../lib/creator-passport.ts';

const story={
  id:'local-1', title:'A neighbourhood memory', excerpt:'An original fictional text about a shared community garden.',
  category:'Community & Society', country:'South Africa', author:'Example creator', language:'English',
  tags:[], date:'2026-11-12'
};
test('v1 UTF-8 canonicalization is deterministic and independently reproducible',async()=>{
  assert.equal(canonicalWrittenDraft(story),JSON.stringify({
    schema:'newwave-written-draft/v1',id:story.id,title:story.title,text:story.excerpt,
    author:story.author,country:story.country,category:story.category,language:story.language,date:story.date
  }));
  assert.equal(await sha256WrittenDraft(story),createHash('sha256').update(canonicalWrittenDraft(story),'utf8').digest('hex'));
  const changed={...story,excerpt:story.excerpt+' Changed'};
  assert.notEqual(await sha256WrittenDraft(changed),await sha256WrittenDraft(story));
});
test('passport is unsigned, omits text/media and verifies against exact saved draft',async()=>{
  const passport=await createUnsignedCreatorPassport(story);
  assert.equal(passport.proofStatus,'unsigned');
  assert.equal(passport.signature,null);
  assert.equal(passport.blockchainAnchor,null);
  assert.equal(passport.hash.algorithm,'SHA-256');
  const download=JSON.stringify(passport);
  assert.ok(!download.includes(story.excerpt));
  assert.ok(!download.includes('data:audio'));
  assert.equal(await verifyUnsignedCreatorPassport(story,JSON.parse(download)),true);
  assert.equal(await verifyUnsignedCreatorPassport({...story,title:'Changed title'},passport),false);
  assert.equal(await verifyUnsignedCreatorPassport({...story,author:'Changed creator'},passport),false);
  assert.equal(await verifyUnsignedCreatorPassport({...story,language:'isiXhosa'},passport),false);
});
test('tampering, invalid schemas and false signature or chain claims are rejected',async()=>{
  const passport=await createUnsignedCreatorPassport(story);
  for(const candidate of [
    null,[],{}, {...passport,proofStatus:'signed'}, {...passport,signature:'fake'},
    {...passport,blockchainAnchor:{chain:'test'}}, {...passport,schema:'other'},
    {...passport,hash:{...passport.hash,value:'0'.repeat(64)}},
    {...passport,hash:{...passport.hash,canonicalization:'other'}},
    {...passport,hash:{...passport.hash,value:'not-a-hash'}},
  ])assert.equal(await verifyUnsignedCreatorPassport(story,candidate),false);
});
test('Creator Studio integrates download and verification without uploading or signing',()=>{
  const ui=readFileSync(new URL('../components/creator-studio.tsx',import.meta.url),'utf8');
  assert.match(ui,/Creator Verification Passport/);
  assert.match(ui,/Download unsigned passport/);
  assert.match(ui,/verifyUnsignedCreatorPassport/);
  assert.match(ui,/parseStories\(localStorage\.getItem\(STORY_KEY\)\)/);
  assert.doesNotMatch(ui,/fetch\([^)]*passport|navigator\.sendBeacon/);
});
