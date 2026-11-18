import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL,token=process.env.UI_FIXTURE_OWNER_TOKEN;
assert.ok(base&&token,'Dedicated fixture URL and owner token required');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
let releaseBoth=()=>{};
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),a=await context.newPage(),b=await context.newPage();
 const owner=await a.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':token}});assert.equal(owner.status(),200,'Refusing to reset an unowned fixture');await a.request.get(base+'/api/test-reset?scenario=recover-ended');
 await context.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 let countA=0,countB=0,releaseA,releaseB,reachedA,reachedB;
 const gateA=new Promise(r=>{releaseA=r;}),gateB=new Promise(r=>{releaseB=r;}),pausedA=new Promise(r=>{reachedA=r;}),pausedB=new Promise(r=>{reachedB=r;});releaseBoth=()=>{releaseA();releaseB();};
 await a.route('**/api/rogue-classic',async route=>{const req=route.request();if(req.method()==='POST'&&req.postDataJSON().action==='recoverBattle'){countA++;if(countA===1){reachedA();await gateA;}}await route.continue();});
 await b.route('**/api/rogue-classic',async route=>{const req=route.request();if(req.method()==='POST'&&req.postDataJSON().action==='recoverBattle'){countB++;reachedB();await gateB;}await route.continue();});
 await a.goto(base+'/?mode=rogue&tab=rogue');await a.getByRole('button',{name:'계속하기',exact:true}).first().click();await pausedA;
 await b.goto(base+'/?mode=rogue&tab=rogue');await b.getByRole('button',{name:'계속하기',exact:true}).first().click();await pausedB;
 const before=await(await a.request.get(base+'/api/test-state')).json();releaseA();await a.waitForTimeout(1800);
 assert.equal(countA,1,'a revision conflict on the same ended battle must not silently resubmit recovery');assert.equal((await(await a.request.get(base+'/api/test-state')).json()).classic.slots[0].screen,'battle');await a.getByRole('button',{name:'전투 복구 다시 시도'}).waitFor({timeout:5000});
 releaseB();await b.waitForFunction(async()=>{const state=await(await fetch('/api/test-state')).json();return state.classic.slots[0].screen==='reward';},null,{timeout:15000});const after=await(await a.request.get(base+'/api/test-state')).json();assert.equal(countB,1);assert.deepEqual(after.adventure,before.adventure);assert.deepEqual(after.classic.slots[1],before.classic.slots[1]);
 await a.getByRole('button',{name:'전투 복구 다시 시도'}).click();await a.waitForTimeout(800);assert.equal(countA,2,'the user may explicitly retry');assert.deepEqual(await(await a.request.get(base+'/api/test-state')).json(),after,'a stale manual retry must not duplicate rewards');
 await context.close();console.log('Two tabs: stale battle recovery does not silently resubmit; other tab commits once');
}finally{releaseBoth();await browser.close();}
