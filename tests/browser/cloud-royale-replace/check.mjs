import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldDialogue,fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
import {takeRoyaleBonus,royaleBonusCards} from '../../../lib/cloud-adventure/adventure-royale-bonus.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const mon={...makeMon(25,40),boxId:'player',evolutions:[]};let revision=1,replacements=0;
 const world={area:3,district:'lumiose-royale',interior:null,x:11,y:13,facing:'up',badges:[],activeId:'player',teamIds:['player'],areaInfo:{name:'격리 테스트',biome:'city'},objective:'보너스 카드',log:[],zaRoyaleRank:'Y',zaRoyaleYPoints:0};
 const offered=royaleBonusCards(world);for(const card of offered.slice(0,3))assert.equal(takeRoyaleBonus(world,Date.now(),card.id),true);world.zaRoyaleBonusCard.progress=2;
 const response=()=>({revision,world:{...world,map:fieldMap(world),interaction:fieldDialogue(world)},box:[mon],wallet:{coins:0,balls:5},inventory:{},fieldShop:[],gameTime:{period:'night',hour:20}});
 const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,body:'',contentType:'image/png'}));await page.route('**/api/world**',async route=>{const body=route.request().postDataJSON();if(body?.action==='replaceRoyaleBonus-super'){assert.equal(body.revision,revision);assert.equal(takeRoyaleBonus(world,Date.now(),offered[3].id,'super'),true);revision++;replacements++;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response())});});
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5235/');await page.getByRole('button',{name:/대화/}).click();const dialog=page.getByRole('dialog');await dialog.getByText(/교체할 카드를 선택/).waitFor();await dialog.getByRole('button',{name:'효과가 굉장한 공격 교체'}).click();assert.equal(replacements,1);assert.equal(world.zaRoyaleBonusCard.discarded,true);await page.reload();assert.equal(world.zaRoyaleBonusExtraCards[offered[3].id].progress,0);assert.deepEqual(errors,[]);console.log(JSON.stringify({viewport,replacements,card:offered[3].id}));await context.close();
}}finally{await browser.close();}
