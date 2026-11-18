import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
 for(const viewport of [{width:1280,height:800},{width:390,height:844},{width:320,height:568}]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
   assert.equal((await page.request.post(base+'/api/test-reset?scenario=double-types')).status(),200);await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
   const inspect=async()=>{
    await page.locator('.bs-hud').first().waitFor({state:'visible'});const huds=await page.locator('.bs-hud').evaluateAll(nodes=>nodes.map(n=>{const box=n.getBoundingClientRect(),items=[...n.querySelectorAll('.bs-type-symbol')],rects=items.map(i=>i.getBoundingClientRect());return {name:n.querySelector('.bs-name b')?.textContent,types:items.map(i=>i.dataset.type),visible:items.every(i=>{const s=getComputedStyle(i);return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0;}),fits:rects.every(r=>r.width>0&&r.height>0&&r.left>=box.left&&r.right<=box.right&&r.top>=box.top&&r.bottom<=box.bottom&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight),separate:rects.every((a,i)=>rects.slice(i+1).every(b=>a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top))};}));
    assert.equal(huds.length,4,JSON.stringify(huds));for(const hud of huds){assert.deepEqual(hud.types,hud.name==='누리레느'?['water','fairy']:['fire','flying']);assert.ok(hud.visible&&hud.fits&&hud.separate,JSON.stringify(hud));}assert.equal(huds.filter(h=>h.name==='누리레느').length,2);assert.equal(huds.filter(h=>h.name==='리자몽').length,2);
   };
   await inspect();const before=await(await page.request.get(base+'/api/test-state')).json();await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await inspect();assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);assert.deepEqual(errors,[]);console.log(`${viewport.width}x${viewport.height}: four HUDs and reload passed`);
  }finally{await context.close();}
 }
}finally{await browser.close();}
