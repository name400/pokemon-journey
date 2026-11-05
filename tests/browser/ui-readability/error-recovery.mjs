import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5224',out='.sites-runtime/tests/error-recovery';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const postId='a1b2c3d4-1234-4567-8910-a1b2c3d4e5f6',getId='a1b2c3d4-1234-4567-8910-a1b2c3d4e5f7',message='행동을 처리하지 못했습니다.',results=[];
try{
 for(const width of [375,1280])for(const recoveryFails of [false,true]){
  const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://**/*',route=>route.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><circle cx="48" cy="48" r="36" fill="#73a9a3"/></svg>'}));
  await page.request.post(base+'/api/test-reset?scenario=battle');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('button',{name:'싸운다',exact:true}).waitFor();
  const before=await(await page.request.get(base+'/api/test-state')).json();let posts=0,recoveries=0;
  await page.route('**/api/rogue-classic',async route=>{
   const request=route.request();
   if(request.method()==='POST'&&request.postDataJSON().action==='turn'){posts++;await route.fulfill({status:409,json:{error:message,code:'ACTION_FAILED',requestId:postId}});return;}
   if(request.method()==='GET'&&posts){recoveries++;if(recoveryFails){await route.fulfill({status:500,json:{error:'도전을 불러오지 못했습니다.',code:'INTERNAL_ERROR',requestId:getId}});return;}}
   await route.continue();
  });
  await page.getByRole('button',{name:'싸운다',exact:true}).click();await page.locator('.bs-move').first().click();
  const alert=page.locator('.rc-error').filter({hasText:postId}).first();await alert.waitFor();
  await page.waitForFunction(({postId,recoveryFails})=>{const alert=[...document.querySelectorAll('.rc-error')].find(el=>el.textContent.includes(postId));return alert&&(!recoveryFails||alert.textContent.includes('새로고침한 뒤 확인'));},{postId,recoveryFails});
  // One read after the failed write; no write retry or save consumption.
  await page.waitForFunction(()=>!document.querySelector('.rogue-footer')?.textContent?.includes('저장 중'));
  assert.equal(posts,1);assert.equal(recoveries,1);const text=await alert.textContent();assert.ok(text.includes(message));assert.ok(text.includes(postId));assert.ok(!text.includes(getId));assert.equal(text.includes('새로고침한 뒤 확인'),recoveryFails);
  const layout=await alert.evaluate(el=>{const box=el.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(el);return {clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,right:box.right,textRight:Math.max(...[...range.getClientRects()].map(rect=>rect.right)),pageWidth:document.documentElement.clientWidth,pageScroll:document.documentElement.scrollWidth};});
  assert.ok(layout.scrollWidth<=layout.clientWidth);assert.ok(layout.textRight<=layout.right+1);assert.equal(layout.pageScroll,layout.pageWidth);assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);assert.deepEqual(errors,[]);
  await page.screenshot({path:`${out}/${width}-${recoveryFails?'failed':'successful'}-get.png`});results.push({width,recoveryFails,posts,recoveries,layout});await context.close();
 }
 await writeFile(out+'/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({passed:results.length,results}));
}finally{await browser.close();}
