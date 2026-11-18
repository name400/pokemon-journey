import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL,owner=process.env.UI_FIXTURE_OWNER_TOKEN;
if(!base||!owner)throw Error('UI_TEST_URL and UI_FIXTURE_OWNER_TOKEN are required for an owned fixture server');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);
 try{
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  const ownership=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':owner}});assert.ok(ownership.ok()&&(await ownership.json()).owned);
  await page.request.post(base+'/api/test-reset?scenario=fusion-level-move');await page.goto(base+'/?mode=rogue&tab=rogue',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  await page.locator('.rcr-choice[data-rcr-id=fusion-level-candy]').click();await page.locator('.rcr-detail').waitFor();await page.locator('.rcr-confirm>button').click();
  const learning=page.locator('.rogue-move-learn');await learning.waitFor();assert.match(await learning.innerText(),/거품/);await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await learning.waitFor();
  await learning.locator('[data-move-slot="1"]').click();await learning.getByRole('button',{name:'거품 배우기'}).click();await page.waitForFunction(()=>!!document.querySelector('.battle-screen'));
  const saved=await(await page.request.get(base+'/api/test-state')).json();assert.ok(saved.classic.slots[0].party[0].moves.includes('거품'));assert.equal(saved.classic.slots[0].party[0].pp.tackle,1);assert.equal(saved.classic.slots[0].party[0].fusionSpecies,7);assert.deepEqual(saved.adventure,{safe:true});assert.deepEqual(errors,[]);
  console.log(`${viewport.width}x${viewport.height}: donor level move, reload and battle passed`);
 }finally{await context.close();}
}}finally{await browser.close();}
