import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chromium} from 'playwright';

// Synthetic fresh contexts, no provider keys, no external requests or personal drafts.
const base=(process.env.NEW_WAVE_QA_BASE_URL||'http://127.0.0.1:4173/newwave-africa/').replace(/\/?$/,'/');
const output='browser-qa-artifacts/studio-landing';
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
try{
  for(const width of [1440,768,390,320]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    const page=await context.newPage();
    const failures=[];page.on('pageerror',error=>failures.push(error.message));
    await page.goto(base,{waitUntil:'networkidle'});
    await page.getByRole('heading',{level:1,name:/Stories\s*move us\./}).waitFor();
    assert.equal(await page.locator('h1').count(),1);
    // Protect the language trigger from paper/background token leakage in dark mode.
    const languageTrigger=page.locator('details').filter({has:page.getByText('English',{exact:true})}).locator('summary');
    const contrast=await languageTrigger.evaluate(element=>{
      const linear=value=>{value/=255;return value<=.04045?value/12.92:((value+.055)/1.055)**2.4;};
      const luminance=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(Number);return .2126*linear(rgb[0])+.7152*linear(rgb[1])+.0722*linear(rgb[2]);};
      let ancestor=element.parentElement;
      while(ancestor&&getComputedStyle(ancestor).backgroundColor==='rgba(0, 0, 0, 0)')ancestor=ancestor.parentElement;
      const foreground=luminance(getComputedStyle(element).color),background=luminance(getComputedStyle(ancestor).backgroundColor);
      return (Math.max(foreground,background)+.05)/(Math.min(foreground,background)+.05);
    });
    assert.ok(contrast>=4.5,`Language trigger contrast ${contrast.toFixed(2)} at ${width}`);
    const dimensions=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));
    assert.ok(dimensions.content<=dimensions.viewport+2,`Overflow at ${width}: ${JSON.stringify(dimensions)}`);
    await page.screenshot({path:`${output}/${width}-home.png`,fullPage:true});

    const theme=page.getByRole('button',{name:'Innovation',exact:true});
    await theme.focus();await page.keyboard.press('Enter');
    assert.equal(await theme.getAttribute('aria-pressed'),'true');
    await page.getByRole('heading',{name:'Made in the neighbourhood',exact:true}).first().waitFor();
    await page.getByRole('button',{name:'Read this story',exact:true}).click();
    const dialog=page.getByRole('dialog');await dialog.waitFor();
    await dialog.getByRole('heading',{name:'The coders building for their neighborhoods',exact:true}).waitFor();
    await dialog.getByRole('button',{name:'Save to reading list',exact:true}).click();
    assert.equal(await dialog.getByRole('button',{name:'Saved in reading list',exact:true}).getAttribute('aria-pressed'),'true');
    await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
    assert.equal(await page.getByRole('button',{name:'Read this story',exact:true}).evaluate(element=>element===document.activeElement),true);

    await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name:'Discover',exact:true}).click();
    await page.getByRole('heading',{level:1,name:'Discover stories'}).waitFor();
    await page.getByRole('button',{name:'Reading list (1)',exact:true}).click();
    await page.getByRole('button',{name:'Read story: The coders building for their neighborhoods',exact:true}).waitFor();
    await page.goto(base+'#discovery-insights',{waitUntil:'networkidle'});
    await page.waitForURL('**/discover/#discovery-insights');
    await page.getByRole('heading',{name:'Make discovery visible',exact:true}).waitFor();
    await page.goto(base+'#studio-plan',{waitUntil:'networkidle'});
    await page.waitForURL('**/creator-studio/#studio-plan');
    for(const route of ['discover/','creator-studio/','our-approach/']){
      await page.goto(base+route,{waitUntil:'networkidle'});
      assert.equal(await page.locator('[data-theme="studio"]').count(),1);
      assert.equal(await page.locator('h1').count(),1);
      const size=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,content:document.documentElement.scrollWidth}));
      assert.ok(size.content<=size.viewport+2,`Overflow on ${route} at ${width}: ${JSON.stringify(size)}`);
      await page.screenshot({path:`${output}/${width}-${route.replaceAll('/','')}.png`,fullPage:true});
    }
    assert.deepEqual(failures,[]);
    results.push({width,status:'passed',checks:'overflow, theme keyboard activation, sample reader, bookmark handoff, Escape/focus restore, legacy insight/studio links, page errors'});
    await context.close();
  }
  // Explicit reduced-effects safety on the moving theme ribbon.
  const context=await browser.newContext({reducedMotion:'reduce'});
  const page=await context.newPage();await page.goto(base,{waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-quiet]').first().getAttribute('data-quiet'),'true');
  await context.close();
  writeFileSync(`${output}/results.json`,JSON.stringify(results,null,2));
  console.log('NewWave landing interaction and responsive smoke checks passed at four widths.');
}finally{await browser.close();}
