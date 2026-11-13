import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldDialogue,fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const mon={...makeMon(152,15),boxId:'lead',evolutions:[]};let revision=1,starts=0;
 const world={area:3,district:'lumiose-rouge-north',interior:null,x:21,y:13,facing:'right',zaRougeStreetSouth:false,badges:[],activeId:'lead',teamIds:['lead'],areaInfo:{name:'묘지 서쪽 거리',biome:'grass'},objective:'Moire의 의뢰',zaEmmaMet:true,log:[]};
 const response=()=>({revision,world:{...world,map:fieldMap(world),interaction:fieldDialogue(world)},box:[mon],wallet:{coins:1000,balls:3},inventory:{},fieldShop:[],gameTime:{period:'day'}});
 const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,body:'',contentType:'image/png'}));await page.route('**/api/world**',async route=>{const body=route.request().postDataJSON();if(body?.action==='startSableye'){assert.equal(body.revision,revision);world.zaSableyeQuest=1;revision++;starts++;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response())});});
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5231/');await page.locator('canvas.adv-field').waitFor();await page.getByRole('button',{name:/대화/}).click();await page.getByRole('dialog').getByRole('button',{name:'반지 찾기 의뢰 받기'}).click();assert.equal(starts,1);await page.reload();await page.getByRole('button',{name:/대화/}).click();await page.getByRole('dialog').getByText(/묘지 깊은 곳에서 반지/).waitFor();assert.equal(starts,1);assert.deepEqual(errors,[]);console.log(JSON.stringify({viewport,starts,reloaded:true}));await context.close();
}}finally{await browser.close();}
