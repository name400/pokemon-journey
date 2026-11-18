import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:18992';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:280,height:568},{width:390,height:844},{width:844,height:390},{width:1280,height:800}]){
 const context=await browser.newContext({viewport,reducedMotion:'reduce',isMobile:viewport.width<600,hasTouch:viewport.width<600}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);
 try{
  await page.route('https://**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.request.post(base+'/api/test-reset?scenario=evolution-guidance');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();
  const before=await(await page.request.get(base+'/api/test-state')).json();await page.getByRole('button',{name:'파티',exact:true}).first().click();
  const weather=page.locator('.rc-mon').filter({hasText:'미끄네일'}),biome=page.locator('.rc-mon').filter({hasText:'마빌크'}),item=page.locator('.rc-mon').filter({hasText:'윤겔라'});await weather.waitFor();assert.match(await weather.innerText(),/날씨: 비 · 안개 · 큰비/);assert.match(await biome.innerText(),/바이옴: 마을 · 평야 · 풀숲 · 높은 풀숲 · 대도시/);assert.match(await item.innerText(),/연결의끈 1개/);assert.doesNotMatch(await item.innerText(),/linkingcord/);
  const result=await page.locator('.rc-evolution-option').evaluateAll(nodes=>nodes.map(e=>{const text=e.querySelector('small'),button=e.querySelector('button'),a=text.getBoundingClientRect(),b=button.getBoundingClientRect(),container=e.getBoundingClientRect();return {label:text.textContent,overflow:text.scrollWidth>text.clientWidth+1||a.left<container.left-1||a.right>container.right+1,overlap:a.top<b.bottom-.5&&b.top<a.bottom-.5&&a.left<b.right-.5&&b.left<a.right-.5};}));assert.ok(result.length>2);assert.ok(result.every(e=>!e.overflow&&!e.overlap),JSON.stringify({viewport,result}));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await page.getByRole('button',{name:'도전으로 돌아가기'}).click();assert.equal(await page.locator('.rc-mon').count(),0);assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);assert.deepEqual(errors,[]);console.log(JSON.stringify({viewport,conditions:result.length}));
 }finally{await context.close();}
}}finally{await browser.close();}
