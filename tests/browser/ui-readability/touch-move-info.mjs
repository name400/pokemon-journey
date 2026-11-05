import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222',out='.sites-runtime/tests/ui-readability';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];
try{
 for(const viewport of [{width:375,height:667},{width:390,height:844},{width:430,height:932},{width:844,height:390},{width:1280,height:800}]){
  const touch=viewport.width!==1280,context=await browser.newContext({viewport,isMobile:touch,hasTouch:touch}),page=await context.newPage(),errors=[],posts=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/api/rogue-classic'))posts.push(r.postData());});
  await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg"/>'}));
  for(let round=0;round<2;round++)for(let index=0;index<4;index++){
   await page.request.post(base+'/api/test-reset?scenario=battle');await page.goto(base+'/?mode=rogue&tab=rogue');
   await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('button',{name:'싸운다',exact:true}).click();
   const info=page.locator('.bs-move-info').nth(index),wrap=page.locator('.bs-move-wrap').nth(index),before=await(await page.request.get(base+'/api/test-state')).json(),postCount=posts.length;
   if(touch)await info.tap();else{await info.focus();await page.keyboard.press('Enter');}
   await page.waitForTimeout(450);assert.equal(await info.getAttribute('aria-expanded'),'true',JSON.stringify({viewport,round,index}));assert.equal(await wrap.locator('[role=tooltip]').getAttribute('aria-hidden'),'false');
   if(touch){await info.tap();await page.waitForTimeout(150);assert.equal(await info.getAttribute('aria-expanded'),'false');}
   else{await page.keyboard.press('Enter');assert.equal(await info.getAttribute('aria-expanded'),'false');await wrap.locator('.bs-move').hover();assert.equal(await info.getAttribute('aria-expanded'),'true');await page.locator('.bs-header').hover();assert.equal(await info.getAttribute('aria-expanded'),'false');}
   assert.equal(posts.length,postCount,'information must not send a battle action');assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before,'information must not change saves or PP');
   results.push({viewport,round,index:index+1,pass:true});
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 await writeFile(out+'/touch-move-info.json',JSON.stringify(results,null,2));console.log(JSON.stringify({passed:results.length}));
}finally{await browser.close();}
