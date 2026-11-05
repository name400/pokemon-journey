import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL||'http://127.0.0.1:5222',out='.sites-runtime/tests/ui-readability/pp-and-trainers';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']}),results=[];
const state=async page=>await(await page.request.get(base+'/api/test-state')).json();
async function open(page,scenario){await page.request.post(base+'/api/test-reset?scenario='+scenario);await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();}
try{
 for(const viewport of [{width:1280,height:800},{width:375,height:667}]){
  const context=await browser.newContext({viewport,hasTouch:viewport.width<900}),page=await context.newPage(),errors=[],posts=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()==='POST'&&r.url().endsWith('/api/rogue-classic'))posts.push(JSON.parse(r.postData()));});
  await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><circle cx="48" cy="48" r="30" fill="#b298c6"/></svg>'}));
  for(const scenario of process.env.UI_FOCUS==='trainers'?[]:['pp-empty','pp-all-empty','pp-restored']){
   await open(page,scenario);await page.getByRole('button',{name:'싸운다',exact:true}).click();const cards=page.locator('.bs-move'),extreme=cards.nth(3);assert.equal(await cards.count(),scenario==='pp-all-empty'?5:4);assert.match(await extreme.textContent(),/신속/);
   const before=await state(page),count=posts.length;
   if(scenario!=='pp-restored'){
    assert.equal(await extreme.isDisabled(),true);assert.match(await extreme.getAttribute('aria-label'),/PP 0\/5.*PP가 없습니다/);await page.getByRole('button',{name:'신속 기술 설명',exact:true}).click();assert.match(await page.locator('#bs-move-description-extremespeed-4').textContent(),/PP가 없습니다/);
    await page.locator('.bs-move-info').nth(3).focus();await page.keyboard.press('4');await page.waitForTimeout(100);assert.equal(posts.length,count);assert.deepEqual(await state(page),before);
    if(scenario==='pp-all-empty'){for(let i=0;i<4;i++)assert.ok(await cards.nth(i).isDisabled());assert.ok(await cards.nth(4).isEnabled());await cards.nth(4).click();await page.waitForFunction(()=>!document.querySelector('.battle-screen[data-playing=true]'));assert.equal(posts.at(-1).command.move,'struggle');}
   }else{assert.ok(await extreme.isEnabled());await extreme.click();await page.waitForTimeout(100);assert.equal(posts.at(-1).command.move,'extremespeed');}
   await page.screenshot({path:out+'/'+viewport.width+'-'+scenario+'.png',fullPage:true});results.push({viewport,scenario});
  }
  for(const scenario of ['rival-m','rival-f','trainer-normal','trainer-failed']){
   await open(page,scenario);await page.locator('.rc-npc-dialogue').waitFor();
   const expected='/game/trainers/'+(scenario==='trainer-normal'?'bug-superfan.png':scenario==='trainer-failed'?'fallback.svg':scenario+'.png');
   await page.waitForFunction(expected=>[...document.querySelectorAll('.bs-trainer>img,.bs-trainer-intro-portrait,.rc-npc-dialogue-portrait img')].length===3&&[...document.querySelectorAll('.bs-trainer>img,.bs-trainer-intro-portrait,.rc-npc-dialogue-portrait img')].every(i=>i.complete&&i.naturalWidth&&i.src.endsWith(expected)),expected);
   const sources=await page.locator('.bs-trainer>img,.bs-trainer-intro-portrait,.rc-npc-dialogue-portrait img').evaluateAll(nodes=>nodes.map(i=>({src:i.src,width:i.naturalWidth,height:i.naturalHeight})));
   if(scenario.startsWith('rival'))for(const image of sources)assert.deepEqual([image.width,image.height],scenario==='rival-f'?[70,70]:[69,69]);
   if(scenario.startsWith('rival'))assert.ok(await page.locator('.rc-npc-dialogue-portrait img').evaluate(img=>{const i=img.getBoundingClientRect(),p=img.parentElement.getBoundingClientRect();return i.left>=p.left&&i.right<=p.right&&i.top>=p.top&&i.bottom<=p.bottom;}),'rival portrait must show the full sprite, including the face');
   await page.screenshot({path:out+'/'+viewport.width+'-'+scenario+'.png',fullPage:true});await page.locator('.rc-npc-dialogue-skip').click();await page.locator('.rc-npc-dialogue').waitFor({state:'detached'});assert.equal(await page.locator('.bs-trainer>img').getAttribute('src'),expected);results.push({viewport,scenario,sources});
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 await writeFile(out+(process.env.UI_FOCUS==='trainers'?'/trainer-results.json':'/results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({passed:results.length}));
}finally{await browser.close();}
