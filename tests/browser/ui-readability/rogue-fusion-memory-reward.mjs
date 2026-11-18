import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL,owner=process.env.UI_FIXTURE_OWNER_TOKEN;
if(!base||!owner)throw Error('UI_TEST_URL and UI_FIXTURE_OWNER_TOKEN are required for an owned fixture server');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);
 try{
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  const ownership=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':owner}});assert.ok(ownership.ok()&&(await ownership.json()).owned);
  await page.request.post(base+'/api/test-reset?scenario=fusion-memory-reward');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  await page.locator('.rcr-choice').filter({hasText:'기억버섯'}).click();const dialog=page.locator('.rcr-detail');await dialog.waitFor();await dialog.getByLabel('배울 기술').selectOption({label:'물대포'});await dialog.locator('.rcr-replace-moves button').nth(1).click();
  const response=page.waitForResponse(r=>r.url().includes('/api/rogue-classic')&&r.request().method()==='POST');await dialog.locator('.rcr-confirm>button').click();assert.ok((await response).ok());
  let saved=await(await page.request.get(base+'/api/test-state')).json();assert.ok(saved.classic.slots[0].party[0].moves.includes('물대포'));assert.equal(saved.classic.slots[0].party[0].pp.tackle,1);await page.reload();saved=await(await page.request.get(base+'/api/test-state')).json();assert.equal(saved.classic.slots[0].party[0].fusionSpecies,7);assert.ok(saved.classic.slots[0].party[0].moves.includes('물대포'));assert.deepEqual(saved.adventure,{safe:true});assert.deepEqual(errors,[]);
  console.log(`${viewport.width}x${viewport.height}: donor move, memory reward and reload passed`);
 }finally{await context.close();}
}}finally{await browser.close();}
