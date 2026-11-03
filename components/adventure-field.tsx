'use client';
import {useEffect,useRef,useState} from 'react';
import manifest from '@/public/game/town/tiles.json';
import {fieldPath} from '@/lib/adventure-world.mjs';

type Props={world:any;disabled:boolean;onPath:(path:string[])=>void;onInteract:()=>void};
const palettes:Record<string,string[]>={city:['#d7d0b9','#bed3bf','#e8dfc9'],meadow:['#82bd68','#b5da82','#e5d0a0'],rock:['#aab584','#d3d5aa','#c9b58a'],water:['#80bc9f','#c0dba1','#e9dcad'],electric:['#98c09a','#c9dcb2','#d8c7a4'],forest:['#69a86a','#9dc97c','#dbcda0'],poison:['#8eaa8d','#bdcaa2','#c9bea4'],psychic:['#a0b49a','#cfdbb8','#dfd3bd'],volcano:['#ae9f7d','#c7b68d','#cfb393'],ground:['#b3af7f','#d4ca95','#cdb887'],league:['#82ab93','#b8cdb5','#c6c5b3']};
const trainerRows=['...RRRRR....','..RRRRRRR...','..RRWWWWRR..','...SSSSS....','...SKSKS....','....SSS.....','..BBBBBBB...','.SBBBBBBBS..','.SBBYYYBBS..','..BBYYYBB...','...KKKKK....','...KK.KK....','...KK.KK....','..DDD.DDD...'];

export default function AdventureField({world:w,disabled,onPath,onInteract}:Props){
 const canvas=useRef<HTMLCanvasElement>(null),props=useRef({w,disabled,onPath,onInteract}),scene=useRef({x:w.x,y:w.y,area:w.area,expedition:w.locationId||0,interior:w.interior||null,district:w.district||null,cameraX:0,cameraY:0,tile:32}),[assetError,setAssetError]=useState(false);
 props.current={w,disabled,onPath,onInteract};
 useEffect(()=>{
  const el=canvas.current;if(!el)return;const ctx=el.getContext('2d');if(!ctx)return;
  const images=new Map<string,HTMLImageElement>();let disposed=false,frame=0,last=0,width=736,height=544;
  for(const src of ['/game/town/tilemap.png','/game/town/terrain.png']){const img=new Image();img.onload=()=>images.set(src,img);img.onerror=()=>setAssetError(true);img.src=src;}
  const observer=new ResizeObserver(([entry])=>{width=Math.max(280,Math.round(entry.contentRect.width));height=Math.round(width*(width<560?.87:17/23));el.width=width*2;el.height=height*2;});observer.observe(el);
  function draw(time:number){
   if(disposed||!ctx||!el)return;const {w}=props.current,s=scene.current,dt=Math.min(48,time-last||16);last=time;
   const movedArea=s.area!==w.area||s.expedition!==(w.locationId||0)||s.interior!==(w.interior||null)||s.district!==(w.district||null);
   if(movedArea){s.x=w.x;s.y=w.y;s.area=w.area;s.expedition=w.locationId||0;s.interior=w.interior||null;s.district=w.district||null;}
   const moving=Math.abs(s.x-w.x)+Math.abs(s.y-w.y)>.025;
   const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   s.x=reduce?w.x:s.x+(w.x-s.x)*Math.min(1,dt/72);s.y=reduce?w.y:s.y+(w.y-s.y)*Math.min(1,dt/72);
   const tile=width>=900?40:32;s.tile=tile;
   s.cameraX=Math.max(0,Math.min(w.map[0].length*tile-width,(s.x+.5)*tile-width/2));s.cameraY=Math.max(0,Math.min(w.map.length*tile-height,(s.y+.5)*tile-height/2));
   // If the viewport is larger than the map, center it.
   if(width>w.map[0].length*tile)s.cameraX=-(width-w.map[0].length*tile)/2;
   if(height>w.map.length*tile)s.cameraY=-(height-w.map.length*tile)/2;
   ctx.setTransform(2,0,0,2,0,0);ctx.imageSmoothingEnabled=false;
   const palette=palettes[w.areaInfo.biome]||palettes.meadow;
   ctx.fillStyle=palette[0];ctx.fillRect(0,0,width,height);ctx.save();ctx.translate(-Math.round(s.cameraX),-Math.round(s.cameraY));
   function sprite(name:string,x:number,y:number,size=tile){const t=(manifest.tiles as any)[name];if(!t)return;const img=images.get(t.image||manifest.image);if(img)ctx!.drawImage(img,t.x,t.y,t.w,t.h,Math.round(x),Math.round(y),size,size);}
   const buildings:Array<{x:number;y:number;kind:string}>=[];
   w.map.forEach((row:string,y:number)=>Array.from(row).forEach((c,x)=>{
    const px=x*tile,py=y*tile;ctx.fillStyle=palette[0];ctx.fillRect(px,py,tile,tile);
    if(w.interior==='lab'||w.interior==='hotel'){
     ctx.fillStyle=c==='#'?(w.interior==='hotel'?'#a78375':'#64817e'):(x+y)%2?'#e6e2cc':'#f0ecd9';ctx.fillRect(px,py,tile,tile);
     if(c==='#'){ctx.fillStyle=w.interior==='hotel'?'#ddc0a1':'#a3bcb1';ctx.fillRect(px+3,py+4,tile-6,tile-8);}
     if(c==='X'){ctx.fillStyle='#a95850';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('출구',px+tile/2,py+21);}
     return;
    }
    if(w.district==='lumiose'||w.district==='lumiose-garden'||w.district==='lumiose-site'||w.district==='lumiose-wild'||w.district==='lumiose-observation'||w.district==='lumiose-royale'){
     ctx.fillStyle=(x+y)%2?'#e7dfce':'#ded7c5';ctx.fillRect(px,py,tile,tile);
     if(c==='#'){ctx.fillStyle='#8e9c91';ctx.fillRect(px,py,tile,tile);}if(c==='r'){ctx.fillStyle='#757b78';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,tile*.4,tile*.33,-.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c7cbc5';ctx.fillRect(px+8,py+10,9,3);}
     if(c==='k'||c==='K'){ctx.fillStyle=c==='K'?'#79a36d':'#a6c692';ctx.fillRect(px+2,py+2,tile-4,tile-4);if(c==='K'){ctx.fillStyle='#fff3be';ctx.fillRect(px+8,py+10,5,5);ctx.fillRect(px+20,py+16,5,5);}}
     if(c==='g'){ctx.fillStyle='#92b97c';ctx.fillRect(px,py,tile,tile);sprite('bush',px,py);sprite('grassDetail',px,py);}
     if('HMJ'.includes(c))buildings.push({x,y,kind:c});
     if(c==='a'&&!w.zaWildAlphaSpent){ctx.fillStyle='#8e4939';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,tile*.38,tile*.30,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('왕↓',px+tile/2,py+20);}if(c==='T'){ctx.fillStyle='#769b88';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('광장',px+tile/2,py+20);}
     if(c==='Y'||c==='Z'){ctx.fillStyle='#8d684d';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('안내',px+tile/2,py+20);}
     if(c==='E'||c==='W'){ctx.fillStyle='#537b85';ctx.font='bold 23px sans-serif';ctx.textAlign='center';ctx.fillText(c==='E'?'›':'‹',px+tile/2,py+25);}
     if(c==='X'){ctx.fillStyle='#537b85';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(w.district==='lumiose-royale'?'광장':'항구',px+tile/2,py+20);}
     return;
    }
    if(c==='.'||'EW HMGNLCPQSI'.includes(c)){ctx.fillStyle=palette[2];ctx.fillRect(px,py,tile,tile);sprite('path',px,py);}
    else sprite((x*7+y*3)%11===0?'grassDetail':'grass',px,py);
    if(c==='g'){sprite('bush',px,py);sprite('grassDetail',px,py);ctx.fillStyle=palette[1];for(let i=0;i<3;i++)ctx.fillRect(px+4+i*9,py+tile-9-(i%2)*4,3,7);}
    if(c==='~'){sprite('water',px,py);ctx.fillStyle='#d8ffff88';ctx.fillRect(px+4+((x+y)%3)*4,py+12,9,2);}
    if(c==='^')sprite('rock',px,py);
    if(c==='#')sprite(w.areaInfo.biome==='volcano'||w.areaInfo.biome==='ground'?'treeAutumn':'tree',px,py);
    if('HMGP'.includes(c))buildings.push({x,y,kind:c});
    if(c==='S')sprite('sign',px,py);if(c==='I'&&!w.fieldPickups?.includes(`${w.area}:${x}:${y}`))sprite('bag',px,py);
    if('EW'.includes(c)){ctx.fillStyle='#fff9d8';ctx.font='bold 23px sans-serif';ctx.textAlign='center';ctx.fillText(c==='E'?'›':'‹',px+tile/2,py+25);}
   }));
   for(const b of buildings){
    ctx.fillStyle=palette[2];ctx.fillRect((b.x-1)*tile,(b.y-3)*tile,3*tile,4*tile);
    const layout=b.kind==='H'?manifest.buildings.center.layout:manifest.buildings.shop.layout;
    for(let y=0;y<4;y++)for(let x=0;x<3;x++)sprite(layout[y][x],(b.x+x-1)*tile,(b.y+y-3)*tile);
    // Red clinic / blue shop signs, independent of the source sheet roof colors.
    ctx.fillStyle=b.kind==='H'?'#d44e4c':b.kind==='M'?'#417fae':b.kind==='G'?'#bd8c37':b.kind==='J'?'#ad8865':'#6e7d8c';ctx.fillRect((b.x-1)*tile,(b.y-3)*tile,3*tile,4);
    const label=b.kind==='H'?'포켓몬 센터':b.kind==='M'?'프렌들리숍':b.kind==='G'?'GYM':b.kind==='J'?'호텔 안내소':'연구소';
    ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillStyle='#253e3c';ctx.fillRect(b.x*tile-24,(b.y+1)*tile-2,80,19);ctx.fillStyle='#ffffff';ctx.fillText(label,b.x*tile+16,(b.y+1)*tile+11);
   }
   if(w.area===9&&!w.expedition){for(let y=1;y<=4;y++)for(let x=7;x<=21;x++)sprite(y===1?'castleBattlement':y===3?'castleWindow':'castleWall',x*tile,y*tile);[8,11,14,17,20].forEach((x,i)=>{sprite('castleDoor',x*tile,4*tile);ctx.fillStyle='#fff4bc';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(i===4?'챔피언':`${i+1} 사천왕`,x*tile+16,6*tile-8);});}
   function trainer(x:number,y:number,color:string,face:string,walk=false){
    const px=Math.round(x*tile+tile/2-12),py=Math.round(y*tile+tile-29),step=walk&&!reduce?Math.sin(time/70)*2:0;
    ctx!.fillStyle='#28473155';ctx!.beginPath();ctx!.ellipse(px+12,py+28,12,4,0,0,Math.PI*2);ctx!.fill();
    const colors:Record<string,string>={R:color,W:'#f3f2dd',S:'#f4c48d',K:'#263e51',B:'#3d79aa',Y:'#f4cf64',D:'#4b3741'};
    trainerRows.forEach((row,ry)=>Array.from(row).forEach((p,rx)=>{if(p==='.')return;ctx!.fillStyle=face==='up'&&ry>2&&ry<6?(ry===3?color:'#60473b'):colors[p];ctx!.fillRect(px+rx*2,py+ry*2+(ry>10?(rx<6?step:-step):0),2,2);}));
    if(face==='left'||face==='right'){ctx!.fillStyle='#263e51';ctx!.fillRect(px+(face==='left'?7:15),py+9,3,3);}
   }
   w.map.forEach((row:string,y:number)=>Array.from(row).forEach((c,x)=>{if(c==='N'||c==='Q'||c==='R'||c==='F'||c==='D'||c==='A'||c==='B'||c==='O'||c==='U'||c==='V')trainer(x,y,c==='N'?'#8d5ca8':c==='R'?'#719f9a':c==='F'?'#9e758e':c==='D'?'#bb9c42':c==='A'?'#59855b':c==='B'?'#477e9a':'#cf9254','down');}));
   for(const member of w.unionMembers||[])if(member.x!==w.x||member.y!==w.y)trainer(member.x,member.y,'#e7b93e','down');
   trainer(s.x,s.y,'#d95250',w.facing||'down',moving);
   ctx.restore();
   // Soft border is part of the camera, never a fullscreen tint over sprites.
   ctx.strokeStyle='#284d3b55';ctx.lineWidth=4;ctx.strokeRect(2,2,width-4,height-4);
   frame=requestAnimationFrame(draw);
  }
  frame=requestAnimationFrame(draw);return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();};
 },[]);
 return <div className="adv-field-wrap"><canvas ref={canvas} className="adv-field" tabIndex={0} aria-label={`${w.areaInfo.name} 필드. 방향키 또는 WASD로 이동, E로 대화. 현재 위치 ${w.x}, ${w.y}`} onClick={e=>{if(disabled)return;const rect=e.currentTarget.getBoundingClientRect(),s=scene.current,x=Math.floor(((e.clientX-rect.left)/rect.width*(e.currentTarget.width/2)+s.cameraX)/s.tile),y=Math.floor(((e.clientY-rect.top)/rect.height*(e.currentTarget.height/2)+s.cameraY)/s.tile);if(x===w.x&&y===w.y){onInteract();return;}onPath(fieldPath(w.map,{x:w.x,y:w.y},{x,y}));}}/><div className="adv-field-hint">필드를 누르면 그곳까지 걷습니다</div>{assetError&&<span className="adv-asset-error" role="status">일부 타일 이미지를 불러오지 못했습니다.</span>}</div>;
}
