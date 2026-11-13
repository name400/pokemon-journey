import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {learnableMoves,tutorMoves} from '../../../lib/pokemon-config.mjs';
import {makeAdventureAlpha} from '../../../lib/cloud-adventure/adventure-alpha.mjs';
import {fieldDialogue,fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const mon={...makeAdventureAlpha(makeMon(16,24)),boxId:'player',evolutions:[]};mon.learnable=learnableMoves(mon,mon.level);mon.tutorMoves=tutorMoves(mon);let revision=1,requests=[],pending=false;
 const world={area:3,district:'lumiose-zone4',interior:null,x:5,y:10,facing:'left',badges:[],activeId:'player',teamIds:['player'],areaInfo:{name:'격리 테스트',biome:'grass'},objective:'기술 확인',log:[]};
 const response=()=>({revision,world:{...world,map:fieldMap(world),interaction:fieldDialogue(world),adventurePendingMoves:pending?[{boxId:'player',move:'몸통박치기'}]:[]},box:[mon],wallet:{coins:3000,balls:5},inventory:{},gameTime:{period:'day'}});
 const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,body:'',contentType:'image/png'}));await page.route('**/api/world**',async route=>{const body=route.request().postDataJSON();if(body?.action&&body.action!=='movementFence'){requests.push(body);revision++;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response())});});
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5227/');await page.getByRole('button',{name:'기술 · 성장'}).click();const ui=page.getByRole('dialog'),select=ui.getByLabel('배울 기술');const values=await select.locator('option').evaluateAll(options=>options.map(o=>o.value)),choice=values.find(x=>x&&!mon.moves.includes(x));assert.ok(choice);await select.selectOption(choice);
 let message='';page.once('dialog',async d=>{message=d.message();await d.dismiss();});await ui.getByRole('button',{name:'기술 배우기',exact:true}).click();assert.match(message,/우두머리 고유 기술 유턴/);assert.equal(requests.length,0);
 page.once('dialog',async d=>{assert.match(d.message(),/기술 교습소/);await d.accept();});await ui.getByRole('button',{name:'기술 배우기',exact:true}).click();assert.equal(requests.at(-1).action,'learn');
 pending=true;await page.reload();await page.getByRole('dialog',{name:'새 기술 배우기'}).waitFor();const before=requests.length;page.once('dialog',async d=>{assert.match(d.message(),/우두머리 고유 기술 유턴/);await d.dismiss();});await page.getByRole('button',{name:/유턴 대신/}).click();assert.equal(requests.length,before);assert.deepEqual(errors,[]);console.log(JSON.stringify({viewport,managementCancel:true,managementConfirm:true,pendingCancel:true}));await context.close();
}}finally{await browser.close();}
