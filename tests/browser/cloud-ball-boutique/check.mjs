import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldDialogue,fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const mon={...makeMon(25,40),boxId:'player',evolutions:[]};let revision=1,coins=5000,purchases=0;
 const world={area:3,district:'lumiose-rouge-sector3',interior:null,x:16,y:14,facing:'down',badges:[],activeId:'player',teamIds:['player'],areaInfo:{name:'루주 3번지',biome:'city'},objective:'탐험',log:[],adventureBalls:{}};
 const response=()=>({revision,world:{...world,map:fieldMap(world),interaction:fieldDialogue(world)},box:[mon],wallet:{coins,balls:5},inventory:{},fieldShop:[],gameTime:{period:'day',hour:12}});
 const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,body:'',contentType:'image/png'}));await page.route('**/api/world**',async route=>{const body=route.request().postDataJSON();if(body?.action==='buyBoutiqueBall-healball'){assert.equal(body.revision,revision);assert.equal(body.quantity,5);coins-=1500;world.adventureBalls.healball=5;revision++;purchases++;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response())});});
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5235/');await page.getByRole('button',{name:/대화/}).click();const dialog=page.getByRole('dialog');await dialog.getByText(/일부 원작 상품은 미구현/).waitFor();await page.getByLabel('볼 구매 수량').selectOption('5');await dialog.getByRole('button',{name:'힐볼 · 개당 300코인 · 합계 1,500코인'}).click();assert.equal(purchases,1);assert.equal(coins,3500);await page.reload();await page.getByRole('button',{name:'가방',exact:true}).click();await page.getByRole('dialog').getByText('힐볼 × 5').waitFor();assert.deepEqual(errors,[]);console.log(JSON.stringify({viewport,purchases,coins}));await context.close();
}}finally{await browser.close();}
