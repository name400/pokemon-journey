import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5333';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const [width,height] of [[390,844],[1280,800]]){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'}),page=await context.newPage();
 await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.request.post(base+'/api/test-reset?scenario=new-shiny-hatch');
 await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.waitForFunction(()=>document.querySelector('.rc-auto-hatch-scene')?.dataset.hatchPhase==='result');
 const before=await(await page.request.get(base+'/api/test-state')).json();assert.match(await page.locator('.rc-auto-hatch-dialog').innerText(),/새 모습 등록 · 보상 3,000코인/);
 await page.getByRole('button',{name:'전체 결과 보기'}).click();assert.match(await page.locator('.rc-hatch-summary').innerText(),/부화 보상 3,000 코인 획득/);assert.match(await page.locator('.rc-hatch-summary').innerText(),/새 모습 등록 · 보상 3,000코인/);
 assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before,'viewing results does not change rewards');
 await page.getByRole('button',{name:'한 마리씩 보기'}).click();const response=page.waitForResponse(r=>r.request().method()==='POST'&&r.request().postDataJSON()?.action==='ackHatch');await page.getByRole('button',{name:'다음 알'}).click();assert.ok((await response).ok());
 const after=await(await page.request.get(base+'/api/test-state')).json();assert.equal(after.coins,before.coins);assert.equal(after.classic.system.pendingHatches.length,1);await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),after,'reload does not duplicate rewards');
 console.log(`${width}x${height}: new shiny result, visible legacy payout, acknowledgement and reload passed`);await context.close();
}}finally{await browser.close()}
