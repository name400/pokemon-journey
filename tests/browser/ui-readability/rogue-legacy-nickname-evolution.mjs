import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL||'http://127.0.0.1:18992';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);
 try{
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.request.post(base+'/api/test-reset?scenario=evolution-psyduck-nickname');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('button',{name:'지금 진화',exact:true}).click();
  const result=page.getByRole('region',{name:'진화 결과'});await result.waitFor();assert.match(await result.innerText(),/별명 · Normal/);await result.getByRole('button',{name:'확인',exact:true}).click();
  const doc=await(await page.request.get(base+'/api/test-state')).json(),mon=doc.classic.slots[doc.classic.activeSlot].party[0];assert.equal(mon.name,'별명 · Normal');assert.equal(mon.rogueSourceId,55);assert.equal(mon.baseName,'골덕');
  await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('button',{name:'파티',exact:true}).first().click();assert.match(await page.locator('.rc-mon').first().innerText(),/별명 · Normal/);assert.deepEqual(errors,[]);console.log(JSON.stringify({viewport,evolution:'saved',nickname:'preserved'}));
 }finally{await context.close();}
}}finally{await browser.close();}
