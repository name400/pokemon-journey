import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldDialogue,fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const mon={...makeMon(25,40),boxId:'player',evolutions:[]};let revision=1,claims=0;const inventory={'za-exp-candy-l':998,'za-exp-candy-xl':999};
 const world={area:3,district:'lumiose-hibernal-approach',interior:null,x:14,y:6,facing:'up',badges:[],activeId:'player',teamIds:['player'],areaInfo:{name:'격리 테스트',biome:'city'},objective:'홀로베이터',log:[],zaSide118Complete:true,zaSide118RewardPending:{large:2,xl:1}};
 const response=()=>({revision,world:{...world,map:fieldMap(world),interaction:fieldDialogue(world)},box:[mon],wallet:{coins:3500,balls:5},inventory,fieldShop:[],gameTime:{period:'day'}});
 const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,body:'',contentType:'image/png'}));await page.route('**/api/world**',async route=>{const body=route.request().postDataJSON();if(body?.action==='claimSide118Rewards'){assert.equal(body.revision,revision);world.zaSide118RewardPending={large:1,xl:1};inventory['za-exp-candy-l']=999;revision++;claims++;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response())});});
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5235/');await page.getByRole('button',{name:'가방',exact:true}).click();const dialog=page.getByRole('dialog'),pending=dialog.locator('article').filter({hasText:'보관된 Gengar 수색 보상'});await pending.getByText('경험사탕L 2개 · 경험사탕XL 1개').waitFor();await pending.getByRole('button',{name:'보상 받기'}).click();await pending.getByText('경험사탕L 1개 · 경험사탕XL 1개').waitFor();assert.equal(claims,1);await page.reload();await page.getByRole('button',{name:'가방',exact:true}).click();await page.getByRole('dialog').getByText('경험사탕L 1개 · 경험사탕XL 1개').waitFor();assert.deepEqual(errors,[]);console.log(JSON.stringify({viewport,claims,pending:world.zaSide118RewardPending}));await context.close();
}}finally{await browser.close();}
