import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldMap,fieldDialogue} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const world={area:3,district:'lumiose-magenta-sector4',interior:null,x:5,y:7,facing:'up',zaRoyaleRank:'F',zaSide25Stage:1,zaSide25TrailV1:[{x:3,y:7},{x:4,y:7},{x:6,y:7}],areaInfo:{name:'마젠타 4번지',biome:'city'},teamIds:['lead'],activeId:'lead',badges:[],objective:'깨봉이 안내',log:[],weather:''};world.map=fieldMap(world);world.interaction=fieldDialogue(world,world.map);const mon={...makeMon(152,5),boxId:'lead',expToNext:100,evolutions:[]};const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect x="12" y="12" width="72" height="72" fill="#469d47"/><circle cx="32" cy="40" r="6" fill="#ffffff"/><circle cx="64" cy="40" r="6" fill="#ffffff"/></svg>'}));
 await page.route('**/api/world**',async r=>new URL(r.request().url()).searchParams.has('engineOnly')?r.fulfill({json:{engine:'cloud'}}):r.fulfill({json:{engine:'cloud',revision:1,world,box:[mon],wallet:{coins:100,balls:0,potions:0},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null}}));
 await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5235')+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();await page.keyboard.press('e');await page.getByText('맛있는 쓰레기를 따라오는 깨봉이들을 수거 장소로 데려가자.').waitFor();await page.screenshot({path:`/tmp/side25-${viewport.width}.png`});assert.deepEqual(errors,[]);await page.close();
}console.log('Side 25 follower scene: PC and mobile (mock API).');}finally{await browser.close();}
