import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {createMission10DoubleSnapshot,mission10MultiView,playMission10MultiTurn} from '../../../lib/cloud-adventure/adventure-mission10-double.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const mon=(id,boxId)=>({...makeMon(id,40),boxId,moves:['튀어오르기'],pp:{},evolutions:[]});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const player=mon(25,'player'),reserve={...mon(4,'reserve'),hp:10,name:'대기포켓몬'},ally=mon(25,'ally'),foes=[mon(129,'foe1'),mon(129,'foe2')];let combat=createMission10DoubleSnapshot([player,reserve],[ally],foes),revision=1,actions=0,received=null,stock=1;const errors=[];
 const world={area:3,district:'lumiose',interior:null,x:3,y:5,facing:'down',badges:[],activeId:'player',teamIds:['player','reserve'],areaInfo:{name:'격리 테스트',biome:'grass'},objective:'격리 테스트',log:[],trainer:{name:'상대'},map:Array(17).fill('.'.repeat(23))};
 const response=()=>({revision,world,box:[player,reserve],battle:mission10MultiView(combat),wallet:{coins:100,balls:5,potions:0},inventory:{sodapop:stock},gameTime:{period:'day'}});
 const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,body:'',contentType:'image/png'}));
 await page.route('**/api/world**',async route=>{const body=route.request().postDataJSON();if(body?.action==='use'){received=body;stock--;combat=playMission10MultiTurn(combat,{type:'item',item:'adventure-sodapop',boxId:body.boxId});actions++;revision++;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response())});});
 await page.goto(process.env.UI_TEST_URL||'http://127.0.0.1:5271/');await page.getByRole('navigation',{name:'전투 명령'}).getByRole('button',{name:'가방',exact:true}).click();await page.locator('summary').filter({hasText:'대기포켓몬 · HP 10/'}).click();await page.getByRole('button',{name:/미네랄사이다 · 대기포켓몬/}).click();await page.waitForFunction(()=>document.body.innerText.includes('TURN 2'));assert.equal(actions,1);assert.equal(received.boxId,'reserve');assert.equal(received.item,'sodapop');assert.equal(mission10MultiView(combat).teams[0].find(m=>m.boxId==='reserve').hp,60);await page.reload();await page.getByText('TURN 2',{exact:true}).waitFor();assert.equal(actions,1);assert.deepEqual(errors,[]);console.log(JSON.stringify({viewport,actions,reserveHp:60,reload:true}));await context.close();
}}finally{await browser.close();}
