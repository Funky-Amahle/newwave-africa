import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {chromium} from 'playwright';

// Browser-level, synthetic-data-only smoke test. No keys, mic or private images.
const base=(process.env.NEW_WAVE_QA_BASE_URL||'http://127.0.0.1:4173/newwave-africa/').replace(/\/?$/,'/');
const output='browser-qa-artifacts';
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
let passed=0;
async function run(label,fn){
  try{await fn();passed++;console.log('PASS: '+label);}
  catch(e){
    const name=label.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    try{await page.screenshot({path:output+'/FAIL-'+name+'.png',fullPage:true,animations:'disabled'});}catch{}
    console.error('FAIL: '+label+' - '+String(e));throw e;
  }
}
try{
  await page.goto(base+'creator-studio/',{waitUntil:'networkidle',timeout:45000});
  await page.getByRole('heading',{name:'Creator studio',exact:true}).waitFor();

  await run('Language and effects utility bar stays usable on narrow screens',async()=>{
    for(const width of [320,375,540,768]){
      await page.setViewportSize({width,height:812});
      const utility=page.locator('div[class*="utilityActions"]');
      const language=utility.locator('details');
      const trigger=language.locator('summary');
      const effects=utility.getByRole('button',{name:/effects/i});
      await trigger.waitFor();
      await effects.waitFor();
      const before=await page.evaluate(()=>({
        innerWidth:window.innerWidth,
        scrollWidth:document.documentElement.scrollWidth
      }));
      assert.ok(before.scrollWidth<=before.innerWidth+2,'utility header overflows at '+width);
      const triggerBox=await trigger.boundingBox();
      const effectsBox=await effects.boundingBox();
      for(const box of [triggerBox,effectsBox]){
        assert.ok(box && box.x>=-1 && box.x+box.width<=width+1,
          'utility controls escape viewport at '+width);
      }
      await trigger.click();
      const panel=language.locator('div[class*="siteLanguagePanel"]');
      const panelBox=await panel.boundingBox();
      assert.ok(panelBox && panelBox.x>=-1 && panelBox.x+panelBox.width<=width+1,
        'language disclosure escapes viewport at '+width);
      await trigger.click();
    }
    await page.setViewportSize({width:1440,height:900});
  });

  await run('Recording status and timer never overlap the recording action',async()=>{
    const recorder=page.locator('section[class*="recorder"]');
    for(const width of [1440,768,320]){
      await page.setViewportSize({width,height:900});
      const button=await recorder.getByRole('button',{name:'Start recording',exact:true}).boundingBox();
      const timer=await recorder.locator('[aria-label^="Recording duration"]').boundingBox();
      const status=await recorder.locator('span[role="status"]').boundingBox();
      assert.ok(button&&timer&&status,'Missing recording controls at '+width);
      for(const box of [timer,status]){
        const overlap=box.x<button.x+button.width&&box.x+box.width>button.x&&box.y<button.y+button.height&&box.y+box.height>button.y;
        assert.equal(overlap,false,'Recording button overlaps status/timer at '+width);
      }
    }
    await page.setViewportSize({width:1440,height:900});
  });

  await run('Desktop Visuals shortcut scrolls to the actual visual editor',async()=>{
    const nav=page.getByRole('navigation',{name:'Jump between Creator Studio sections'});
    await nav.getByRole('link',{name:'Visuals',exact:true}).click();
    await page.waitForFunction(()=>location.hash==='#studio-visual');
    await page.waitForFunction(()=>{
      const section=document.querySelector('#studio-visual');
      if(!section)return false;
      const rect=section.getBoundingClientRect();
      return rect.top<window.innerHeight*.9 && rect.bottom>0;
    },null,{timeout:4500});
    const visual=page.locator('#studio-visual');
    await visual.getByRole('heading',{name:'Give your voice a setting'}).waitFor();
    assert.equal(await page.locator('#studio-visual').count(),1);
    assert.equal(await page.locator('aside#studio-visual').count(),0);
    await page.screenshot({path:output+'/desktop-visuals.png',animations:'disabled'});
  });

  const visual=page.locator('#studio-visual');
  await run('Artwork motion pauses on request and respects reduced motion',async()=>{
    const stage=visual.locator('[data-artwork-motion]');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await stage.scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('[data-artwork-motion]')?.getAttribute('data-artwork-motion')==='playing');
    await visual.getByRole('button',{name:'Pause artwork motion',exact:true}).click();
    assert.equal(await stage.getAttribute('data-artwork-motion'),'paused');
    assert.equal(await stage.locator('img').evaluate(e=>getComputedStyle(e).animationPlayState),'paused');
    await visual.getByRole('button',{name:'Play artwork motion',exact:true}).click();
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(()=>document.querySelector('[data-artwork-motion]')?.getAttribute('data-artwork-motion')==='still');
    assert.equal(await stage.locator('img').evaluate(e=>getComputedStyle(e).animationName),'none');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await stage.scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('[data-artwork-motion]')?.getAttribute('data-artwork-motion')==='playing');
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.waitForFunction(()=>document.querySelector('[data-artwork-motion]')?.getAttribute('data-artwork-motion')==='paused');
  });

  await run('Original Forest current SVG downloads with SVG extension',async()=>{
    await visual.getByRole('button',{name:'Forest current'}).click();
    const link=visual.getByRole('link',{name:'Download visual'});
    assert.equal(await link.getAttribute('download'),'newwave-forest.svg');
    const [file]=await Promise.all([page.waitForEvent('download'),link.click()]);
    assert.equal(file.suggestedFilename(),'newwave-forest.svg');
    assert.equal(await file.failure(),null);
  });

  await run('Uploaded JPG, PNG and WebP preview and download with correct extensions',async()=>{
    const input=visual.locator('input[type=file]');
    for(const [mime,ext] of [['image/jpeg','jpg'],['image/png','png'],['image/webp','webp']]){
      // A 3x3 generated color tile provides a safe valid file in each format.
      const url=await page.evaluate((mime)=>{
        const canvas=document.createElement('canvas');
        canvas.width=3;canvas.height=3;
        const context=canvas.getContext('2d');
        if(!context)throw Error('Canvas context missing');
        context.fillStyle='#317558';
        context.fillRect(0,0,3,3);
        return canvas.toDataURL(mime,.94);
      },mime);
      assert.ok(url.startsWith('data:'+mime+';'),'Browser cannot encode '+mime);
      await input.setInputFiles({name:'fixture.'+ext,mimeType:mime,buffer:Buffer.from(url.split(',')[1],'base64')});
      const filename='newwave-visual.'+ext;
      await page.waitForFunction((name)=>{
        return document.querySelector('#studio-visual a[download]')?.getAttribute('download')===name;
      },filename);
      const link=visual.getByRole('link',{name:'Download visual'});
      assert.equal(await link.getAttribute('download'),filename);
      const [download]=await Promise.all([page.waitForEvent('download'),link.click()]);
      assert.equal(download.suggestedFilename(),filename);
      assert.equal(await download.failure(),null);
      console.log('  '+ext+' file downloaded from a browser-local blob');
    }
    await page.screenshot({path:output+'/uploaded-webp-preview.png',animations:'disabled'});
  });

  await run('Removing an upload restores original SVG selection',async()=>{
    await visual.getByRole('button',{name:'Remove uploaded visual'}).click();
    assert.equal(await visual.getByRole('link',{name:'Download visual'}).getAttribute('download'),'newwave-forest.svg');
  });

  await run('375px mobile picker focuses Visuals and preserves hash navigation',async()=>{
    await page.setViewportSize({width:375,height:812});
    await page.goto(base+'creator-studio/',{waitUntil:'networkidle',timeout:45000});
    await page.locator('#studio-section-jump').selectOption('studio-visual');
    await page.waitForFunction(()=>location.hash==='#studio-visual');
    await page.waitForFunction(()=>document.activeElement?.id==='studio-visual');
    // Native anchor navigation uses CSS smooth scrolling; wait for the animation
    // to finish before measuring the viewport (focus/hash update occurs first).
    await page.waitForFunction(()=>{
      const el=document.getElementById('studio-visual');
      if(!el)return false;
      const rect=el.getBoundingClientRect();
      return rect.top<window.innerHeight-80 && rect.bottom>0;
    },null,{timeout:12000});
    await page.screenshot({path:output+'/mobile-visuals.png',animations:'disabled'});
  });

  await run('Responsive Creator Studio avoids horizontal overflow at five widths',async()=>{
    for(const width of [320,375,768,1024,1440]){
      await page.setViewportSize({width,height:900});
      const measure=await page.evaluate(()=>({width:window.innerWidth,body:document.body.scrollWidth,html:document.documentElement.scrollWidth}));
      assert.ok(measure.body<=measure.width+2 && measure.html<=measure.width+2,
        'horizontal overflow at '+width+'px '+JSON.stringify(measure));
      console.log('  No horizontal overflow at '+width+'px');
    }
  });
  console.log('Creator Studio Chromium checks passed: '+passed+'/7');
}finally{
  await browser.close();
}
