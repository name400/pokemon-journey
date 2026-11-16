import assert from 'node:assert/strict';
import {fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
try{
 for(const [scenario,viewport] of [['single-layout',{width:390,height:844}],['double-layout',{width:1280,height:800}]]){
  await fetch(base+'/api/test-reset?scenario='+scenario,{method:'POST'});const original=(await(await fetch(base+'/api/rogue-classic')).json()).battle;
  const battle=structuredClone(original);battle.events=[];battle.log=[];
  const p=battle.teams[0][battle.requests[0].active];const mon={...p,boxId:'fixture',experience:0,expToNext:20,evolutions:[]};
  const world={area:3,district:'lumiose',interior:null,areaInfo:{name:'시험 구역',biome:'city'},x:2,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행',log:[],adventureBalls:{},steps:0};world.map=fieldMap(world);
  let revision=1,actions=[];const state=()=>({engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle,world});
  const page=await browser.newPage({viewport});await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.route('**/api/world**',async r=>{if(r.request().method()==='POST'){const body=r.request().postDataJSON();if(body.action==='movementFence'){revision++;return r.fulfill({json:{settled:true}});}actions.push(body);revision++;}return r.fulfill({json:state()});});
  await page.goto(base+'/?mode=adventure&tab=adventure');const dialog=page.getByRole('dialog',{name:'포켓몬 배틀'});await dialog.waitFor();assert.equal(await dialog.evaluate(el=>el.matches(':modal')),true);
  const rect=await dialog.boundingBox();assert.ok(rect&&rect.x>=0&&rect.y>=0&&rect.x+rect.width<=viewport.width+1&&rect.y+rect.height<=viewport.height+1,JSON.stringify({scenario,rect}));
  await page.reload();await dialog.waitFor();assert.equal(await dialog.evaluate(el=>el.matches(':modal')),true,'battle popup restores after reload');
  await page.keyboard.press('Escape');assert.equal(await dialog.evaluate(el=>el.open),true,'Escape cannot dismiss an active battle');
  await page.mouse.click(1,1);assert.equal(await dialog.evaluate(el=>el.open),true,'backdrop cannot dismiss an active battle');
  await page.keyboard.press('ArrowUp');assert.equal(actions.some(a=>a.action==='move'),false,'field movement must not leak through a battle modal');
  await page.screenshot({path:`/tmp/adventure-battle-popup-${scenario}.png`});
  const move=dialog.locator('.bs-move button, button.bs-move').first();await move.scrollIntoViewIfNeeded();await move.waitFor({state:'visible'});assert.ok(await move.isEnabled(),'a battle move remains selectable');await move.click();
  if(scenario==='single-layout'){await page.waitForTimeout(300);assert.ok(actions.some(a=>a.action==='battle'),'battle action reaches API');}
  console.log(JSON.stringify({scenario,viewport,rect,actions:actions.map(a=>a.action)}));await page.close();
 }
}finally{await browser.close();}
