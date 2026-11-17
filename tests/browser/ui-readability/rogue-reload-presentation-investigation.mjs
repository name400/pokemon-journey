import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5263';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'no-preference'}),page=await context.newPage();
 await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.addInitScript(()=>{window.__seenFx=[];new MutationObserver(()=>{const el=document.querySelector('.bs-fx-layer');if(el&&!el.dataset.testSeen){el.dataset.testSeen='1';window.__seenFx.push(el.dataset.kind)}}).observe(document,{subtree:true,childList:true});});
 await page.request.get(base+'/api/test-reset?scenario=battle');
 const start=async()=>{await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.locator('.battle-screen').waitFor();await page.waitForFunction(()=>document.querySelector('.battle-screen')?.dataset.playing!=='true');return page.evaluate(()=>window.__seenFx);};
 await page.goto(base+'/?mode=rogue&tab=rogue');const first=await start();assert.ok(first.includes('switch'),JSON.stringify(first));const receipt=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('rogue-classic:displayed-events:v1')||'null'));assert.equal(receipt?.complete,true,JSON.stringify(receipt));assert.deepEqual(receipt.events,[0,1]);
 const popupPromise=page.waitForEvent('popup');await page.evaluate(()=>window.open('/','_blank'));const clone=await popupPromise;await clone.waitForLoadState('domcontentloaded');const copied=await clone.evaluate(()=>JSON.parse(sessionStorage.getItem('rogue-classic:displayed-events:v1')||'null'));assert.deepEqual(copied,receipt,'a tab with an opener clones sessionStorage, so this cannot yet be used to suppress playback');await clone.close();await page.bringToFront();
 await page.reload();const second=await start();assert.ok(second.includes('switch'),JSON.stringify(second));
 console.log(JSON.stringify({first,afterReload:second,observation:'same switch events replay after reload'}));
 await page.evaluate(()=>sessionStorage.removeItem('rogue-classic:displayed-events:v1'));await page.emulateMedia({reducedMotion:'reduce'});await page.reload();const skipped=await start();assert.deepEqual(skipped,[]);assert.equal(await page.evaluate(()=>sessionStorage.getItem('rogue-classic:displayed-events:v1')),null);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.reload();const afterSkipped=await start();assert.ok(afterSkipped.includes('switch'),JSON.stringify(afterSkipped));
 console.log(JSON.stringify({skipped,afterSkipped,observation:'reduced motion did not erase later replay'}));
 await page.evaluate(()=>sessionStorage.removeItem('rogue-classic:displayed-events:v1'));await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.locator('.bs-fx-layer').first().waitFor();
 const other=await context.newPage();await other.goto(base+'/');await other.bringToFront();await page.waitForTimeout(3300);
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('rogue-classic:displayed-events:v1')),null,'backgrounded playback cannot be recorded as displayed');
 assert.equal(await other.evaluate(()=>sessionStorage.getItem('rogue-classic:displayed-events:v1')),null,'independently opened tab has its own receipt');
 await other.close();await page.bringToFront();await page.reload();const recovered=await start();assert.ok(recovered.includes('switch'));console.log(JSON.stringify({backgrounded:'not recorded',otherTab:'empty',recovered}));await context.close();
} finally {await browser.close();}
