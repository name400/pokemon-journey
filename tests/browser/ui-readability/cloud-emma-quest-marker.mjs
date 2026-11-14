import assert from 'node:assert/strict';
import {fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const width of [390,1280]){
 const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
 let world={area:3,district:'lumiose-rouge-sector6',interior:null,areaInfo:{name:'루주 6번지',biome:'city'},x:6,y:6,facing:'up',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'Emma의 의뢰',log:[],steps:0,zaEmmaMet:true,zaMission05Stage:7,zaBunnelbyQuest:1,zaTrackedQuestId:'1'};world.map=fieldMap(world);
 await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.route('**/api/world**',r=>{if(new URL(r.request().url()).searchParams.has('engineOnly'))return r.fulfill({json:{engine:'cloud'}});return r.fulfill({json:{engine:'cloud',revision:1,world,box:[mon],wallet:{coins:100,balls:5,potions:1},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null}});});
 await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5222')+'/?mode=adventure&tab=adventure');const canvas=page.locator('canvas.adv-field');await canvas.waitFor();assert.match(await canvas.getAttribute('aria-label'),/목적지가 현재 구역/);await page.locator('.adv-route-bar').getByText('루주 골목에서 큰 파르빗을 살피세요.').waitFor();await page.screenshot({path:`/tmp/emma-quest-marker-${width}.png`});
 world={...world,zaBunnelbyQuest:3};world.map=fieldMap(world);await page.reload();await canvas.waitFor();assert.doesNotMatch(await canvas.getAttribute('aria-label'),/목적지가 현재 구역/);await page.locator('.adv-route-bar').getByText('Emma의 의뢰').waitFor();assert.deepEqual(errors,[]);await page.close();console.log(`${width}: tracked target and completed fallback`);
}}finally{await browser.close();}
