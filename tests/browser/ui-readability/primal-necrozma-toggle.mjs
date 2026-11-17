import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5224';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const [scenario,label,key,form] of [['primal-toggle','원시회귀 · 쪽빛구슬','primal:blueorb','primal'],['necrozma-toggle','네크로즈마 합체 · 네크로플러스솔','necrozma:nsolarizer','dusk-mane']]){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.request.post(base+'/api/test-reset?scenario='+scenario);await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  await page.getByRole('button',{name:'싸운다',exact:true}).click();assert.equal(await page.locator('.bs-v60-mega').count(),0,'Mega mark must not replace the conditional Primal or Necrozma choice');await page.locator('summary').filter({hasText:'특수 변화'}).click();
  const before=await(await page.request.get(base+'/api/test-state')).json(),button=page.getByRole('button',{name:label,exact:true});
  await button.click();assert.equal(await button.getAttribute('aria-pressed'),'true');await button.click();assert.equal(await button.getAttribute('aria-pressed'),'false');
  assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before,'Toggling selection must not change saved state');
  await button.click();await page.locator('summary').filter({hasText:'특수 변화'}).click();
  const turn=page.waitForResponse(r=>r.request().method()==='POST'&&r.request().postDataJSON()?.action==='turn');
  await page.getByRole('button',{name:/튀어오르기/}).first().click();const response=await turn;assert.ok(response.ok());assert.equal(response.request().postDataJSON().command.special,key);
  const committed=await(await page.request.get(base+'/api/test-state')).json(),run=committed.classic.slots[committed.classic.activeSlot];assert.equal(run.party[0].rogueFormKey,form);
  await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  const restored=await(await page.request.get(base+'/api/test-state')).json();assert.deepEqual(restored,committed);assert.deepEqual(errors,[]);
  console.log(scenario+': selection toggle, submitted command and reload passed');await context.close();
 }
}finally{await browser.close();}
