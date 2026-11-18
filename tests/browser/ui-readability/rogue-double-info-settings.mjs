import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL,token=process.env.UI_FIXTURE_OWNER_TOKEN;
assert.ok(base&&token,'Dedicated fixture URL and owner token required');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const [width,height] of [[280,568],[390,844],[568,320]]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage();
 const owner=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':token}});assert.equal(owner.status(),200,'Refusing to reset an unowned fixture');await page.request.get(base+'/api/test-reset?scenario=profile-double');
 await context.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.waitForFunction(()=>document.querySelector('.battle-screen')&&!document.querySelector('.battle-screen[data-playing=true]'));await page.getByRole('button',{name:'싸운다',exact:true}).first().tap();const before=await(await page.request.get(base+'/api/test-state')).json();
 const infos=page.locator('.bs-move-info'),summary=page.getByLabel('전투 연출 설정');assert.equal(await infos.count(),4);
 for(let i=0;i<4;i++){const info=infos.nth(i);await info.tap();assert.equal(await info.getAttribute('aria-expanded'),'true');const tooltip=page.locator('.bs-move-tooltip[aria-hidden=false]');assert.equal(await tooltip.count(),1);assert.ok((await tooltip.innerText()).length>0);
  await summary.tap({timeout:3000});assert.equal(await page.locator('.bs-settings').getAttribute('open'),'');assert.equal(await info.getAttribute('aria-expanded'),'false');await summary.tap();assert.equal(await page.locator('.bs-settings').getAttribute('open'),null);}
 assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);assert.equal(await page.locator('.bs-move-wrap>.bs-move').count(),4);await context.close();console.log(`${width}x${height}: four move descriptions do not obstruct settings; save preserved`);
}}finally{await browser.close();}
