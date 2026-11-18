import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5263';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'no-preference'}),page=await context.newPage();page.setDefaultTimeout(30000);
 try{
  await page.route('https://**/*',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.request.post(base+'/api/test-reset?scenario=battle');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.locator('.bs-fx-layer[data-kind=switch]').first().waitFor();const saved=await(await page.request.get(base+'/api/test-state')).json();
  await context.setOffline(true);assert.equal(await page.evaluate(async()=>{try{await fetch('/api/rogue-classic',{cache:'no-store'});return 'ok'}catch{return 'offline'}}),'offline');
  const reload=await page.reload().then(()=>true,()=>false);assert.equal(reload,false,'an uncached offline reload should fail');await context.setOffline(false);await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.locator('.bs-fx-layer[data-kind=switch]').first().waitFor();await page.waitForFunction(()=>document.querySelector('.battle-screen')?.dataset.playing!=='true');
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('rogue-classic:displayed-events:v1')),null);assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),saved);console.log('Offline reload fails; reconnect replays the interrupted event and leaves the fixture save unchanged.');
 }finally{await context.setOffline(false);await context.close();}
}finally{await browser.close();}
