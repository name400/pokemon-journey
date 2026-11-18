import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL,owner=process.env.UI_FIXTURE_OWNER_TOKEN;
if(!base||!owner)throw Error('Owned fixture URL and token required');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
 const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(25000);
 let held,releaseHeld;const heldReady=new Promise(resolve=>releaseHeld=resolve);let reads=0;const old={friendCode:'ABCDEF1234',items:[{id:'friend',nickname:'친구A',friendCode:'AAAAAA1111',status:'accepted',direction:'incoming',online:true}]},updated={friendCode:'ABCDEF1234',items:[]};
 try{
  const ownership=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':owner}});assert.ok(ownership.ok()&&(await ownership.json()).owned);
  await page.route('**/api/friends',route=>{if(route.request().method()==='POST')return route.fulfill({json:updated});if(++reads===2){held=route;releaseHeld();return;}return route.fulfill({json:old});});
  await page.route('**/api/presence',route=>route.fulfill({status:204,body:''}));await page.route('https://**/*',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg"/>'}));
  await page.goto(base+'/?mode=rogue&tab=social');const list=page.locator('.social-friends');await list.getByText('친구A').waitFor();await list.getByRole('button',{name:'새로고침'}).click();await heldReady;
  await list.getByRole('button',{name:'친구 삭제'}).click();await page.getByText('목록을 업데이트했습니다.').waitFor();assert.equal(await list.getByText('친구A').count(),0);
  await held.fulfill({json:old});await page.waitForTimeout(250);assert.equal(await list.getByText('친구A').count(),0,'늦은 이전 조회가 삭제 결과를 덮어썼습니다');assert.deepEqual(errors,[]);
  console.log(`${viewport.width}x${viewport.height}: stale refresh cannot resurrect a removed friend`);
 }finally{await context.close();}
}}finally{await browser.close();}
