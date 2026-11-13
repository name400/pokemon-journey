import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {createMission10DoubleSnapshot,mission10MultiView,playMission10MultiTurn} from '../../../lib/cloud-adventure/adventure-mission10-double.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const mon=(id,boxId)=>({...makeMon(id,30),boxId,moves:['튀어오르기','축하','고속이동','신비의부적'],pp:{},evolutions:[]});
const player={...mon(25,'player'),hp:1,moves:['몸통박치기']},ally=mon(129,'ally'),foes=[{...mon(597,'foe1'),ability:'ironbarbs'},mon(129,'foe2')];
let combat=playMission10MultiTurn(createMission10DoubleSnapshot([player],[ally],foes),{type:'move',move:'tackle',target:1}),revision=2,actions=0;assert.equal(combat.adventureMultiContinueV1,true);
const world={area:3,district:'lumiose',interior:null,x:3,y:5,facing:'down',badges:[],activeId:'player',teamIds:['player'],areaInfo:{name:'격리 테스트',biome:'grass'},objective:'격리 테스트',log:[],trainer:{name:'상대'},map:Array(17).fill('.'.repeat(23))};
const data=()=>({revision,world,box:[combat.teams[0][0]],battle:combat.ended?null:mission10MultiView(combat),wallet:{coins:100,balls:5},inventory:{},gameTime:{period:'day'}});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,body:'',contentType:'image/png'}));
 await page.route('**/api/world**',async route=>{const body=route.request().postDataJSON();if(body?.action==='continueCompanionBattle'){assert.equal(body.revision,revision);actions++;combat=playMission10MultiTurn(combat,{type:'continue'});revision++;const result=data();if(combat.ended)result.battleResult=mission10MultiView(combat);await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(result)});return;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data())});});
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5218/');const resume=page.getByRole('button',{name:'동료 배틀 이어가기'});await resume.waitFor();assert.equal(await resume.isEnabled(),true);
 await page.reload();await resume.waitFor();assert.equal(actions,0);await resume.click();await page.waitForFunction(()=>document.body.innerText.includes('BATTLE / REPLAY')||document.body.innerText.includes('BATTLE / RECORD')||document.body.innerText.includes('BATTLE / VICTORY')||document.body.innerText.includes('마지막 장면'));assert.equal(actions,1);assert.equal(combat.ended,true);assert.deepEqual(errors,[]);console.log(JSON.stringify({reloadedCheckpoint:true,continuationActions:actions,ended:combat.ended,winner:combat.winner}));
}finally{await browser.close();}
