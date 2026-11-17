import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
import {createMission10DoubleSnapshot,mission10MultiView} from '../../../lib/cloud-adventure/adventure-mission10-double.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL||'http://127.0.0.1:5262';
const mon=(id,boxId)=>({...makeMon(id,50),boxId,moves:['몸통박치기']});
const player=mon(1,'p'),ally=mon(155,'a'),foes=[mon(143,'f0'),mon(150,'f1')];
const battle=mission10MultiView(createMission10DoubleSnapshot([player],[ally],foes));
// The production companion fixture has one controllable actor. Add a second
// request to exercise the UI's multi-owner draft; the endpoint remains mocked.
const actor=battle.requests[0].actors[0];battle.requests[0].actors.push({...structuredClone(actor),slot:1,active:1});
const world={area:3,district:'lumiose-north-boulevard',interior:null,areaInfo:{name:'시험 거리',biome:'city'},x:3,y:8,facing:'up',teamIds:['p'],activeId:'p',badges:[],objective:'배틀',log:[],steps:0};world.map=fieldMap(world);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const [width,height] of [[320,568],[844,390]]){const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),page=await context.newPage(),sent=[];page.setDefaultTimeout(15000);
 await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.route('**/api/world**',r=>{if(new URL(r.request().url()).searchParams.has('engineOnly'))return r.fulfill({json:{engine:'cloud'}});if(r.request().method()==='POST')sent.push(r.request().postDataJSON());return r.fulfill({json:{engine:'cloud',revision:7,box:[player],wallet:{coins:0,balls:0,potions:0},inventory:{},fieldShop:[],expeditions:[],gameTime:{period:'day'},battle,world}})});
 await page.goto(base+'/?mode=adventure&tab=adventure');const layer=page.locator('.adv-battle-layer');await layer.locator('.bs-scene').waitFor();
 for(const targetName of ['상대 1','상대 2']){await layer.getByRole('button',{name:'싸운다',exact:true}).tap();await layer.locator('.bs-move').first().tap();await layer.locator('.bs-target-grid button').filter({hasText:targetName}).tap();}
 const review=layer.locator('.bs-turn-review');await review.waitFor();assert.match(await review.innerText(),/이상해씨/);assert.match(await review.innerText(),/브케인/);await review.getByRole('button',{name:'수정'}).first().tap();await layer.getByRole('button',{name:'싸운다',exact:true}).tap();await layer.locator('.bs-move').first().tap();await layer.locator('.bs-target-grid button').filter({hasText:'상대 1'}).tap();await review.waitFor();await review.locator('.bs-submit-turn').tap();
 const command=sent.find(x=>x.action==='battle')?.command;assert.equal(command?.type,'turn');assert.deepEqual(command.actions.map(x=>[x.actor,x.target]),[[0,1],[1,2]]);
 console.log(`${width}x${height}: two controlled actors retained distinct target commands`);await context.close();}}
finally{await browser.close();}
