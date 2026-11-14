import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldMap,fieldDialogue} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
 for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
  const sizes=[];
  for(const scale of [0,255]){
   const mon={...makeMon(152,5),boxId:'lead',evolutions:[]},key='zone12:gogoat:673',world={area:3,district:'lumiose-zone12',interior:null,x:17,y:5,facing:'up',areaInfo:{name:'구역 12',biome:'city'},teamIds:['lead'],activeId:'lead',badges:[],objective:'XL 고고트',log:[],zaWildShinyRolls:{[key]:false},zaWildSizeRollsV1:{version:1,entries:{[key]:{version:1,scale}}}};world.map=fieldMap(world);world.interaction=fieldDialogue(world,world.map);
   const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{window.__sizeDraw=[];const original=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(image,...args){if(image instanceof HTMLImageElement&&/\/673\.png(?:\?|$)/.test(image.src)&&args.length===4)window.__sizeDraw.push(args[2]);return original.call(this,image,...args);};});
   await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#a652bb"/></svg>'}));
   await page.route('**/api/world**',r=>r.fulfill({json:{engine:'cloud',revision:1,world,box:[mon],wallet:{coins:100,balls:5,potions:0},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null}}));
   await page.goto(process.env.TEST_URL||'http://127.0.0.1:5234');await page.locator('canvas.adv-field').waitFor();await page.waitForFunction(()=>window.__sizeDraw?.length>0,{timeout:15000});sizes.push(await page.evaluate(()=>window.__sizeDraw.at(-1)));assert.deepEqual(errors,[]);await page.screenshot({path:`/tmp/zone12-size-${viewport.width}-${scale}.png`});await page.close();
  }
  assert.ok(sizes[1]>sizes[0],`visible XL must be larger than XS: ${sizes}`);
 }
 console.log('Zone 12 XS/XL sprites: mobile and PC (mock API/images).');
}finally{await browser.close();}
