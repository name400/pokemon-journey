import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.CHUNK_TEST_URL||'http://127.0.0.1:5227',out='.sites-runtime/tests/chunk-recovery';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const results=[];
try{
 for(const width of [375,1280])for(const prefetch of [false,true]){
  const context=await browser.newContext({viewport:{width,height:844}}),page=await context.newPage();let posts=0,documents=0;const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
  page.on('request',r=>{if(r.method()==='POST')posts++;if(r.isNavigationRequest()&&r.frame()===page.mainFrame())documents++;});
  await page.route('https://**/*',route=>route.fulfill({status:200,contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg"/>'}));
  await page.route('**/api/rogue-classic**',route=>route.fulfill({json:{revision:0,slots:[],tools:{},starters:[],settings:{}}}));
  const failed='**/app/rogue.tsx';await page.route(failed,route=>route.abort('failed'));
  await page.goto(base+(prefetch?'/?tab=games':'/?mode=rogue&tab=rogue'));
  if(prefetch){const entry=page.getByRole('button',{name:/200층 로그라이크/});await entry.focus();await page.waitForTimeout(250);await entry.click();}
  const alert=page.getByRole('alert').filter({hasText:'게임 화면을 불러오지 못했어요'});await alert.waitFor();
  assert.ok(await page.getByRole('navigation',{name:'게임 메뉴'}).isVisible());assert.equal(posts,0);const initialDocuments=documents;await page.waitForTimeout(250);assert.equal(documents,initialDocuments);
  const dimensions=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));assert.equal(dimensions.width,dimensions.scroll);
  // Recovery is explicit. The browser must request the document again, not retry
  // a saved turn or silently reload when a module fails.
  await page.unroute(failed);await page.route(failed,route=>route.fulfill({contentType:'text/javascript',body:'export default function Recovered(){return "복구된 게임 화면";}'}));await page.getByRole('button',{name:'화면 새로고침'}).focus();await page.keyboard.press('Enter');await page.waitForLoadState('load');
  await page.getByText('복구된 게임 화면',{exact:true}).waitFor();
  assert.equal(documents,initialDocuments+1);assert.equal(posts,0);assert.deepEqual(pageErrors,[]);assert.ok(await page.getByRole('navigation',{name:'게임 메뉴'}).isVisible());
  results.push({width,prefetch,posts,initialDocuments,documents,dimensions});await context.close();
 }
 await writeFile(out+'/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({passed:results.length,results}));
}finally{await browser.close();}
