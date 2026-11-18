import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL,owner=process.env.UI_FIXTURE_OWNER_TOKEN;
if(!base||!owner)throw Error('UI_TEST_URL and UI_FIXTURE_OWNER_TOKEN are required for an owned fixture server');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);
 try{
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  const ownership=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':owner}});assert.ok(ownership.ok()&&(await ownership.json()).owned);
  await page.request.post(base+'/api/test-reset?scenario=caught-evolution-reward');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  await page.locator('.rcr-choice').filter({hasText:'연결의끈'}).click();await page.locator('.rcr-detail').waitFor();await page.locator('.rcr-confirm>button').click();
  const notice=page.locator('.rc-evolution-notice');await notice.waitFor();await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await notice.getByRole('button',{name:'파티에서 확인'}).click();
  await page.locator('.rc-mon').filter({hasText:'딱정곤'}).getByRole('button',{name:'슈바르고(으)로 진화'}).click();await page.waitForFunction(()=>document.body.innerText.includes('진화했다'));
  const saved=await(await page.request.get(base+'/api/test-state')).json();assert.equal(saved.classic.slots[0].party[0].rogueSourceId,589);assert.equal(saved.classic.slots[0].evolutionItems.linkingcord,0);assert.equal(saved.classic.system.dex['616'].caught,true);assert.deepEqual(saved.adventure,{safe:true});assert.deepEqual(errors,[]);
  console.log(`${viewport.width}x${viewport.height}: generated reward, reload and evolution passed`);
 }finally{await context.close();}
}}finally{await browser.close();}
