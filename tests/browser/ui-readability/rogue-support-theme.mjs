import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const width of [320,390,1280]){
  const page=await browser.newPage({viewport:{width,height:width===320?740:width===390?844:850},reducedMotion:'reduce'}),errors=[];
  page.setDefaultTimeout(10000);page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><circle cx="48" cy="48" r="32" fill="#739d89"/></svg>'}));
  await page.route('**/api/rogue-ranking',r=>r.fulfill({status:200,json:{leaders:[{nickname:'탐험가',best_wave:200},{nickname:'화면 격리 검증',best_wave:78,is_self:1}],own:{bestWave:78,rank:2,needsNickname:false}}}));
  const fit=async label=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${label} overflow ${width}`);
  await page.request.post(base+'/api/test-reset?scenario=rewards');await page.goto(base+'/?mode=rogue&tab=rogue');
  await page.getByRole('button',{name:'새 도전 시작'}).last().click();await page.locator('.rogue-starters-screen').waitFor();await fit('starter');
  await page.locator('.rss-mon:not(.is-locked)').first().click();
  const detail=page.getByRole('button',{name:'선택 포켓몬 설정'});if(await detail.isVisible()&&await detail.getAttribute('aria-pressed')!=='true')await detail.click();
  const add=page.getByRole('button',{name:/파티에 추가/});await add.waitFor();await add.click();assert.equal(await page.locator('.rss-slots .is-filled').count(),1);
  await page.request.post(base+'/api/test-reset?scenario=rewards');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('button',{name:'파티',exact:true}).click();
  await page.locator('.rc-party-grid .rc-mon').first().waitFor();assert.equal(await page.locator('.rc-party-grid .rc-mon').count(),2);await fit('party');
  await page.getByRole('button',{name:'알 상점',exact:true}).click();await page.locator('.rc-machine').first().waitFor();await page.locator('.rc-machine').first().click();assert.equal(await page.locator('.rc-machine').first().getAttribute('aria-pressed'),'true');await fit('eggs');
  await page.goto(base+'/?mode=rogue&tab=ranking');await page.getByText('탐험가').waitFor();await page.getByRole('button',{name:'새로고침',exact:true}).click();await page.getByText('탐험가').waitFor();await fit('ranking');
  const refresh=page.getByRole('button',{name:'새로고침',exact:true});assert.equal(await refresh.evaluate(e=>e.scrollWidth<=e.clientWidth),true,`ranking button clipped ${width}`);
  assert.deepEqual(errors,[]);console.log(`rogue support screens ${width}px passed`);await page.close();
 }
}finally{await browser.close();}
