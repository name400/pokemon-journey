import assert from 'node:assert/strict';
import {fieldMap,stepField} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
try{
 for(const scenario of ['keyboard','pointer','multi','multi-held','multi-rejected','turn-partial','rejected','blocked']){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀','독'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
  let world={area:3,district:'lumiose',interior:null,areaInfo:{name:'시험 구역',biome:'city'},x:2,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행',log:[],adventureBalls:{},steps:0};world.map=fieldMap(world);
  let revision=1,posts=0,inflight=0,maxInflight=0,releaseFirst;const paths=[],gate=new Promise(r=>{releaseFirst=r;}),state=()=>({engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null,world});
  await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.route('**/api/world**',async r=>{
   if(r.request().method()==='POST'){
    const b=r.request().postDataJSON();if(b.action==='movementFence'){if(b.revision===revision&&(b.activeId==null||b.activeId===world.activeId))revision++;return r.fulfill({json:{settled:true}});}assert.equal(b.revision,revision);posts++;inflight++;maxInflight=Math.max(maxInflight,inflight);paths.push(b.path);
    if(posts===1)await gate;if((scenario==='multi-held'&&posts>1)||(scenario==='turn-partial'&&posts===3))await new Promise(resolve=>setTimeout(resolve,350));
    if((scenario==='rejected'&&posts===2)||(scenario==='multi-rejected'&&posts===3)){inflight--;return r.fulfill({status:409,json:{error:'진행이 변경됐습니다.'}});}
    for(const direction of b.path){const step=stepField(world,direction);if(step.blocked)break;world={...world,...step,steps:world.steps+1};if(step.transitioned||(scenario==='blocked'&&posts===2)||(scenario==='turn-partial'&&posts===3))break;}
    revision++;inflight--;
   }
   await r.fulfill({json:state()});
  });
  try{
   await page.goto(base+'/?mode=adventure&tab=adventure');const canvas=page.locator('canvas.adv-field');await canvas.waitFor();
   await page.evaluate(()=>{window.__turnPositions=[];const el=document.querySelector('canvas.adv-field');new MutationObserver(()=>{const match=/현재 위치 (\d+), (\d+)/.exec(el.getAttribute('aria-label')||'');if(match)window.__turnPositions.push([+match[1],+match[2]]);}).observe(el,{attributes:true,attributeFilter:['aria-label']});});
   if(scenario==='pointer'){const r=await page.getByRole('button',{name:'오른쪽로 이동'}).boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();}else await page.keyboard.down('ArrowRight');
   await page.waitForFunction(()=>{const m=/현재 위치 (\d+), (\d+)/.exec(document.querySelector('canvas.adv-field')?.getAttribute('aria-label')||'');return m&&Number(m[1])>=6;});
   if(scenario==='pointer')await page.mouse.up();else await page.keyboard.up('ArrowRight');
   const before=/현재 위치 (\d+), (\d+)/.exec(await canvas.getAttribute('aria-label')),x=Number(before[1]);
   if(scenario==='pointer'){const r=await page.getByRole('button',{name:'위로 이동'}).boundingBox();await page.mouse.click(r.x+r.width/2,r.y+r.height/2);}else await page.keyboard.press('ArrowUp');
   await page.waitForFunction(x=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes(`현재 위치 ${x}, 7`),x);
   if(scenario==='multi'||scenario==='multi-held'||scenario==='multi-rejected'||scenario==='turn-partial'){if(scenario==='turn-partial')await page.keyboard.down('ArrowLeft');else await page.keyboard.press('ArrowLeft');await page.waitForFunction(x=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes(`현재 위치 ${x-1}, 7`),x);}
   if(scenario==='multi-held'){await page.keyboard.down('ArrowUp');await page.waitForFunction(x=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes(`현재 위치 ${x-1}, 6`),x);}
   releaseFirst();
   if(scenario==='multi-held')await page.keyboard.up('ArrowUp');
   if(scenario==='rejected'||scenario==='blocked'||scenario==='multi-rejected'||scenario==='turn-partial'){
    const lastX=scenario==='multi-rejected'||scenario==='turn-partial'?x:scenario==='rejected'?3:4,lastY=scenario==='turn-partial'?7:8;await page.waitForFunction(({x,y})=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes(`현재 위치 ${x}, ${y}`),{x:lastX,y:lastY});await page.waitForTimeout(200);if(scenario==='turn-partial')await page.keyboard.up('ArrowLeft');assert.equal(posts,scenario==='multi-rejected'||scenario==='turn-partial'?3:2);assert.deepEqual([world.x,world.y,world.steps],[lastX,lastY,lastX-2+(scenario==='turn-partial'?1:0)]);
   }else{
    const multiple=scenario==='multi'||scenario==='multi-held',targetX=multiple?x-1:x,targetY=scenario==='multi-held'?6:7;await page.waitForFunction(({x,y})=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes(`현재 위치 ${x}, ${y}`),{x:targetX,y:targetY});for(let i=0;i<100&&(world.x!==targetX||world.y!==targetY);i++)await page.waitForTimeout(50);
    assert.deepEqual([world.x,world.y,world.steps],[targetX,targetY,x-2+(scenario==='multi-held'?3:multiple?2:1)]);assert.equal(paths.length,3);assert.deepEqual(paths[0],['right']);assert.deepEqual(paths[1],Array(x-3).fill('right'));assert.deepEqual(paths[2],scenario==='multi-held'?['up','left','up']:multiple?['up','left']:['up']);
    const positions=await page.evaluate(()=>window.__turnPositions);const turn=positions.findIndex(([px,py])=>px===targetX&&py===targetY);assert.ok(turn>=0);assert.ok(positions.slice(turn).every(([px,py])=>px===targetX&&py===targetY),'accepted turns must not jump back while their earlier steps are confirmed');
   }
   assert.equal(maxInflight,1);console.log(`${scenario}: buffered steps retained; ${scenario==='rejected'||scenario==='blocked'||scenario==='multi-rejected'||scenario==='turn-partial'?'server stop cancels the turn':'turn follows confirmed steps'}`);
  }finally{releaseFirst();await page.close();}
 }
}finally{await browser.close();}
