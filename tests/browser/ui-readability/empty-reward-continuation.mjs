import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {salesmanFixture} from '../../fixtures/empty-reward-salesman.mjs';
import {applyClassicAction,activeClassicRun,classicGameView} from '../../../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../../../lib/game-storage.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5224',out='.sites-runtime/tests/empty-reward-continuation',results=[];
await mkdir(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const width of [375,1280])for(const scenario of ['leave','buy','confirm','capture']){
  let {doc,run}=salesmanFixture({fullParty:scenario==='capture'}),revision=0;const job=scenario==='leave'?'leave':'buy';applyClassicAction(doc,{action:'mysterySelect',job,offerId:run.mystery.offer.pokemon.boxId});if(scenario!=='confirm')applyClassicAction(doc,{action:'mysteryConfirm'});doc=await decodeGameData(await encodeGameData(doc));
  const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://**/*',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.route('**/api/rogue-classic*',async route=>{let extra={};if(route.request().method()==='POST'){extra=applyClassicAction(doc,route.request().postDataJSON());revision++;}await route.fulfill({json:{...classicGameView(doc),...extra,revision}});});
  await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();const next=page.getByRole('button',{name:'다음으로',exact:true});
  if(['leave','buy'].includes(scenario)){await next.waitFor();assert.equal(await next.count(),1);await page.screenshot({path:`${out}/${scenario}-${width}.png`,fullPage:true});await Promise.all([page.waitForResponse(r=>r.request().method()==='POST'&&r.request().postDataJSON()?.action==='skipReward'),next.click()]);assert.equal(activeClassicRun(doc).wave,24);assert.equal(activeClassicRun(doc).screen,'battle');}
  else{await page.getByRole('button',{name:scenario==='confirm'?'확인':'도감에 등록하고 놓아주기',exact:true}).waitFor();assert.equal(await next.count(),0);assert.equal(activeClassicRun(doc).screen,scenario==='confirm'?'mystery':'capture');}
  assert.deepEqual(errors,[]);results.push({width,scenario,wave:activeClassicRun(doc).wave,screen:activeClassicRun(doc).screen});await context.close();
 }
 await writeFile(out+'/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({passed:results.length,results}));
}finally{await browser.close();}
