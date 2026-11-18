import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
 for(const viewport of [{width:1280,height:800},{width:390,height:844}])for(const mode of ['mega','tera','transform']){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.route('https://**/*',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
   await page.request.post(base+'/api/test-reset?scenario='+(mode==='mega'?'mega-command':mode==='tera'?'dual-type-tera':'dual-type-transform'));await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.waitForFunction(()=>!document.querySelector('.battle-screen[data-playing=true]'));
   const types=()=>page.locator('.bs-hud-own .bs-type-symbol').evaluateAll(nodes=>nodes.map(node=>node.dataset.type));assert.deepEqual(await types(),mode==='transform'?['normal']:['fire','flying']);
   await page.getByRole('button',{name:'싸운다',exact:true}).click();if(mode!=='transform'){await page.locator('summary').filter({hasText:'특수 변화'}).click();await (mode==='mega'?page.getByRole('button',{name:'메가진화 · 리자몽나이트X'}):page.locator('.bs-specials button').filter({hasText:'테라스탈'})).click();await page.locator('summary').filter({hasText:'특수 변화'}).click();}
   const response=page.waitForResponse(res=>res.url().endsWith('/api/rogue-classic')&&res.request().method()==='POST');await page.getByRole('button',{name:mode==='transform'?/변신/:/튀어오르기/}).first().click();assert.equal((await response).status(),200);await page.waitForFunction(()=>!document.querySelector('.battle-screen[data-playing=true]'));
   const expected=mode==='mega'?['fire','dragon']:mode==='tera'?['ghost']:['fire','flying'];await page.waitForFunction(expected=>{const battle=document.querySelector('.battle-screen'),nodes=[...document.querySelectorAll('.bs-hud-own .bs-type-symbol')];return battle&&battle.dataset.playing!=='true'&&JSON.stringify(nodes.map(n=>n.dataset.type))===JSON.stringify(expected)},expected,{timeout:15000});assert.deepEqual(await types(),expected);
   const before=await(await page.request.get(base+'/api/test-state')).json();await page.reload();await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.waitForFunction(expected=>{const battle=document.querySelector('.battle-screen'),nodes=[...document.querySelectorAll('.bs-hud-own .bs-type-symbol')];return battle&&battle.dataset.playing!=='true'&&JSON.stringify(nodes.map(n=>n.dataset.type))===JSON.stringify(expected)},expected,{timeout:15000});assert.deepEqual(await types(),expected);assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);assert.deepEqual(errors,[]);
   console.log(`${viewport.width}x${viewport.height} ${mode}: original, transformed, reload passed`);
  }finally{await context.close();}
 }
}finally{await browser.close();}
