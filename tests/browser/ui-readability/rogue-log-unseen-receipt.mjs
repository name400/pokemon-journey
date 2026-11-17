import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5267';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'no-preference'}),page=await context.newPage();
 await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.request.get(base+'/api/test-reset?scenario=battle');
 await page.route('**/api/rogue-classic*',async r=>{const response=await r.fetch(),data=await response.json();if(data.battle){data.battle.previousLogCount=100;data.battle.log=Array.from({length:100},(_,i)=>`이전 로그 ${i}`);}await r.fulfill({response,json:data});});
 await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();const log=page.locator('.bs-log-lines');await log.waitFor();await page.locator('.bs-fx-layer').first().waitFor();
 await log.evaluate(e=>{e.scrollTop=0;e.dispatchEvent(new Event('scroll',{bubbles:true}));});
 await page.waitForFunction(()=>document.querySelector('.battle-screen')?.dataset.playing!=='true');
 const result=await page.evaluate(()=>{const e=document.querySelector('.bs-log-lines');return {scrollTop:e.scrollTop,scrollHeight:e.scrollHeight,height:e.clientHeight,last:e.lastElementChild?.textContent,receipt:sessionStorage.getItem('rogue-classic:displayed-events:v1')!==null};});console.log(JSON.stringify(result));assert.ok(result.scrollHeight>result.height);assert.equal(result.scrollTop,0);assert.equal(result.receipt,false,'unseen log messages must not be recorded as displayed');await context.close();
}finally{await browser.close();}
