import assert from 'node:assert/strict';
import {fieldMap,rotoGlideLanding} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
 let world={area:3,district:'lumiose-protect',interior:null,areaInfo:{name:'비계',biome:'city'},x:19,y:8,facing:'right',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'활공',log:[],adventureBalls:{},steps:0,zaMission15Stage:2,zaMission37Stage:4,zaProtectLayout:5,zaProtectScaffoldV1:true,zaProtectScaffoldGlideV2:true,zaProtectScaffoldUpper:true,zaProtectScaffoldPlatform:true};world.map=fieldMap(world);let revision=7,glides=0;
 await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.route('**/api/world**',async r=>{if(r.request().method()==='POST'){const body=r.request().postDataJSON();if(body.action==='movementFence'){revision++;return r.fulfill({json:{settled:true}});}assert.equal(body.action,'rotoGlide');const next=rotoGlideLanding(world);assert.ok(next);world={...world,...next};world.map=fieldMap(world);glides++;revision++;}return r.fulfill({json:{engine:'cloud',revision,box:[mon],wallet:{coins:100,balls:5},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle:null,world}});});
 await page.goto((process.env.UI_TEST_URL||'http://127.0.0.1:5474')+'/?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();const button=page.getByRole('button',{name:'활공'});await button.waitFor();assert.ok(await button.isEnabled());await page.screenshot({path:'/tmp/mission37-glide-mobile.png'});await button.tap();await page.waitForFunction(()=>document.querySelector('canvas.adv-field')?.getAttribute('aria-label')?.includes('현재 위치 5, 4'));assert.equal(glides,1);assert.equal(world.zaProtectScaffoldJumped,true);await page.close();console.log('mobile glide available and lands once');
}finally{await browser.close();}
