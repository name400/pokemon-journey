import assert from 'node:assert/strict';
import {fieldMap,stepField} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀','독'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
let world={area:0,district:null,interior:null,areaInfo:{name:'테스트 지역',biome:'meadow',min:2,max:5},x:3,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행을 시작하세요',log:[],adventureBalls:{},steps:0};world.map=fieldMap(world);
let revision=1,posts=0;const state=()=>({engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5,potions:2},inventory:{},fieldShop:[],gameTime:{period:'day'},battle:null,world});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.addInitScript(()=>{const original=window.setTimeout;window.__shortTimers=0;window.setTimeout=function(fn,delay,...args){if(delay===16)window.__shortTimers++;return original(fn,delay,...args)}});
 await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.route('**/api/world**',async r=>{if(r.request().method()==='POST'){posts++;const body=r.request().postDataJSON();await new Promise(resolve=>setTimeout(resolve,120));for(const dir of body.path||[]){const s=stepField(world,dir);if(s.blocked)break;world={...world,...s,steps:world.steps+1};}revision++;}await r.fulfill({json:state()});});
 await page.goto(base+'/?mode=adventure&tab=adventure');await page.getByLabel('필드 탐험').waitFor();await page.waitForTimeout(300);const idle=await page.evaluate(()=>window.__shortTimers);await page.waitForTimeout(250);assert.ok(await page.evaluate(()=>window.__shortTimers)-idle<=2,'idle movement loop keeps polling');
 await page.keyboard.down('ArrowRight');await page.waitForTimeout(420);await page.keyboard.up('ArrowRight');await page.waitForTimeout(700);assert.ok(world.x>3,'held input did not move');const stoppedAt=posts;await page.waitForTimeout(350);assert.equal(posts,stoppedAt,'movement continued after release');
 const before=world.x;await page.keyboard.press('ArrowRight');await page.waitForTimeout(400);assert.ok(world.x>before,'idle loop did not wake for next input');const right=world.x;await page.keyboard.press('ArrowLeft');await page.waitForTimeout(400);assert.ok(world.x<right,'direction change did not move left');console.log('cloud movement idle, held, release, and wake passed');await page.close();
}finally{await browser.close();}
