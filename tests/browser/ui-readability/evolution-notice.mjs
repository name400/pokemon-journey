import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.route('https://**/*',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.request.post(base+'/api/test-reset?scenario=evolution');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  const before=await(await page.request.get(base+'/api/test-state')).json(),notice=page.locator('.rc-evolution-notice');assert.match(await notice.innerText(),/진화 가능한 포켓몬/);await notice.getByRole('button',{name:'파티에서 확인'}).click();
  const card=page.locator('.rc-mon').filter({hasText:'캐터피'});assert.match(await card.innerText(),/진화 가능/);assert.match(await card.innerText(),/단데기/);assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);assert.deepEqual(errors,[]);console.log(`${viewport.width}x${viewport.height}: notice, names and unchanged save passed`);
 }finally{await context.close();}
}}finally{await browser.close();}
