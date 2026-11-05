import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL||'http://127.0.0.1:5222',out='.sites-runtime/tests/ui-readability/types-and-motion';await mkdir(out,{recursive:true});
async function slotBoundary(page,viewport){
 await page.emulateMedia({reducedMotion:'reduce'});await page.request.post(base+'/api/test-reset?scenario=evolution-prompt');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('button',{name:'지금 진화',exact:true}).click();await page.getByRole('region',{name:'진화 결과'}).waitFor();
 await page.getByRole('button',{name:'저장 슬롯',exact:true}).click();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();assert.equal(await page.getByRole('region',{name:'진화 결과'}).count(),0);return {viewport,mode:'evolution-slot-change',cleared:true};
}
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']}),results=[];
try{
 for(const viewport of [{width:1280,height:800},{width:375,height:667},{width:320,height:568}]){
  const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[],posts=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/api/rogue-classic'))posts.push(JSON.parse(r.postData()));});
  await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><circle cx="48" cy="48" r="30" fill="#b298c6"/></svg>'}));
  if(process.env.UI_FOCUS==='slot'){results.push(await slotBoundary(page,viewport));assert.deepEqual(errors,[]);await context.close();continue;}
  await page.goto(base+'/layout.html');
  for(const mode of ['single-types','double-types','tera','stellar','current']){
   await page.getByRole('button',{name:mode,exact:true}).click();await page.waitForTimeout(250);
   const badges=await page.locator('.bs-hud').evaluateAll(nodes=>nodes.map(n=>({name:n.querySelector('.bs-name b').textContent,types:[...n.querySelectorAll('.bs-type-symbol')].map(i=>i.dataset.type),fits:[...n.querySelectorAll('.bs-type-symbol')].every(i=>{const r=i.getBoundingClientRect(),b=n.getBoundingClientRect();return r.left>=b.left&&r.right<=b.right&&r.top>=b.top&&r.bottom<=b.bottom;}),nameFits:n.querySelector('.bs-name b').scrollWidth<=n.querySelector('.bs-name b').clientWidth+1})));
   assert.equal(badges.length,mode==='single-types'?2:4);for(const b of badges){assert.deepEqual(b.types,mode==='tera'?['fire']:mode==='current'?['grass','poison']:b.name==='누리레느'?['water','fairy']:['fire','flying']);assert.ok(b.fits,JSON.stringify({viewport,mode,b}));assert.ok(b.nameFits,JSON.stringify({viewport,mode,b,reason:'name clipped'}));}
   await page.screenshot({path:out+'/'+viewport.width+'-'+mode+'.png',fullPage:true});results.push({viewport,mode,badges});
  }
  for(const reducedMotion of ['no-preference','reduce']){
   await page.emulateMedia({reducedMotion});await page.request.post(base+'/api/test-reset?scenario=evolution-prompt');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('button',{name:'지금 진화',exact:true}).click();
   const result=page.getByRole('region',{name:'진화 결과'});await result.waitFor();await result.getByRole('status').waitFor();assert.match(await result.textContent(),/캐터피.*단데기/);
   const before=await(await page.request.get(base+'/api/test-state')).json(),count=posts.length;
   if(reducedMotion==='no-preference'){await result.getByRole('button',{name:'연출 건너뛰기'}).click();assert.equal(await result.getAttribute('data-motion-skipped'),'true');}else assert.equal(await result.locator('.rc-evolution-skip').isVisible(),false);
   assert.equal(await result.locator('.rc-evolve-after').evaluate(n=>getComputedStyle(n).animationName),'none');
   await page.screenshot({path:out+'/'+viewport.width+'-evolution-'+reducedMotion+'.png',fullPage:true});await result.getByRole('button',{name:'확인',exact:true}).click();assert.equal(await result.count(),0);assert.equal(posts.length,count);assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);
   results.push({viewport,reducedMotion,mode:'evolution',noSaveOnSkipOrClose:true});
   if(reducedMotion==='reduce')results.push(await slotBoundary(page,viewport));
   await page.request.post(base+'/api/test-reset?scenario=mystery-motion');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
   const card=page.locator('.rc-content>.rc-decision').first();await page.getByRole('button',{name:'상자를 연다',exact:true}).waitFor();assert.equal(await card.evaluate(n=>getComputedStyle(n).animationName),reducedMotion==='reduce'?'none':'rc-event-choose');
   await page.getByRole('button',{name:'상자를 연다',exact:true}).click();await page.getByRole('button',{name:'다시 선택',exact:true}).waitFor();assert.equal(await card.evaluate(n=>getComputedStyle(n).animationName),reducedMotion==='reduce'?'none':'rc-event-confirm');
   await page.getByRole('button',{name:'다시 선택',exact:true}).click();await page.getByRole('button',{name:'그냥 떠난다',exact:true}).click();await page.getByRole('button',{name:'확인',exact:true}).click();await page.waitForTimeout(200);assert.ok(!await page.getByRole('button',{name:'그냥 떠난다',exact:true}).count());results.push({viewport,reducedMotion,mode:'mystery',chooseConfirmCancel:true});
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 await writeFile(out+(process.env.UI_FOCUS==='slot'?'/slot-results.json':'/results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({passed:results.length}));
}finally{await browser.close();}
