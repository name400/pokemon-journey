import assert from 'node:assert/strict';
import {fieldMap,fieldDialogue} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const width of [390,1280]){
 const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));let revision=1;
 const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
 const world={area:3,district:'lumiose-quasartico',interior:'quasarticoOffice',areaInfo:{name:'콰자르티코 사무실',biome:'city'},x:11,y:6,facing:'up',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'Jett의 이야기를 듣자',log:[],steps:0,zaMission31Stage:1,zaMission31JettSceneV1:{version:1,step:1}};
 const state=()=>{world.map=fieldMap(world);world.interaction=fieldDialogue(world,world.map);return {engine:'cloud',revision,world,box:[mon],wallet:{coins:100,balls:5,potions:1},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null};};
 await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.route('**/api/account',r=>r.fulfill({json:{authenticated:true,profile:{nickname:'격리 검사'},signOut:'#'}}));
 await page.route('**/api/world**',r=>{if(new URL(r.request().url()).searchParams.has('engineOnly'))return r.fulfill({json:{engine:'cloud'}});if(r.request().method()==='POST'){const b=r.request().postDataJSON();if(b.action==='movementFence'){revision++;return r.fulfill({json:{settled:true}});}assert.equal(b.action,'advanceMission31JettScene');assert.equal(b.step,world.zaMission31JettSceneV1.step);if(b.step===4){delete world.zaMission31JettSceneV1;world.zaMission31Stage=2;}else world.zaMission31JettSceneV1={version:1,step:b.step+1};revision++;}return r.fulfill({json:state()});});
 await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:55371')+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();
 for(let step=1;step<=4;step++){
  const scene=page.locator('dialog[open] .adv-mission35-scene');await scene.waitFor();assert.equal(await scene.locator('.adv-mission35-people span').count(),3);assert.ok(await page.locator('canvas.adv-field').isVisible());
  if(step===2){await page.reload();await scene.waitFor();assert.match(await scene.innerText(),/재개발/);}
  await scene.getByRole('button',{name:step===4?'이야기 마치기':'다음'}).click();
 }
 await page.locator('dialog[open] .adv-mission35-scene').waitFor({state:'detached'});assert.equal(world.zaMission31Stage,2);assert.equal(world.interior,'quasarticoOffice');assert.deepEqual(errors,[]);await page.close();
}console.log('Mission 31 Jett scene: mobile and desktop, dialogue and reload (mock API).');}finally{await browser.close();}
