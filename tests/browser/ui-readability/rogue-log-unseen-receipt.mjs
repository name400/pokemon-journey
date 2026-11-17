import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL||'http://127.0.0.1:5303';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const multiple of [false,true])for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
  const context=await browser.newContext({viewport,reducedMotion:'no-preference'}),page=await context.newPage(),errors=[];page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  assert.ok((await page.request.post(base+'/api/test-reset?scenario='+(multiple?'double-special-zmove':'reviewed-zmove'))).ok());
  let originalLog=[];
  await page.route('**/api/rogue-classic*',async r=>{const response=await r.fetch(),data=await response.json();if(data.battle){originalLog=data.battle.log||[];data.battle.previousLogCount=100+(data.battle.previousLogCount||0);data.battle.log=[...Array.from({length:100},(_,i)=>`이전 로그 ${i}`),...originalLog];}await r.fulfill({response,json:data});});
  await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.locator('.bs-fx-layer').first().waitFor({timeout:30000});const before=await(await page.request.get(base+'/api/test-state')).json();
  // The approved inline box contains one current line and is hidden in command mode.
  // Interrupt playback as a user changing reduced-motion preference, then inspect
  // the actual history panel rather than measuring that hidden inline box.
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.battle-screen')?.dataset.playing!=='true',null,{timeout:30000});
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('rogue-classic:displayed-events:v1')),null,'interrupted playback must not produce a complete receipt');
  if(multiple)await page.getByRole('button',{name:'전투 기록 보기',exact:true}).click();else{await page.locator('.bs-settings summary').click();await page.locator('.bs-settings').getByRole('button',{name:'전투 기록',exact:true}).click()}const history=page.locator('.bs-history');await history.waitFor();const metrics=await history.evaluate(e=>({height:e.clientHeight,scrollHeight:e.scrollHeight,text:e.innerText}));assert.ok(metrics.height>0&&metrics.scrollHeight>metrics.height,JSON.stringify(metrics));assert.ok(metrics.text.includes('이전 로그 0')&&metrics.text.includes('이전 로그 99'));if(originalLog.length)assert.ok(metrics.text.includes(originalLog.at(-1)),'actual log must remain in history');
  await history.evaluate(e=>e.scrollTop=e.scrollHeight);assert.ok(await history.evaluate(e=>e.scrollTop)>0,'history must scroll');assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before,'presentation and history must not mutate save');assert.deepEqual(errors,[]);console.log(`${multiple?'double':'single'} ${viewport.width}x${viewport.height}: interrupted receipt absent; full history scrolls; save unchanged`);await context.close();
 }
}finally{await browser.close();}
