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
    const y=await page.locator('#studio-visual').evaluate(e=>e.getBoundingClientRect().top);
    assert.ok(y<700,'Visuals should be scrolled into the phone viewport, got y='+y);
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
  console.log('Creator Studio Chromium checks passed: '+passed+'/6');
}finally{
  await browser.close();
}
