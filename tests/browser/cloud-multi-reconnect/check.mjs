import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {createMission10DoubleSnapshot,mission10MultiView,playMission10MultiTurn} from '../../../lib/cloud-adventure/adventure-mission10-double.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const mon=(id,boxId)=>({...makeMon(id,40),boxId,moves:['몸통박치기'],pp:{},evolutions:[]});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const player=mon(25,'player'),ally=mon(25,'ally'),foes=[mon(25,'foe1'),mon(25,'foe2')];let combat=createMission10DoubleSnapshot([player],[ally],foes),revision=1,actions=0;const errors=[];
 const world={area:3,district:'lumiose',interior:null,x:3,y:5,facing:'down',badges:[],activeId:'player',teamIds:['player'],areaInfo:{name:'격리 테스트',biome:'grass'},objective:'격리 테스트',log:[],trainer:{name:'상대'},map:Array(17).fill('.'.repeat(23))};
 const response=()=>({revision,world,box:[player],battle:mission10MultiView(combat),wallet:{coins:100,balls:5},inventory:{},gameTime:{period:'day'}});
 const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,body:'',contentType:'image/png'}));
 await page.route('**/api/world**',async route=>{const body=route.request().postDataJSON();if(body?.action==='battle'){actions++;combat=playMission10MultiTurn(combat,body.command?.type==='turn'?body.command.actions[0]:body.command);revision++;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response())});});
 await page.goto('http://127.0.0.1:5218/');await page.getByRole('button',{name:/몸통박치기, Normal/}).waitFor();
 await page.getByRole('button',{name:/몸통박치기, Normal/}).click();await page.getByRole('button',{name:/상대 1/}).click();await page.getByRole('button',{name:'1마리 행동 확정'}).click();
 await page.waitForFunction(()=>document.body.innerText.includes('TURN 2'));assert.equal(actions,1);assert.ok(combat.events.some(e=>e.kind==='damage'));
 // The saved response retains the turn's events. A GET after reload must show
 // final HP immediately and allow a new command rather than replaying them.
 const savedHp=mission10MultiView(combat).teams[1][0].hp;await page.reload();await page.getByText('TURN 2',{exact:true}).waitFor();
 await page.getByRole('button',{name:/몸통박치기, Normal/}).waitFor({state:'visible'});assert.equal(await page.getByRole('button',{name:/몸통박치기, Normal/}).isEnabled(),true);
 const body=await page.locator('body').innerText();assert.ok(body.includes(`${savedHp} / ${foes[0].maxHp}`),`saved opponent HP ${savedHp}: ${body}`);assert.equal(actions,1);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({viewport,actions,turn:2,savedEvents:combat.events.length,savedOpponentHp:savedHp,reloadActionEnabled:true}));await context.close();
}}finally{await browser.close();}
