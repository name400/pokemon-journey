import assert from 'node:assert/strict';
import {fieldMap,stepField} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
await fetch(base+'/api/test-reset?scenario=single-layout',{method:'POST'});const fixtureBattle=(await(await fetch(base+'/api/rogue-classic')).json()).battle;
try{
 for(const scenario of ['same-revision','newer-revision','same-revision-position','same-revision-battle']){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
  let world={area:3,district:'lumiose',interior:null,inUnion:true,areaInfo:{name:'시험 구역',biome:'city'},x:3,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행',log:[],adventureBalls:{},steps:0};world.map=fieldMap(world);
  let revision=1,moves=0,pollStarted,releasePoll,releaseMove,battle=null;
  const pollStart=new Promise(r=>{pollStarted=r;}),pollGate=new Promise(r=>{releasePoll=r;}),moveGate=new Promise(r=>{releaseMove=r;});
  const state=()=>({engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle,world});
  await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.route('**/api/world**',async r=>{
   const url=new URL(r.request().url());
   if(r.request().method()==='POST'){
    const body=r.request().postDataJSON();if(body.action==='movementFence'){revision++;return r.fulfill({json:{settled:true}});}
    assert.equal(body.action,'move');moves++;await moveGate;
    if(body.revision!==revision)return r.fulfill({status:409,json:{error:'진행이 변경됐습니다.'}});
    const step=stepField(world,body.path[0]);world={...world,...step,steps:world.steps+1};revision++;return r.fulfill({json:state()});
   }
   if(url.searchParams.has('engineOnly'))return r.fulfill({json:{engine:'cloud'}});
   if(url.searchParams.has('light')){
    const old=structuredClone(state());pollStarted();await pollGate;
    if(scenario==='newer-revision'){revision++;world={...world,x:5};return r.fulfill({json:state()});}
    if(scenario==='same-revision-position'){world={...world,x:5};return r.fulfill({json:state()});}
    if(scenario==='same-revision-battle'){battle=fixtureBattle;return r.fulfill({json:state()});}
    return r.fulfill({json:old});
   }
   return r.fulfill({json:state()});
  });
  try{
   await page.goto(base+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();await pollStart;
   await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes('현재 위치 4, 8'));
   const response=page.waitForResponse(r=>r.request().url().includes('light=1'));releasePoll();await response;await page.waitForTimeout(150);
   if(scenario==='same-revision-battle')await page.getByText('야생 포켓몬과 배틀').waitFor();
   else{const label=await page.locator('canvas.adv-field').getAttribute('aria-label');assert.ok(label.includes(scenario==='same-revision'?'현재 위치 4, 8':'현재 위치 5, 8'),`${scenario}: ${label}`);}
   releaseMove();await page.waitForTimeout(250);assert.equal(moves,1);console.log(`${scenario}: correct position while poll and move overlap`);
  }finally{releasePoll();releaseMove();await page.close();}
 }
}finally{await browser.close();}
