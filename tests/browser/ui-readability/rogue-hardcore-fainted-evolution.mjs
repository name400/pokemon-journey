import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),base=process.env.UI_TEST_URL,owner=process.env.UI_FIXTURE_OWNER_TOKEN;
if(!base||!owner)throw Error('Owned fixture server required');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);
 try{
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  const ownership=await page.request.get(base+'/api/test-owner',{headers:{'x-fixture-owner':owner}});assert.ok(ownership.ok()&&(await ownership.json()).owned);
  assert.ok((await page.request.post(base+'/api/test-reset?scenario=hardcore-fainted-evolution')).ok());
  await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();await page.getByRole('navigation',{name:'도전 메뉴'}).getByRole('button',{name:'파티',exact:true}).click();
  const cards=page.locator('.rc-mon'),dead=cards.nth(0),live=cards.nth(1),evolve=card=>card.getByRole('button',{name:'라이츄 · Normal(으)로 진화'});
  assert.ok(await evolve(dead).isDisabled());assert.ok(await dead.getByText('영구 기절 상태',{exact:false}).first().isVisible());await page.waitForFunction(()=>{const cards=document.querySelectorAll('.rc-mon');return [...(cards[1]?.querySelectorAll('button')||[])].some(b=>b.textContent.includes('라이츄 · Normal(으)로 진화')&&!b.disabled);});assert.ok(await evolve(live).isEnabled());
  const response=page.waitForResponse(r=>r.url().includes('/api/rogue-classic')&&r.request().method()==='POST');await evolve(live).click();assert.ok((await response).ok());
  const saved=await(await page.request.get(base+'/api/test-state')).json();assert.equal(saved.classic.slots[0].party[0].rogueSourceId,25);assert.equal(saved.classic.slots[0].party[0].hp,0);assert.equal(saved.classic.slots[0].party[1].rogueSourceId,26);assert.equal(saved.classic.slots[0].evolutionItems.thunderstone,1);assert.deepEqual(saved.adventure,{safe:true});assert.equal(saved.classic.slots[1].id,'other');
  await page.reload();assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),saved);assert.deepEqual(errors,[]);console.log(`${viewport.width}x${viewport.height}: hardcore evolution UI and save passed`);
 }finally{await context.close();}
}}finally{await browser.close();}
