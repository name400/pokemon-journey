import assert from 'node:assert/strict';
import {fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const caught of [false,true]){
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),requests=[];
  await page.route('https://**/*',r=>{const url=r.request().url();requests.push(url);return r.fulfill({status:200,contentType:'image/svg+xml',body:`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="${url.includes('/shiny/179.png')?'#ff00ff':'#777777'}"/></svg>`});});
  const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀','독'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
  const world={area:3,district:'lumiose-zone1-high-roof',interior:null,areaInfo:{name:'야생 구역 1 옥상',biome:'city'},x:8,y:6,facing:'up',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'탐험',log:[],adventureBalls:{},steps:0,zaSide17Stage:2,zaSide17MareepCaught:caught};world.map=fieldMap(world);
  await page.route('**/api/world**',r=>new URL(r.request().url()).searchParams.has('engineOnly')?r.fulfill({json:{engine:'cloud'}}):r.fulfill({json:{engine:'cloud',revision:7,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null,world}}));
  await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5457')+'/?mode=adventure&tab=adventure');const canvas=page.locator('canvas.adv-field');await canvas.waitFor();
  if(!caught)await page.waitForFunction(()=>performance.getEntriesByType('resource').some(e=>e.name.endsWith('/shiny/179.png')));
  await page.waitForTimeout(200);assert.equal(requests.some(url=>url.endsWith('/shiny/179.png')),!caught);
  const image=(await canvas.screenshot()).toString('base64');const magenta=await page.evaluate(async encoded=>{const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),image=await createImageBitmap(new Blob([bytes],{type:'image/png'})),canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let count=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]>220&&pixels[i+1]<35&&pixels[i+2]>220)count++;return count;},image);
  assert.equal(magenta>10,!caught,'shiny sprite is drawn only before capture');await page.close();
 }
 console.log('Guaranteed shiny Mareep renders before capture and disappears after capture (mock API and artwork).');
}finally{await browser.close();}
