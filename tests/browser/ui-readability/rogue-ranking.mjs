import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
 const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];page.setDefaultTimeout(12000);page.on('pageerror',error=>errors.push(error.message));
 try{let payload={leaders:[{nickname:'먼저',best_wave:12,is_self:0},{nickname:'나',best_wave:12,is_self:1}],own:{bestWave:12,rank:2,needsNickname:false}};
  await page.route('**/api/rogue-ranking',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(payload)}));await page.route('https://**/*',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"/>'}));
  await page.request.post(base+'/api/test-reset?scenario=evolution');await page.goto(base+'/?mode=rogue&tab=rogue');await page.getByRole('button',{name:'계속하기',exact:true}).first().click();const before=await(await page.request.get(base+'/api/test-state')).json();await page.getByRole('button',{name:'랭킹',exact:true}).click();
  const ranking=page.getByRole('region',{name:'포켓로그 랭킹'}),own=ranking.getByRole('region',{name:'개인 최고 기록'}),global=ranking.getByRole('region',{name:'글로벌 랭킹'});await ranking.getByText('글로벌 2위').waitFor();assert.match(await ranking.innerText(),/완료한 최고 웨이브/);assert.match(await own.innerText(),/12 웨이브/);assert.deepEqual(await global.locator('li').allTextContents(),['01먼저12 웨이브','02나 나12 웨이브']);
  payload={leaders:[],own:null};await ranking.getByRole('button',{name:'새로고침'}).click();await ranking.getByText('아직 등록된 기록이 없습니다.').waitFor();assert.match(await own.innerText(),/아직 기록이 없습니다.*완료한 웨이브/s);
  payload={leaders:[],own:{bestWave:12,rank:null,needsNickname:true}};await ranking.getByRole('button',{name:'새로고침'}).click();await ranking.getByText('닉네임을 설정하면 글로벌 랭킹에 표시됩니다.').waitFor();assert.deepEqual(await(await page.request.get(base+'/api/test-state')).json(),before);assert.deepEqual(errors,[]);console.log(`${viewport.width}x${viewport.height}: ranking, ties, no record and nickname passed`);
 }finally{await context.close();}
}}finally{await browser.close();}
