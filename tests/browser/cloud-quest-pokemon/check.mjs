import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldMap,fieldDialogue} from '../../../lib/cloud-adventure/adventure-world.mjs';
const playwright=await import(process.env.PLAYWRIGHT_MODULE||'playwright');const {chromium}=playwright.default||playwright;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
 for(const viewport of [{width:390,height:844},{width:1280,height:850}])for(const c of [
  {district:'lumiose-magenta-sector9',x:4,y:2,facing:'down',zaSide85Stage:1,name:'불켜미',sprite:607},
  {district:'lumiose-rouge7-roof',x:3,y:4,facing:'up',zaSide65Stage:1,name:'데덴네',sprite:702},
 ]){
  const mon={...makeMon(152,5),boxId:'lead',expToNext:100,evolutions:[]},world={area:3,interior:null,areaInfo:{name:c.name,biome:'city'},teamIds:['lead'],activeId:'lead',badges:[],objective:'탐험',log:[],zaRoyaleRank:'B',weather:'',...c};world.map=fieldMap(world);world.interaction=fieldDialogue(world,world.map);
  const page=await browser.newPage({viewport,reducedMotion:'reduce'}),errors=[],spriteRequests=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',route=>{const url=route.request().url(),m=url.match(/\/pokemon\/(\d+)\.png/);if(m)spriteRequests.push(Number(m[1]));return route.fulfill({status:200,contentType:'image/svg+xml',headers:{'access-control-allow-origin':'*'},body:`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="${m&&Number(m[1])===c.sprite?'#fc15cb':'#789'}"/></svg>`});});
  await page.route('**/api/account',r=>r.fulfill({json:{authenticated:true,profile:{nickname:'검사',friendCode:'TEST'},signOut:'#'}}));
  await page.route('**/api/world**',r=>{if(new URL(r.request().url()).searchParams.has('engineOnly'))return r.fulfill({json:{engine:'cloud'}});return r.fulfill({json:{engine:'cloud',revision:1,world,box:[mon],wallet:{coins:100,balls:1,potions:0},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null}});});
  await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5235')+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();for(let i=0;i<30&&!spriteRequests.includes(c.sprite);i++)await page.waitForTimeout(200);assert.ok(spriteRequests.includes(c.sprite),`missing sprite ${c.sprite}; requested ${spriteRequests}`);
  await page.keyboard.press('e');await page.getByText(new RegExp(c.name)).first().waitFor();await page.screenshot({path:`/tmp/quest-${c.sprite}-${viewport.width}.png`});assert.ok(spriteRequests.includes(c.sprite));assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Quest Pokémon: PC and mobile sprite requests, canvas and interactions (mock API).');
}finally{await browser.close();}
