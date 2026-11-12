import assert from 'node:assert/strict';
import {fieldMap,stepField} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀','독'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
const district=process.env.CLOUD_TEST_DISTRICT||'lumiose',simulateBlock=process.env.CLOUD_TEST_BLOCK==='1',startX=Number(process.env.CLOUD_TEST_X||2),startY=Number(process.env.CLOUD_TEST_Y||8);
let world={area:3,district,interior:null,areaInfo:{name:'시험 구역',biome:'city'},x:startX,y:startY,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행',log:[],adventureBalls:{},steps:0};world.map=fieldMap(world);
let revision=1,posts=0,inflight=0,maxInflight=0;const paths=[],state=()=>({engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null,world});
let releaseFirst,firstStarted;const gate=new Promise(r=>{releaseFirst=r;}),started=new Promise(r=>{firstStarted=r;});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.route('**/api/world**',async r=>{
  if(r.request().method()==='POST'){
   posts++;inflight++;maxInflight=Math.max(maxInflight,inflight);const body=r.request().postDataJSON();assert.equal(body.revision,revision);assert.ok(body.path.length<=8);paths.push(body.path);
   if(posts===1){firstStarted();await gate;if(simulateBlock){inflight--;return r.fulfill({status:409,json:{error:'진행이 변경됐습니다.'}});}}
   for(const direction of body.path){const step=stepField(world,direction);if(step.blocked)break;world={...world,...step,steps:world.steps+1};if(step.transitioned)break;}
   revision++;inflight--;
  }
  await r.fulfill({json:state()});
 });
 await page.goto(base+'/?mode=adventure&tab=adventure');const canvas=page.locator('canvas.adv-field');await canvas.waitFor();await page.keyboard.down('ArrowRight');await started;
 await page.waitForTimeout(620);const label=await canvas.getAttribute('aria-label'),match=/현재 위치 (\d+), (\d+)/.exec(label||'');assert.ok(match);const visible=Number(match[1]);assert.ok(visible>=startX+6,`prediction stopped too soon at ${visible}`);assert.equal(posts,1,'server requests must remain sequential');assert.equal(world.x,startX,'preview must not mutate the authoritative position');
 await page.keyboard.up('ArrowRight');releaseFirst();if(simulateBlock){await page.waitForFunction(({x,y})=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes(`현재 위치 ${x}, ${y}`),{x:startX,y:startY});await page.waitForTimeout(150);assert.equal(posts,1);assert.equal(world.steps,0);}else{await page.waitForFunction(({x,y})=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes(`현재 위치 ${x}, ${y}`),{x:visible,y:startY});for(let i=0;i<30&&world.x!==visible;i++)await page.waitForTimeout(50);assert.equal(world.x,visible);assert.equal(world.steps,visible-startX);assert.equal(posts,2);assert.equal(paths.flat().length,world.steps);}assert.equal(maxInflight,1);console.log(`${district}: delayed preview ${visible}; server ${simulateBlock?'rejection rolls back':'confirms ordered steps'}`);await page.close();
}finally{releaseFirst?.();await browser.close();}
