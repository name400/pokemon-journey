import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.SAFARI_TEST_URL||'http://127.0.0.1:5216',artifacts='.sites-runtime/tests/safari-recovery';await mkdir(artifacts,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const rows=[];
try{for(const size of [{width:390,height:844},{width:375,height:667},{width:844,height:390},{width:1280,height:850}]){
 const context=await browser.newContext({viewport:size,isMobile:size.width<900,hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',route=>route.fulfill({status:200,body:'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"/>',contentType:'image/svg+xml'}));
 const state=async()=>await(await page.request.get(base+'/api/test-state')).json();
 for(const outcome of ['old-save','release','replace','auto-add','no-capture']){
  await page.request.post(base+'/api/test-reset?outcome='+outcome);await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  const before=await state(),old=before.classic.slots[0];
  if(outcome!=='old-save'){
   await page.getByRole('button',{name:outcome==='no-capture'?'이 포켓몬에게서 도망친다':'몬스터볼을 던진다',exact:true}).tap();
   if(outcome==='release'||outcome==='replace'){
    await page.getByRole('heading',{name:/을\(를\) 잡았다!/}).waitFor();await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
    await (outcome==='release'?page.getByRole('button',{name:'도감에 등록하고 놓아주기',exact:true}):page.getByRole('button',{name:/대신 파티에 추가/}).nth(1)).tap();
   }
  }
  await page.getByRole('region',{name:'43층 돌파 보상',exact:true}).waitFor();let saved=await state();assert.equal(saved.classic.slots[0].rewards.length,0);assert.equal(saved.classic.slots[0].screen,'reward');
  if(process.env.EXPECT_SAFARI_BLOCKED==='1'){assert.equal(await page.getByRole('button',{name:'다음으로',exact:true}).count(),0);await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('region',{name:'43층 돌파 보상',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'다음으로',exact:true}).count(),0);await page.screenshot({path:artifacts+'/before.png'});console.log(JSON.stringify({baseline:true,stuckAfterReload:true,viewport:size}));break;}
  await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();const next=page.getByRole('button',{name:'다음으로',exact:true});await next.waitFor();await next.scrollIntoViewIfNeeded();
  const hit=await next.evaluate(b=>{const r=b.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {reachable:b.contains(hit),rect:r.toJSON(),hit:hit?.outerHTML,viewport:{width:innerWidth,height:innerHeight}};});await page.screenshot({path:`${artifacts}/hit-${size.width}x${size.height}.png`});assert.ok(hit.reachable,JSON.stringify({outcome,...hit}));
  assert.ok(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));if(outcome==='old-save')await page.screenshot({path:`${artifacts}/after-${size.width}x${size.height}.png`});
  if(size.width>=900){await next.focus();await page.keyboard.press('Enter');}else await next.tap();
  await page.waitForFunction(()=>document.querySelector('.rc-shell')?.textContent?.includes('44'));saved=await state();const run=saved.classic.slots[0];assert.equal(run.wave,44);assert.equal(run.money,old.money);assert.equal(run.party.length,outcome==='auto-add'?2:6);if(outcome==='release'||outcome==='old-save'||outcome==='no-capture')assert.deepEqual(run.party.map(p=>p.boxId),old.party.map(p=>p.boxId));assert.deepEqual(saved.adventure,{safe:true});assert.deepEqual(saved.classic.slots[1],{id:'other-slot',unchanged:true});rows.push({...size,outcome,reconnect:true,nextWave:run.wave});
 }
 assert.deepEqual(errors,[]);await context.close();if(process.env.EXPECT_SAFARI_BLOCKED==='1')break;
}console.log(JSON.stringify(rows));}finally{await browser.close();}
