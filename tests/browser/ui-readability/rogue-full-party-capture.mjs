import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL,owner=process.env.UI_FIXTURE_OWNER_TOKEN;
assert.ok(base&&owner,'Owned fixture server required');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:800}])for(const release of [false,true]){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(20000);
 try{
  const owned=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':owner}});assert.ok(owned.ok()&&(await owned.json()).owned);assert.ok((await page.request.post(base+'/api/test-reset?scenario=full-party-capture')).ok());
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  const state=async()=>await(await page.request.get(base+'/api/test-state')).json();await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  const original=(await state()).classic.slots[0].party.map(mon=>mon.boxId);await page.getByRole('button',{name:'볼 선택'}).click();await page.getByRole('button',{name:'다음 볼'}).click();await page.getByRole('button',{name:/마스터볼/}).click();await page.getByRole('button',{name:'볼 선택으로'}).click();assert.equal((await state()).classic.slots[0].balls.masterball,1);
  await page.getByRole('button',{name:/마스터볼/}).click();await page.getByRole('button',{name:'던진다',exact:true}).click();await page.getByRole('button',{name:'계속하기',exact:true}).waitFor();await page.getByRole('button',{name:'계속하기',exact:true}).click();
  await page.getByRole('button',{name:'도감에 등록하고 놓아주기'}).waitFor();let saved=await state();const caught=saved.classic.slots[0].pendingCapture.boxId;assert.equal(saved.classic.slots[0].balls.masterball,0);assert.equal(saved.classic.slots[0].party.length,6);
  await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('button',{name:'도감에 등록하고 놓아주기'}).waitFor();saved=await state();assert.equal(saved.classic.slots[0].pendingCapture.boxId,caught);
  await page.getByRole('button',{name:release?'도감에 등록하고 놓아주기':'이상해씨 대신 파티에 추가'}).click();await page.waitForFunction(()=>!document.querySelector('.rc-decision'));saved=await state();const run=saved.classic.slots[0];assert.equal(run.pendingCapture,null);assert.equal(run.balls.masterball,0);assert.equal(run.party.length,6);if(release)assert.deepEqual(run.party.map(mon=>mon.boxId),original);else{assert.ok(run.party.some(mon=>mon.boxId===caught));assert.ok(!run.party.some(mon=>mon.boxId===original[0]));}assert.equal(saved.classic.system.dex[150].caughtCount,1);assert.deepEqual(saved.classic.slots[1],{id:'other'});assert.deepEqual(saved.adventure,{safe:true});assert.deepEqual(errors,[]);console.log(`${viewport.width}: ${release?'release':'replace'} and reload passed`);
 }finally{await context.close();}
}}finally{await browser.close();}
