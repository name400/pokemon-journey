// Requires movement-trace.vite.config.mjs. Responses are isolated mocks.
import assert from 'node:assert/strict';
import {fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const direction of ['right','up']){
 const page=await browser.newPage({viewport:{width:390,height:844}}),base=process.env.UI_TEST_URL||'http://127.0.0.1:5229';
 const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
 let world={area:3,district:'lumiose',interior:null,areaInfo:{name:'시험',biome:'city'},x:2,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행',log:[],adventureBalls:{},steps:0,zaFieldCrouched:true};world.map=fieldMap(world);
 let revision=1,posts=0,releaseFirst,releaseSecond;const firstGate=new Promise(r=>{releaseFirst=r;}),secondGate=new Promise(r=>{releaseSecond=r;}),state=()=>({engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null,world});
 try{
  await page.addInitScript(()=>{window.__movementTraceEvents=[];window.__movementTrace=(type,detail)=>window.__movementTraceEvents.push({type,detail});});
  await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg"/>'}));
  await page.route('**/api/world**',async r=>{if(r.request().method()==='POST'){const b=r.request().postDataJSON();if(b.action==='movementFence'){revision++;return r.fulfill({json:{settled:true}});}assert.equal(b.action,'move');posts++;if(posts===1)await firstGate;else await secondGate;return r.fulfill({status:409,json:{error:'이동이 차단되었습니다.',code:'MOVEMENT_PRECHECK_CONFLICT'}});}return r.fulfill({json:state()});});
  await page.goto(base+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();await page.keyboard.press('ArrowRight');
  await page.waitForFunction(()=>window.__movementTraceEvents.some(e=>e.type==='draw-position'&&e.detail.x>2.6&&e.detail.x<2.9),null,{timeout:5000});releaseFirst();
  await page.waitForFunction(()=>window.__movementTraceEvents.some(e=>e.type==='draw-correction'&&e.detail.cancelled),null,{timeout:5000});
  const first=await page.evaluate(()=>window.__movementTraceEvents.filter(e=>e.type==='draw-generation').length);await page.keyboard.press(direction==='right'?'ArrowRight':'ArrowUp');
  await page.waitForFunction(n=>window.__movementTraceEvents.filter(e=>e.type==='draw-generation').length>n,first,{timeout:5000});const event=await page.evaluate(()=>window.__movementTraceEvents.filter(e=>e.type==='draw-generation').at(-1).detail);
  assert.ok(event.from.x>2&&event.from.x<3);assert.deepEqual(event.origin,{x:2,y:8});assert.ok(event.restart&&event.restart.duration>0,'continue from the drawn position');
  assert.deepEqual([event.restart.targetX,event.restart.targetY],direction==='right'?[3,8]:[2,8]);assert.equal(event.restart.step,direction==='right'?1:-1);
  if(direction==='up')await page.waitForFunction(()=>window.__movementTraceEvents.some(e=>e.type==='draw-target'&&e.detail.step===1&&e.detail.target.x===2&&e.detail.target.y===7),null,{timeout:5000});
  assert.deepEqual([world.x,world.y,world.steps],[2,8,0]);
  if(direction==='right'){
   const count=await page.evaluate(()=>window.__movementTraceEvents.filter(e=>e.type==='draw-correction'&&e.detail.cancelled).length);
   releaseSecond();await page.waitForFunction(n=>window.__movementTraceEvents.filter(e=>e.type==='draw-correction'&&e.detail.cancelled).length>n,count,{timeout:5000});
   const correction=await page.evaluate(()=>window.__movementTraceEvents.filter(e=>e.type==='draw-correction'&&e.detail.cancelled).at(-1).detail);
   assert.ok(correction.duration>0,'a second rejection retraces the recorded segment');assert.deepEqual(correction.target,{x:2,y:8});
  }else releaseSecond();
  console.log(`${direction}: restart follows the safe segment and authoritative position`);
 }finally{releaseFirst?.();releaseSecond?.();await page.close();}
}}finally{await browser.close();}
