import assert from 'node:assert/strict';
import {fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const scenario of ['za-before-rank','za-old-save','classic']){
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));
 const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]},classic=scenario==='classic';
 let world={area:classic?0:3,district:classic?null:'lumiose-zone1',interior:classic?'lab':null,areaInfo:{name:'시험 지역',biome:'city'},x:3,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:['brock','misty'],league:2,completed:true,objective:'현재 진행 목표',log:[],adventureBalls:{},steps:0,...(scenario==='za-old-save'?{zaRoyaleRank:'Y'}:{})};world.map=fieldMap(world);
 const snapshot=JSON.stringify(world),state=()=>({engine:'cloud',revision:1,world,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null});
 await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg"/>'}));
 await page.route('**/api/world**',r=>{if(r.request().method()==='POST'){const body=r.request().postDataJSON();if(body.action==='movementFence')return r.fulfill({json:{settled:true}});requests.push(body);}return r.fulfill({json:new URL(r.request().url()).searchParams.has('engineOnly')?{engine:'cloud'}:state()});});
 await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5222')+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();
 const button=page.getByLabel(/여행 수첩 열기/);await button.waitFor();
 if(classic)assert.match(await button.innerText(),/배지\s*2\/8/);else {assert.match(await button.innerText(),scenario==='za-old-save'?/랭크 Y/:/참가 전/);assert.doesNotMatch(await button.innerText(),/배지/);}
 await button.click();
 if(classic){await page.getByText('관동 배지 컬렉션').waitFor();await page.getByText('도시 조사단 이야기 초안').waitFor();await page.getByText('여행 지도',{exact:true}).waitFor();}
 else{if(scenario==='za-old-save')await page.getByText('Z-A 로열 · 랭크 Y').waitFor();for(const text of ['관동 배지 컬렉션','도시 조사단 이야기 초안','도시 조사단 현장 조사','여행 지도','챔피언 이후 · 세계 탐험'])assert.equal(await page.getByText(text,{exact:true}).count(),0,text);}
 assert.equal(JSON.stringify(world),snapshot);assert.deepEqual(requests,[]);assert.deepEqual(errors,[]);await page.close();console.log(`${scenario}: mode-specific progress and stored badges preserved`);
}}finally{await browser.close();}
