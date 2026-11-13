import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldDialogue,fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
import {takeRoyaleBonus} from '../../../lib/cloud-adventure/adventure-royale-bonus.mjs';
import {royaleNightIndex} from '../../../lib/cloud-adventure/adventure-royale-zones.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const mon={...makeMon(25,40),boxId:'player',evolutions:[]};let revision=1,taken=0,period='night';
 const world={area:3,district:'lumiose-royale',interior:null,x:11,y:14,facing:'left',badges:[],activeId:'player',teamIds:['player'],areaInfo:{name:'격리 테스트',biome:'city'},objective:'보너스 카드',log:[],zaRoyaleRank:'Y',zaRoyaleYPoints:0};
 const response=()=>({revision,world:{...world,map:fieldMap(world),interaction:fieldDialogue(world)},box:[mon],wallet:{coins:0,balls:5},inventory:{},fieldShop:[],gameTime:{period,hour:period==='night'?20:8,absoluteHour:royaleNightIndex(world)*24+20}});
 const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,body:'',contentType:'image/png'}));await page.route('**/api/world**',async route=>{const body=route.request().postDataJSON();if(body?.action==='takeRoyaleBonus'){assert.equal(body.revision,revision);assert.equal(takeRoyaleBonus(world),true);revision++;taken++;}else if(body?.action==='claimRoyaleMedals'){assert.equal(body.revision,revision);assert.equal(period,'day');world.zaRoyalePrizeMedals=0;revision++;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response())});});
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5235/');await page.getByRole('button',{name:/대화/}).click();const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'카드 줍기'}).click();await page.getByText('보너스 카드 · 효과가 굉장한 공격 0/3').waitFor();assert.equal(taken,1);await page.reload();await page.getByText('보너스 카드 · 효과가 굉장한 공격 0/3').waitFor();world.zaRoyaleBonusExtraCards={fire:{night:royaleNightIndex(world),rank:'Y',progress:1,completed:false}};world.zaRoyalePrizeMedals=20;await page.reload();await page.getByText('보너스 카드 · 불꽃 타입 공격 1/2').waitFor();period='day';await page.reload();await page.getByRole('button',{name:'상금 정산 (기본 1배)'}).click();await page.getByRole('button',{name:'상금 정산 (기본 1배)'}).waitFor({state:'detached'});assert.deepEqual(errors,[]);console.log(JSON.stringify({viewport,taken,progress:world.zaRoyaleBonusCard.progress}));await context.close();
}}finally{await browser.close();}
