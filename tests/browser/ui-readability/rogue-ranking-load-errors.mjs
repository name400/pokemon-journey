import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL,token=process.env.UI_FIXTURE_OWNER_TOKEN;
assert.ok(base&&token,'Dedicated fixture URL and owner token required');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
let release;
try{for(const width of [390,1280]){
 const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'}),page=await context.newPage();
 const owner=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':token}});assert.equal(owner.status(),200,'Refusing to reset an unowned fixture');await page.request.get(base+'/api/test-reset?scenario=evolution');
 await context.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 let requestCount=0,reached;const paused=new Promise(r=>{reached=r;}),gate=new Promise(r=>{release=r;});
 await page.route('**/api/rogue-ranking',async route=>{requestCount++;if(requestCount===1){reached();await gate;await route.fulfill({status:503,json:{error:'랭킹 조회 실패'}});return;}if(requestCount===2){await route.fulfill({status:200,json:{leaders:[{nickname:'나',best_wave:12,is_self:1}],own:{bestWave:12,rank:1,needsNickname:false}}});return;}await route.fulfill({status:503,json:{error:'랭킹 조회 실패'}});});
 await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();const before=await(await page.request.get(base+'/api/test-state')).json();await page.getByRole('button',{name:'랭킹',exact:true}).click();await paused;
 const ranking=page.getByRole('region',{name:'포켓로그 랭킹'}),own=ranking.getByRole('region',{name:'개인 최고 기록'});assert.match(await own.innerText(),/불러오는 중/);assert.doesNotMatch(await own.innerText(),/아직 기록이 없습니다/);
 release();await ranking.getByRole('alert').waitFor();assert.match(await own.innerText(),/확인하지 못했습니다/);assert.doesNotMatch(await own.innerText(),/아직 기록이 없습니다/);
 await ranking.getByRole('button',{name:'새로고침'}).click();await own.getByText('12 웨이브').waitFor();await ranking.getByRole('button',{name:'새로고침'}).click();await ranking.getByRole('alert').waitFor();assert.match(await own.innerText(),/확인하지 못했습니다/);assert.doesNotMatch(await own.innerText(),/12 웨이브/);
 assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);await context.close();console.log(`${width}: loading, failure, successful retry and failed refresh distinguished`);
}}finally{release?.();await browser.close();}
