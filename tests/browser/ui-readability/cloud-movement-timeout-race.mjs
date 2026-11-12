import assert from 'node:assert/strict';
import {fieldMap,stepField} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const scenario of ['second-wins','first-wins']){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.addInitScript(()=>{const original=window.setTimeout;window.setTimeout=function(fn,delay,...args){return original(fn,delay===4000?300:delay,...args);};});
  const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀','독'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
  let world={area:3,district:'lumiose',interior:null,areaInfo:{name:'시험 구역',biome:'city'},x:3,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행',log:[],adventureBalls:{},steps:0};world.map=fieldMap(world);
  let revision=1,posts=0,gets=0,resolveRecovery,releaseFirst,resolveFirst;const outcomes=[],recovery=new Promise(r=>{resolveRecovery=r;}),firstGate=new Promise(r=>{releaseFirst=r;}),firstDone=new Promise(r=>{resolveFirst=r;}),state=()=>({engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null,world});
  await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.route('**/api/world**',async r=>{
   if(r.request().method()==='POST'){
    const b=r.request().postDataJSON(),number=++posts;assert.equal(b.revision,1);
    if(number===1)await firstGate;else if(scenario==='first-wins'){releaseFirst();await firstDone;}
    if(b.revision!==revision){outcomes.push([number,409]);if(number===1)resolveFirst();try{await r.fulfill({status:409,json:{error:'다른 화면에서 진행이 변경됐습니다.'}})}catch{}return;}
    for(const direction of b.path){const step=stepField(world,direction);if(step.blocked)break;world={...world,...step,steps:world.steps+1};if(step.transitioned)break;}revision++;outcomes.push([number,200]);if(number===1)resolveFirst();if(number===2&&scenario==='second-wins')releaseFirst();try{await r.fulfill({json:state()})}catch{}return;
   }
   if(new URL(r.request().url()).searchParams.has('engineOnly'))return r.fulfill({json:{engine:'cloud'}});
   gets++;await r.fulfill({json:state()});if(gets===2)resolveRecovery();
  });
  try{
   await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5222')+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();
   await page.keyboard.press('ArrowRight');await recovery;await page.waitForTimeout(50);await page.keyboard.press('ArrowDown');for(let i=0;i<100&&outcomes.length<2;i++)await new Promise(r=>setTimeout(r,20));
   assert.equal(posts,2,'a timeout must not automatically resend a mutation');assert.equal(revision,2);assert.equal(world.steps,1);assert.deepEqual(outcomes.sort((a,b)=>a[0]-b[0]),scenario==='second-wins'?[[1,409],[2,200]]:[[1,200],[2,409]]);
   await page.reload();await page.locator('canvas.adv-field').waitFor();const expected=scenario==='second-wins'?'현재 위치 3, 9':'현재 위치 4, 8';await page.waitForFunction(expected=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes(expected),expected);
   console.log(`${scenario}: one saved movement, stale request rejected and reload reconciled`);
  }finally{releaseFirst();await page.close();}
 }
}finally{await browser.close();}
