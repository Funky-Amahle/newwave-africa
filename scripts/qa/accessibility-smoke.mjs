import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {chromium} from 'playwright';

// Headless Chromium + axe-core. These are browser simulations, never physical-device evidence.
// Uses a local static Pages build, synthetic drafts, and no live speech-provider credentials.
const require=createRequire(import.meta.url);
const axePath=require.resolve('axe-core/axe.min.js');
const base=(process.env.NEW_WAVE_QA_BASE_URL||'http://127.0.0.1:4173/newwave-africa/').replace(/\/?$/,'/');
const folder='browser-qa-artifacts';
mkdirSync(folder,{recursive:true});
const browser=await chromium.launch({headless:true});
const findings=[];
let checks=0;
const routes=[
  {path:'',label:'home'},
  {path:'discover/',label:'discover'},
  {path:'creator-studio/',label:'creator-studio'},
  {path:'our-approach/',label:'our-approach'}
];
async function check(name,fn,page){
  try{await fn();console.log('PASS '+name);checks++;}
  catch(error){
    console.error('FAIL '+name+': '+String(error));
    findings.push({name,error:String(error)});
    if(page)try{await page.screenshot({path:folder+'/FAIL-'+name.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.png',fullPage:true,animations:'disabled'});}catch{}
  }
}
async function pageAt(context,path){
  const page=await context.newPage();
  await page.goto(base+path,{waitUntil:'networkidle',timeout:45_000});
  await page.locator('#page-content').waitFor();
  return page;
}
async function audit(page,label){
  await page.addScriptTag({path:axePath});
  const data=await page.evaluate(async()=>{
    const results=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});
    return results.violations.map(item=>({
      id:item.id,impact:item.impact,help:item.help,
      nodes:item.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,12)
    }));
  });
  writeFileSync(folder+'/axe-'+label+'.json',JSON.stringify(data,null,2)+'\n');
  console.log('AXE '+label+': '+data.length+' rules flagged; '
    +data.filter(item=>['critical','serious'].includes(item.impact)).length+' serious or critical');
  const severe=data.filter(item=>['critical','serious'].includes(item.impact));
  assert.equal(severe.length,0,JSON.stringify(severe).slice(0,4000));
}
try{
  const desktop=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  const mobile=await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true,deviceScaleFactor:2,reducedMotion:'reduce'});
  for(const {path,label} of routes){
    const page=await pageAt(desktop,path);
    await check('axe desktop '+label,()=>audit(page,'desktop-'+label),page);
    await page.close();
  }
  for(const {path,label} of routes.filter(item=>item.label==='discover'||item.label==='creator-studio')){
    const page=await pageAt(mobile,path);
    await check('axe mobile-emulation '+label,()=>audit(page,'mobile-'+label),page);
    await page.close();
  }

  const discover=await pageAt(desktop,'discover/');
  await check('skip link focuses the main landmark',async()=>{
    const skip=discover.getByRole('link',{name:'Skip to page content'});
    await skip.focus();await discover.keyboard.press('Enter');
    await discover.waitForFunction(()=>document.activeElement?.id==='page-content');
    assert.equal(await discover.locator('#page-content').evaluate(el=>document.activeElement===el),true);
  },discover);
  await check('keyboard opens and closes the story reader and restores focus',async()=>{
    const opener=discover.locator('button[aria-label^="Read story:"]').first();
    await opener.focus();await discover.keyboard.press('Enter');
    const dialog=discover.getByRole('dialog');
    await dialog.waitFor({state:'visible'});
    assert.equal(await dialog.getByRole('button',{name:/Close/}).isVisible(),true);
    await discover.keyboard.press('Escape');
    await dialog.waitFor({state:'hidden'});
    await discover.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')?.startsWith('Read '));
    assert.equal(await opener.evaluate(el=>document.activeElement===el),true);
  },discover);
  await discover.close();

  const studio=await pageAt(desktop,'creator-studio/');
  await check('Addis language menu supports keyboard selection and Escape focus return',async()=>{
    await studio.getByRole('button',{name:/Addis AI.*African languages/}).click();
    const trigger=studio.locator('button[aria-haspopup="listbox"]');
    await trigger.focus();await studio.keyboard.press('ArrowDown');
    await studio.getByRole('listbox').waitFor({state:'visible'});
    await studio.keyboard.press('End');
    assert.equal(await studio.getByRole('listbox').getByRole('option',{name:'Hausa'}).evaluate(el=>document.activeElement===el),true);
    await studio.keyboard.press('Enter');
    await studio.getByRole('listbox').waitFor({state:'hidden'});
    assert.match(await trigger.innerText(),/Hausa/);
    await trigger.focus();await studio.keyboard.press('Enter');
    await studio.getByRole('listbox').waitFor({state:'visible'});
    await studio.keyboard.press('Escape');
    await studio.getByRole('listbox').waitFor({state:'hidden'});
    assert.equal(await trigger.evaluate(el=>document.activeElement===el),true);
  },studio);
  await check('creator draft only saves after rights confirmation',async()=>{
    await studio.getByRole('textbox',{name:'Working title',exact:true}).fill('An invented quality assurance story');
    await studio.getByRole('textbox',{name:'Your story',exact:true}).fill('A fictional account for independent browser checks with no personal information and no real creator data.');
    await studio.getByRole('button',{name:'Save written draft locally'}).click();
    const countBefore=await studio.evaluate(()=>JSON.parse(localStorage.getItem('newwave-local-stories-v1')||'[]').length);
    assert.equal(countBefore,0);
    await studio.getByRole('checkbox',{name:/This is my original story or I have permission/}).check();
    await studio.getByRole('button',{name:'Save written draft locally'}).click();
    await studio.getByRole('status').filter({hasText:/Saved in this browser only/}).waitFor();
    assert.equal(await studio.evaluate(()=>JSON.parse(localStorage.getItem('newwave-local-stories-v1')||'[]').length),1);
    await studio.reload({waitUntil:'networkidle'});
    assert.equal(await studio.evaluate(()=>JSON.parse(localStorage.getItem('newwave-local-stories-v1')||'[]').length),1);
  },studio);
  await studio.close();

  // Deterministic permission-denial simulation: not a real microphone, speaker or device test.
  const denial=await browser.newContext({viewport:{width:375,height:812}});
  await denial.addInitScript(()=>{
    const api={getUserMedia:async()=>{throw new DOMException('Permission denied in test','NotAllowedError')}};
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:api});
  });
  const mic=await pageAt(denial,'creator-studio/');
  await check('simulated microphone permission denial shows recovery instructions',async()=>{
    await mic.getByRole('button',{name:'Start recording'}).first().click();
    await mic.getByRole('alert').filter({hasText:/Microphone access was unavailable/}).first().waitFor();
    assert.equal(await mic.getByRole('button',{name:'Start recording'}).first().isEnabled(),true);
  },mic);
  await mic.close();await denial.close();await desktop.close();await mobile.close();

  console.log('Phase 1 accessibility browser checks: '+checks+' passed; '+findings.length+' failed.');
  if(findings.length){writeFileSync(folder+'/accessibility-failures.json',JSON.stringify(findings,null,2)+'\n');process.exitCode=1;}
}finally{
  await browser.close();
}
