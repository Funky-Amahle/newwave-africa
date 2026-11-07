import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';

// Inspect the actual export served by Pages, including direct-refresh documents.
const root=resolve(process.argv[2]||'out');
for(const [route,title] of [['','Many voices.'],['creator-studio','Creator studio'],['our-approach','Every story changes the']]){
  const html=readFileSync(resolve(root,route,'index.html'),'utf8');
  assert.ok(html.includes(title),route+' has its page content before hydration');
  assert.match(html,/<main[^>]*id="page-content"/);
  for(const dest of ['/creator-studio/','/our-approach/'])assert.ok(html.includes('href="/newwave-africa'+dest+'"'),route+' links to '+dest);
  for(const [,href] of html.matchAll(/(?:href|src)="(\/[^"\s]+)"/g)){
    assert.ok(href.startsWith('/newwave-africa/'),route+' has an unprefixed asset or route: '+href);
    if(href.includes('/_next/static/'))assert.ok(existsSync(resolve(root,href.slice('/newwave-africa/'.length))),href+' exists in export');
  }
}
console.log('Home, Creator Studio and Our Approach export documents, navigation and static assets passed.');
