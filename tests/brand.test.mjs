import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {test} from 'node:test';

const require=createRequire(import.meta.url);
const ts=require('typescript');
const source=readFileSync(new URL('../components/brand.tsx',import.meta.url),'utf8');
const art=JSON.parse(readFileSync(new URL('../lib/brand-artwork.json',import.meta.url),'utf8'));
const styles=Object.fromEntries(['root','mark','accent','divider','wordmark'].map(key=>[key,key]));
const output=ts.transpileModule(source,{fileName:'brand.tsx',reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}});
// Inspect this stateless component's JSX contract without needing a browser or network.
const jsx=(type,props)=>({type,props});
const exports={};
vm.runInNewContext(output.outputText,{exports,require(id){
  if(id==='react/jsx-runtime')return {jsx,jsxs:jsx};
  if(id==='../lib/brand-artwork.json')return {default:art};
  if(id==='./brand.module.css')return {default:styles};
  throw new Error('Unexpected component dependency: '+id);
}});
const {Brand}=exports;

test('brand TSX transpiles without syntax errors',()=>{
  assert.equal(output.diagnostics.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);
});
test('logo is an accessible home link that preserves the Pages path',()=>{
  const logo=Brand();
  assert.equal(logo.type,'a');
  assert.equal(logo.props.href,'#top');
  assert.equal(logo.props['aria-label'],'NewWave Africa home');
});
test('monogram and wordmark use the approved outlines, not remote fonts',()=>{
  const [mark,divider,word]=Brand().props.children;
  assert.equal(mark.type,'svg');assert.equal(word.type,'svg');
  assert.equal(mark.props.viewBox,art.markViewBox);
  assert.equal(word.props.viewBox,art.wordViewBox);
  assert.equal(mark.props.children[0].props.d,art.markInk);
  assert.equal(mark.props.children[1].props.d,art.markAccent);
  assert.equal(word.props.children.props.d,art.wordmark);
  assert.equal(word.props.children.props.fillRule,'evenodd');
  assert.equal(divider.type,'span');
});
test('decorative graphics do not duplicate the link accessible name',()=>{
  for(const graphic of Brand().props.children){
    assert.equal(graphic.props['aria-hidden'],'true');
    if(graphic.type==='svg')assert.equal(graphic.props.focusable,'false');
  }
});
test('inverse version can be selected without changing logo structure',()=>{
  assert.equal(Brand({inverse:true}).props['data-inverse'],true);
  assert.equal(Brand().props['data-inverse'],undefined);
});
test('favicon contains the same monogram and approved high-contrast colors',()=>{
  const icon=readFileSync(new URL('../app/icon.svg',import.meta.url),'utf8');
  assert.ok(icon.includes('viewBox="0 0 64 64"'));
  assert.ok(icon.includes('d="'+art.markInk+'"'));
  assert.ok(icon.includes('d="'+art.markAccent+'"'));
  assert.ok(icon.includes('#173e2b'));assert.ok(icon.includes('#f6f2e9'));
  assert.equal(/<(script|image|text)\b/i.test(icon),false);
});
test('all artwork consists only of supported SVG path commands',()=>{
  for(const key of ['markInk','markAccent','wordmark']){
    assert.match(art[key],/^M[0-9MmLlHhVvCcSsQqTtAaZz.,eE+\s-]+Z$/);
  }
});
