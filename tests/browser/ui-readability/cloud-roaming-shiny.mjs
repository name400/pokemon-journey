import assert from 'node:assert/strict';
import {fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const sample of [{district:'lumiose-zone2',key:'field2:patrat:504',species:504},{district:'lumiose-zone3',key:'field3:flabebe:669',species:669},{district:'lumiose-crystal-sewer',key:'sewer:inkay:686',species:686}]){
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),requests=[];
  await page.route('https://**/*',r=>{const url=r.request().url();requests.push(url);const color=url.includes('/shiny/')?'#ff00ff':'#777777';return r.fulfill({status:200,contentType:'image/svg+xml',body:`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="${color}"/></svg>`});});
  const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀','독'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
  const world={area:3,district:sample.district,interior:null,areaInfo:{name:'야생 구역',biome:'city',min:2,max:5},x:sample.district==='lumiose-crystal-sewer'?17:10,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'야생 구역 탐험',log:[],adventureBalls:{},steps:0,completed:true,hallOfFame:[],zaRoyaleRank:'A',zaMission20Stage:9,zaWildShinyRolls:{[sample.key]:true}};world.map=fieldMap(world);
  await page.route('**/api/world**',r=>new URL(r.request().url()).searchParams.has('engineOnly')?r.fulfill({json:{engine:'cloud'}}):r.fulfill({json:{engine:'cloud',revision:7,box:[mon],wallet:{coins:100,balls:5,potions:2},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null,world}}));
  for(let i=0;i<2;i++){requests.length=0;await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5371')+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();await page.waitForFunction(({id})=>performance.getEntriesByType('resource').some(e=>e.name.includes(`/shiny/${id}.png`)),{id:sample.species},{timeout:10000});assert.ok(requests.some(url=>url.endsWith(`/shiny/${sample.species}.png`)),sample.district);await page.waitForTimeout(250);const screenshot=(await page.locator('canvas.adv-field').screenshot()).toString('base64');const magenta=await page.evaluate(async encoded=>{const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),image=await createImageBitmap(new Blob([bytes],{type:'image/png'})),canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;let count=0;for(let j=0;j<data.length;j+=4)if(data[j]>220&&data[j+1]<35&&data[j+2]>220)count++;return count;},screenshot);assert.ok(magenta>10,`${sample.district}: shiny image was drawn`);}
  await page.close();
 }
 console.log('Roaming field shiny sprite pixels survive reload in zones 2, 3 and sewer (mock API and artwork).');
}finally{await browser.close();}
