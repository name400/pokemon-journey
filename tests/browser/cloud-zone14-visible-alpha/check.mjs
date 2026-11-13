import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldMap,fieldDialogue} from '../../../lib/cloud-adventure/adventure-world.mjs';
const playwright=await import(process.env.PLAYWRIGHT_MODULE||'playwright');const {chromium}=playwright.default||playwright;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const mon={...makeMon(152,5),boxId:'lead',expToNext:100,evolutions:[]},key='zone14:aron:304';
 const world={area:3,district:'lumiose-zone14',interior:null,x:11,y:4,facing:'up',areaInfo:{name:'야생 구역 14',biome:'city'},teamIds:['lead'],activeId:'lead',badges:[],objective:'탐험',log:[],zaRoyaleRank:'D',zaMission19Complete:true,zaZone14Period:'day',weather:'',zaWildShinyRolls:{[key]:true},zaWildVisibleAlphaLevels:{[key]:38}};
 world.map=fieldMap(world);world.interaction=fieldDialogue(world,world.map);assert.match(world.interaction.name,/우두머리/);const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.route('**/api/account',r=>r.fulfill({json:{authenticated:true,profile:{nickname:'격리 테스트',friendCode:'TEST'},signOut:'#'}}));
 await page.route('**/api/world**',r=>{if(new URL(r.request().url()).searchParams.has('engineOnly'))return r.fulfill({json:{engine:'cloud'}});return r.fulfill({json:{engine:'cloud',revision:1,world,box:[mon],wallet:{coins:100,balls:1,potions:0},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null}});});
 await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5235')+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor({timeout:10000}).catch(async e=>{console.error('PAGE',await page.locator('body').innerText(), 'ERRORS',errors);throw e;});await page.keyboard.press('e');await page.getByText(/우두머리 가보리/).first().waitFor();await page.screenshot({path:`/tmp/zone14-visible-alpha-${viewport.width}.png`});await page.reload();await page.locator('canvas.adv-field').waitFor();assert.deepEqual(errors,[]);await page.close();
}console.log('Zone 14 visible alpha: PC and mobile canvas, interaction and reload (mock API).');}finally{await browser.close();}
