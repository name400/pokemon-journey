// Run with movement-trace.vite.config.mjs and an isolated mocked /api/world.
import assert from 'node:assert/strict';
import {fieldMap,stepField} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
await fetch(base+'/api/test-reset?scenario=single-layout',{method:'POST'});
const fixtureBattle=(await(await fetch(base+'/api/rogue-classic')).json()).battle;
try{
 for(const scenario of ['success','encounter','collision']){
  const page=await browser.newPage({viewport:{width:390,height:844}}),mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
  let world={area:3,district:'lumiose',interior:null,areaInfo:{name:'시험',biome:'city'},x:2,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행',log:[],adventureBalls:{},steps:0,zaWildAlphaAlert:true};world.map=fieldMap(world);
  let revision=1,battle=null,releaseFirst,firstStarted,inflight=0,maxInflight=0;const paths=[],gate=new Promise(r=>{releaseFirst=r;}),started=new Promise(r=>{firstStarted=r;}),state=()=>({engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle,world});
  await page.addInitScript(()=>{window.__movementTraceEvents=[];window.__movementTrace=(type,detail)=>window.__movementTraceEvents.push({type,detail});});
  await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.route('**/api/world**',async r=>{
   if(r.request().method()==='POST'){
    const b=r.request().postDataJSON();if(b.action==='movementFence'){if((b.revision===null||b.revision===revision)&&(b.activeId==null||b.activeId===world.activeId))revision++;return r.fulfill({json:{settled:true}});}
    assert.equal(b.action,'move');assert.equal(b.revision,revision);paths.push(b.path);inflight++;maxInflight=Math.max(maxInflight,inflight);
    if(paths.length===1){firstStarted();await gate;if(scenario==='collision'){inflight--;return r.fulfill({status:409,json:{error:'이동이 차단되었습니다.'}});}}
    for(const direction of b.path){const next=stepField(world,direction);if(next.blocked)break;world={...world,...next,facing:direction,steps:world.steps+1};if(scenario==='encounter'){battle=fixtureBattle;break;}if(next.transitioned)break;}
    revision++;inflight--;
   }
   return r.fulfill({json:state()});
  });
  try{
   await page.goto(base+'/?mode=adventure&tab=adventure');const canvas=page.locator('canvas.adv-field');await canvas.waitFor();await page.keyboard.press('ArrowRight');await started;
   await page.evaluate(()=>{for(const key of ['ArrowRight','ArrowUp','ArrowUp','ArrowRight']){window.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));window.dispatchEvent(new KeyboardEvent('keyup',{key,bubbles:true}));}});
   await page.waitForFunction(()=>window.__movementTraceEvents.filter(e=>e.type==='draw-target'&&e.detail.step!==undefined).length>=4,null,{timeout:5000});
   const targets=await page.evaluate(()=>window.__movementTraceEvents.filter(e=>e.type==='draw-target').map(e=>e.detail));assert.deepEqual(targets.slice(0,4).map(x=>x.target),[{x:3,y:8},{x:4,y:8},{x:4,y:7},{x:4,y:6}]);assert.ok(targets.every(x=>x.step!==undefined&&Math.abs(x.target.x-x.previous.x)+Math.abs(x.target.y-x.previous.y)===1),'hazard preview must follow cardinal steps');assert.equal(paths.length,1);assert.deepEqual([world.x,world.y,world.steps],[2,8,0]);
   releaseFirst();
   if(scenario==='success'){await page.waitForFunction(()=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes('현재 위치 5, 6'),null,{timeout:5000});for(let i=0;i<50&&world.steps!==5;i++)await page.waitForTimeout(50);assert.deepEqual([world.x,world.y,world.steps],[5,6,5]);assert.deepEqual(paths.flat(),['right','right','up','up','right']);}
   else if(scenario==='encounter'){await page.getByText('야생 포켓몬과 배틀',{exact:true}).first().waitFor();await page.waitForTimeout(150);assert.deepEqual([world.x,world.y,world.steps],[3,8,1]);assert.equal(paths.length,1);assert.match(await canvas.getAttribute('aria-label'),/현재 위치 3, 8/);}
   else{await page.waitForFunction(()=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes('현재 위치 2, 8'),null,{timeout:5000});await page.waitForTimeout(150);assert.deepEqual([world.x,world.y,world.steps],[2,8,0]);assert.equal(paths.length,1);}
   assert.equal(maxInflight,1);console.log(`${scenario}: ordered hazard preview and authoritative movement`);
  }finally{releaseFirst?.();await page.close();}
 }
}finally{await browser.close();}
