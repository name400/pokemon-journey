import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL,owner=process.env.UI_FIXTURE_OWNER_TOKEN;
if(!base||!owner)throw Error('UI_TEST_URL and UI_FIXTURE_OWNER_TOKEN are required for an owned fixture server');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);
 try{
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  const ownership=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':owner}});assert.ok(ownership.ok()&&(await ownership.json()).owned);
  assert.ok((await page.request.post(base+'/api/test-reset?scenario=fusion-friendship-candy')).ok());
  await page.goto(base+'/?mode=rogue&tab=rogue',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  await page.getByRole('button',{name:'싸운다',exact:true}).click();
  const response=page.waitForResponse(r=>r.url().includes('/api/rogue-classic')&&r.request().method()==='POST'&&r.request().postDataJSON()?.action==='turn');
  await page.locator('.bs-move').first().click();assert.ok((await response).ok());
  const saved=await(await page.request.get(base+'/api/test-state')).json();
  for(const id of [1,4]){assert.equal(saved.classic.system.starterData[id].candies,1);assert.equal(saved.classic.system.starterData[id].friendshipPoints,3);}
  assert.equal(saved.classic.slots[0].party[0].friendship,53);assert.equal(saved.classic.slots[0].party[0].fusionSpecies,4);assert.deepEqual(saved.adventure,{safe:true});
  await page.reload({waitUntil:'domcontentloaded'});assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),saved);assert.deepEqual(errors,[]);
  console.log(`${viewport.width}x${viewport.height}: battle command, both candy families and reload passed`);
 }finally{await context.close();}
}}finally{await browser.close();}
