import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL,token=process.env.UI_FIXTURE_OWNER_TOKEN;
assert.ok(base&&token,'Dedicated fixture URL and owner token required');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const width of [390,1280]){
 const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'}),page=await context.newPage();
 const owner=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':token}});assert.equal(owner.status(),200,'Refusing to reset an unowned fixture');
 await page.request.get(base+'/api/test-reset?scenario=reward-all-blocked-after-service');
 await context.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
 const before=await(await page.request.get(base+'/api/test-state')).json();assert.equal(before.classic.slots[0].rewards.length,3);assert.ok(before.classic.slots[0].rewards.every(r=>r.id==='potion'));assert.equal(await page.getByRole('button',{name:'보상을 받지 않고 계속'}).count(),0,'a usable reward must not offer the blocked-reward continuation');
 await page.locator('.rcr-service[data-rcr-id="potion"]').click();const dialog=page.locator('.rcr-detail');await dialog.waitFor();const response=page.waitForResponse(r=>r.url().includes('/api/rogue-classic')&&r.request().method()==='POST');await dialog.locator('.rcr-confirm>button').click();assert.equal((await response).ok(),true);await page.getByRole('button',{name:'선택 상세 닫기'}).click();
 assert.equal(await page.locator('.rcr-choice:disabled').count(),3);assert.equal(await page.locator('.rcr-reroll-action button').isDisabled(),true);const afterService=await(await page.request.get(base+'/api/test-state')).json();assert.equal(afterService.classic.slots[0].money,0);assert.equal(afterService.classic.slots[0].party[0].hp,afterService.classic.slots[0].party[0].maxHp);
 const proceed=page.getByRole('button',{name:'보상을 받지 않고 계속'});await proceed.waitFor({timeout:3000});await proceed.click();await page.waitForFunction(async()=>{const state=await(await fetch('/api/test-state')).json();return state.classic.slots[0].screen!=='reward';},null,{timeout:15000});
 const after=await(await page.request.get(base+'/api/test-state')).json();assert.equal(after.classic.slots[0].money,0);assert.equal(after.classic.slots[0].party[0].boxId,'blocked-reward-hero');assert.deepEqual(after.classic.slots[1],before.classic.slots[1]);assert.deepEqual(after.adventure,before.adventure);await page.reload();assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),after);
 await context.close();console.log(`${width}: generated blocked rewards, paid heal, deliberate continuation and reload`);
}}finally{await browser.close();}
