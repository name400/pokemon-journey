// Run against movement-trace.vite.config.mjs; all movement responses are mocked.
import assert from 'node:assert/strict';
import {fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:844}}),base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
let world={area:3,district:'lumiose',interior:null,areaInfo:{name:'시험',biome:'city'},x:2,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행',log:[],adventureBalls:{},steps:0,zaFieldCrouched:true};world.map=fieldMap(world);
let revision=1,posts=0,release;const gate=new Promise(r=>{release=r;}),state=()=>({engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null,world});
try{
 await page.addInitScript(()=>{window.__movementTraceEvents=[];window.__movementTrace=(type,detail)=>window.__movementTraceEvents.push({type,detail});});
 await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg"/>'}));
 await page.route('**/api/world**',async r=>{if(r.request().method()==='POST'){const b=r.request().postDataJSON();if(b.action==='movementFence'){revision++;return r.fulfill({json:{settled:true}});}assert.equal(b.action,'move');posts++;await gate;return r.fulfill({status:409,json:{error:'이동이 차단되었습니다.'}});}return r.fulfill({json:state()});});
 await page.goto(base+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();await page.keyboard.press('ArrowRight');
 await page.waitForFunction(()=>window.__movementTraceEvents.some(e=>e.type==='draw-target'&&e.detail.step!==undefined),null,{timeout:5000});
 await page.waitForTimeout(65);release();
 await page.waitForFunction(()=>window.__movementTraceEvents.some(e=>e.type==='draw-correction'&&e.detail.cancelled),null,{timeout:5000});
 const event=await page.evaluate(()=>window.__movementTraceEvents.find(e=>e.type==='draw-correction'&&e.detail.cancelled).detail);
 assert.deepEqual(event.target,{x:2,y:8});assert.ok(event.from.x>2&&event.from.x<3);assert.ok(event.duration>0&&event.duration<150);assert.equal(posts,1);
 await page.waitForTimeout(200);assert.match(await page.locator('canvas.adv-field').getAttribute('aria-label'),/현재 위치 2, 8/);
 console.log('collision: short same-segment correction is animated toward authoritative position');
}finally{release?.();await browser.close();}
