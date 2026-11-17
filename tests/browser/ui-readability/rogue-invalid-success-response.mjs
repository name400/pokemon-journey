import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5292';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const width of [390,1280])for(const mode of ['missing-state','stale-revision','missing-state-read-fails']){
  const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.request.get(base+'/api/test-reset?scenario=field-playback-rain');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('button',{name:'싸운다',exact:true}).waitFor();
  let posts=0,reads=0;await page.route('**/api/rogue-classic',async route=>{const req=route.request();if(req.method()==='POST'&&req.postDataJSON().action==='turn'){posts++;if(posts===1){const response=await route.fetch(),body=await response.json();if(mode.startsWith('missing-state'))await route.fulfill({status:200,json:{revision:body.revision}});else{body.revision--;await route.fulfill({status:200,json:body});}return;}}if(req.method()==='GET'&&posts){reads++;if(mode==='missing-state-read-fails'&&reads===1){await route.fulfill({status:200,json:{revision:2}});return;}}await route.continue();});
  await page.getByRole('button',{name:'싸운다',exact:true}).click();await page.locator('.bs-move').first().click();await page.waitForTimeout(2000);
  assert.equal(posts,1);assert.equal(reads,1,'an invalid success response must trigger a read instead of being accepted');assert.deepEqual(errors,[]);const saved=await(await page.request.get(base+'/api/test-state')).json();assert.ok(saved.classic.slots[0].combat.turn>0);assert.ok(await page.locator('.battle-screen').count());if(mode==='missing-state-read-fails'){await page.locator('.rc-error').filter({hasText:'다시 불러오지 못했습니다'}).first().waitFor();await page.locator('.bs-move').first().click();await page.waitForTimeout(500);assert.equal(posts,1,'invalid recovery response must not authorize another action');assert.equal(reads,2);}assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),saved);await context.close();console.log(`${width}, ${mode}: saved turn restored with one write`);
 }
}finally{await browser.close();}
