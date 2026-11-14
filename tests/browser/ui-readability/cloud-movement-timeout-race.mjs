import assert from 'node:assert/strict';
import {fieldMap,stepField} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const scenario of ['fence-wins','movement-wins','reload-fence','blocked-storage','pending-fence-reload']){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.addInitScript(({blocked,limit})=>{if(blocked)Object.defineProperty(window,'sessionStorage',{get(){throw Error('storage blocked')}});const original=window.setTimeout;window.setTimeout=function(fn,delay,...args){return original(fn,delay===4000?limit:delay,...args);};},{blocked:scenario==='blocked-storage'||scenario==='pending-fence-reload',limit:scenario==='reload-fence'||scenario==='blocked-storage'?10000:300});
  const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀','독'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
  let world={area:3,district:'lumiose',interior:null,areaInfo:{name:'시험 구역',biome:'city'},x:3,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행',log:[],adventureBalls:{},steps:0};world.map=fieldMap(world);
  let revision=1,moves=0,fences=0,gets=0,resolveRecovery,releaseFirst,resolveFirst,resolveOldFence,releaseOldFence;const oldFence=new Promise(r=>resolveOldFence=r),oldFenceGate=new Promise(r=>releaseOldFence=r);const fenceInputs=[],outcomes=[],recovery=new Promise(r=>{resolveRecovery=r;}),firstGate=new Promise(r=>{releaseFirst=r;}),firstDone=new Promise(r=>{resolveFirst=r;}),state=()=>({engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null,world});
  await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  // Isolate the race fixture from real account and local sign-in state.
  await page.route('**/api/account',r=>r.fulfill({json:{authenticated:true,profile:{nickname:'격리 테스트'},signOut:'#'}}));
  await page.route('**/api/world**',async r=>{
   if(r.request().method()==='POST'){
    const b=r.request().postDataJSON();
    if(b.action==='movementFence'){
     fences++;fenceInputs.push({revision:b.revision,activeId:b.activeId});if(fences>1&&scenario==='movement-wins'){releaseFirst();await firstDone;}if((b.revision===null||b.revision===revision)&&(b.activeId==null||b.activeId===world.activeId))revision++;if(scenario==='pending-fence-reload'&&fences===2){resolveOldFence();await oldFenceGate;}try{return await r.fulfill({json:{settled:true}})}catch{return;}
    }
    const number=++moves;if(number===1)await firstGate;
    if(b.revision!==revision){outcomes.push([number,409]);if(number===1)resolveFirst();try{await r.fulfill({status:409,json:{error:'다른 화면에서 진행이 변경됐습니다.'}})}catch{}return;}
    for(const direction of b.path){const step=stepField(world,direction);if(step.blocked)break;world={...world,...step,steps:world.steps+1};if(step.transitioned)break;}revision++;outcomes.push([number,200]);if(number===1)resolveFirst();try{await r.fulfill({json:state()})}catch{}return;
   }
   if(new URL(r.request().url()).searchParams.has('engineOnly'))return r.fulfill({json:{engine:'cloud'}});
   gets++;await r.fulfill({json:state()});if(gets===2)resolveRecovery();
  });
  try{
   await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5222')+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();
   await page.keyboard.press('ArrowRight');if(scenario==='pending-fence-reload'){await oldFence;await page.reload();releaseOldFence();}else if(scenario==='reload-fence'||scenario==='blocked-storage'){for(let i=0;i<100&&moves<1;i++)await page.waitForTimeout(10);assert.equal(moves,1);await page.reload();}await recovery;const expectedX=scenario==='movement-wins'?4:3;
   await page.waitForFunction(x=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes(`현재 위치 ${x}, 8`),expectedX);
   // The fence-wins case reproduces recovery GET finishing before the old POST.
   releaseFirst();await firstDone;await page.waitForTimeout(120);
   // Reload can abort the old fetch early enough for its recovery to start before
   // the new page loads. Verify both exact request sequences and their revisions.
   const unloadRecovery=(scenario==='reload-fence'||scenario==='blocked-storage')&&fences===3;
   const entry={revision:null,activeId:null},oldMove={revision:2,activeId:'fixture'};
   assert.deepEqual(fenceInputs,scenario==='pending-fence-reload'||unloadRecovery?[entry,oldMove,entry]:scenario==='reload-fence'||scenario==='blocked-storage'?[entry,entry]:[entry,oldMove]);
   const settledRevision=scenario==='pending-fence-reload'||unloadRecovery?4:3;
   assert.equal(moves,1);assert.equal(revision,settledRevision);assert.equal(world.x,expectedX);assert.equal(world.steps,scenario==='movement-wins'?1:0);assert.deepEqual(outcomes,[[1,scenario==='movement-wins'?200:409]]);
   assert.ok((await page.locator('canvas.adv-field').getAttribute('aria-label')).includes(`현재 위치 ${expectedX}, 8`),'late request must not change the recovered position');
   await page.keyboard.press('ArrowDown');for(let i=0;i<100&&moves<2;i++)await page.waitForTimeout(20);for(let i=0;i<100&&revision<settledRevision+1;i++)await page.waitForTimeout(20);
   assert.equal(moves,2);assert.equal(revision,settledRevision+1);assert.deepEqual([world.x,world.y],[expectedX,9]);assert.equal(world.steps,scenario==='movement-wins'?2:1);
   console.log(`${scenario}: ${fences} fences; recovery and late request converge; next movement succeeds`);
  }finally{releaseFirst();await page.close();}
 }
}finally{await browser.close();}
