import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
 for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
  const context=await browser.newContext({viewport,hasTouch:viewport.width<900}),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://**/*',route=>route.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.request.post(base+'/api/test-reset?scenario=active-alias-repair');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  const before=await(await page.request.get(base+'/api/test-state')).json(),oldRun=before.classic.slots[before.classic.activeSlot];
  await page.getByRole('button',{name:'대기 포켓몬 기술 확인'}).click();await page.getByRole('button',{name:'중복 기술 확인'}).click();
  await page.getByRole('group',{name:'중복 기술 정리 확인'}).waitFor();const request=page.waitForResponse(response=>response.url().endsWith('/api/rogue-classic')&&response.request().method()==='POST');await page.getByRole('button',{name:'정리 확인',exact:true}).click();assert.equal((await request).status(),200);
  const after=await(await page.request.get(base+'/api/test-state')).json(),run=after.classic.slots[after.classic.activeSlot];assert.deepEqual(run.party[1].moves,['Tackle','Growl']);assert.equal(run.combat.snapshot.turn,oldRun.combat.snapshot.turn);assert.deepEqual(run.combat.snapshot.prng,oldRun.combat.snapshot.prng);assert.deepEqual(run.combat.snapshot.field,oldRun.combat.snapshot.field);assert.deepEqual(run.party[0],oldRun.party[0]);
  await page.getByRole('button',{name:'도전으로 돌아가기'}).click();assert.equal(await page.getByRole('button',{name:'대기 포켓몬 기술 확인'}).count(),0);assert.deepEqual(errors,[]);await context.close();
 }
 console.log('active alias review passed on desktop and mobile');
}finally{await browser.close();}
