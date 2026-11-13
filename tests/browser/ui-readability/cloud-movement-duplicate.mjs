import assert from 'node:assert/strict';
import {fieldMap,stepField} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:844}}),stopForMenu=process.env.CLOUD_TEST_STOP==='menu';
await page.addInitScript(()=>{window.__queueTrace=[];window.__movementTrace=(type,detail)=>window.__queueTrace.push({type,detail,t:performance.now()});});
let world={area:3,district:'lumiose',interior:null,areaInfo:{name:'시험',biome:'city'},x:2,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행',log:[],adventureBalls:{},steps:0};world.map=fieldMap(world);
const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
let revision=1,fences=0,moves=0,gets=0,firstReply,releaseFirst;const paths=[],gate=new Promise(resolve=>releaseFirst=resolve),state=()=>({engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null,world});
await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
await page.route('**/api/world**',async r=>{
 if(r.request().method()==='POST'){
  const b=r.request().postDataJSON();
  if(b.action==='movementFence'){fences++;if(b.revision===null||b.revision===revision)revision++;return r.fulfill({json:{settled:true}});}
  assert.equal(b.action,'move');assert.equal(b.revision,revision);moves++;paths.push(b.path);if(moves===1)await gate;
  for(const direction of b.path){const step=stepField(world,direction);assert.ok(!step.blocked);world={...world,...step,facing:direction,steps:world.steps+1};}revision++;
  if(moves===1)firstReply=structuredClone(state());
  // Save the second request once, but deliver a stale copy of the first ACK.
  // The client must recover uncertainty rather than accept it or replay input.
  if(moves===2)return r.fulfill({json:firstReply});
 }else gets++;
 return r.fulfill({json:state()});
});
try{
 await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5222')+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();const initialGets=gets;await page.keyboard.down('ArrowRight');
 await page.waitForFunction(()=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes('현재 위치 7, 8'));await page.keyboard.up('ArrowRight');if(stopForMenu)await page.keyboard.press('b');const stoppedAt=await page.evaluate(()=>performance.now());releaseFirst();
 if(stopForMenu){await page.waitForFunction(()=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes('현재 위치 3, 8'));await page.waitForTimeout(250);assert.equal(moves,1);assert.equal(world.steps,1);assert.equal(fences,1);assert.equal(paths.flat().length,1);if(process.env.TRACE_INTERNAL){const trace=await page.evaluate(()=>window.__queueTrace);assert.ok(trace.some(e=>e.type==='draw-target'&&e.detail.step!==undefined));assert.ok(!trace.some(e=>e.t>stoppedAt&&e.type==='draw-target'&&e.detail.step!==undefined),'menu must discard unrendered speculative waypoints');}console.log('menu stop: sent step settles once; unsent visual suffix discarded');}
 else {
 await page.waitForFunction(()=>!!document.querySelector('canvas.adv-field'));for(let i=0;i<100&&(fences<2||gets<=initialGets);i++)await page.waitForTimeout(30);
 assert.equal(gets,initialGets+1);assert.equal(fences,2);assert.equal(moves,2);assert.equal(world.steps,paths.flat().length);await page.waitForFunction(({x,y})=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes(`현재 위치 ${x}, ${y}`),world);
 await page.waitForTimeout(150);assert.equal(moves,2,'duplicate ACK must never replay saved movement');console.log('duplicate ACK: saved path recovered once, stale prefix ignored, no replay');
 }
}finally{releaseFirst();await browser.close();}
