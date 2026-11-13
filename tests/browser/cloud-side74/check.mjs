import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldDialogue,fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const mon={...makeMon(150,95),boxId:'player',evolutions:[]};let revision=1,actions=[];const world={area:3,district:'lumiose-vert-sector9',interior:null,x:5,y:7,facing:'up',zaMission26Started:true,badges:[],activeId:'player',teamIds:['player'],areaInfo:{name:'베르 9번지',biome:'grass'},objective:'딜리버드',log:[]};
 const response=()=>({revision,world:{...world,map:fieldMap(world),interaction:fieldDialogue(world)},box:[mon],wallet:{coins:0,balls:5},inventory:{},gameTime:{period:'day'}});
 const ctx=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500,reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,body:'',contentType:'image/png'}));await page.route('**/api/world**',async route=>{const body=route.request().postDataJSON();if(body?.action==='side74Battle'){actions.push(body.action);revision++;}await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response())});});
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5227/');await page.locator('canvas.adv-field').waitFor();await page.getByRole('button',{name:/대화/}).click();const dialog=page.getByRole('dialog');await dialog.getByText('딜리버드 (위치 초안)').waitFor();await dialog.getByRole('button',{name:'더스트나와 배틀'}).click();assert.deepEqual(actions,['side74Battle']);assert.deepEqual(errors,[]);console.log(JSON.stringify({viewport,dialogue:true,battleRequest:true}));await ctx.close();
}}finally{await browser.close();}
