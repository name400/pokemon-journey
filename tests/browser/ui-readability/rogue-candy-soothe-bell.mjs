import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL,owner=process.env.UI_FIXTURE_OWNER_TOKEN;
if(!base||!owner)throw Error('UI_TEST_URL and UI_FIXTURE_OWNER_TOKEN are required for an owned fixture server');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:800}])for(const scenario of ['candy-soothe-target','candy-soothe-party']){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);
 try{
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  const ownership=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':owner}});assert.ok(ownership.ok()&&(await ownership.json()).owned);
  assert.ok((await page.request.post(base+'/api/test-reset?scenario='+scenario)).ok());const before=await(await page.request.get(base+'/api/test-state')).json();
  await page.goto(base+'/?mode=rogue&tab=rogue',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  const choice=page.locator('.rcr-choice[data-rcr-id=soothe-candy]');
  if(scenario==='candy-soothe-target'){await choice.click();const detail=page.locator('.rcr-detail');await detail.waitFor();await detail.locator('.rcr-target').first().click();const response=page.waitForResponse(r=>r.url().includes('/api/rogue-classic')&&r.request().method()==='POST');await detail.locator('.rcr-confirm>button').click();assert.ok((await response).ok());}
  else{const response=page.waitForResponse(r=>r.url().includes('/api/rogue-classic')&&r.request().method()==='POST');await choice.click();assert.ok((await response).ok());}
  const saved=await(await page.request.get(base+'/api/test-state')).json(),all=scenario==='candy-soothe-party';assert.deepEqual(saved.classic.slots[0].party.map(p=>p.friendship),all?[59,62]:[59,50]);assert.equal(saved.classic.system.starterData[1].friendshipPoints,27);assert.equal(saved.classic.system.starterData[4]?.friendshipPoints||0,all?36:0);assert.deepEqual(saved.adventure,before.adventure);assert.deepEqual(saved.classic.slots[1],before.classic.slots[1]);
  await page.reload({waitUntil:'domcontentloaded'});assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),saved);assert.deepEqual(errors,[]);console.log(`${viewport.width}x${viewport.height} ${scenario}: reward command and saved progress passed`);
 }finally{await context.close();}
}}finally{await browser.close();}
