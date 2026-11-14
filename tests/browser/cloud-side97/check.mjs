import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldMap,fieldDialogue} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const mon={...makeMon(152,5),boxId:'lead',evolutions:[]},world={area:3,district:'lumiose-south-boulevard',interior:null,x:11,y:8,facing:'up',areaInfo:{name:'남쪽 대로',biome:'city'},teamIds:['lead'],activeId:'lead',badges:[],objective:'휠구 찾기',log:[],zaSide97Stage:1,zaSide97MotionV1:{version:1,index:0,tick:0}};world.map=fieldMap(world);world.interaction=fieldDialogue(world,world.map);
 const page=await browser.newPage({viewport}),errors=[],images=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>{images.push(r.request().url());return r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#a652bb"/></svg>'});});
 await page.route('**/api/world**',async r=>{if(new URL(r.request().url()).searchParams.has('engineOnly'))return r.fulfill({json:{engine:'cloud'}});return r.fulfill({json:{engine:'cloud',revision:1,world,box:[mon],wallet:{coins:100,balls:5,potions:0},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null}});});
 await page.goto((process.env.TEST_URL||'http://127.0.0.1:5236')+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();await page.keyboard.press('e');await page.getByRole('dialog').getByText('포획할 수 없다.',{exact:false}).waitFor();await page.getByRole('button',{name:'휠구와 배틀'}).waitFor();assert.ok(images.some(url=>url.includes('/544.png')),JSON.stringify(images));assert.deepEqual(errors,[]);await page.close();
}console.log('Runaway Whirlipede field and battle prompt: mobile and PC (mock API).');}finally{await browser.close();}
