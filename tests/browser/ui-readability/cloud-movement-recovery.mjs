import assert from 'node:assert/strict';
import {fieldMap,stepField} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const scenario of ['success','recovery','failed-recovery']){
  const failRecovery=scenario==='failed-recovery';
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.addInitScript(()=>{const original=window.setTimeout;window.setTimeout=function(fn,delay,...args){return original(fn,delay===12000?80:delay,...args);};});
  const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀','독'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
  let world={area:3,district:'lumiose',interior:null,areaInfo:{name:'미르시티',biome:'city',min:2,max:5},x:3,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행을 시작하세요',log:[],adventureBalls:{},steps:0,completed:true,hallOfFame:[],interaction:{name:'상점 안내원',text:'상점을 살펴보세요.',action:'shop',label:'상점 열기'}};world.map=fieldMap(world);
  let revision=1,posts=0,gets=0;
  const state=()=>({engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5,potions:2},inventory:{},fieldShop:[{id:'potion',name:'시험 도구',price:20}],expeditions:[{id:1,name:'시험 장소',region:1}],gameTime:{period:'day'},battle:null,world});
  await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.route('**/api/world**',async r=>{
   if(r.request().method()==='POST'){
    posts++;const body=r.request().postDataJSON();assert.equal(body.action,'move');assert.equal(body.compact,true);const step=stepField(world,body.path?.[0]||body.direction);assert.ok(!step.blocked);world={...world,...step,steps:world.steps+1};revision++;
    if(scenario!=='success')await new Promise(resolve=>setTimeout(resolve,300));try{await r.fulfill({json:{...state(),boxMode:'patch',fieldShop:undefined,expeditions:undefined}});}catch{}return;
   }
   if(new URL(r.request().url()).searchParams.has('engineOnly'))return r.fulfill({json:{engine:'cloud'}});
   gets++;if(failRecovery&&gets===2)return r.fulfill({status:503,json:{error:'연결 실패'}});await r.fulfill({json:state()});
  });
  await page.goto(base+'/?mode=adventure&tab=adventure');const canvas=page.locator('canvas.adv-field');await canvas.waitFor();await page.keyboard.press('ArrowRight');
  if(failRecovery){await page.getByRole('button',{name:'다시 불러오기'}).waitFor();assert.equal(posts,1);await page.keyboard.press('ArrowRight');assert.equal(posts,1);await page.getByRole('button',{name:'다시 불러오기'}).click();}
  await page.waitForFunction(()=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes('현재 위치 4, 8'));
  await page.waitForTimeout(350);assert.equal(posts,1,'timed-out mutation must not be retried');assert.equal(world.x,4);assert.equal(revision,2);if(scenario==='success'){assert.equal(gets,1);await page.keyboard.press('e');await page.getByRole('button',{name:'상점 열기'}).click();await page.getByText('시험 도구',{exact:true}).waitFor();await page.getByRole('button',{name:'닫기'}).click();await page.getByLabel(/여행 수첩 열기/).click();assert.equal(await page.locator('option').filter({hasText:'시험 장소'}).count(),1);}else assert.ok(gets>=2);await page.close();
 }
 console.log('compact movement retains catalogs; timeout recovery and failed reload retry do not duplicate moves');
}finally{await browser.close();}
