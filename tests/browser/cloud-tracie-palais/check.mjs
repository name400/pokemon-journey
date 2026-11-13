import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldDialogue,fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const lead={...makeMon(152,15),boxId:'lead',evolutions:[]},pika={...makeMon(25,9),boxId:'pika',evolutions:[]};let box=[lead,pika],revision=1,trades=0;
 const world={area:3,district:'lumiose-passage-palais',interior:null,x:7,y:8,facing:'left',badges:[],activeId:'lead',teamIds:['lead'],areaInfo:{name:'팔레 통로',biome:'grass'},objective:'교환',zaEmmaMet:true,zaTradeQuest:1,log:[]};
 const response=()=>({revision,world:{...world,map:fieldMap(world),interaction:fieldDialogue(world)},box,wallet:{coins:1000,balls:1},inventory:{},fieldShop:[],gameTime:{period:'day'}});
 const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,body:'',contentType:'image/png'}));await page.route('**/api/world**',async route=>{const body=route.request().postDataJSON();if(body?.action==='tradePikachu'){assert.equal(body.boxId,'pika');assert.equal(body.confirmed,true);assert.equal(body.revision,revision);world.zaTradeQuest=2;box=[lead,{...makeMon(214,12),boxId:'heracross',evolutions:[]}];revision++;trades++;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response())});});
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5227/');await page.getByRole('button',{name:'여행 수첩',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.getByLabel('교환할 피카츄').selectOption('pika');await dialog.getByRole('checkbox',{name:/선택한 피카츄/}).check();await dialog.getByRole('button',{name:'헤라크로스와 교환'}).click();assert.equal(trades,1);await page.reload();await page.getByRole('button',{name:'여행 수첩',exact:true}).click();await page.getByRole('dialog').getByText(/피카츄 교환 · 완료/).waitFor();assert.equal(trades,1);assert.deepEqual(errors,[]);console.log(JSON.stringify({viewport,trades,reloaded:true}));await context.close();
}}finally{await browser.close();}
