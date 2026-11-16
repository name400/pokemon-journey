import assert from 'node:assert/strict';
import {fieldMap,stepField} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();
const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀','독'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
let world={area:3,district:'lumiose',interior:null,areaInfo:{name:'시험 구역',biome:'city'},x:2,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행',log:[],adventureBalls:{},steps:0};world.map=fieldMap(world);
let revision=1,posts=0,inflight=0,maxInflight=0,releaseFirst;const paths=[],gate=new Promise(r=>{releaseFirst=r;}),state=()=>({engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null,world});
await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg"/>'}));
await page.route('**/api/world**',async r=>{if(r.request().method()==='POST'){const b=r.request().postDataJSON();if(b.action==='movementFence'){revision++;return r.fulfill({json:{settled:true}});}assert.equal(b.action,'move');inflight++;maxInflight=Math.max(maxInflight,inflight);paths.push(b.path);if(++posts===1)await gate;for(const direction of b.path){const step=stepField(world,direction);if(step.blocked)break;world={...world,...step,facing:direction,steps:world.steps+1};if(step.transitioned)break;}revision++;inflight--;}await r.fulfill({json:state()});});
try{
 await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5229')+'/?mode=adventure&tab=adventure');const canvas=page.locator('canvas.adv-field');await canvas.waitFor();const right=page.getByRole('button',{name:'오른쪽로 이동'}),up=page.getByRole('button',{name:'위로 이동'});await right.scrollIntoViewIfNeeded();const r=await right.boundingBox(),u=await up.boundingBox();assert.ok(r&&u);
 await page.evaluate(()=>{window.__touchAudit=[];for(const t of ['pointerdown','pointerup','pointercancel','lostpointercapture'])document.addEventListener(t,e=>{if(e.target.closest?.('.adv-dpad'))window.__touchAudit.push([t,e.pointerId,e.target.getAttribute('aria-label')]);},true);});
 const client=await context.newCDPSession(page),p=(id,box)=>({id,x:Math.round(box.x+box.width/2),y:Math.round(box.y+box.height/2)}),first=p(1,r),second=p(2,u);
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first]});await page.waitForFunction(()=>/현재 위치 3, 8/.test(document.querySelector('canvas.adv-field')?.getAttribute('aria-label')||''));
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[first,second]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[first]});
 await page.waitForTimeout(550);const label=await canvas.getAttribute('aria-label'),match=/현재 위치 (\d+), (\d+)/.exec(label||'');assert.ok(match,label);const events=await page.evaluate(()=>window.__touchAudit);assert.ok(+match[2]<=6,`second held touch must continue moving up after first is released: ${label}; ${JSON.stringify(events)}`);
 await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});releaseFirst();
 for(let i=0;i<100&&(world.x!==+match[1]||world.y!==+match[2]||inflight);i++)await page.waitForTimeout(50);
 assert.deepEqual([world.x,world.y],[+match[1],+match[2]]);assert.equal(maxInflight,1);assert.equal(world.steps,paths.flat().length);
 const settled=world.steps;await page.waitForTimeout(250);assert.equal(world.steps,settled,'the remaining release stops further movement');
 console.log('overlapping touch release preserves the later held direction and server path');
}finally{releaseFirst();await browser.close();}
