import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL,token=process.env.UI_FIXTURE_OWNER_TOKEN;
assert.ok(base&&token,'Dedicated fixture URL and owner token required');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const [width,height] of [[280,568],[390,844],[568,320]]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage();
 const owner=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':token}});assert.equal(owner.status(),200,'Refusing to reset an unowned fixture');await page.request.get(base+'/api/test-reset?scenario=rogue-v52-moves-single');
 await context.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.waitForFunction(()=>document.querySelector('.battle-screen')&&!document.querySelector('.battle-screen[data-playing=true]'));await page.getByRole('button',{name:'싸운다',exact:true}).tap();const before=await(await page.request.get(base+'/api/test-state')).json();
 await page.getByLabel('전투 연출 설정').tap();const menu=page.locator('.bs-settings > div');const bounds=await menu.evaluate(el=>{const r=el.getBoundingClientRect(),a=el.closest('.battle-screen').getBoundingClientRect();return {top:r.top,bottom:r.bottom,arenaTop:a.top,arenaBottom:a.bottom,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight}});assert.ok(bounds.top>=bounds.arenaTop&&bounds.bottom<=bounds.arenaBottom+1,JSON.stringify(bounds));
 const iv=menu.getByLabel('IV 스캐너 팝업 숨기기');await iv.scrollIntoViewIfNeeded();await iv.check();assert.equal(await iv.isChecked(),true);const history=menu.getByRole('button',{name:'전투 기록'});await history.scrollIntoViewIfNeeded();await history.tap();assert.equal(await page.locator('.bs-settings').getAttribute('open'),null);assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);
 await context.close();console.log(`${width}x${height}: settings stay in arena; scrolled controls and battle log work`);
}}finally{await browser.close();}
