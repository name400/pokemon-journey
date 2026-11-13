import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {createMission10DoubleSnapshot,mission10MultiView,playMission10MultiTurn} from '../../../lib/cloud-adventure/adventure-mission10-double.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const mon=(id,boxId,move)=>({...makeMon(id,45),boxId,moves:[move],pp:{}}),player=mon(152,'player','몸통박치기'),ally=mon(25,'ally','튀어오르기'),foes=[mon(143,'enemy1','튀어오르기'),mon(143,'enemy2','튀어오르기')];let combat={...createMission10DoubleSnapshot([player],[ally],foes),adventurePlusGaugeV1:{charge:1,max:3}},revision=1,actions=0;const errors=[];
 const world={area:3,district:'lumiose',interior:null,x:3,y:5,facing:'down',badges:[],activeId:'player',teamIds:['player'],areaInfo:{name:'격리 테스트',biome:'grass'},objective:'격리 테스트',log:[],trainer:{id:'test',name:'상대'},map:Array(17).fill('.'.repeat(23))};
 const response=()=>({revision,world,box:[player],battle:mission10MultiView(combat),wallet:{coins:100,balls:5,potions:2},inventory:{},gameTime:{period:'day'}});
 const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,body:'',contentType:'image/png'}));await page.route('**/api/world**',async route=>{const body=route.request().postDataJSON();if(body?.action==='battle'){actions++;assert.equal(body.command.actions[0].plus,true);combat=playMission10MultiTurn(combat,body.command.actions[0]);revision++;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response())});});
 await page.goto(process.env.UI_TEST_URL||'http://127.0.0.1:5221/');await page.getByRole('button',{name:'몸통박치기 플러스 · 1칸'}).click();await page.getByRole('button',{name:/상대 2/}).click();await page.getByRole('button',{name:'1마리 행동 확정'}).click();await page.getByText(/기술플러스 게이지 0\/3/).waitFor();assert.equal(actions,1);await page.reload();await page.getByText(/기술플러스 게이지 0\/3/).waitFor();assert.deepEqual(errors,[]);console.log(JSON.stringify({viewport,actions,charge:combat.adventurePlusGaugeV1.charge}));await context.close();
}}finally{await browser.close();}
