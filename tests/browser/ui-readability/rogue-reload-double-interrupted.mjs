import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5263',scenario=process.env.DOUBLE_SWITCH==='1'?'profile-double-switch':'profile-double';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'no-preference'}),page=await context.newPage();
 await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.addInitScript(()=>{window.__entryFrames=[];const sample=()=>{const fx=document.querySelector('.bs-fx-layer[data-kind=switch]');if(fx)window.__entryFrames.push({target:fx.getAttribute('data-target'),phase:fx.getAttribute('data-switch-phase')});requestAnimationFrame(sample);};requestAnimationFrame(sample);});
 await page.request.get(base+'/api/test-reset?scenario='+scenario);
 const start=async()=>{await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.locator('.battle-screen').waitFor();};
 await page.goto(base+'/?mode=rogue&tab=rogue');await start();await page.locator('.bs-fx-layer[data-kind=switch]').first().waitFor({timeout:60000});const savedBefore=await(await page.request.get(base+'/api/test-state')).json();const opened=page.waitForEvent('popup');await page.evaluate(()=>window.open('/','_blank'));const clone=await opened;await clone.waitForLoadState('domcontentloaded');assert.equal(await clone.evaluate(()=>sessionStorage.getItem('rogue-classic:displayed-events:v1')),null,'a clone during playback must not inherit a completed receipt');await clone.close();await page.bringToFront();await page.reload();assert.equal(await page.evaluate(()=>sessionStorage.getItem('rogue-classic:displayed-events:v1')),null,'interrupted entry must not be recorded as fully seen');
 await start();await page.waitForFunction(()=>document.querySelector('.battle-screen')?.getAttribute('data-playing')!=='true',{timeout:60000});const frames=await page.evaluate(()=>window.__entryFrames);assert.ok(frames.some(f=>f.target==='own')&&(scenario==='profile-double-switch'||frames.some(f=>f.target==='foe')),JSON.stringify(frames));
 const after=await(await page.request.get(base+'/api/test-state')).json();assert.deepEqual(after,savedBefore,'refresh and presentation must not modify rewards, party or game save');
 console.log(JSON.stringify({scenario,interrupted:'not marked complete',switch:'replayed',save:'unchanged'}));await context.close();
}finally{await browser.close();}
