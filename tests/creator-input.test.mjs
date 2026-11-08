import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {CATEGORIES,prependDraft,parseStories} from '../lib/discovery.ts';
import {categorizeLocally} from '../lib/demo-categorize.ts';
const require=createRequire(import.meta.url),ts=require('typescript');
const source=readFileSync(new URL('../lib/creator-input.ts',import.meta.url),'utf8');
const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}});
const exports={};
vm.runInNewContext(output.outputText,{exports,require(id){if(id==='./discovery')return {CATEGORIES};if(id==='./demo-categorize')return {categorizeLocally};throw new Error(id)}});
const {appendCreatorAnswer,resolveCreatorMetadata}=exports;
const base={title:'Community software',content:'A local software team builds a tool for their neighbourhood.',country:' Kenya ',language:' Kiswahili ',category:''};
test('reviewed voice answers append and preserve original spacing',()=>{
  assert.equal(appendCreatorAnswer('My own words.  ','  Next idea.  '),'My own words.  \n\nNext idea.');
  assert.equal(appendCreatorAnswer('',' A beginning '),'A beginning');
});
test('voice insertion accepts the exact boundary and rejects overflow or empty words',()=>{
  assert.equal(appendCreatorAnswer('a'.repeat(4997),'b').length,5000);
  assert.throws(()=>appendCreatorAnswer('a'.repeat(4998),'b'),/5,000/);
  assert.throws(()=>appendCreatorAnswer('keep this',' \n '),/some words/);
});
test('story metadata preserves chosen language and trims country',()=>{
  const value=resolveCreatorMetadata(base);
  assert.equal(value.country,'Kenya');assert.equal(value.language,'Kiswahili');
  assert.equal(value.category,'Technology & Innovation');
});
test('creator category overrides the local keyword suggestion',()=>{
  assert.equal(resolveCreatorMetadata({...base,category:'Culture & Heritage'}).category,'Culture & Heritage');
  assert.throws(()=>resolveCreatorMetadata({...base,category:'unlisted'}),/Choose a category/);
});
test('metadata supports custom countries and multilingual language names',()=>{
  const value=resolveCreatorMetadata({...base,country:'United Kingdom',language:'Tshivenḓa / English'});
  assert.equal(value.country,'United Kingdom');assert.equal(value.language,'Tshivenḓa / English');
});
test('invalid metadata or oversized content cannot bypass validation with an explicit category',()=>{
  for(const country of [' ', 'x'.repeat(121)])assert.throws(()=>resolveCreatorMetadata({...base,country}),/country/);
  for(const language of ['', 'x'.repeat(121)])assert.throws(()=>resolveCreatorMetadata({...base,language}),/language/);
  assert.throws(()=>resolveCreatorMetadata({...base,content:'x'.repeat(5001),category:CATEGORIES[0]}),/20–5000/);
});
test('chosen metadata survives existing browser draft serialization and reload',()=>{
  const story={id:'creator-test',title:base.title,excerpt:base.content,author:'Anonymous creator',...resolveCreatorMetadata({...base,category:CATEGORIES[2]}),tags:[],date:'2026-11-08'};
  const reloaded=parseStories(JSON.stringify(prependDraft(null,story)));
  assert.equal(reloaded.length,1);assert.equal(reloaded[0].country,'Kenya');assert.equal(reloaded[0].language,'Kiswahili');assert.equal(reloaded[0].category,CATEGORIES[2]);
});
