import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldMap,fieldDialogue} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const mon={...makeMon(152,5),boxId:'lead',evolutions:[]},world={area:3,district:'lumiose-zone15',interior:null,x:18,y:6,facing:'up',areaInfo:{name:'구역 15',biome:'city'},teamIds:['lead'],activeId:'lead',badges:[],objective:'호바귀 찾기',log:[],zaZone15Period:'night',zaWildSpawnCycles:{15:{period:'night',interval:21}},zaWildShinyRolls:{'zone15:pumpkaboo-super:10029':true}};world.map=fieldMap(world);world.interaction=fieldDialogue(world,world.map);
 const page=await browser.newPage({viewport}),errors=[],images=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>{images.push(r.request().url());return r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#a652bb"/></svg>'});});
 await page.route('**/api/world**',async r=>{if(new URL(r.request().url()).searchParams.has('engineOnly'))return r.fulfill({json:{engine:'cloud'}});return r.fulfill({json:{engine:'cloud',revision:1,world,box:[mon],wallet:{coins:100,balls:5,potions:0},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'night'},battle:null}});});
 await page.goto((process.env.TEST_URL||'http://127.0.0.1:5234')+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();await page.waitForFunction(()=>[...document.images].every(i=>i.complete));await page.keyboard.press('e');await page.getByRole('dialog').getByText('특대 폼', {exact:false}).waitFor();
 assert.ok(images.some(url=>url.includes('/10028.png')),JSON.stringify(images));assert.ok(images.some(url=>url.includes('/10029.png')),JSON.stringify(images));assert.deepEqual(errors,[]);await page.screenshot({path:`/tmp/zone15-forms-${viewport.width}.png`});await page.close();
}console.log('Zone 15 large and jumbo field sprites and interaction: mobile and PC (mock API).');}finally{await browser.close();}
