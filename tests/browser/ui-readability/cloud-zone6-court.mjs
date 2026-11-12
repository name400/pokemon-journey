import assert from 'node:assert/strict';
import {fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const period of ['day','night']){
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),requests=[];
  await page.route('https://**/*',r=>{const url=r.request().url();requests.push(url);const color=url.includes('/307.png')?'#ff00ff':'#777777';return r.fulfill({status:200,contentType:'image/svg+xml',body:`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="${color}"/></svg>`});});
  const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀','독'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
  const world={area:3,district:'lumiose-zone6',interior:null,areaInfo:{name:'야생 구역 6',biome:'city'},x:15,y:7,facing:'up',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'탐험',log:[],adventureBalls:{},steps:0,zaRoyaleRank:'F',zaZone6Period:period,zaWildShinyRolls:{'zone6:meditite:307':false}};world.map=fieldMap(world);
  await page.route('**/api/account',r=>r.fulfill({json:{authenticated:true,profile:{nickname:'격리 테스트',friendCode:'TEST'},signOut:'#'}}));
  await page.route('**/api/world**',r=>new URL(r.request().url()).searchParams.has('engineOnly')?r.fulfill({json:{engine:'cloud'}}):r.fulfill({json:{engine:'cloud',revision:7,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period},battle:null,world}}));
  await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5468')+'/?mode=adventure&tab=adventure');const canvas=page.locator('canvas.adv-field');await canvas.waitFor({timeout:15000});await page.waitForTimeout(700);
  assert.equal(requests.some(url=>/\/307\.png(?:\?|$)/.test(url)),period==='day');await canvas.screenshot({path:`/tmp/zone6-court-${period}.png`});await page.close();
 }
 console.log('Zone 6 court day/night rendering verified (mock API and placeholder sprites).');
}finally{await browser.close();}
