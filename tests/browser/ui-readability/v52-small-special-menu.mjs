import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5227';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const [width,height] of [[280,568],[320,568]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.request.post(base+'/api/test-reset?scenario=mega-command-many');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  await page.getByRole('button',{name:'싸운다',exact:true}).tap();const summary=page.locator('summary').filter({hasText:'특수 변화'});await summary.tap();
  const boxes=await page.locator('.bs-specials button').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect(),scene=n.closest('.bs-scene, .battle-screen').getBoundingClientRect(),hit=document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2)?.closest('button')===n;return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,sceneLeft:scene.left,sceneRight:scene.right,sceneTop:scene.top,sceneBottom:scene.bottom,hit}}));
  assert.equal(boxes.length,4);for(const b of boxes){assert.ok(b.width>=44&&b.height>=44&&b.hit,JSON.stringify(boxes));assert.ok(b.left>=b.sceneLeft-.5&&b.right<=b.sceneRight+.5&&b.top>=b.sceneTop-.5&&b.bottom<=b.sceneBottom+.5,JSON.stringify(boxes));}for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert.ok(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top,JSON.stringify(boxes));}
  const megaX=page.getByRole('button',{name:'메가진화 · 리자몽나이트X'});await megaX.tap();assert.equal(await megaX.getAttribute('aria-pressed'),'true');const mega=page.getByRole('button',{name:'메가진화 · 리자몽나이트Y'});await mega.tap();assert.equal(await mega.getAttribute('aria-pressed'),'true');const icon=page.getByRole('button',{name:'메가진화',exact:true});await icon.tap();assert.equal(await icon.getAttribute('aria-pressed'),'false');await mega.tap();assert.equal(await icon.getAttribute('aria-pressed'),'true');await summary.tap();
  const next=page.getByRole('button',{name:'다음 기술'});if(await next.count()){const b=await next.boundingBox();assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=width&&b.y+b.height<=height,JSON.stringify(b));await next.tap();}
  const moves=page.locator('.bs-move-wrap>.bs-move'),last=moves.last();const response=page.waitForResponse(r=>r.url().includes('/api/rogue-classic')&&r.request().method()==='POST');await last.tap();const sent=await response;assert.equal(sent.status(),200);assert.equal(sent.request().postDataJSON().command.move,'tackle');assert.equal(sent.request().postDataJSON().command.special,'mega:charizarditey');assert.deepEqual(errors,[]);
  console.log(`${width}x${height}: all special choices visible, selection and fourth move passed`);await context.close();
 }
}finally{await browser.close();}
