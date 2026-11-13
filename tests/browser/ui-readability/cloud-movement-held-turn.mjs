import assert from 'node:assert/strict';
import {fieldMap,stepField} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:844}});
const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀','독'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
let world={area:3,district:'lumiose',interior:null,areaInfo:{name:'시험 구역',biome:'city'},x:2,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행',log:[],adventureBalls:{},steps:0};world.map=fieldMap(world);
let revision=1,inflight=0,maxInflight=0,posts=0,releaseFirst;const paths=[],gate=new Promise(r=>{releaseFirst=r;}),state=()=>({engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null,world});
await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
await page.route('**/api/world**',async r=>{
 if(r.request().method()==='POST'){
  const b=r.request().postDataJSON();if(b.action==='movementFence'){if((b.revision===null||b.revision===revision)&&(b.activeId==null||b.activeId===world.activeId))revision++;return r.fulfill({json:{settled:true}});}assert.equal(b.revision,revision);posts++;inflight++;maxInflight=Math.max(maxInflight,inflight);paths.push(b.path);
  if(posts===1)await gate;
  for(const direction of b.path){const step=stepField(world,direction);if(step.blocked)break;world={...world,...step,facing:direction,steps:world.steps+1};if(step.transitioned)break;}
  revision++;inflight--;
 }
 await r.fulfill({json:state()});
});
try{
 await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5222')+'/?mode=adventure&tab=adventure');const canvas=page.locator('canvas.adv-field');await canvas.waitFor();
 await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>/현재 위치 6, 8/.test(document.querySelector('canvas.adv-field')?.getAttribute('aria-label')||''));await page.keyboard.up('ArrowRight');
 const start=Date.now();await page.keyboard.down('ArrowUp');await page.waitForTimeout(350);await page.keyboard.up('ArrowUp');
 const before=/현재 위치 (\d+), (\d+)/.exec(await canvas.getAttribute('aria-label'));const x=+before[1],y=+before[2];
 console.log(JSON.stringify({turnHoldMs:Date.now()-start,previewX:x,previewY:y,previewSteps:8-y}));
 assert.ok(y<=6,'held turn should advance more than one tile before the first request settles');
 releaseFirst();for(let i=0;i<100&&(world.x!==x||world.y!==y||inflight);i++)await page.waitForTimeout(50);
 assert.deepEqual([world.x,world.y],[x,y]);assert.equal(world.steps,paths.flat().length);assert.equal(maxInflight,1);
 const directions=paths.flat();assert.deepEqual(directions,[...Array(x-2).fill('right'),...Array(8-y).fill('up')]);
}finally{releaseFirst();await browser.close();}
