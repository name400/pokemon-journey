import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:36085';
const token=process.env.UI_FIXTURE_OWNER_TOKEN;
assert.ok(token,'An isolated fixture owner token is required');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const width of [390,1280])for(const mode of ['failed','failed-read','committed','committed-read','changed-revision']){
  const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'}),page=await context.newPage();
  const owner=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':token}});assert.equal(owner.status(),200,'Refusing to reset a server not owned by this test');
  await page.request.get(base+'/api/test-reset?scenario=advance-retry');const initial=await(await page.request.get(base+'/api/test-state')).json();
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  let posts=0,reads=0;
  await page.route('**/api/rogue-classic',async route=>{const req=route.request();if(req.method()==='POST'&&req.postDataJSON().action==='next'){posts++;if(posts===1){if(mode.startsWith('committed'))await route.fetch();await route.fulfill({status:503,json:{error:'다음 웨이브 요청 실패'}});return;}}if(req.method()==='GET'&&posts){reads++;if(mode.endsWith('-read')&&reads===1){await route.fulfill({status:503,json:{error:'상태 읽기 실패'}});return;}if(mode==='changed-revision'&&reads===1){const response=await route.fetch(),data=await response.json();data.revision++;await route.fulfill({response,json:data});return;}}await route.continue();});
  await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  await page.locator('.rc-error').filter({hasText:'다음 웨이브 요청 실패'}).first().waitFor({timeout:15000});
  if(mode==='changed-revision'){
   await page.locator('.rc-next-loading').getByRole('button',{name:'다시 시도'}).waitFor();await page.waitForTimeout(800);assert.equal(posts,1,'a changed revision after an uncertain request must not trigger an automatic second write');
  }else if(mode==='committed-read'){
   const saved=await(await page.request.get(base+'/api/test-state')).json();assert.notEqual(saved.classic.slots[0].screen,'advance');await page.locator('.rc-next-loading').getByRole('button',{name:'다시 시도'}).click();await page.waitForTimeout(600);assert.equal(posts,1,'refresh must not repeat an already committed advance');assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),saved);
  }else if(mode==='committed'){
   await page.waitForTimeout(600);const result=await(await page.request.get(base+'/api/test-state')).json();assert.notEqual(result.classic.slots[0].screen,'advance');assert.equal(posts,1);assert.equal(await page.locator('.rc-next-loading').getByRole('button',{name:'다시 시도'}).count(),0);
  }else{
   const retry=page.locator('.rc-next-loading').getByRole('button',{name:'다시 시도'});await retry.waitFor({state:'visible',timeout:3000});const beforeRetry=await(await page.request.get(base+'/api/test-state')).json();assert.equal(beforeRetry.classic.slots[0].screen,'advance');assert.equal(beforeRetry.classic.slots[0].wave,initial.classic.slots[0].wave);assert.equal(beforeRetry.classic.slots[0].party[0].boxId,'advance-hero');await retry.click();
   if(mode==='failed-read'){await page.getByText('진행 상태를 다시 불러왔습니다. 행동을 다시 선택해 주세요.').waitFor();assert.equal(posts,1,'refresh must not repeat an uncertain write');await retry.click();}
   await page.waitForFunction(async()=>{const state=await(await fetch('/api/test-state')).json();return state.classic.slots[0].screen!=='advance';},null,{timeout:15000});
   const result=await(await page.request.get(base+'/api/test-state')).json();assert.equal(posts,2);assert.deepEqual(result.adventure,initial.adventure);assert.deepEqual(result.classic.slots[1],initial.classic.slots[1]);
  }
  await context.close();console.log(`${width} ${mode}: verified`);
 }
}finally{await browser.close();}
