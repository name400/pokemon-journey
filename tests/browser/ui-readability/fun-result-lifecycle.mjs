import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolvedFunFixture,leaveFunResult} from '../../fixtures/fun-result-lifecycle.mjs';
import {applyClassicAction,activeClassicRun,classicGameView} from '../../../lib/rogue-classic-game.mjs';
import {generateClassicRewards} from '../../../lib/rogue-classic-rewards.mjs';
import {ensureClassicState} from '../../../lib/rogue-classic-state.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5224',out='.sites-runtime/tests/fun-result-lifecycle',results=[];
await mkdir(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const width of [375,1280])for(const scenario of ['current-none','current-lens','legacy-normal']){
  const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];let doc=await resolvedFunFixture(scenario==='current-lens'?'lens':'none'),revision=0;
  if(scenario==='legacy-normal'){const stale=structuredClone(activeClassicRun(doc).mystery),run=leaveFunResult(doc);run.screen='reward';run.combat=null;generateClassicRewards(run,ensureClassicState(doc).system);run.mystery=stale;}
  page.on('pageerror',error=>errors.push(error.message));await page.route('https://**/*',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.route('**/api/rogue-classic*',async route=>{let extra={};if(route.request().method()==='POST'){extra=applyClassicAction(doc,route.request().postDataJSON());revision++;}await route.fulfill({json:{...classicGameView(doc),...extra,revision}});});
  await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  const noPrize=page.getByText('도전이 끝났습니다. 이번에는 렌즈를 받지 못했습니다.',{exact:true}),prize=page.getByText('도전에 성공해 렌즈를 받습니다.',{exact:true});
  if(scenario==='legacy-normal'){await page.locator('.rcr-choice').first().waitFor();assert.match(await page.locator('.rcr-choice-count').textContent(),/3가지 선택지/);assert.equal(await page.locator('.rcr-choice').count(),3);assert.equal(await noPrize.count(),0);assert.equal(await prize.count(),0);assert.equal(await page.getByRole('button',{name:'보상을 받지 않고 다음으로',exact:true}).count(),0);}
  else if(scenario==='current-none'){await noPrize.waitFor();assert.equal(await prize.count(),0);assert.equal(await page.getByRole('button',{name:'다음으로',exact:true}).count(),1);}
  else{await prize.waitFor();assert.equal(await noPrize.count(),0);assert.equal(await page.locator('.rcr-choice').count(),1);}
  assert.deepEqual(errors,[]);await page.screenshot({path:`${out}/${scenario}-${width}.png`,fullPage:true});results.push({scenario,width,rewardChoices:await page.locator('.rcr-choice').count(),oldNoPrizeShown:await noPrize.count()});await context.close();
 }
 await writeFile(out+'/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({passed:results.length,results}));
}finally{await browser.close();}
