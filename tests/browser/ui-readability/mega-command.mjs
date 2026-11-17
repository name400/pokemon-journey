import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox'],timeout:12000});
try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},hasTouch:mobile,isMobile:mobile,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
  await page.request.get(base+'/api/test-reset?scenario=mega-command');
  await page.route('https://**/*',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  const press=async locator=>mobile?locator.tap():locator.click();await press(page.getByRole('button',{name:'싸운다',exact:true}));await press(page.locator('summary').filter({hasText:'특수 변화'}));
  const x=page.getByRole('button',{name:'메가진화 · 리자몽나이트X'}),y=page.getByRole('button',{name:'메가진화 · 리자몽나이트Y'});assert.equal(await x.isVisible(),true);assert.equal(await y.isVisible(),true);await page.screenshot({path:`/tmp/mega-command-${mobile?'mobile':'desktop'}.png`});await press(y);assert.equal(await y.getAttribute('aria-pressed'),'true');
  await press(page.locator('summary').filter({hasText:'특수 변화'}));const responsePromise=page.waitForResponse(response=>response.url().includes('/api/rogue-classic')&&response.request().method()==='POST');await press(page.getByRole('button',{name:/튀어오르기/}).first());const response=await responsePromise,payload=response.request().postDataJSON();assert.equal(response.status(),200);assert.equal(payload.command.special,'mega:charizarditey');
  const state=await(await page.request.get(base+'/api/test-state')).json(),run=state.classic.slots[state.classic.activeSlot];assert.equal(run.party[0].rogueFormKey,'mega-y');assert.equal(run.party[0].mega,true);assert.deepEqual(errors,[]);await context.close();console.log(`${mobile?'mobile viewport + touch':'desktop viewport + mouse'}: Mega Y command and saved state passed`);
 }
}finally{await browser.close();}
