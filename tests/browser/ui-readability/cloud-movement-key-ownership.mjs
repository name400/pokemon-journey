import assert from 'node:assert/strict';
import {fieldMap,stepField} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const scenario of ['repeat','same-direction']){
 const page=await browser.newPage({viewport:{width:390,height:844}}),mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
 let world={area:3,district:'lumiose',interior:null,areaInfo:{name:'시험',biome:'city'},x:2,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행',log:[],adventureBalls:{},steps:0};world.map=fieldMap(world);
 let revision=1,posts=0,inflight=0,releaseFirst;const paths=[],gate=new Promise(r=>{releaseFirst=r;}),state=()=>({engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null,world});
 await page.addInitScript(()=>{window.__keyAudit=[];window.addEventListener('keydown',e=>window.__keyAudit.push([e.key,e.repeat]));});
 await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg"/>'}));
 await page.route('**/api/world**',async r=>{if(r.request().method()==='POST'){const b=r.request().postDataJSON();if(b.action==='movementFence'){revision++;return r.fulfill({json:{settled:true}});}assert.equal(b.action,'move');inflight++;paths.push(b.path);if(++posts===1)await gate;for(const d of b.path){const step=stepField(world,d);if(step.blocked)break;world={...world,...step,facing:d,steps:world.steps+1};if(step.transitioned)break;}revision++;inflight--;}await r.fulfill({json:state()});});
 try{
  await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5230')+'/?mode=adventure&tab=adventure');const canvas=page.locator('canvas.adv-field');await canvas.waitFor();
  if(scenario==='repeat'){
   await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>/현재 위치 3, 8/.test(document.querySelector('canvas.adv-field')?.getAttribute('aria-label')||''));
   await page.keyboard.down('ArrowUp');await page.keyboard.down('ArrowRight');await page.waitForTimeout(400);await page.keyboard.up('ArrowRight');await page.keyboard.up('ArrowUp');
  }else{
   await page.keyboard.down('w');await page.waitForFunction(()=>/현재 위치 2, 7/.test(document.querySelector('canvas.adv-field')?.getAttribute('aria-label')||''));
   await page.keyboard.down('ArrowUp');await page.keyboard.up('w');await page.waitForTimeout(400);await page.keyboard.up('ArrowUp');
  }
  const label=await canvas.getAttribute('aria-label'),m=/현재 위치 (\d+), (\d+)/.exec(label||'');assert.ok(m,label);
  assert.equal(+m[1],scenario==='repeat'?3:2,`${scenario}: unintended horizontal move: ${label}`);assert.ok(+m[2]<=6,`${scenario}: new direction should continue: ${label}`);
  if(scenario==='repeat')assert.ok((await page.evaluate(()=>window.__keyAudit)).some(([key,repeat])=>key==='ArrowRight'&&repeat));
  releaseFirst();for(let i=0;i<100&&(world.x!==+m[1]||world.y!==+m[2]||inflight);i++)await page.waitForTimeout(50);assert.deepEqual([world.x,world.y],[+m[1],+m[2]]);assert.equal(world.steps,paths.flat().length);
  console.log(`${scenario}: latest key owns held movement and server path`);
 }finally{releaseFirst();await page.close();}
}}finally{await browser.close();}
