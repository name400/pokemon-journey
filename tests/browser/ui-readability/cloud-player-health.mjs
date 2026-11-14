import assert from 'node:assert/strict';
import {fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const mon={boxId:'fixture',id:152,speciesId:152,name:'치코리타',types:['풀'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
 let revision=1,world={area:3,district:'lumiose-wild',interior:null,areaInfo:{name:'야생 구역',biome:'city'},x:3,y:7,facing:'up',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'탐험',log:[],steps:0,zaPlayerVitalsV1:{version:1,hp:100,lastCenterId:'hotel'}};world.map=fieldMap(world);
 const state=()=>({engine:'cloud',revision,world,box:[mon],wallet:{coins:100,balls:5,potions:1},inventory:{},gameTime:{period:'day'},battle:null});
 await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.route('**/api/account',r=>r.fulfill({json:{authenticated:true,profile:{nickname:'격리 테스트'},signOut:'#'}}));
 await page.route('**/api/world**',async r=>{if(r.request().method()==='POST'){const b=r.request().postDataJSON();if(b.action==='movementFence'){revision++;return r.fulfill({json:{settled:true}});}assert.equal(b.action,'move');world={...world,x:3,y:6,steps:1,zaPlayerVitalsV1:{...world.zaPlayerVitalsV1,hp:90}};world.map=fieldMap(world);revision++;return r.fulfill({json:{...state(),boxMode:'patch'}});}if(new URL(r.request().url()).searchParams.has('engineOnly'))return r.fulfill({json:{engine:'cloud'}});return r.fulfill({json:{...state(),fieldShop:[],expeditions:[]}});});
 await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5222')+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();const health=page.getByText('플레이어 체력: 100/100');await health.waitFor();const rect=await health.boundingBox();assert.ok(rect&&rect.x>=0&&rect.x+rect.width<=viewport.width);
 await page.keyboard.press('ArrowUp');await page.getByText('플레이어 체력: 90/100').waitFor();await page.reload();await page.getByText('플레이어 체력: 90/100').waitFor();assert.deepEqual(errors,[]);await page.close();console.log(`${viewport.width}: player health is visible and survives reload`);
}}finally{await browser.close();}
