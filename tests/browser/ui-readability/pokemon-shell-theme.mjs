import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{
 for(const width of [320,390,1280]){
  const page=await browser.newPage({viewport:{width,height:width<500?844:800},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://**/*',route=>route.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><circle cx="48" cy="48" r="35" fill="#729d89"/></svg>'}));
  await page.goto(base+'/?tab=games');await page.getByRole('button',{name:/탐험 모험/}).waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`home overflow at ${width}`);
  assert.equal(await page.locator('.mode-cards button').count(),2);
  for(const button of await page.locator('.mode-cards button').all()){
   const box=await button.boundingBox();assert.ok(box&&box.width>0&&box.height>=44);
   const title=await button.locator('h3').boundingBox(),art=await button.locator('.mode-art').boundingBox();
   if(title&&art)assert.ok(title.y>=art.y+art.height||title.x+title.width<=art.x,`art obscures heading at ${width}`);
  }
  await page.getByRole('link',{name:'게임 안내'}).click();await page.getByRole('heading',{name:'모험 안내'}).waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`guide overflow at ${width}`);
  await page.goto(base+'/?mode=adventure&tab=games');await page.locator('main[data-mode="adventure"]').waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`adventure shell overflow at ${width}`);
  await page.goto(base+'/?tab=games');await page.getByRole('button',{name:/200층 로그라이크/}).click();
  await page.locator('main[data-mode="rogue"]').waitFor();assert.equal(await page.locator('.sidebar nav').getAttribute('aria-label'),'게임 메뉴');
  assert.deepEqual(errors,[]);console.log(`shell ${width}px: selection, guide and roguelike navigation passed`);await page.close();
 }
}finally{await browser.close();}
