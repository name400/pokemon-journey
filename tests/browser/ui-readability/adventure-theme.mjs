import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222';
const mon={boxId:'fixture',id:1,speciesId:1,name:'이상해씨',types:['풀','독'],level:5,hp:18,maxHp:20,experience:0,expToNext:20,evolutions:[]};
const data={engine:'cloud',revision:1,box:[mon],wallet:{coins:100,balls:5,potions:2},inventory:{},fieldShop:[],gameTime:{period:'day'},battle:null,world:{area:0,areaInfo:{name:'테스트 지역',biome:'meadow',min:2,max:5},map:Array.from({length:17},()=>'.'.repeat(23)),x:11,y:8,facing:'down',teamIds:['fixture'],activeId:'fixture',badges:[],objective:'여행을 시작하세요',log:[],adventureBalls:{}}};
try{for(const width of [320,390,1280]){
 const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><circle cx="48" cy="48" r="35" fill="#729d89"/></svg>'}));
 await page.route('**/api/world**',r=>r.fulfill({json:data}));
 const noOverflow=async label=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${label} overflow ${width}`);
 await page.goto(base+'/?mode=adventure&tab=adventure');await page.getByLabel('필드 탐험').waitFor();await noOverflow('field');
 await page.getByRole('button',{name:'포켓몬',exact:true}).click();await page.getByRole('heading',{name:'포켓몬 · 파티와 보유함'}).waitFor();
 await page.getByRole('button',{name:'파티 편성하기'}).click();assert.equal(await page.locator('.adv-roster button').first().getAttribute('aria-pressed'),'true');await noOverflow('party');
 if(width===390)await page.screenshot({path:'/tmp/adventure-party-390.png'});
 await page.getByRole('button',{name:'닫기'}).click();await page.getByRole('button',{name:'가방',exact:true}).click();await page.getByRole('heading',{name:'가방',exact:true}).waitFor();await page.getByText('상처약',{exact:true}).first().waitFor();await noOverflow('bag');
 if(width===390)await page.screenshot({path:'/tmp/adventure-bag-390.png'});
 await page.getByRole('button',{name:'닫기'}).click();assert.deepEqual(errors,[]);console.log(`adventure screens ${width}px passed`);await page.close();
}}finally{await browser.close();}
