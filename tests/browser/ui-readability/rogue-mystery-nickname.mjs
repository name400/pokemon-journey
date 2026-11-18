import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL,owner=process.env.UI_FIXTURE_OWNER_TOKEN;
if(!base||!owner)throw Error('Owned fixture URL and token required');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(25000);
 try{
  const ownership=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':owner}});assert.ok(ownership.ok()&&(await ownership.json()).owned);
  await page.request.post(base+'/api/test-reset?scenario=mystery-nickname-fun');await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('button',{name:'내 친구 참가'}).click();
  const decision=page.locator('.rc-decision');await decision.getByText('내 친구으로 도전할까요?').waitFor();let saved=await(await page.request.get(base+'/api/test-state')).json();assert.equal(saved.classic.slots[0].mystery.selection.boxId,'nickname-hero');assert.equal(saved.classic.slots[0].party[0].nickname,'내 친구');
  await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await decision.getByText('내 친구으로 도전할까요?').waitFor();
  const response=page.waitForResponse(r=>r.url().includes('/api/rogue-classic')&&r.request().method()==='POST');await decision.getByRole('button',{name:'확인',exact:true}).click();assert.ok((await response).ok());
  saved=await(await page.request.get(base+'/api/test-state')).json();assert.equal(saved.classic.slots[0].screen,'battle');assert.equal(saved.classic.slots[0].party[0].boxId,'nickname-hero');assert.equal(saved.classic.slots[0].party[0].nickname,'내 친구');assert.equal(saved.classic.slots[1].id,'other');assert.deepEqual(saved.adventure,{safe:true});assert.deepEqual(errors,[]);
  console.log(`${viewport.width}x${viewport.height}: nickname selection, confirmation, reload and battle save passed`);
 }finally{await context.close();}
}}finally{await browser.close();}
