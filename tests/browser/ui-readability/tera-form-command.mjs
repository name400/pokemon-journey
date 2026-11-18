import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5227';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 for(const [scenario,form,viewport] of [['tera-ogerpon',4,{width:1280,height:800}],['tera-terapagos',2,{width:390,height:844}]]) {
  const context=await browser.newContext({viewport,reducedMotion:'no-preference'}),page=await context.newPage(),errors=[];
  const formAssets=[];page.on('response',response=>{if(response.url().includes('1017-teal-mask-tera'))formAssets.push({path:new URL(response.url()).pathname,status:response.status()})});page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://**/*',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.request.get(base+'/api/test-reset?scenario='+scenario);await page.goto(base+'/?mode=rogue&tab=rogue');
  await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  await page.waitForFunction(()=>!document.querySelector('.battle-screen[data-playing=true]'));
  const initialSprite=scenario==='tera-ogerpon'?await page.locator('.bs-combatant-own img').first().evaluate(el=>el.currentSrc):'';await page.getByRole('button',{name:'싸운다',exact:true}).click();
  await page.locator('summary').filter({hasText:'특수 변화'}).click();
  const tera=page.locator('.bs-specials button').filter({hasText:'테라스탈'});await tera.click();assert.equal(await tera.getAttribute('aria-pressed'),'true');
  await page.locator('summary').filter({hasText:'특수 변화'}).click();
  await page.evaluate(()=>{window.teraBursts=[];const seen=new WeakSet();new MutationObserver(()=>{for(const el of document.querySelectorAll('.bs-combatant .bs-transformation-burst')){if(seen.has(el))continue;seen.add(el);window.teraBursts.push({type:el.dataset.transformation,box:el.closest('.bs-combatant').dataset.battleBoxid});}}).observe(document.documentElement,{subtree:true,childList:true});});
  const responsePromise=page.waitForResponse(response=>response.url().includes('/api/rogue-classic')&&response.request().method()==='POST');
  await page.getByRole('button',{name:/튀어오르기/}).first().click();const response=await responsePromise;assert.equal(response.status(),200);assert.equal(response.request().postDataJSON().command.special,'terastallize');
  await page.waitForFunction(()=>window.teraBursts.some(e=>e.type==='tera'&&e.box==='tera-ui'),null,{timeout:20000});
  await page.waitForFunction(()=>!document.querySelector('.battle-screen[data-playing=true]'),null,{timeout:20000});
  assert.deepEqual(await page.evaluate(()=>window.teraBursts),[{type:'tera',box:'tera-ui'}]);
  let expectedSprite='';if(scenario==='tera-ogerpon'){await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>{const img=document.querySelector('.bs-combatant-own img');return img&&img.currentSrc.startsWith('data:image/png')&&img.naturalWidth>1},null,{timeout:20000});expectedSprite=await page.locator('.bs-combatant-own img').first().evaluate(el=>el.currentSrc);assert.notEqual(expectedSprite,initialSprite);assert.ok(formAssets.some(a=>a.path.endsWith('/back/1017-teal-mask-tera.png')&&a.status===200),'Ogerpon Tera back atlas must load');}const state=await(await page.request.get(base+'/api/test-state')).json(),run=state.classic.slots[state.classic.activeSlot];assert.equal(run.party[0].rogueFormIndex,form);assert.equal(run.teraCharged,false);assert.deepEqual(errors,[]);
  await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.locator('.bs-scene').waitFor();if(expectedSprite)await page.waitForFunction(src=>{const img=document.querySelector('.bs-combatant-own img');return img&&img.currentSrc===src&&img.naturalWidth>1&&!document.querySelector('.battle-screen[data-playing=true]')},expectedSprite,{timeout:25000});const restored=await(await page.request.get(base+'/api/test-state')).json();assert.equal(restored.classic.slots[restored.classic.activeSlot].party[0].rogueFormIndex,form);
  console.log(`${scenario} ${viewport.width}x${viewport.height}: command, one Tera burst and restored form passed`);await context.close();
 }
} finally {await browser.close();}
