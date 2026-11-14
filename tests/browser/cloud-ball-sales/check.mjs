import assert from 'node:assert/strict';
import {makeMon} from '../../../lib/game.mjs';
import {fieldDialogue,fieldMap} from '../../../lib/cloud-adventure/adventure-world.mjs';
import {adventureSupplySale} from '../../../lib/cloud-adventure/adventure-supply-sales.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:850}]){
 const mon={...makeMon(25,40),boxId:'player',evolutions:[]},balls={nestball:2,diveball:2,repeatball:2,premierball:2};let coins=0,revision=1,changes=0;
 const world={area:3,district:'lumiose-jaune-sector8',interior:null,x:7,y:7,facing:'up',badges:[],activeId:'player',teamIds:['player'],areaInfo:{name:'격리 테스트',biome:'grass'},objective:'격리 상점',log:[],adventureBalls:balls};
 const response=()=>({revision,world:{...world,map:fieldMap(world),interaction:fieldDialogue(world)},box:[mon],wallet:{coins,balls:5},inventory:{},fieldShop:[],gameTime:{period:'day'}});
 const context=await browser.newContext({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,body:'',contentType:'image/png'}));await page.route('**/api/account',r=>r.fulfill({json:{authenticated:true,profile:{nickname:'격리 검사'},signOut:'#'}}));await page.route('**/api/world**',async r=>{if(new URL(r.request().url()).searchParams.has('engineOnly'))return r.fulfill({json:{engine:'cloud'}});const b=r.request().postDataJSON();if(b?.action==='movementFence'){revision++;return r.fulfill({json:{settled:true}});}if(b?.action==='sellAdventureSupply'){const item=adventureSupplySale(b.item);assert.ok(item);assert.equal(b.revision,revision);balls[item.id]-=b.quantity;coins+=item.price*b.quantity;revision++;changes++;}return r.fulfill({json:response()});});
 await page.goto((process.env.TEST_URL||'http://127.0.0.1:5399/')+'?mode=adventure&tab=adventure');await page.locator('canvas.adv-field').waitFor();await page.keyboard.press('e');await page.getByRole('dialog').getByRole('button',{name:'상품 보기'}).click();const dialog=page.getByRole('dialog');
 for(const [id,name,price] of [['nestball','네스트볼',250],['diveball','다이브볼',250],['repeatball','리피트볼',250],['premierball','프레미어볼',50]]){const item=dialog.locator('article').filter({hasText:name});await item.waitFor();await item.getByRole('button',{name:new RegExp(`${price}코인.*판매`)}).click();assert.equal(balls[id],1);}
 await page.screenshot({path:`/tmp/ball-sales-${viewport.width}.png`});assert.equal(coins,800);assert.equal(changes,4);assert.deepEqual(errors,[]);await context.close();
}console.log('Four ball sales: PC and mobile mock shop.');}finally{await browser.close();}
