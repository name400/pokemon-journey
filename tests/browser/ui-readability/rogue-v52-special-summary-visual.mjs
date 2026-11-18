import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL,token=process.env.UI_FIXTURE_OWNER_TOKEN;
assert.ok(base&&token,'Dedicated fixture URL and owner token required');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const [width,height] of [[280,568],[320,568],[390,844]]){
 const context=await browser.newContext({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage();
 const owner=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':token}});assert.equal(owner.status(),200,'Refusing to reset an unowned fixture');await page.request.get(base+'/api/test-reset?scenario=mega-command-many');
 await context.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.waitForFunction(()=>document.querySelector('.battle-screen')&&!document.querySelector('.battle-screen[data-playing=true]'));await page.getByRole('button',{name:'싸운다',exact:true}).tap();
 const summary=page.locator('.bs-specials-drawer summary'),before=await(await page.request.get(base+'/api/test-state')).json();
 const size=await summary.evaluate(el=>{const r=el.getBoundingClientRect(),bg=getComputedStyle(el,'::before'),hit=[[2,2],[r.width-2,2],[2,r.height-2],[r.width-2,r.height-2]].map(([x,y])=>{const node=document.elementFromPoint(r.left+x,r.top+y);return node===el||el.contains(node)});return {w:r.width,h:r.height,bgWidth:parseFloat(bg.width),bgHeight:parseFloat(bg.height),background:getComputedStyle(el).backgroundColor,drawerBackground:getComputedStyle(el.parentElement).backgroundColor,hit}});
 assert.ok(size.w>=70&&size.h>=44,JSON.stringify(size));assert.equal(size.bgWidth,70);assert.equal(size.bgHeight,22);assert.equal(size.background,'rgba(0, 0, 0, 0)');assert.equal(size.drawerBackground,'rgba(0, 0, 0, 0)');assert.ok(size.hit.every(Boolean),JSON.stringify(size));assert.equal(await page.locator('.bs-move-wrap>.bs-move').count(),4);
 await summary.tap();const y=page.getByRole('button',{name:'메가진화 · 리자몽나이트Y'});await y.tap();assert.equal(await y.getAttribute('aria-pressed'),'true');await summary.tap();assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);
 const response=page.waitForResponse(r=>r.request().method()==='POST'&&r.url().includes('/api/rogue-classic')&&r.request().postDataJSON()?.action==='turn');await page.locator('.bs-move-wrap>.bs-move').last().tap();const sent=await response;assert.equal(sent.status(),200);assert.equal(sent.request().postDataJSON().command.special,'mega:charizarditey');
 await context.close();console.log(`${width}: smaller visible special entry, four moves and selected Mega action`);
}}finally{await browser.close();}
