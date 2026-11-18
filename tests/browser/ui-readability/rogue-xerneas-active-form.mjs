import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL,owner=process.env.UI_FIXTURE_OWNER_TOKEN;
if(!base||!owner)throw Error('Owned fixture server required');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const reference=new Map();
try{for(const scenario of ['xerneas-active-display','xerneas-fusion-active-display'])for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(30000);
 try{
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  const ownership=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':owner}});assert.ok(ownership.ok()&&(await ownership.json()).owned);
  assert.ok((await page.request.post(base+'/api/test-reset?scenario='+scenario)).ok());
  const read=async()=>{await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();const img=page.locator('.bs-combatant[data-battle-boxid="xerneas-hero"] .bs-sprite img');await img.waitFor();await page.waitForFunction(()=>{const i=document.querySelector('.bs-combatant[data-battle-boxid="xerneas-hero"] .bs-sprite img');return i?.currentSrc.startsWith('data:image/')&&i.complete&&i.naturalWidth>0;});return img.evaluate(i=>({src:i.currentSrc,width:i.naturalWidth,height:i.naturalHeight,title:i.title}));};
  const before=await read(),saved=await(await page.request.get(base+'/api/test-state')).json();assert.equal(saved.classic.slots[0].party[0].rogueFormIndex,1);if(scenario==='xerneas-active-display'){assert.equal(before.title,'');reference.set(viewport.width,before.src);}else{assert.match(before.title,/융합 색상/);assert.equal(before.src,reference.get(viewport.width),'fallback must use the active-form atlas');}await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();const img=page.locator('.bs-combatant[data-battle-boxid="xerneas-hero"] .bs-sprite img');await page.waitForFunction(()=>{const i=document.querySelector('.bs-combatant[data-battle-boxid="xerneas-hero"] .bs-sprite img');return i?.currentSrc.startsWith('data:image/')&&i.complete&&i.naturalWidth>0;});const after=await img.evaluate(i=>({src:i.currentSrc,width:i.naturalWidth,height:i.naturalHeight,title:i.title}));assert.deepEqual(after,before);assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),saved);assert.deepEqual(errors,[]);console.log(`${scenario} ${viewport.width}x${viewport.height}: image decoded and unchanged after reload`);
 }finally{await context.close();}
}}finally{await browser.close();}
