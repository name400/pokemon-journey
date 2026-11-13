import assert from 'node:assert/strict';
import {fieldMap,stepField} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844}}),a=await context.newPage(),b=await context.newPage();
await context.addInitScript(()=>{const original=window.setTimeout;window.setTimeout=function(fn,delay,...args){return original(fn,delay===4000?15000:delay,...args);};});
const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀','독'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
let world={area:3,district:'lumiose',interior:null,areaInfo:{name:'시험 구역',biome:'city'},x:3,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행',log:[],adventureBalls:{},steps:0};world.map=fieldMap(world);
const precheck=process.env.MOVEMENT_PRECHECK!=='0';
let revision=1,moves=0,fences=0,releaseFirst,firstArrived,resolveRecovery;const gate=new Promise(r=>{releaseFirst=r;}),arrived=new Promise(r=>{firstArrived=r;}),recovery=new Promise(r=>{resolveRecovery=r;}),outcomes=[];
const state=()=>({engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null,world});
await context.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
await context.route('**/api/world**',async r=>{
 if(r.request().method()==='POST'){
  const body=r.request().postDataJSON();if(body.action==='movementFence'){fences++;if((body.revision===null||body.revision===revision)&&(body.activeId==null||body.activeId===world.activeId))revision++;return r.fulfill({json:{settled:true}});}
  const n=++moves;if(n===1){firstArrived();await gate;}if(body.revision!==revision){outcomes.push([n,409]);return r.fulfill({status:409,json:{error:'다른 화면에서 진행이 변경됐습니다.',...(precheck?{code:'MOVEMENT_PRECHECK_CONFLICT'}:{})}});}
  for(const dir of body.path){const next=stepField(world,dir);if(next.blocked)break;world={...world,...next,facing:dir,steps:world.steps+1};if(next.transitioned)break;}revision++;outcomes.push([n,200]);
 }
 const isRecovery=r.request().method()==='GET'&&r.request().frame().page()===a&&outcomes.some(([n,status])=>n===1&&status===409);
 await r.fulfill({json:state()});if(isRecovery)resolveRecovery();
});
try{
 const url=(process.env.UI_TEST_URL||'http://127.0.0.1:5222')+'/?mode=adventure&tab=adventure';
 await a.goto(url);await a.locator('canvas.adv-field').waitFor();await b.goto(url);await b.locator('canvas.adv-field').waitFor();
 // A reloads after B's initial fence so its next move uses the current revision.
 await a.reload();await a.locator('canvas.adv-field').waitFor();await a.keyboard.press('ArrowRight');await arrived;
 const before=revision;await b.reload();await b.locator('canvas.adv-field').waitFor();assert.equal(revision,before+1);
 releaseFirst();await recovery;await a.waitForFunction(()=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes('현재 위치 3, 8'));
 for(let i=0;i<100&&outcomes.length<1;i++)await a.waitForTimeout(20);assert.deepEqual(outcomes,[[1,409]]);assert.equal(world.steps,0);assert.equal(fences,precheck?4:5);
 await a.bringToFront();await a.waitForTimeout(100);await a.keyboard.press('ArrowDown');for(let i=0;i<100&&outcomes.length<2;i++)await a.waitForTimeout(20);
 assert.deepEqual(outcomes,[[1,409],[2,200]]);assert.deepEqual([world.x,world.y,world.steps,world.facing],[3,9,1,'down']);
 console.log(JSON.stringify({fences,outcomes,position:[world.x,world.y],steps:world.steps}));
}finally{releaseFirst();await browser.close();}
