import assert from 'node:assert/strict';
import {fieldMap,stepField} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
await fetch(base+'/api/test-reset?scenario=single-layout',{method:'POST'});const fixtureBattle=(await(await fetch(base+'/api/rogue-classic')).json()).battle;
try{
 for(const scenario of ['confirmed','touch','corrected','queued','no-target','encounter','failed','partner-changed']){
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:scenario==='touch',isMobile:scenario==='touch'});
  const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
  let world={area:3,district:'lumiose',interior:null,areaInfo:{name:'시험 구역',biome:'city'},x:3,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행',log:[],adventureBalls:{},steps:0};world.map=fieldMap(world);
  let revision=1,posts=0,release,battle=null;const gate=new Promise(resolve=>{release=resolve;});
  const state=()=>({engine:'cloud',revision,box:[mon,{...mon,boxId:'other'}],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle,world});
  await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.route('**/api/world**',async r=>{
   if(r.request().method()==='POST'){
    const body=r.request().postDataJSON();
    if(body.action==='movementFence'){revision++;return r.fulfill({json:{settled:true}});}
    assert.equal(body.action,'move');posts++;await gate;
    if(scenario==='failed')return r.fulfill({status:409,json:{error:'이동이 충돌했습니다.'}});
    if(scenario!=='corrected'){const step=stepField(world,body.path[0]);world={...world,...step,steps:world.steps+1};}
    world.interaction=scenario==='no-target'?null:{name:'검증 안내자',text:'서버가 확인한 대화입니다.'};if(scenario==='encounter')battle=fixtureBattle;if(scenario==='partner-changed')world.activeId='other';revision++;
   }
   return r.fulfill({json:state()});
  });
  try{
   await page.goto(base+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();
   if(scenario==='touch')await page.getByRole('button',{name:'오른쪽로 이동'}).tap();else await page.keyboard.press('ArrowRight');
   await page.waitForFunction(()=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes('현재 위치 4, 8'));
   if(scenario==='queued'){await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes('현재 위치 5, 8'));}
   if(scenario==='touch')await page.getByRole('button',{name:/대화/}).tap();else await page.keyboard.press('e');const response=page.waitForResponse(r=>r.request().method()==='POST'&&r.request().postDataJSON()?.action==='move');release();await response;
   await page.waitForFunction(()=>!document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes('현재 위치 5, 8'));
   if(scenario==='confirmed'||scenario==='touch')await page.getByRole('dialog').getByText('서버가 확인한 대화입니다.').waitFor();
   else{await page.waitForTimeout(250);assert.equal(await page.getByRole('dialog').count(),0,scenario);}
   if(['queued','corrected','partner-changed'].includes(scenario))assert.ok(await page.getByText('위치가 확정된 뒤 다시 대화해 주세요.').count());
   if(scenario==='no-target')assert.ok(await page.getByText('NPC나 건물 입구로 다가가 바라본 뒤 대화하세요.').count());
   if(scenario==='encounter')await page.getByText('야생 포켓몬과 배틀').waitFor();
   assert.equal(posts,1,scenario);console.log(`${scenario}: authoritative position and interaction respected`);
  }finally{release();await page.close();}
 }
}finally{await browser.close();}
