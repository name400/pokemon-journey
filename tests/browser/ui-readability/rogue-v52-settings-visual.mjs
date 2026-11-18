import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL,token=process.env.UI_FIXTURE_OWNER_TOKEN;
assert.ok(base&&token,'Dedicated fixture URL and owner token required');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const width of [280,320,390]){
 const context=await browser.newContext({viewport:{width,height:844},hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage();
 const owner=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':token}});assert.equal(owner.status(),200,'Refusing to reset an unowned fixture');await page.request.get(base+'/api/test-reset?scenario=rogue-v52-moves-single');
 await context.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.waitForFunction(()=>document.querySelector('.battle-screen')&&!document.querySelector('.battle-screen[data-playing=true]'));await page.getByRole('button',{name:'싸운다',exact:true}).first().tap();
 const summary=page.locator('.bs-settings summary'),before=await(await page.request.get(base+'/api/test-state')).json();
 const size=await summary.evaluate(el=>{const rect=el.getBoundingClientRect(),bg=getComputedStyle(el,'::before'),box=el.closest('.battle-screen').getBoundingClientRect(),hit=[[2,2],[rect.width-2,2],[2,rect.height-2],[rect.width-2,rect.height-2]].map(([x,y])=>{const node=document.elementFromPoint(rect.left+x,rect.top+y);return node===el||el.contains(node)});return {w:rect.width,h:rect.height,bgWidth:parseFloat(bg.width),bgHeight:parseFloat(bg.height),arenaH:box.height,background:getComputedStyle(el).backgroundColor,hit};});
 assert.ok(size.w>=44&&size.h>=44,JSON.stringify(size));assert.equal(size.bgWidth,22);assert.equal(size.bgHeight,22);assert.equal(size.background,'rgba(0, 0, 0, 0)');assert.ok(size.hit.every(Boolean),JSON.stringify(size));
 assert.equal(await page.locator('.bs-move-wrap>.bs-move').count(),4);await summary.tap();assert.equal(await page.locator('.bs-settings').getAttribute('open'),'');await summary.tap();assert.equal(await page.locator('.bs-settings').getAttribute('open'),null);assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);
 const command=page.waitForResponse(r=>r.request().method()==='POST'&&r.url().includes('/api/rogue-classic')&&r.request().postDataJSON()?.action==='turn');await page.locator('.bs-move-wrap>.bs-move').first().tap();assert.equal((await command).ok(),true);
 await context.close();console.log(`${width}: compact visible settings, 44px target, four moves and battle command`);
}}finally{await browser.close();}
