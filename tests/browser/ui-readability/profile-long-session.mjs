import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5225',out='.sites-runtime/tests/ui-readability/long-session'+(process.env.PROFILE_SUFFIX||'');await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});const results=[];
try{for(const count of (process.env.PROFILE_LOG_COUNTS||'0,300,1500').split(',').map(Number)){
 const context=await browser.newContext({viewport:{width:Number(process.env.PROFILE_WIDTH||1280),height:800}}),page=await context.newPage(),cdp=await context.newCDPSession(page);page.setDefaultTimeout(15000);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await page.request.post(base+'/api/test-reset?scenario=profile-log-'+count);await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('button',{name:'싸운다',exact:true}).waitFor();await page.waitForFunction(()=>!document.querySelector('.battle-screen[data-playing=true]'));await page.waitForFunction(()=>[...document.querySelectorAll('.bs-combatant img')].every(i=>i.complete&&i.naturalWidth>0));
 const result=await page.evaluate(async()=>{
  const longtasks=[],observer=new PerformanceObserver(list=>longtasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration}))));observer.observe({type:'longtask'});
  const next=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))),times=[];
  // DOM click avoids Playwright actionability/hit-testing in the measured section.
  for(let i=0;i<12;i++){const start=performance.now();[...document.querySelectorAll('.bs-classic-commands button')].find(b=>b.textContent==='싸운다').click();await next();if(!document.querySelector('.bs-move'))throw Error('Move panel missing');document.querySelector('.battle-screen').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await next();times.push(performance.now()-start);}
  await next();observer.disconnect();return {times,longtasks,logNodes:document.querySelectorAll('.bs-log-lines p').length,domNodes:document.querySelectorAll('*').length,loadedRealImages:[...document.querySelectorAll('.bs-combatant img')].every(i=>i.complete&&i.naturalWidth&&i.currentSrc.includes('/profile-art/'))};
 });assert.ok(result.loadedRealImages);
 results.push({count,...result});console.log(JSON.stringify(results.at(-1)));await context.close();
}await writeFile(out+'/menu-results.json',JSON.stringify(results,null,2));}finally{await browser.close();}
