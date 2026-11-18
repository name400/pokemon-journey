import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL,owner=process.env.UI_FIXTURE_OWNER_TOKEN;
if(!base||!owner)throw Error('UI_TEST_URL and UI_FIXTURE_OWNER_TOKEN are required for an owned fixture server');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage();page.setDefaultTimeout(20000);
 try{
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  const ownership=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':owner}});assert.ok(ownership.ok()&&(await ownership.json()).owned);
  await page.request.post(base+'/api/test-reset?scenario=evolution-item-review-full');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  await page.locator('.rcr-choice[data-rcr-id=review-stone]').click();await page.locator('.rcr-detail').waitFor();await page.locator('.rcr-confirm>button').click();
  await page.locator('.rc-evolution-notice').getByRole('button',{name:'파티에서 확인'}).click();await page.locator('.rc-mon').filter({hasText:'이브이'}).getByRole('button',{name:'부스터(으)로 진화'}).click();
  await page.locator('.evolution-presentation-actions').getByRole('button',{name:'확인',exact:true}).click();await page.getByRole('button',{name:'도전으로 돌아가기'}).click();
  await page.getByRole('button',{name:'배우지 않고 계속'}).click();await page.getByRole('button',{name:'다음 전투',exact:true}).waitFor();
  let saved=await(await page.request.get(base+'/api/test-state')).json();assert.equal(saved.classic.slots[0].screen,'advance');assert.equal(saved.classic.slots[0].wave,21);assert.equal(saved.classic.slots[0].evolutionItemReview,true);
  await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('button',{name:'다음 전투',exact:true}).click();await page.waitForFunction(()=>!!document.querySelector('.battle-screen'));
  saved=await(await page.request.get(base+'/api/test-state')).json();assert.equal(saved.classic.slots[0].screen,'battle');assert.equal(saved.classic.slots[0].wave,22);assert.equal(saved.classic.slots[0].evolutionItemReview,undefined);assert.deepEqual(saved.adventure,{safe:true});
  console.log(`${viewport.width}x${viewport.height}: learn skip, review, reload and next battle passed`);
 }finally{await context.close();}
}}finally{await browser.close();}
