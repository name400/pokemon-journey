import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5607';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const [width,height] of [[280,568],[390,844],[844,390],[1280,800]]){
 const page=await browser.newPage({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'});
 await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.request.post(base+'/api/test-reset?scenario=rogue-v52-screen-double');
 await page.route('**/api/rogue-classic*',async r=>{const res=await r.fetch(),view=await res.json();for(const teams of [view.battle?.teams,view.battle?.before])for(const mon of (teams||[]).flat()){mon.name='울트라네크로즈마';mon.boosts={atk:6,def:6,spa:6,spd:6,spe:6,accuracy:6,evasion:6}}await r.fulfill({response:res,json:view})});
 await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();const before=await(await page.request.get(base+'/api/test-state')).json();await page.getByRole('button',{name:'상태 확인',exact:true}).first().click();
 const panel=page.locator('.bs-rogue-v52-status'),sheet=panel.locator('.bs-rogue-status-sheet');await sheet.waitFor();assert.equal(await sheet.locator('.bs-stat-stages span').count(),28);const fit=await sheet.evaluate(e=>{const r=e.getBoundingClientRect(),back=e.closest('.bs-rogue-v52-status').querySelector('.bs-rogue-party-back').getBoundingClientRect();return {height:e.clientHeight,scroll:e.scrollHeight,bottom:r.bottom,backTop:back.top}});assert.ok(fit.scroll<=fit.height+1,JSON.stringify({width,height,fit}));assert.ok(fit.bottom<=fit.backTop+.5,JSON.stringify({width,height,fit}));await panel.getByRole('button',{name:'명령으로'}).click();assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);console.log(`${width}x${height}: four battlers, 28 rank changes, no scroll or overlap; save unchanged`);await page.close();
}}finally{await browser.close()}
