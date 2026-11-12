import assert from 'node:assert/strict';
import {fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const period of ['day','night']){
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),requests=[];
  await page.route('https://**/*',r=>{const url=r.request().url();requests.push(url);const color=url.includes('/shiny/173.png')?'#ff00ff':url.endsWith('/35.png')?'#00ffff':'#777777';return r.fulfill({status:200,contentType:'image/svg+xml',body:`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="${color}"/></svg>`});});
  const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀','독'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
  const world={area:3,district:'lumiose-zone19',interior:null,areaInfo:{name:'야생 구역 19',biome:'city'},x:11,y:10,facing:'up',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'탐험',log:[],adventureBalls:{},steps:0,zaRoyaleRank:'B',zaZone19Period:period,zaWildShinyRolls:{'zone19:cleffa-night:173':true}};world.map=fieldMap(world);
  await page.route('**/api/account',r=>r.fulfill({json:{authenticated:true,profile:{nickname:'격리 테스트',friendCode:'TEST'},signOut:'#'}}));
  await page.route('**/api/world**',r=>new URL(r.request().url()).searchParams.has('engineOnly')?r.fulfill({json:{engine:'cloud'}}):r.fulfill({json:{engine:'cloud',revision:7,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period},battle:null,world}}));
  await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5468')+'/?mode=adventure&tab=adventure');const canvas=page.locator('canvas.adv-field');try{await canvas.waitFor({timeout:15000});}catch(error){console.error('Page:',(await page.locator('body').innerText()).slice(0,3000));throw error;}
  if(period==='night')await page.waitForTimeout(1000);
  await page.waitForTimeout(300);assert.equal(requests.some(url=>url.endsWith('/shiny/173.png')),period==='night');assert.equal(requests.some(url=>url.endsWith('/35.png')),period==='night');
  const png=await canvas.screenshot({path:`/tmp/zone19-pavilion-${period}.png`});
  const magenta=await page.evaluate(async encoded=>{const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),image=await createImageBitmap(new Blob([bytes],{type:'image/png'})),c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);const p=ctx.getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<p.length;i+=4)if(p[i]>220&&p[i+1]<35&&p[i+2]>220)n++;return n;},png.toString('base64'));
  assert.equal(magenta>10,period==='night');await page.close();
 }
 console.log('Zone 19 day/night pavilion and shiny rendering verified (mock API and placeholder sprites).');
}finally{await browser.close();}
