import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
try {
 for(const width of [320,390,1280]) {
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><circle cx="48" cy="48" r="35" fill="#729d89"/></svg>'}));
  await page.route('**/api/world',r=>r.fulfill({json:{box:[{boxId:'fixture',id:1,speciesId:1,name:'이상해씨',level:5,hp:18,maxHp:18,origin:'capture'}]}}));
  await page.route('**/api/friends',r=>r.fulfill({json:{friendCode:'1234567890',items:[{id:'fixture',nickname:'친구',friendCode:'0987654321',status:'accepted',direction:'incoming'}]}}));
  await page.route('**/api/trades',r=>r.fulfill({json:{items:[]}}));
  await page.route('**/api/admin**',r=>r.fulfill({json:{players:[],box:[],audit:[],starterOptions:[]}}));
  const noOverflow=async label=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${label} overflow at ${width}`);
  await page.goto(base+'/?mode=adventure&tab=collection');await page.getByText('이상해씨 · Lv.5').waitFor();await noOverflow('collection');
  await page.goto(base+'/?mode=adventure&tab=social');await page.getByText('1234567890',{exact:true}).waitFor();await page.getByRole('button',{name:'새로고침'}).first().click();await noOverflow('social adventure');
  await page.goto(base+'/?mode=rogue&tab=social');await page.getByText('1234567890',{exact:true}).waitFor();await noOverflow('social rogue');
  await page.goto(base+'/?tab=admin');await page.getByRole('button',{name:'탐험 관리'}).click();await page.getByLabel('대상 플레이어').waitFor();await noOverflow('admin');
  assert.equal(await page.getByRole('button',{name:'탐험 관리'}).getAttribute('aria-pressed'),'true');
  if(width===390)await page.screenshot({path:'/tmp/shared-admin-390.png'});
  assert.deepEqual(errors,[]);console.log(`shared screens ${width}px passed`);await page.close();
 }
}finally{await browser.close();}
