import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldMap,fieldDialogue} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),mon={...makeMon(25,30),boxId:'owned',evs:{hp:100,atk:0,def:0,spa:0,spd:0,spe:0},expToNext:100};
 page.on('pageerror',e=>console.error('pageerror',e.message));page.on('console',m=>{if(m.type()==='error')console.error('console',m.text())});
 let revision=1,shards=5,requests=0,world={area:3,areaInfo:{name:'사무소',biome:'city',min:1,max:30},district:'lumiose-rust',interior:'rustOffice',x:14,y:7,facing:'up',teamIds:['owned'],activeId:'owned',zaMission20Complete:true,zaMission20Stage:15,zaMegaShards:shards,badges:[],objective:'여행',log:[],adventureBalls:{}};
 const state=()=>{world={...world,zaMegaShards:shards};world.map=fieldMap(world);world.interaction=fieldDialogue(world,world.map);return {engine:'cloud',revision,world,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null};};
 await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.route('**/api/world**',async r=>{if(r.request().method()==='POST'){const b=r.request().postDataJSON();if(b.action==='movementFence'){revision++;return r.fulfill({json:{settled:true}});}assert.equal(b.action,'resetAdventureEvs');assert.equal(b.boxId,'owned');assert.equal(b.confirmed,true);assert.equal(b.revision,revision);requests++;shards-=5;mon.evs.hp=0;revision++;}if(new URL(r.request().url()).searchParams.has('engineOnly'))return r.fulfill({json:{engine:'cloud'}});return r.fulfill({json:state()});});
 await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5222')+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor({timeout:10000}).catch(async e=>{console.log('page:',await page.locator('body').innerText());throw e});await page.keyboard.press('e');await page.getByText('메가조각 5개로 선택한 파티 포켓몬의 노력치를 모두 초기화합니다.').waitFor();
 page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'피카츄 · Lv.30'}).click();assert.equal(requests,0);assert.equal(shards,5);
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'피카츄 · Lv.30'}).click();await page.waitForFunction(()=>!document.body.innerText.includes('메가조각 5개로 선택한 파티 포켓몬의 노력치를 모두 초기화합니다.'));assert.equal(requests,1);assert.equal(shards,0);assert.equal(mon.evs.hp,0);await page.reload();await page.locator('canvas.adv-field').waitFor();assert.equal(requests,1);console.log('Lady Clear confirmation, party choice and restored state verified');
}finally{await browser.close();}
