import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';

// Check the real static export, including direct page refresh and Pages basePath.
const root=resolve(process.argv[2]||'out');
const base='/newwave-africa';
const destinations=['/','/discover/','/creator-studio/','/our-approach/'];
const titles=new Map([
  ['/','id="studio-hero-title"'],
  ['/discover/','Discover stories'],
  ['/creator-studio/','Creator studio'],
  ['/our-approach/','Every story changes the']
]);
for(const route of destinations){
  const relative=route==='/'?'':route.slice(1,-1);
  const html=readFileSync(resolve(root,relative,'index.html'),'utf8');
  assert.ok(html.includes(titles.get(route)),route+' lacks expected server-rendered content');
  assert.match(html,/<main[^>]*id="page-content"/);
  for(const destination of destinations){
    const target=base+destination;
    assert.ok(html.includes('href="'+target+'"'),route+' lacks navigation to '+target);
  }
  for(const [,href] of html.matchAll(/(?:href|src)="(\/[^"\s]+)"/g)){
    assert.ok(href.startsWith(base+'/'),route+' has an unprefixed asset or route: '+href);
    if(href.includes('/_next/static/')){
      assert.ok(existsSync(resolve(root,href.slice((base+'/').length))),href+' not in export');
    }
  }
}
console.log('Home, Discover, Creator Studio and Our Approach export documents, navigation and static assets passed.');
