import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.UI_TEST_URL||'http://127.0.0.1:5222',out='.sites-runtime/tests/ui-readability/double-layout',cache=process.env.SPRITE_CACHE||'/tmp/double-sprite-cache';
await mkdir(out,{recursive:true});await mkdir(cache,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const results=[],assets=new Map(),names={mewtwo:150,happiny:440,pancham:674,linoone:264};
async function artwork(route){
 const requested=route.request().url();let url=requested;
 if(url.startsWith('https://play.pokemonshowdown.com/sprites/ani')){const name=url.split('/').at(-1).replace('.gif',''),id=names[name];if(id)url=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${url.includes('ani-back')?'back/':''}${id}.gif`;}
 if(!url.startsWith('https://raw.githubusercontent.com/PokeAPI/sprites/'))return route.fulfill({status:404,body:''});
 const path=cache+'/'+createHash('sha256').update(url).digest('hex');let body;
 try{body=await readFile(path);}catch{try{body=execFileSync('curl',['-fsSL','--max-time','20',url]);await writeFile(path,body);}catch{return route.fulfill({status:404,body:''});}}
 assets.set(requested,{requested,source:url,sha256:createHash('sha256').update(body).digest('hex'),bytes:body.length});
 return route.fulfill({status:200,body,headers:{'access-control-allow-origin':'*','content-type':url.endsWith('.gif')?'image/gif':'image/png'}});
}
async function measure(page){return page.evaluate(async()=>{
 const scene=document.querySelector('.bs-scene'),box=scene.getBoundingClientRect(),tiny=matchMedia('(max-width:360px) and (max-height:650px) and (orientation:portrait)').matches,applicable=matchMedia('(min-width:850px), (max-width:600px) and (orientation:portrait)').matches;
 const nodes=await Promise.all([...scene.querySelectorAll('.bs-combatant')].map(async node=>{
  const img=node.querySelector('img'),image=new Image();image.crossOrigin='anonymous';image.src=img.currentSrc;await image.decode();
  const c=document.createElement('canvas');c.width=c.height=96;const ctx=c.getContext('2d'),fit=Math.min(96/image.naturalWidth,96/image.naturalHeight),w=image.naturalWidth*fit,h=image.naturalHeight*fit;ctx.drawImage(image,(96-w)/2,(96-h)/2,w,h);
  const p=ctx.getImageData(0,0,96,96).data;let l=96,r=-1,t=96,b=-1;for(let y=0;y<96;y++)for(let x=0;x<96;x++)if(p[(y*96+x)*4+3]>16){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  const rect=img.getBoundingClientRect(),nr=node.getBoundingClientRect(),style=getComputedStyle(node),ring=getComputedStyle(node,'::before'),own=node.classList.contains('bs-combatant-own'),slot=Number(node.dataset.battleSlot),goals=tiny?(own?[[.13,.98],[.36,.98]]:[[.63,.40],[.85,.40]]):(own?[[.134,.898],[.271,.898]]:[[.678,.587],[.823,.568]]),goal=goals[slot];
  const floor={x:rect.left+(l+r+1)/192*rect.width,y:rect.top+(b+1)/96*rect.height};
  return {own,slot,id:node.dataset.battleBoxid,source:img.currentSrc,natural:[img.naturalWidth,img.naturalHeight],visible:{left:rect.left+l/96*rect.width,right:rect.left+(r+1)/96*rect.width,top:rect.top+t/96*rect.height,bottom:floor.y},floor,goal:{x:box.left+goal[0]*box.width,y:Math.min(box.top+goal[1]*box.height,...(own?[]:[...scene.querySelectorAll('.bs-multi-vitals.is-own')].map(h=>h.getBoundingClientRect()).filter(h=>h.top>box.top+box.height*.3&&h.left<box.left+goal[0]*box.width+rect.width/2&&h.right>box.left+goal[0]*box.width-rect.width/2).map(h=>h.top-8*nr.height/node.offsetHeight)))},ring:ring.content==='none'?null:{x:nr.left+parseFloat(ring.left)*nr.width/node.offsetWidth,y:nr.bottom-parseFloat(ring.bottom)*nr.height/node.offsetHeight},anchored:!!node.style.getPropertyValue('--classic-anchor-x'),width:parseFloat(style.width)};
 }));return {nodes,applicable,tiny,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,scene:{left:box.left,right:box.right,top:box.top,bottom:box.bottom}};
});}
async function settled(page,count){await page.waitForFunction(count=>document.querySelectorAll('.bs-combatant').length===count&&[...document.querySelectorAll('.bs-combatant img')].every(i=>i.complete&&i.naturalWidth)&&!document.querySelector('.battle-screen[data-playing=true]'),count);await page.waitForTimeout(250);}
function check(m,single=false){
 assert.equal(m.nodes.length,single?2:4);assert.equal(m.overflow,false);
 for(const n of m.nodes){assert.ok(n.natural[0]>1);if(single||!m.applicable)assert.equal(n.anchored,false,'stale doubles anchor');else{
  // Showdown disallows canvas inspection in production, so its cropped canvas is the fallback.
  const tolerance=n.source.includes('play.pokemonshowdown.com')?9:2;
  assert.ok(Math.abs(n.floor.x-n.goal.x)<tolerance,JSON.stringify({reason:'floor x',n}));assert.ok(Math.abs(n.floor.y-n.goal.y)<tolerance,JSON.stringify({reason:'floor y',n}));
  if(n.ring){assert.ok(Math.abs(n.floor.x-n.ring.x)<tolerance,JSON.stringify({reason:'ring x',n}));assert.ok(Math.abs(n.floor.y-n.ring.y)<tolerance,JSON.stringify({reason:'ring y',n}));}
 }}
 if(!single)for(const own of [true,false]){const [a,b]=m.nodes.filter(n=>n.own===own).sort((a,b)=>a.slot-b.slot);assert.ok(b.visible.left-a.visible.right>=-2,JSON.stringify({reason:'overlapping artwork',a,b}));}
}
try{
 for(const viewport of [{width:1280,height:800},{width:1920,height:1080},{width:375,height:667},{width:320,height:568},{width:768,height:1024},{width:844,height:390}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width<900,hasTouch:viewport.width<900}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',artwork);
  await page.goto(base+'/layout.html');
  for(const mode of ['double','single','double','reversed']){
   if(mode!=='double'||results.some(r=>r.viewport.width===viewport.width))await page.getByRole('button',{name:mode,exact:true}).click();
   await settled(page,mode==='single'?2:4);const measured=await measure(page);check(measured,mode==='single');results.push({viewport,mode,...measured});
   await page.screenshot({path:out+'/'+viewport.width+'-'+viewport.height+'-'+mode+'.png',fullPage:true});
  }
  if(viewport.width===1280){for(const width of [375,768,1280]){await page.setViewportSize({width,height:800});await settled(page,4);const measured=await measure(page);check(measured);results.push({viewport:{width,height:800},mode:'resize',...measured});}}
  assert.deepEqual(errors,[]);await context.close();
 }
 await writeFile(out+'/results.json',JSON.stringify({results,assets:[...assets.values()]},null,2));console.log(JSON.stringify({passed:results.length,realSpriteAssets:assets.size}));
}finally{await browser.close();}
