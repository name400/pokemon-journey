import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldMap,fieldDialogue} from '../../../lib/cloud-adventure/adventure-world.mjs';
const playwright=await import(process.env.PLAYWRIGHT_MODULE||'playwright');const {chromium}=playwright.default||playwright;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const p of [{n:5,id:'abra',species:63,level:24,x:6,y:4,name:'캐이시',zaZone5Upper:true},{n:12,id:'delibird',species:225,level:42,x:4,y:11,name:'딜리버드'},{n:20,id:'bulbasaur',species:1,level:62,x:7,y:11,name:'이상해씨'}])for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const mon={...makeMon(152,5),boxId:'lead',expToNext:100,evolutions:[]},key=`zone${p.n}:${p.id}:${p.species}`;
 const world={area:3,district:`lumiose-zone${p.n}`,interior:null,x:p.x,y:p.y,facing:'up',areaInfo:{name:`야생 구역 ${p.n}`,biome:'city'},teamIds:['lead'],activeId:'lead',badges:[],objective:'탐험',log:[],zaRoyaleRank:'A',zaMission19Complete:true,zaMission05Complete:true,weather:'',zaWildShinyRolls:{[key]:true},zaWildVisibleAlphaLevels:{[key]:p.level},...(p.zaZone5Upper?{zaZone5Upper:true}:{})};
 world.map=fieldMap(world);world.interaction=fieldDialogue(world,world.map);assert.match(world.interaction.name,/우두머리/);const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.route('**/api/account',r=>r.fulfill({json:{authenticated:true,profile:{nickname:'격리 테스트',friendCode:'TEST'},signOut:'#'}}));
 await page.route('**/api/world**',r=>{if(new URL(r.request().url()).searchParams.has('engineOnly'))return r.fulfill({json:{engine:'cloud'}});return r.fulfill({json:{engine:'cloud',revision:1,world,box:[mon],wallet:{coins:100,balls:1,potions:0},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null}});});
 await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5235')+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();await page.keyboard.press('e');await page.getByText(new RegExp(`우두머리 ${p.name}`)).first().waitFor();await page.screenshot({path:`/tmp/zone${p.n}-visible-alpha-${viewport.width}.png`});await page.reload();await page.locator('canvas.adv-field').waitFor();assert.deepEqual(errors,[]);await page.close();
}console.log('Zones 5, 12, 20 visible alphas: PC and mobile canvas, interaction and reload (mock API).');}finally{await browser.close();}
