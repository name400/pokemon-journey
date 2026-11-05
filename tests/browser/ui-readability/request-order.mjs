import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createFixture} from './fixture.mjs';
import {applyClassicAction,classicGameView,activeClassicRun} from '../../../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../../../lib/rogue-classic-state.mjs';
import {grantClassicVoucher} from '../../../lib/rogue-egg-shop.mjs';
import {makeReferenceMon} from '../../../lib/rogue-reference.mjs';
import {encodeGameData,decodeGameData} from '../../../lib/game-storage.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5224',out='.sites-runtime/tests/request-order',results=[];
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
async function setup(clock=false){
 const context=await browser.newContext({viewport:{width:1280,height:850},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 if(clock)await page.clock.install({time:new Date('2026-11-05T12:00:00Z')});
 await page.route('https://**/*',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 return {context,page,errors};
}
async function waitUntil(predicate){const deadline=Date.now()+10000;while(!predicate()){assert.ok(Date.now()<deadline,'Timed out waiting for the held background read');await new Promise(resolve=>setTimeout(resolve,10));}}
async function settle(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
try{
 // Use real 15s pickup polling, real DTOs and real draw validation. Hold only
 // transport responses; no calls into React's component internals.
 {
  const {context,page,errors}=await setup(true),doc=createFixture('battle');grantClassicVoucher(ensureClassicState(doc).system,'regular');
  assert.throws(()=>applyClassicAction(structuredClone(doc),{action:'drawEggs',machineId:'legendary',voucherType:'regular',quantity:1,expectedFeaturedId:249},{pickupSourceId:250}),/픽업이 갱신/);
  let reads=0,held,post;const ids=[null,150,249,250],snapshot=n=>({...classicGameView(doc,{pickupSourceId:ids[n]}),revision:0,pickupVersion:n});
  await page.route('**/api/rogue-classic*',async route=>{
   if(route.request().method()==='POST'){post=route.request().postDataJSON();const extra=applyClassicAction(doc,post,{pickupSourceId:250});await route.fulfill({json:{...snapshot(3),...extra,revision:1}});return;}
   if(route.request().url().includes('pickupOnly')){await route.fulfill({json:{pickupVersion:reads+1}});return;}
   reads++;if(reads===2){held=route;return;}await route.fulfill({json:snapshot(reads)});
  });
  await page.goto(base+'/?mode=rogue&tab=eggs');await page.locator('.rc-machine-pickup').filter({hasText:'뮤츠'}).waitFor();
  await page.clock.fastForward(15000); // First background full read remains in flight.
  await waitUntil(()=>held);
  await page.clock.fastForward(15000);await page.locator('.rc-machine-pickup').filter({hasText:'칠색조'}).waitFor();
  await held.fulfill({json:snapshot(2)});await settle(page);
  assert.match(await page.locator('.rc-machine-pickup b').textContent(),/칠색조/);
  await Promise.all([page.waitForResponse(r=>r.request().method()==='POST'&&r.url().includes('rogue-classic')),page.locator('.rc-pull-option').first().click()]);
  assert.equal(post.expectedFeaturedId,250);assert.equal(ensureClassicState(doc).system.eggs.length,1);assert.deepEqual(errors,[]);
  results.push({case:'reverse equal-revision pickup reads',reads,expectedFeaturedId:post.expectedFeaturedId,eggs:1});await context.close();
 }
 // A lookup started in the egg shop must not post an obsolete failure after
 // selecting a slot succeeds. The old failure used to overwrite the success.
 for(const oldReadFails of [false,true]){
  const {context,page,errors}=await setup(true),doc=createFixture('battle');let revision=0,reads=0,held,posts=[];
  const snapshot=()=>({...classicGameView(doc),revision,pickupVersion:1});
  await page.route('**/api/rogue-classic*',async route=>{
   if(route.request().method()==='POST'){const payload=route.request().postDataJSON();posts.push(payload);assert.equal(payload.revision,revision);const extra=applyClassicAction(doc,payload);revision++;await route.fulfill({json:{...snapshot(),...extra}});return;}
   if(route.request().url().includes('pickupOnly')){await route.fulfill({json:{pickupVersion:2}});return;}
   reads++;if(reads===2){held={route,data:snapshot()};return;}await route.fulfill({json:snapshot()});
  });
  await page.goto(base+'/?mode=rogue&tab=eggs');await page.locator('.rc-machine-pickup').waitFor();await page.clock.fastForward(15000);
  await waitUntil(()=>held);
  await page.getByRole('button',{name:'저장 슬롯',exact:true}).click();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('button',{name:'싸운다',exact:true}).waitFor();
  await held.route.fulfill(oldReadFails?{status:500,json:{error:'격리된 오래된 조회 실패'}}:{json:held.data});await settle(page);
  assert.equal(await page.locator('.rc-error').count(),0);await page.getByRole('button',{name:'싸운다',exact:true}).click();await Promise.all([page.waitForResponse(r=>r.request().method()==='POST'&&r.request().postDataJSON()?.action==='turn'),page.locator('.bs-move').first().click()]);assert.deepEqual(posts.map(p=>[p.action,p.revision]),[['selectSlot',0],['turn',1]]);assert.equal(revision,2);assert.deepEqual(errors,[]);
  results.push({case:'old read after selectSlot',oldReadFails,posts:posts.map(p=>({action:p.action,revision:p.revision}))});await context.close();
 }
 // Pending trainer dialogue blocks the actual UI keyboard command. After the
 // dialogue is acknowledged the real engine accepts the selected flat move.
 {
  const {context,page,errors}=await setup(),doc=createFixture('trainer');let revision=0,posts=[];
  await page.route('**/api/rogue-classic*',async route=>{let extra={};if(route.request().method()==='POST'){const p=route.request().postDataJSON();assert.equal(p.revision,revision);posts.push(p);extra=applyClassicAction(doc,p);revision++;}await route.fulfill({json:{...classicGameView(doc),...extra,revision}});});
  await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('dialog').waitFor();const before=posts.length;
  await page.locator('.battle-screen').press('1');assert.equal(posts.length,before);
  while(await page.getByRole('dialog').count()){await page.getByRole('dialog').getByRole('button',{name:'건너뛰기'}).click();await settle(page);}
  await page.getByRole('button',{name:'싸운다',exact:true}).click();await Promise.all([page.waitForResponse(r=>r.request().method()==='POST'&&r.request().postDataJSON()?.action==='turn'),page.locator('.bs-move').first().click()]);
  assert.equal(posts.at(-1).command.type,'move');assert.deepEqual(errors,[]);results.push({case:'trainer dialogue UI gate',actions:posts.map(p=>p.action),commandType:posts.at(-1).command.type});await context.close();
 }
 // Exercise the actual single UI payload through three Wobbuffet turns,
 // encoding/restoring the save between every action as the API does.
 {
  const {context,page,errors}=await setup();let doc=createFixture('battle'),run=activeClassicRun(doc),revision=0,turns=[];
  Object.assign(run,{wave:22,biome:4,screen:'mystery',combat:undefined,mysteryRule:'part-timer-v17',party:[makeReferenceMon(151,40,{boxId:'hero',moves:['Splash']})],tools:{},encounter:{kind:'mystery',key:'fun-and-games'},mystery:{type:'fun-and-games',stage:'choose'}});
  applyClassicAction(doc,{action:'mysterySelect',job:'play',boxId:'hero'});applyClassicAction(doc,{action:'mysteryConfirm'});
  await page.route('**/api/rogue-classic*',async route=>{let extra={};if(route.request().method()==='POST'){const p=route.request().postDataJSON();assert.equal(p.revision,revision);if(p.action==='turn')turns.push(p.command);extra=applyClassicAction(doc,p);doc=await decodeGameData(await encodeGameData(doc));revision++;}await route.fulfill({json:{...classicGameView(doc),...extra,revision}});});
  await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  for(let i=0;i<3;i++){await page.getByRole('button',{name:'싸운다',exact:true}).click();await Promise.all([page.waitForResponse(r=>r.request().method()==='POST'&&r.request().postDataJSON()?.action==='turn'),page.locator('.bs-move').first().click()]);}
  assert.equal(turns.length,3);assert.ok(turns.every(command=>command.type==='move'&&command.move==='splash'));assert.equal(activeClassicRun(doc).mystery.turns,3);assert.equal(activeClassicRun(doc).screen,'reward');await page.getByRole('button',{name:'보상 선택',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'싸운다',exact:true}).count(),0);await page.getByRole('button',{name:'보상 선택',exact:true}).click();assert.equal(turns.length,3);assert.deepEqual(errors,[]);
  results.push({case:'Wobbuffet actual UI and save round trips',turns,screen:activeClassicRun(doc).screen});await context.close();
 }
 await writeFile(out+'/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({passed:results.length,results}));
}finally{await browser.close();}
