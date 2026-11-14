import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldDialogue,fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const mon={...makeMon(1,30),boxId:'player',hp:1,evolutions:[]};let revision=1,coins=2000;
 const world={area:3,district:'lumiose-vert-sector3',interior:null,x:14,y:2,facing:'right',badges:[],activeId:'player',teamIds:['player'],areaInfo:{name:'베르 3번지',biome:'city'},objective:'카페',log:[],zaRoyaleRank:'V',zaSide18Stage:2};
 const response=()=>({revision,world:{...world,map:fieldMap(world),interaction:fieldDialogue(world)},box:[mon],wallet:{coins,balls:5},inventory:{},fieldShop:[],gameTime:{period:'day',hour:12,absoluteHour:12}});
 const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,body:'',contentType:'image/png'}));
 await page.route('**/api/world**',async route=>{if(new URL(route.request().url()).searchParams.has('engineOnly'))return route.fulfill({json:{engine:'cloud'}});const body=route.request().postDataJSON();if(body?.action==='cyclonePantrio'){coins-=1000;mon.hp=mon.maxHp;revision++;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response())});});
 await page.goto((process.env.TEST_URL||'http://127.0.0.1:5237/')+'?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();await page.keyboard.press('e');const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:/Pantrio Tea/}).scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/cafe-cyclone-menu-${viewport.width}.png`});await dialog.getByRole('button',{name:/Pantrio Tea/}).click();assert.equal(coins,1000);assert.equal(mon.hp,mon.maxHp);await page.screenshot({path:`/tmp/cafe-cyclone-${viewport.width}.png`});assert.deepEqual(errors,[]);await context.close();
}console.log('Café Cyclone: PC and mobile (mock API).');}finally{await browser.close();}
