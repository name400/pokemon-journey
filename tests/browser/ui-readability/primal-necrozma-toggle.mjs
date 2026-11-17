import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5224';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const [scenario,label,key,form] of [['primal-toggle','원시회귀 · 쪽빛구슬','primal:blueorb','primal'],['necrozma-toggle','네크로즈마 합체 · 네크로플러스솔','necrozma:nsolarizer','dusk-mane']]){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.request.post(base+'/api/test-reset?scenario='+scenario);if(process.env.SINGLE_SPECIAL)await page.route('**/api/rogue-classic*',async r=>{const res=await r.fetch(),view=await res.json();for(const req of view.battle?.requests||[])if(req.specials)req.specials=req.specials.filter(s=>s.key===key);await r.fulfill({response:res,json:view})});await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  await page.getByRole('button',{name:'싸운다',exact:true}).click();assert.equal(await page.getByRole('button',{name:'메가진화',exact:true}).count(),0,'Mega mark must not replace the conditional Primal or Necrozma choice');
  const before=await(await page.request.get(base+'/api/test-state')).json(),button=page.getByRole('button',{name:scenario==='primal-toggle'?'원시회귀':'네크로즈마 합체',exact:true});
  await button.waitFor();if(process.env.SINGLE_SPECIAL)assert.equal(await page.locator('.bs-specials-drawer').count(),0);else assert.equal(await page.locator('.bs-specials-drawer').count(),1);const mark=button.locator('img');assert.equal(await mark.getAttribute('src'),scenario==='primal-toggle'?'/game/v61/primal.png':'/game/v61/necrozma.png');await mark.evaluate(n=>n.decode());assert.ok(await mark.evaluate(n=>n.naturalWidth>0));
  await button.click();assert.equal(await button.getAttribute('aria-pressed'),'true');await button.click();assert.equal(await button.getAttribute('aria-pressed'),'false');
  assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before,'Toggling selection must not change saved state');
  await button.click();assert.match(await button.locator('.bs-v60-mark').evaluate(n=>getComputedStyle(n).filter),/brightness/);
  const turn=page.waitForResponse(r=>r.request().method()==='POST'&&r.request().postDataJSON()?.action==='turn');
  await page.getByRole('button',{name:/튀어오르기/}).first().click();const response=await turn;assert.ok(response.ok());assert.equal(response.request().postDataJSON().command.special,key);
  const committed=await(await page.request.get(base+'/api/test-state')).json(),run=committed.classic.slots[committed.classic.activeSlot];assert.equal(run.party[0].rogueFormKey,form);
  await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  const restored=await(await page.request.get(base+'/api/test-state')).json();assert.deepEqual(restored,committed);assert.deepEqual(errors,[]);
  console.log(scenario+': selection toggle, submitted command and reload passed');await context.close();
 }
}finally{await browser.close();}
