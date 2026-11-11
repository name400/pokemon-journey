import assert from 'node:assert/strict';
import {createFixture} from './fixture.mjs';
import {classicGameView} from '../../../lib/rogue-classic-game.mjs';
import {ADVENTURE_STORE_VERSION} from '../../../lib/adventure-economy.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀','독'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
const world={engine:'cloud',revision:1,box:[mon],wallet:{coins:100,balls:5,potions:2},inventory:{},fieldShop:[],gameTime:{period:'day'},battle:null,world:{area:0,areaInfo:{name:'테스트 지역',biome:'meadow',min:2,max:5},map:Array.from({length:17},()=>'.'.repeat(23)),x:11,y:8,facing:'down',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행을 시작하세요',log:[],adventureBalls:{},interaction:{name:'안내원',text:'반가워요.'}}};
const battle=classicGameView(createFixture('battle')).battle;
try{for(const width of [320,390,1280]){
 const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><circle cx="48" cy="48" r="35" fill="#729d89"/></svg>'}));
 await page.route('**/api/shop',r=>r.fulfill({json:{coins:100,priceVersion:ADVENTURE_STORE_VERSION,catalog:[],inventory:{}}}));
 let activeBattle=false,failWorld=false;await page.route('**/api/world**',r=>failWorld&&!r.request().url().includes('engineOnly=1')?r.fulfill({status:500,json:{error:'연결을 확인해 주세요'}}):r.fulfill({json:{...world,battle:activeBattle?battle:null}}));
 const noOverflow=async name=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${name} overflow ${width}`);
 await page.goto(base+'/?mode=adventure&tab=shop');await page.getByRole('heading',{name:'모험 상점'}).waitFor();await page.getByText('전체 등장 목록 · 개별 확률').first().click();await noOverflow('shop');
 await page.goto(base+'/?mode=adventure&tab=adventure');await page.getByRole('button',{name:'대화'}).click();await page.getByText('반가워요.').waitFor();await noOverflow('dialogue');await page.getByRole('button',{name:'닫기'}).click();
 failWorld=true;await page.reload();await page.getByText('연결을 확인해 주세요',{exact:true}).waitFor();await noOverflow('error');failWorld=false;activeBattle=true;await page.reload();await page.locator('.battle-screen .bs-command-tabs').waitFor();await noOverflow('battle');const icon=await page.locator('.bs-move .bs-type-symbol').first().boundingBox();assert.ok(icon&&icon.width<=20,`type icon too large ${width}`);const name=await page.locator('.bs-move-name b').first().boundingBox();assert.ok(name&&name.width>=24,`move name compressed ${width}`);
 if(width===390)await page.locator('.battle-screen').screenshot({path:'/tmp/adventure-battle-390.png'});
 assert.deepEqual(errors,[]);console.log(`adventure shop dialogue battle ${width}px passed`);await page.close();
}}finally{await browser.close();}
