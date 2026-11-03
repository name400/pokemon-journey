'use client';
import {useEffect,useRef,useState} from 'react';
import manifest from '@/public/game/town/tiles.json';
import {fieldPath} from '@/lib/adventure-field-core.mjs';
import {shouldRenderField,createFieldScheduler} from '@/lib/adventure-render.mjs';
import {GARDEN_VISIBLE,visibleWildTile} from '@/lib/adventure-visible-wild.mjs';
import {fieldThrowTarget} from '@/lib/adventure-field-throw.mjs';

type Props={world:any;disabled:boolean;night:boolean;aiming?:boolean;throwing?:boolean;onPath:(path:string[])=>void;onInteract:()=>void;onAim?:(target:{x:number;y:number})=>void};
const palettes:Record<string,string[]>={meadow:['#82bd68','#b5da82','#e5d0a0'],rock:['#aab584','#d3d5aa','#c9b58a'],water:['#80bc9f','#c0dba1','#e9dcad'],electric:['#98c09a','#c9dcb2','#d8c7a4'],forest:['#69a86a','#9dc97c','#dbcda0'],poison:['#8eaa8d','#bdcaa2','#c9bea4'],psychic:['#a0b49a','#cfdbb8','#dfd3bd'],volcano:['#ae9f7d','#c7b68d','#cfb393'],ground:['#b3af7f','#d4ca95','#cdb887'],league:['#82ab93','#b8cdb5','#c6c5b3']};
const gymFloors:Record<string,[string,string,string]>={rock:['#d9ceb5','#cfc2a5','#897657'],water:['#d3e8e7','#c2dbdf','#4d8799'],electric:['#f2e7ba','#e8d99e','#a98235'],forest:['#d8e7ca','#c5dbb7','#5d8e5b'],poison:['#e3d5e2','#d6c4d7','#92618d'],psychic:['#f0dbe2','#e6cbd6','#ac6688'],volcano:['#f0d7c1','#e4c5a7','#b7614f'],ground:['#e5d5b9','#d8c3a0','#997754']};
const trainerRows=['...RRRRR....','..RRRRRRR...','..RRWWWWRR..','...SSSSS....','...SKSKS....','....SSS.....','..BBBBBBB...','.SBBBBBBBS..','.SBBYYYBBS..','..BBYYYBB...','...KKKKK....','...KK.KK....','...KK.KK....','..DDD.DDD...'];

export default function AdventureField({world:w,disabled,night,aiming=false,throwing=false,onPath,onInteract,onAim}:Props){
 const canvas=useRef<HTMLCanvasElement>(null),invalidateRef=useRef<()=>void>(()=>{}),props=useRef({w,disabled,night,aiming,onPath,onInteract,onAim}),scene=useRef({x:w.x,y:w.y,area:w.area,expedition:w.locationId||0,interior:w.interior||'',cameraX:0,cameraY:0,tile:32}),[assetError,setAssetError]=useState(false);
 const visibleNames=w.interior==='citywild'?Object.entries(GARDEN_VISIBLE).filter(([tile])=>w.map.some((row:string)=>row.includes(tile))).map(([,pokemon])=>pokemon.name).join(', '):'';
 props.current={w,disabled,night,aiming,onPath,onInteract,onAim};
 useEffect(()=>{
  const el=canvas.current;if(!el)return;const ctx=el.getContext('2d');if(!ctx)return;
  const images=new Map<string,HTMLImageElement>(),requested=new Set<string>(),motion=window.matchMedia('(prefers-reduced-motion: reduce)');let disposed=false,last=0,width=736,height=544,lastDrawn:any=null;
  const scheduler=createFieldScheduler((callback:FrameRequestCallback)=>requestAnimationFrame(callback),(id:number)=>cancelAnimationFrame(id),draw);invalidateRef.current=scheduler.invalidate;
  for(const src of ['/game/town/tilemap.png','/game/town/terrain.png']){const img=new Image();img.onload=()=>{if(!disposed){images.set(src,img);scheduler.invalidate();}};img.onerror=()=>{if(!disposed)setAssetError(true);};img.src=src;}
  function wildSprite(id:number){const src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;if(!requested.has(src)){requested.add(src);const img=new Image();img.crossOrigin='anonymous';img.onload=()=>{if(!disposed){images.set(src,img);scheduler.invalidate();}};img.src=src;}return images.get(src);}
  const observer=new ResizeObserver(([entry])=>{const nextWidth=Math.max(1,Math.round(entry.contentRect.width)),nextHeight=Math.max(1,Math.round(entry.contentRect.height));if(nextWidth!==width||nextHeight!==height||el.width!==nextWidth*2||el.height!==nextHeight*2){width=nextWidth;height=nextHeight;el.width=width*2;el.height=height*2;lastDrawn=null;scheduler.invalidate();}});observer.observe(el);
  const onMotionChange=()=>scheduler.invalidate();motion.addEventListener('change',onMotionChange);
  function draw(time:number){
   if(disposed||!ctx||!el)return false;const {w,night,aiming}=props.current,s=scene.current,outdoor=w.interior==='citywild',arena=w.interior==='cityarena',dt=Math.min(48,time-last||16);last=time;
   const movedArea=s.area!==w.area||s.expedition!==(w.locationId||0)||s.interior!==(w.interior||'');
   if(movedArea){s.x=w.x;s.y=w.y;s.area=w.area;s.expedition=w.locationId||0;s.interior=w.interior||'';}
   const moving=Math.abs(s.x-w.x)+Math.abs(s.y-w.y)>.025;
   const reduce=motion.matches,current={world:w,width,height,images:images.size,reduced:reduce,moving,night,aiming};
   if(!shouldRenderField(lastDrawn,current,moving))return false;
   lastDrawn=current;
   s.x=reduce?w.x:s.x+(w.x-s.x)*Math.min(1,dt/72);s.y=reduce?w.y:s.y+(w.y-s.y)*Math.min(1,dt/72);
   if(!moving){s.x=w.x;s.y=w.y;}
   const tile=width>=900?40:32;s.tile=tile;
   s.cameraX=Math.max(0,Math.min(w.map[0].length*tile-width,(s.x+.5)*tile-width/2));s.cameraY=Math.max(0,Math.min(w.map.length*tile-height,(s.y+.5)*tile-height/2));
   // If the viewport is larger than the map, center it.
   if(width>w.map[0].length*tile)s.cameraX=-(width-w.map[0].length*tile)/2;
   if(height>w.map.length*tile)s.cameraY=-(height-w.map.length*tile)/2;
   ctx.setTransform(2,0,0,2,0,0);ctx.imageSmoothingEnabled=false;
   const palette=palettes[w.areaInfo.biome]||palettes.meadow;
   ctx.fillStyle=arena?'#202c40':w.interior&&!outdoor?'#564a3c':palette[0];ctx.fillRect(0,0,width,height);ctx.save();ctx.translate(-Math.round(s.cameraX),-Math.round(s.cameraY));
   function sprite(name:string,x:number,y:number,size=tile){const t=(manifest.tiles as any)[name];if(!t)return;const img=images.get(t.image||manifest.image);if(img)ctx!.drawImage(img,t.x,t.y,t.w,t.h,Math.round(x),Math.round(y),size,size);}
   const buildings:Array<{x:number;y:number;kind:string}>=[];
   w.map.forEach((row:string,y:number)=>Array.from(row).forEach((c,x)=>{
    const px=x*tile,py=y*tile;ctx.fillStyle=palette[0];ctx.fillRect(px,py,tile,tile);
    if(c==='c'||((w.cityVisit||w.interior)&&'EW HMGNLCPQSIJBRKDAOTFUVZY09d'.includes(c))){const gym=gymFloors[w.areaInfo.biome]||gymFloors.rock;ctx.fillStyle=arena?((x+y)%2?'#63748a':'#586c82'):w.interior==='gym'?gym[(x+y)%2]:w.interior==='shop'||w.interior==='center'?((x+y)%2?'#d6e2df':'#c3d4d1'):w.interior?((x+y)%2?'#e2c99d':'#d6ba8d'):((x+y)%2?'#d6d9c7':'#cdd2c2');ctx.fillRect(px,py,tile,tile);ctx.fillStyle=arena?'#8698a8':w.interior?'#a9b7ae':'#b9c2b1';ctx.fillRect(px,py,tile,1);ctx.fillRect(px,py,1,tile);}
    else if(c==='.'||'EW HMGNLCPQSIJBR'.includes(c)){ctx.fillStyle=palette[2];ctx.fillRect(px,py,tile,tile);sprite('path',px,py);}
    else sprite((x*7+y*3)%11===0?'grassDetail':'grass',px,py);
    if(c==='g'){sprite('bush',px,py);sprite('grassDetail',px,py);ctx.fillStyle=palette[1];for(let i=0;i<3;i++)ctx.fillRect(px+4+i*9,py+tile-9-(i%2)*4,3,7);}
    if(c==='~'){sprite('water',px,py);ctx.fillStyle='#d8ffff88';ctx.fillRect(px+4+((x+y)%3)*4,py+12,9,2);}
    if(c==='^')sprite('rock',px,py);
    if(c==='#'){if(w.cityVisit&&!w.interior&&x>=10&&x<=12&&y>=1&&y<=4){ctx.fillStyle=y===1?'#6d8488':'#e6ddc6';ctx.fillRect(px,py,tile,tile);ctx.fillStyle=y===1?'#abc3bd':'#b4aa91';ctx.fillRect(px,py,tile,3);ctx.fillRect(px,py,tile/8,tile);if(y>=2&&x===11){ctx.fillStyle='#4d7980';ctx.fillRect(px+tile/3,py+7,tile/3,tile-12);ctx.fillStyle='#dcebe3';ctx.fillRect(px+tile/2-1,py+8,2,tile-14);}}else if((w.cityVisit||w.interior)&&!outdoor){ctx.fillStyle=arena?'#273b51':w.interior?'#87664a':'#879b94';ctx.fillRect(px,py,tile,tile);ctx.fillStyle=arena?'#6a8293':w.interior?'#c1a17a':'#b6c6b9';ctx.fillRect(px,py,tile,3);ctx.fillRect(px,py+tile/2,tile,2);ctx.fillRect(px+tile/2,py,2,tile/2);}else sprite(w.areaInfo.biome==='volcano'||w.areaInfo.biome==='ground'?'treeAutumn':'tree',px,py);}
    if('HMGPJB'.includes(c)&&!(c==='B'&&w.interior==='cityarena'))buildings.push({x,y,kind:c});
    if(c==='6'||c==='7'){ctx.fillStyle=c==='6'?'#65a36a':'#bd615d';ctx.fillRect(px+4,py+7,tile-8,tile-12);ctx.fillStyle='#f9f4d7';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(c==='6'?'야생':'배틀',px+tile/2,py+22);}if(c==='S')sprite('sign',px,py);if(c==='I'&&!w.fieldPickups?.includes(`${w.area}:${x}:${y}`))sprite('bag',px,py);
    if(c==='U'||c==='V'){const gym=gymFloors[w.areaInfo.biome]||gymFloors.rock;ctx.fillStyle='#f6f1d7';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle=gym[2];ctx.fillRect(px+8,py+8,tile-16,tile-16);ctx.fillStyle=w.pcGymSwitches?.includes(`${w.area}:${c}`)?'#62c27c':'#f0c864';ctx.fillRect(px+tile/2-3,py+tile/2-3,6,6);}
    if('123'.includes(c)){
     sprite('grassDetail',px,py);
     if(c==='1'){ctx.fillStyle='#e99daf';ctx.fillRect(px+4,py+6,5,5);ctx.fillRect(px+tile-9,py+12,5,5);ctx.fillStyle='#f7e3a3';ctx.fillRect(px+6,py+7,2,2);ctx.fillRect(px+tile-7,py+13,2,2);}
     if(c==='2'){ctx.fillStyle='#739974';ctx.fillRect(px+3,py+5,tile-6,6);ctx.fillStyle='#517759';ctx.fillRect(px+5,py+4,tile-10,3);}
     if(c==='3'){ctx.fillStyle='#d6c99e';ctx.fillRect(px+2,py+tile-9,tile-4,5);ctx.fillStyle='#a99e7d';ctx.fillRect(px+6,py+tile-7,4,1);ctx.fillRect(px+tile-12,py+tile-7,5,1);}
     ctx.fillStyle=w.pcCityHabitat?.points?.includes(c)?'#718f73':'#f7df86';ctx.fillRect(px+tile/2-3,py+6,6,17);ctx.fillRect(px+tile/2-8,py+11,16,5);
    }
    if(visibleWildTile(c)){const pokemon=(GARDEN_VISIBLE as any)[c],img=wildSprite(pokemon.id);if(pokemon.alpha){ctx.save();ctx.strokeStyle='#d34545';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2+4,14,11,0,0,Math.PI*2);ctx.stroke();ctx.restore();}if(img){const pad=pokemon.alpha?9:4;ctx.drawImage(img,img.naturalWidth*.2,img.naturalHeight*.25,img.naturalWidth*.6,img.naturalHeight*.65,px-pad,py-(pokemon.alpha?18:10),tile+2*pad,tile+2*pad);}else{ctx.fillStyle=pokemon.alpha?'#a36c63':c==='a'?'#80bb64':'#78a6d3';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2+2,pokemon.alpha?12:9,pokemon.alpha?10:7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=pokemon.alpha?'#ff5555':'#f8f5d7';ctx.fillRect(px+tile/2-3,py+tile/2-1,2,2);ctx.fillRect(px+tile/2+3,py+tile/2-1,2,2);}}
    if(c==='e'&&w.pcAlphaAlert){ctx.save();ctx.fillStyle='#d33b3b';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.fillText('!',px+tile/2,py-12);ctx.restore();}
    if(aiming&&visibleWildTile(c)&&fieldThrowTarget(w,w.map,{x,y}).ok){ctx.save();ctx.strokeStyle='#ffe97a';ctx.lineWidth=2;ctx.strokeRect(px+2,py+2,tile-4,tile-4);ctx.restore();}
    if(c==='8'){sprite('bush',px,py);if(!w.pcGardenRare){ctx.fillStyle='#f7e8a0';ctx.fillRect(px+tile/2-2,py+5,4,17);ctx.fillRect(px+tile/2-7,py+11,14,4);}}
    if(c==='A'){sprite('grassDetail',px,py);if([1,4,7].includes(w.pcCityIncident)){ctx.fillStyle='#f2d76b';ctx.fillRect(px+tile/2-2,py+6,4,20);ctx.fillRect(px+tile/2-8,py+13,16,4);}}
    if(c==='Z'){ctx.fillStyle=w.pcCityFinale===1?'#67a66d':'#95aa98';ctx.fillRect(px+tile/2-3,py+5,6,tile-10);ctx.fillRect(px+5,py+tile/2-3,tile-10,6);}
    if('EWD'.includes(c)){ctx.fillStyle=w.interior?'#62483a':'#fff9d8';ctx.font='bold 23px sans-serif';ctx.textAlign='center';ctx.fillText(c==='D'?'↓':c==='E'?'›':'‹',px+tile/2,py+25);}
   }));
   if(arena){ctx.save();ctx.strokeStyle='#ff747b';ctx.lineWidth=4;ctx.shadowColor='#ff5362';ctx.shadowBlur=10;ctx.strokeRect(2*tile+3,2*tile+3,11*tile-6,7*tile-6);ctx.shadowBlur=0;ctx.strokeStyle='#ffd2bb';ctx.lineWidth=1;ctx.strokeRect(2*tile+8,2*tile+8,11*tile-16,7*tile-16);ctx.fillStyle='#f3c786';for(const x of [3,5,9,11])ctx.fillRect(x*tile+tile/2-2,2*tile+9,4,4);ctx.restore();}
   for(const b of buildings){
    ctx.fillStyle=palette[2];ctx.fillRect((b.x-1)*tile,(b.y-3)*tile,3*tile,4*tile);
    const layout=b.kind==='H'?manifest.buildings.center.layout:manifest.buildings.shop.layout;
    for(let y=0;y<4;y++)for(let x=0;x<3;x++)sprite(layout[y][x],(b.x+x-1)*tile,(b.y+y-3)*tile);
    // Red clinic / blue shop signs, independent of the source sheet roof colors.
    ctx.fillStyle=b.kind==='H'?'#d44e4c':b.kind==='M'?'#417fae':b.kind==='G'?'#bd8c37':'#6e7d8c';ctx.fillRect((b.x-1)*tile,(b.y-3)*tile,3*tile,4);
    const label=b.kind==='H'?'포켓몬 센터':b.kind==='M'?'프렌들리숍':b.kind==='G'?'GYM':b.kind==='J'?'호텔 Z':b.kind==='B'?'배틀 광장':'연구소';
    ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillStyle='#253e3c';ctx.fillRect(b.x*tile-24,(b.y+1)*tile-2,80,19);ctx.fillStyle='#ffffff';ctx.fillText(label,b.x*tile+16,(b.y+1)*tile+11);
   }
   if(w.interior==='hotel'){ctx.fillStyle='#aa665d';ctx.fillRect(5*tile,5*tile,5*tile,2*tile);ctx.fillStyle='#e2b996';ctx.fillRect(5*tile+4,5*tile+4,5*tile-8,2*tile-8);ctx.fillStyle='#b37468';ctx.fillRect(5*tile+8,5*tile+8,5*tile-16,2*tile-16);}
   if(w.area===9&&!w.expedition&&!w.cityVisit&&!w.interior){for(let y=1;y<=4;y++)for(let x=7;x<=21;x++)sprite(y===1?'castleBattlement':y===3?'castleWindow':'castleWall',x*tile,y*tile);[8,11,14,17,20].forEach((x,i)=>{sprite('castleDoor',x*tile,4*tile);ctx.fillStyle='#fff4bc';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(i===4?'챔피언':`${i+1} 사천왕`,x*tile+16,6*tile-8);});}
   function trainer(x:number,y:number,color:string,face:string,walk=false){
    const px=Math.round(x*tile+tile/2-12),py=Math.round(y*tile+tile-29),step=walk&&!reduce?Math.sin(time/70)*2:0;
    ctx!.fillStyle='#28473155';ctx!.beginPath();ctx!.ellipse(px+12,py+28,12,4,0,0,Math.PI*2);ctx!.fill();
    const colors:Record<string,string>={R:color,W:'#f3f2dd',S:'#f4c48d',K:'#263e51',B:'#3d79aa',Y:'#f4cf64',D:'#4b3741'};
    trainerRows.forEach((row,ry)=>Array.from(row).forEach((p,rx)=>{if(p==='.')return;ctx!.fillStyle=face==='up'&&ry>2&&ry<6?(ry===3?color:'#60473b'):colors[p];ctx!.fillRect(px+rx*2,py+ry*2+(ry>10?(rx<6?step:-step):0),2,2);}));
    if(face==='left'||face==='right'){ctx!.fillStyle='#263e51';ctx!.fillRect(px+(face==='left'?7:15),py+9,3,3);}
   }
   if(night&&(!w.interior||outdoor||w.interior==='cityarena')){ctx.fillStyle='#16345c';ctx.globalAlpha=.16;ctx.fillRect(0,0,w.map[0].length*tile,w.map.length*tile);ctx.globalAlpha=1;}
   w.map.forEach((row:string,y:number)=>Array.from(row).forEach((c,x)=>{if(c==='N'||c==='Q'||c==='R'||c==='Y'||c==='K'||c==='O'||c==='T'||c==='F'||c==='4'||c==='5'||c==='9'||c==='0'||c==='d'||(c==='B'&&w.interior==='cityarena'))trainer(x,y,c==='N'||c==='F'?'#8d5ca8':c==='R'&&w.pcMZRival==='tani'?'#bc718b':c==='R'||c==='O'||c==='0'?'#638cb1':c==='Y'||c==='5'||c==='d'?'#4d8c67':c==='K'||c==='T'||c==='4'||c==='9'?'#d15e66':'#cf9254','down');}));
   for(const member of w.unionMembers||[])if(member.x!==w.x||member.y!==w.y)trainer(member.x,member.y,'#e7b93e','down');
   trainer(s.x,s.y,'#d95250',w.facing||'down',moving);
   ctx.restore();
   // Soft border is part of the camera, never a fullscreen tint over sprites.
   ctx.strokeStyle='#284d3b55';ctx.lineWidth=4;ctx.strokeRect(2,2,width-4,height-4);
   return moving;
  }
  scheduler.invalidate();return()=>{disposed=true;scheduler.dispose();invalidateRef.current=()=>{};observer.disconnect();motion.removeEventListener('change',onMotionChange);};
 },[]);
 useEffect(()=>{invalidateRef.current();},[w,night,aiming]);
 return <div className="adv-field-wrap"><canvas ref={canvas} className="adv-field" tabIndex={0} aria-label={`${w.areaInfo.name} 필드. ${aiming?'조준 중: 가까운 야생 포켓몬을 선택하세요.':'방향키 또는 WASD로 이동, E로 대화.'} 현재 위치 ${w.x}, ${w.y}.${visibleNames?` 보이는 야생 포켓몬: ${visibleNames}.`:''}`} onClick={e=>{if(disabled)return;const rect=e.currentTarget.getBoundingClientRect(),s=scene.current,x=Math.floor(((e.clientX-rect.left)/rect.width*(e.currentTarget.width/2)+s.cameraX)/s.tile),y=Math.floor(((e.clientY-rect.top)/rect.height*(e.currentTarget.height/2)+s.cameraY)/s.tile);if(aiming){onAim?.({x,y});return;}if(x===w.x&&y===w.y){onInteract();return;}onPath(fieldPath(w.map,{x:w.x,y:w.y},{x,y}));}}/>{throwing&&<div className="adv-throw-pending" role="status"><span aria-hidden="true">◉</span> 볼을 던지는 중…</div>}<div className="adv-field-hint">{aiming?'가까운 야생 포켓몬을 눌러 볼을 던지세요':'필드를 누르면 그곳까지 걷습니다'}</div>{assetError&&<span className="adv-asset-error" role="status">일부 타일 이미지를 불러오지 못했습니다.</span>}</div>;
}
