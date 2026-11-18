import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL,owner=process.env.UI_FIXTURE_OWNER_TOKEN;
if(!base||!owner)throw Error('Owned fixture server required');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);
 try{
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  const ownership=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':owner}});assert.ok(ownership.ok()&&(await ownership.json()).owned);
  assert.ok((await page.request.post(base+'/api/test-reset?scenario=hardcore-fainted-unsplice')).ok());
  await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('navigation',{name:'도전 메뉴'}).getByRole('button',{name:'파티',exact:true}).click();
  const cards=page.locator('.rc-mon'),dead=cards.nth(0),live=cards.nth(1);assert.equal(await dead.getByRole('button',{name:'융합 분리',exact:true}).count(),0);
  const unsplice=live.getByRole('button',{name:'융합 분리',exact:true});await unsplice.waitFor();await unsplice.click();
  const confirmation=live.getByRole('group',{name:'융합 분리 확인'});await confirmation.getByRole('button',{name:'취소'}).click();assert.equal(await confirmation.count(),0);
  await unsplice.click();const response=page.waitForResponse(r=>r.url().includes('/api/rogue-classic')&&r.request().method()==='POST');await confirmation.getByRole('button',{name:'분리 확인'}).click();assert.ok((await response).ok());
  const saved=await(await page.request.get(base+'/api/test-state')).json(),run=saved.classic.slots[0];assert.equal(run.party[0].hp,0);assert.ok(run.party[0].fusionSpecies);assert.equal(run.party[1].fusionSpecies,undefined);assert.deepEqual(saved.adventure,{safe:true});assert.equal(saved.classic.slots[1].id,'other');
  await page.reload();assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),saved);assert.deepEqual(errors,[]);console.log(`${viewport.width}x${viewport.height}: hardcore unsplice UI and save passed`);
 }finally{await context.close();}
}}finally{await browser.close();}
