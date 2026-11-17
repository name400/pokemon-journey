import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL||'http://127.0.0.1:5272';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:1280,height:800}]){
 const context=await browser.newContext({viewport,hasTouch:viewport.width<1000,isMobile:viewport.width<1000,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('poke-journey-battle-settings',JSON.stringify({animations:true,speed:1,sound:true}));window.__v60Sounds=[];HTMLMediaElement.prototype.play=function(){window.__v60Sounds.push(new URL(this.src).pathname);return Promise.resolve();};});
 await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
 await page.request.post(base+'/api/test-reset?scenario=mega-double-v60');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
 await page.getByRole('button',{name:'싸운다',exact:true}).click();const icon=page.locator('.bs-v60-mega');await icon.waitFor();
 const geometry=await page.evaluate(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {l:r.left,r:r.right,t:r.top,b:r.bottom}};return {icon:rect(document.querySelector('.bs-v60-mega')),buttons:[...document.querySelectorAll('.bs-move-panel button:not(.bs-v60-mega),.bs-specials-drawer summary')].filter(e=>e.offsetWidth&&e.offsetHeight).map(rect),width:innerWidth,height:innerHeight};});
 const a=geometry.icon;assert.ok(a.r-a.l>=43.9&&a.b-a.t>=43.9&&a.l>=0&&a.r<=geometry.width&&a.t>=0&&a.b<=geometry.height,JSON.stringify(geometry));
 for(const b of geometry.buttons)assert.ok(a.r<=b.l+.5||b.r<=a.l+.5||a.b<=b.t+.5||b.b<=a.t+.5,JSON.stringify(geometry));
 const before=await(await page.request.get(base+'/api/test-state')).json();await icon.click();assert.equal(await icon.getAttribute('aria-pressed'),'true');await icon.click();assert.equal(await icon.getAttribute('aria-pressed'),'false');assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);
 await icon.click();await page.getByRole('button',{name:/튀어오르기/}).first().click();
 await page.getByRole('button',{name:'싸운다',exact:true}).click();assert.equal(await icon.getAttribute('aria-pressed'),'false','The second actor must have its own selection');
 await icon.click();assert.equal(await icon.getAttribute('aria-pressed'),'true');await icon.click();assert.equal(await icon.getAttribute('aria-pressed'),'false');
 await page.getByRole('button',{name:/튀어오르기/}).first().click();const turn=page.waitForResponse(r=>r.request().method()==='POST'&&r.request().postDataJSON()?.action==='turn');
 await page.getByRole('button',{name:'2마리 행동 확정'}).click();const response=await turn;assert.ok(response.ok());const actions=response.request().postDataJSON().command.actions;
 assert.equal(actions[0].special,'mega:charizarditex');assert.equal(actions[1].special,undefined);
 assert.deepEqual((await page.evaluate(()=>window.__v60Sounds)).slice(0,3),['/game/v60/on-chime.wav','/game/v60/off-click.wav','/game/v60/on-chime.wav']);
 assert.deepEqual(errors,[]);console.log(`${viewport.width}x${viewport.height}: separate actor toggles and double command passed`);await context.close();
}}finally{await browser.close();}
