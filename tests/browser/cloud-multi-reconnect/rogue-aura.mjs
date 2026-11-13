import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {createCombat,combatView,playCpu} from '../../../lib/party-battle.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const player={...makeMon(1,25),boxId:'player',moves:['몸통박치기'],adventurePlusMastered:['tackle']},foe={...makeMon(10071,60),boxId:'foe',moves:['튀어오르기']};let combat={...createCombat([player],[foe]),adventurePlusGaugeV1:{charge:1,max:3},adventureRogueAuraV1:{targets:['foe']},disableCpuTera:true},revision=1,actions=0;const errors=[];
 const world={area:3,district:'lumiose',interior:null,x:3,y:5,facing:'down',badges:[],activeId:'player',teamIds:['player'],areaInfo:{name:'격리 테스트',biome:'grass'},objective:'격리 테스트',log:[],trainer:{id:'test',name:'상대'},map:Array(17).fill('.'.repeat(23))};
 const response=()=>({revision,world,box:[player],battle:combatView(combat),wallet:{coins:100,balls:5,potions:2},inventory:{},gameTime:{period:'day'}});
 const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,body:'',contentType:'image/png'}));await page.route('**/api/world**',async route=>{const body=route.request().postDataJSON();if(body?.action==='battle'){actions++;combat=playCpu(combat,body.command);revision++;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response())});});
 await page.goto(process.env.UI_TEST_URL||'http://127.0.0.1:5244/');await page.getByText(/기술플러스 게이지 1\/3/).waitFor();await page.getByText('폭주 메가포켓몬에게 일반 기술의 피해가 약 30%로 감소합니다. 기술플러스나 메가진화를 활용하세요.').waitFor();await page.getByRole('button',{name:'몸통박치기 플러스 · 1칸'}).click();await page.getByText(/기술플러스 게이지 0\/3/).waitFor();assert.equal(actions,1);await page.reload();await page.getByText(/기술플러스 게이지 0\/3/).waitFor();assert.equal(await page.getByRole('button',{name:'몸통박치기 플러스 · 1칸'}).count(),0);assert.deepEqual(errors,[]);console.log(JSON.stringify({viewport,actions,charge:combat.adventurePlusGaugeV1.charge}));await context.close();
}}finally{await browser.close();}
