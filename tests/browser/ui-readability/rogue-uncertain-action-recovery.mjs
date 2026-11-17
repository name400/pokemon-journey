import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5263';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'}),page=await context.newPage();
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.request.get(base+'/api/test-reset?scenario=battle');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('button',{name:'싸운다',exact:true}).waitFor();
  const before=await(await page.request.get(base+'/api/test-state')).json();let posts=0,reads=0;
  await page.route('**/api/rogue-classic',async route=>{
   const request=route.request();if(request.method()==='POST'&&request.postDataJSON().action==='turn'){posts++;if(posts===1){await route.fulfill({status:500,json:{error:'행동 결과를 확인할 수 없습니다.',code:'INTERNAL_ERROR'}});return;}}
   if(request.method()==='GET'&&posts){reads++;if(reads===1){await route.fulfill({status:500,json:{error:'상태 읽기 실패',code:'INTERNAL_ERROR'}});return;}if(reads===2){const response=await route.fetch(),data=await response.json();data.revision=0;await route.fulfill({response,json:data});return;}}
   await route.continue();
  });
  await page.getByRole('button',{name:'싸운다',exact:true}).click();await page.locator('.bs-move').first().click();
  await page.locator('.rc-error').filter({hasText:'다시 불러오지 못했습니다'}).first().waitFor();await page.waitForFunction(()=>!document.querySelector('.rogue-footer')?.textContent?.includes('저장 중'));
  assert.equal(posts,1);assert.equal(reads,1);assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);
  await page.locator('.bs-move').first().click();await page.waitForTimeout(1000);
  assert.equal(posts,1,'an uncertain prior action must not be followed by another write before a successful refresh');assert.equal(reads,2);assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);
  await page.locator('.bs-move').first().click();await page.waitForTimeout(1000);assert.equal(posts,1,'a stale read must not authorize a write');assert.equal(reads,3);assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);
  await page.locator('.bs-move').first().click();await page.waitForTimeout(1000);assert.equal(posts,2,'after refreshing the user can deliberately select the action again');
  await context.close();console.log(`${width}: failed action/read, stale read, refresh without write, deliberate retry`);
 }
 {
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage();
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.request.get(base+'/api/test-reset?scenario=field-playback-rain');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('button',{name:'싸운다',exact:true}).waitFor();
  let posts=0,reads=0;await page.route('**/api/rogue-classic',async route=>{const request=route.request();if(request.method()==='POST'&&request.postDataJSON().action==='turn'){posts++;if(posts===1){await route.fetch();await route.fulfill({status:500,json:{error:'응답 소실',code:'INTERNAL_ERROR'}});return;}}if(request.method()==='GET'&&posts&&++reads===1){await route.fulfill({status:500,json:{error:'상태 읽기 실패',code:'INTERNAL_ERROR'}});return;}await route.continue();});
  await page.getByRole('button',{name:'싸운다',exact:true}).click();await page.locator('.bs-move').first().click();await page.locator('.rc-error').filter({hasText:'다시 불러오지 못했습니다'}).first().waitFor();
  const committed=await(await page.request.get(base+'/api/test-state')).json();assert.ok(committed.classic.slots[0].combat.turn>0);
  await page.locator('.bs-move').first().click();await page.waitForTimeout(1000);assert.equal(posts,1);assert.equal(reads,2);assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),committed,'refresh must not repeat an already saved turn');
  await context.close();console.log('committed response lost: refresh restores the saved turn without repeating it');
 }
}finally{await browser.close();}
