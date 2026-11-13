import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldDialogue,fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const mon={...makeMon(1,30),boxId:'player',hp:1,evolutions:[]};let revision=1,coins=1000;
 const world={area:3,district:'lumiose-jaune-sector8',interior:null,x:18,y:7,facing:'up',badges:[],activeId:'player',teamIds:['player'],areaInfo:{name:'존느 8번지',biome:'city'},objective:'카페',log:[],zaRoyaleRank:'Y'};
 const response=()=>({revision,world:{...world,map:fieldMap(world),interaction:fieldDialogue(world)},box:[mon],wallet:{coins,balls:5},inventory:{},fieldShop:[],gameTime:{period:'day',hour:12,absoluteHour:12}});
 const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,body:'',contentType:'image/png'}));
 await page.route('**/api/world**',async route=>{const body=route.request().postDataJSON();if(body?.action==='enterCafeAction'){world.interior='cafeAction';world.x=11;world.y=13;revision++;}else if(body?.action==='actionTeaBlend'){coins-=490;mon.hp=mon.maxHp;revision++;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response())});});
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5235/');await page.getByRole('button',{name:/대화/}).click();await page.getByRole('dialog').getByRole('button',{name:'카페 들어가기'}).click();
 assert.equal(world.interior,'cafeAction');world.x=11;world.y=6;world.facing='up';await page.reload();await page.getByRole('button',{name:/대화/}).click();const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:/Action! Tea Blend/}).click();assert.equal(coins,510);assert.equal(mon.hp,mon.maxHp);await page.screenshot({path:`/tmp/cafe-action-${viewport.width}.png`});assert.deepEqual(errors,[]);console.log(JSON.stringify({viewport,coins,hp:mon.hp}));await context.close();
}}finally{await browser.close();}
