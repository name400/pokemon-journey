import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:36087',token=process.env.UI_FIXTURE_OWNER_TOKEN;
assert.ok(token,'An isolated fixture owner token is required');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'}),page=await context.newPage();
  const owner=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':token}});assert.equal(owner.status(),200,'Refusing to reset an unowned fixture');
  await page.request.get(base+'/api/test-reset?scenario=reward-capped-ball');
  await context.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  let rewardPosts=0;await page.route('**/api/rogue-classic',async route=>{const req=route.request();if(req.method()==='POST'&&req.postDataJSON().action==='reward')rewardPosts++;await route.continue();});
  await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  const capped=page.locator('.rcr-choice[data-rcr-id="capped-ball"]'),available=page.locator('.rcr-choice[data-rcr-id="available-ball"]');await capped.waitFor();
  assert.equal(await capped.isDisabled(),true,'a reward forbidden by the server must not be selectable');assert.match(await capped.innerText(),/이미 99개 보유/);const reason=capped.locator('.rcr-choice-copy > span').filter({hasText:'이미 99개 보유'});assert.equal(await reason.isVisible(),true);const fit=await reason.evaluate(el=>{const r=el.getBoundingClientRect(),p=el.closest('button').getBoundingClientRect();return r.top>=p.top&&r.bottom<=p.bottom+1&&r.left>=p.left&&r.right<=p.right+1;});assert.equal(fit,true,'the disabled reason must fit in its reward card');assert.equal(await available.isEnabled(),true);assert.equal(rewardPosts,0);
  const before=await(await page.request.get(base+'/api/test-state')).json();assert.equal(before.classic.slots[0].balls.pokeball,99);await available.click();
  await page.waitForFunction(async()=>{const state=await(await fetch('/api/test-state')).json();return state.classic.slots[0].balls.greatball>0;},null,{timeout:15000});
  const after=await(await page.request.get(base+'/api/test-state')).json();assert.equal(rewardPosts,1);assert.equal(after.classic.slots[0].balls.pokeball,99);assert.equal(after.classic.slots[0].party[0].boxId,'ball-reward-hero');assert.deepEqual(after.classic.slots[1],before.classic.slots[1]);assert.deepEqual(after.adventure,before.adventure);
  await context.close();console.log(`${width}: capped ball disabled; valid reward succeeds without altering other data`);
 }
}finally{await browser.close();}
