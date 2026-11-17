import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5227';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 for(const [width,height] of [[320,568],[390,844],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.request.get(base+'/api/test-reset?scenario=mega-command-many');await page.goto(base+'/?mode=rogue&tab=rogue');
  await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  const commands=await page.locator('.bs-v52-commands button,.bs-v52-utilities button').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};}));assert.equal(commands.length,6);for(const box of commands){assert.ok(box.width>=43.9&&box.height>=43.9,JSON.stringify(commands));assert.ok(box.left>=0&&box.right<=width&&box.top>=0&&box.bottom<=height,JSON.stringify(commands));}for(let i=0;i<commands.length;i++)for(let j=i+1;j<commands.length;j++){const a=commands[i],b=commands[j];assert.ok(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top,JSON.stringify(commands));}
  await page.getByRole('button',{name:'싸운다',exact:true}).tap();
  await page.waitForFunction(()=>document.querySelectorAll('.bs-move-wrap').length===4);
  const rectangles=await page.locator('.bs-move-wrap').evaluateAll(nodes=>nodes.map(node=>{const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};return {move:rect(node.querySelector('.bs-move')),info:rect(node.querySelector('.bs-move-info'))};}));
  assert.equal(rectangles.length,4);for(const {move,info} of rectangles){for(const box of [move,info]){assert.ok(box.width>=43.9&&box.height>=43.9,JSON.stringify(rectangles));assert.ok(box.left>=0&&box.right<=width&&box.top>=0&&box.bottom<=height,JSON.stringify(rectangles));}}
  const pageSize=await page.evaluate(()=>({height:document.documentElement.scrollHeight,scrollY}));assert.ok(pageSize.height<=height&&pageSize.scrollY===0,JSON.stringify(pageSize));
  const info=page.locator('.bs-move-info').nth(3);await info.tap();assert.equal(await info.getAttribute('aria-expanded'),'true');await info.tap();assert.equal(await info.getAttribute('aria-expanded'),'false');
  const summary=page.locator('summary').filter({hasText:'특수 변화'});await summary.tap();const mega=page.getByRole('button',{name:'메가진화 · 리자몽나이트Y'}),specialBounds=await mega.boundingBox();assert.ok(specialBounds&&specialBounds.x>=0&&specialBounds.y>=0&&specialBounds.x+specialBounds.width<=width&&specialBounds.y+specialBounds.height<=height,JSON.stringify(specialBounds));await mega.tap();assert.equal(await mega.getAttribute('aria-pressed'),'true');await summary.tap();
  const responsePromise=page.waitForResponse(r=>r.url().includes('/api/rogue-classic')&&r.request().method()==='POST');await page.locator('.bs-move').nth(3).tap();const response=await responsePromise;assert.equal(response.status(),200);assert.equal(response.request().postDataJSON().command.move,'tackle');assert.equal(response.request().postDataJSON().command.special,'mega:charizarditey');assert.deepEqual(errors,[]);
  console.log(`${width}x${height}: four visible >=44px targets, info toggles, and fourth move command passed`);await context.close();
 }
}finally{await browser.close();}
