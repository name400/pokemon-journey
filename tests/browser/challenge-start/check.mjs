// Isolated real-page/controller test. Never uses account saves or production APIs.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {CLASSIC_CHALLENGE_LIMITS} from '../../../lib/rogue-challenge-rules.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.CHALLENGE_TEST_URL||'http://127.0.0.1:5214',artifacts='.sites-runtime/tests/challenge-start/artifacts';
await mkdir(artifacts,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const rows=[];
try{
 for(const size of [{width:390,height:844,mobile:true},{width:375,height:667,mobile:true},{width:844,height:390,mobile:true},{width:1280,height:850,mobile:false}]){
  const page=await browser.newPage({viewport:{width:size.width,height:size.height},isMobile:size.mobile,hasTouch:true,reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"/>'}));
  await page.request.post(base+'/api/test-reset');
  await page.goto(base+'/?mode=rogue&tab=rogue');
  await page.getByRole('button',{name:'새 도전 시작',exact:true}).first().tap();
  await page.locator('.rss-mon').first().waitFor();
  // Challenge selection happens before starter configuration so rule-dependent
  // catalogs, costs, IVs and allowed moves can update before the team is chosen.
  await page.locator('.rss-challenge summary').tap();
  const controls=page.locator('.rss-challenge select'),expectedIds=Object.keys(CLASSIC_CHALLENGE_LIMITS).map(Number).filter(id=>id!==0&&id!==1);
  assert.deepEqual(expectedIds.sort((a,b)=>a-b),[4,5,6,7,8,9,10,11,12]);
  assert.equal(await controls.count(),expectedIds.length+2);
  for(let index=2;index<await controls.count();index++){
   const control=controls.nth(index);await control.scrollIntoViewIfNeeded();
   assert.ok(await control.evaluate(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),`challenge control ${index} is covered`);
   await control.selectOption({index:(await control.locator('option').count())-1});
   // Keyboard must also reach and operate the actual native control.
   await control.focus();await page.keyboard.press('Home');assert.equal(await control.inputValue(),'0');await page.keyboard.press('End');assert.notEqual(await control.inputValue(),'0');
  }
  await page.screenshot({path:`${artifacts}/${size.width}x${size.height}.png`});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page must not overflow horizontally');
  await page.locator('.rss-challenge summary').tap();
  await page.locator('.rss-mon[data-starter-id="1"]').tap();
  await page.getByRole('button',{name:/파티에 추가/}).tap();
  // Mobile detail intentionally covers the page. Return using its visible back
  // button, rather than trying to tap controls behind that detail panel.
  const back=page.getByRole('button',{name:'포켓몬 목록으로 돌아가기',exact:true});
  if(await back.isVisible())await back.tap();
  const responsePromise=page.waitForResponse(r=>r.url().includes('/api/rogue-classic')&&r.request().method()==='POST'&&r.request().postDataJSON()?.action==='start');
  await page.getByRole('button',{name:'이 파티로 도전 시작',exact:true}).tap();
  const response=await responsePromise;assert.ok(response.ok(),await response.text());
  await page.locator('.rogue-starters-screen').waitFor({state:'detached'});
  const state=await(await page.request.get(base+'/api/test-state')).json(),saved=Object.values(state).find(value=>value?.slots),run=saved.slots.find(Boolean);
  assert.deepEqual(run.challenges.map(c=>c.id).sort((a,b)=>a-b),expectedIds.sort((a,b)=>a-b));
  assert.deepEqual(run.challenges.map(({id,value})=>({id,value})).sort((a,b)=>a.id-b.id),response.request().postDataJSON().challenges.map(({id,value})=>({id,value})).sort((a,b)=>a.id-b.id));
  assert.equal(run.party[0].rogueFlipStats,true);
  await page.reload();assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),state);
  assert.deepEqual(errors,[]);rows.push({viewport:`${size.width}x${size.height}`,challengeCount:expectedIds.length,reachable:true,keyboard:true,start:true,reload:true});await page.close();
 }
 console.log(JSON.stringify(rows));
}finally{await browser.close();}
