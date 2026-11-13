import {isScrewGlideRoof,screwGlideAt} from '@/lib/cloud-adventure/adventure-screw-roofs.mjs';
import {royaleFieldEntry} from '@/lib/cloud-adventure/adventure-royale-zones.mjs';
import {LYSANDRE_WILD,lysandreWild} from '@/lib/cloud-adventure/adventure-lysandre-maze.mjs';
import {museumSide21Spot,museumSide21Requester} from '@/lib/cloud-adventure/adventure-museum.mjs';
'use client';
import {ZONE20_VISIBLE,zone20Visible} from '@/lib/cloud-adventure/adventure-mission42.mjs';
import {ZONE19_VISIBLE,zone19Visible} from '@/lib/cloud-adventure/adventure-zone19.mjs';
import {ZONE18_VISIBLE,zone18Visible} from '@/lib/cloud-adventure/adventure-zone18.mjs';
import {ZONE17_VISIBLE,zone17Visible} from '@/lib/cloud-adventure/adventure-zone17.mjs';
import {ZONE16_VISIBLE,zone16Visible} from '@/lib/cloud-adventure/adventure-zone16.mjs';
import {ZONE15_VISIBLE,zone15Visible,ZONE15_TREES,ZONE15_BENCHES} from '@/lib/cloud-adventure/adventure-zone15.mjs';
import {ZONE14_VISIBLE,zone14Visible} from '@/lib/cloud-adventure/adventure-zone14.mjs';
import {ZONE13_VISIBLE,zone13Visible,ZONE13_STUMPS} from '@/lib/cloud-adventure/adventure-zone13.mjs';
import {ZONE12_VISIBLE,zone12Visible} from '@/lib/cloud-adventure/adventure-zone12.mjs';
import {ZONE10_VISIBLE,zone10Visible} from '@/lib/cloud-adventure/adventure-zone10.mjs';
import {ZONE9_VISIBLE} from '@/lib/cloud-adventure/adventure-zone9.mjs';
import {ZONE8_VISIBLE,zone8BurrowSpecies} from '@/lib/cloud-adventure/adventure-zone8.mjs';
import {useEffect,useRef,useState} from 'react';
import manifest from '@/data/cloud-town-tiles.json';
import {wildAlphaPosition,zone2BudewPosition,zone2KakunaPosition,zone2FieldMonsters,zone3FieldMonsters,magentaSewerMonsters,cloudNpcTile,walkable} from '@/lib/cloud-adventure/adventure-world.mjs';
import {adventureAvatarRows} from '@/lib/cloud-adventure/adventure-avatar.mjs';
import {salonAppearance,SALON_COLORS} from '@/lib/cloud-adventure/adventure-salon.mjs';
import {zygardeGuideTarget} from '@/lib/cloud-adventure/adventure-zygarde-guide.mjs';
import {descentGuideTargets} from '@/lib/cloud-adventure/adventure-descent-guides.mjs';
import {ZONE5_VISIBLE,ZONE5_WEST_STALL} from '@/lib/cloud-adventure/adventure-zone5.mjs';
import {ZONE11_VISIBLE,zone11WaterAt} from '@/lib/cloud-adventure/adventure-zone11.mjs';
import {ZONE6_VISIBLE,zone6Layer,zone6Visible,ZONE6_MARKET_STALLS} from '@/lib/cloud-adventure/adventure-zone6.mjs';
import {zone2WaterEdges,zone2BridgeAxis,zone2BridgeRails} from '@/lib/cloud-adventure/adventure-zone2-visual.mjs';
import {zone3GardenPattern,zone3ExitLabel} from '@/lib/cloud-adventure/adventure-zone3-garden.mjs';
import {createFieldScheduler,visibleFieldBounds} from '@/lib/adventure-render.mjs';
import {adventureMovementInterval} from '@/lib/cloud-adventure/adventure-prediction.mjs';

type VisualPath={generation:number;origin:{x:number;y:number};steps:Array<{id:number;x:number;y:number;facing:string}>};
type Props={visualPath?:VisualPath;world:any;disabled:boolean;onInteract:()=>void;onAimAlpha:()=>void;onAimBudew:()=>void;onAimKakuna:()=>void;onAimIslandAlpha:()=>void;onAimField:(id:string)=>void;onAimZone3:(id:string)=>void;onAimSewer:(id:string)=>void;period:string};
const palettes:Record<string,string[]>={city:['#d7d0b9','#bed3bf','#e8dfc9'],meadow:['#82bd68','#b5da82','#e5d0a0'],rock:['#aab584','#d3d5aa','#c9b58a'],water:['#80bc9f','#c0dba1','#e9dcad'],electric:['#98c09a','#c9dcb2','#d8c7a4'],forest:['#69a86a','#9dc97c','#dbcda0'],poison:['#8eaa8d','#bdcaa2','#c9bea4'],psychic:['#a0b49a','#cfdbb8','#dfd3bd'],volcano:['#ae9f7d','#c7b68d','#cfb393'],ground:['#b3af7f','#d4ca95','#cdb887'],league:['#82ab93','#b8cdb5','#c6c5b3']};

export default function AdventureField({world:w,visualPath,disabled,onInteract,onAimAlpha,onAimBudew,onAimKakuna,onAimIslandAlpha,onAimField,onAimZone3,onAimSewer,period}:Props){
 const canvas=useRef<HTMLCanvasElement>(null),invalidate=useRef<null|(()=>void)>(null),props=useRef({w,visualPath,disabled,onInteract,onAimAlpha,onAimBudew,onAimKakuna,onAimIslandAlpha,onAimField,onAimZone3,onAimSewer,period}),scene=useRef({x:w.x,y:w.y,area:w.area,expedition:w.locationId||0,interior:w.interior||null,district:w.district||null,cameraX:0,cameraY:0,tile:32,targetX:w.x,targetY:w.y,startX:w.x,startY:w.y,moveStart:0,moveDuration:1,walkUntil:0,visualGeneration:-1,visualStep:-1,facing:w.facing||'down'}),[assetError,setAssetError]=useState(false);
 props.current={w,visualPath,disabled,onInteract,onAimAlpha,onAimBudew,onAimKakuna,onAimIslandAlpha,onAimField,onAimZone3,onAimSewer,period};
 useEffect(()=>{
  const el=canvas.current;if(!el)return;const ctx=el.getContext('2d');if(!ctx)return;
  const images=new Map<string,HTMLImageElement>();let disposed=false,width=736,height=544;
  let guide:{key:string,x:number,y:number,startX:number,startY:number,targetX:number,targetY:number,start:number}|null=null;
  let descentKey='',descentGuides:Array<{x:number,y:number,startX:number,startY:number,targetX:number,targetY:number,start:number,direction:string}>=[];
  const scheduler=createFieldScheduler(requestAnimationFrame,cancelAnimationFrame,draw);invalidate.current=scheduler.invalidate;
  // Load field sprites only when a visible map actually refers to them. This
  // avoids competing with movement requests for dozens of unrelated images.
  const fieldImages=new Proxy({} as Record<number,HTMLImageElement>,{get(cache,key){if(typeof key!=='string'||!/^\d+$/.test(key))return Reflect.get(cache,key);const id=Number(key);if(!cache[id]){const img=new Image();img.onload=scheduler.invalidate;img.src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;cache[id]=img;}return cache[id];}});
  const shinyFieldImages=new Proxy({} as Record<number,HTMLImageElement>,{get(cache,key){if(typeof key!=='string'||!/^\d+$/.test(key))return Reflect.get(cache,key);const id=Number(key);if(!cache[id]){const img=new Image();img.onload=scheduler.invalidate;img.src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;cache[id]=img;}return cache[id];}});
  const kakunaImage=new Image();kakunaImage.onload=scheduler.invalidate;kakunaImage.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png';
  const budewImage=new Image();budewImage.onload=scheduler.invalidate;budewImage.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/406.png';
  for(const src of [...new Set([manifest.image,...Object.values(manifest.tiles).map((t:any)=>t.image||manifest.image)])]){const img=new Image();img.onload=()=>{images.set(src,img);scheduler.invalidate();};img.onerror=()=>{if(!disposed)setAssetError(true);};img.src=src;}
  const observer=new ResizeObserver(([entry])=>{const nextWidth=Math.max(280,Math.round(entry.contentRect.width)),nextHeight=Math.round(nextWidth*(nextWidth<560?.87:17/23));if(width!==nextWidth||height!==nextHeight||el.width!==nextWidth*2||el.height!==nextHeight*2){width=nextWidth;height=nextHeight;el.width=width*2;el.height=height*2;scheduler.invalidate();}});observer.observe(el);
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');motion.addEventListener('change',scheduler.invalidate);
  function draw(time:number){
   if(disposed||!ctx||!el)return;const {w,visualPath}=props.current,s=scene.current;
   const movedArea=s.area!==w.area||s.expedition!==(w.locationId||0)||s.interior!==(w.interior||null)||s.district!==(w.district||null);
   if(movedArea){s.x=w.x;s.y=w.y;s.targetX=w.x;s.targetY=w.y;s.startX=w.x;s.startY=w.y;s.moveStart=time;s.walkUntil=0;s.area=w.area;s.expedition=w.locationId||0;s.interior=w.interior||null;s.district=w.district||null;}
   const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   let moving=false;
   if(visualPath&&!movedArea){
    if(s.visualGeneration!==visualPath.generation){
     s.visualGeneration=visualPath.generation;s.visualStep=-1;s.x=visualPath.origin.x;s.y=visualPath.origin.y;s.targetX=s.x;s.targetY=s.y;s.startX=s.x;s.startY=s.y;s.moveStart=time;s.moveDuration=0;
    }
    // Complete the current segment before taking the next point. The ordered
    // list survives React batching and successful acknowledgements.
    for(;;){
     const progress=reduce||!s.moveDuration?1:Math.min(1,Math.max(0,(time-s.moveStart)/s.moveDuration));
     s.x=s.startX+(s.targetX-s.startX)*progress;s.y=s.startY+(s.targetY-s.startY)*progress;
     if(progress<1){moving=true;break;}
     const next=visualPath.steps.find(point=>point.id>s.visualStep);if(!next)break;
     if(Math.abs(next.x-s.targetX)+Math.abs(next.y-s.targetY)!==1||(s.visualStep!==-1&&next.id!==s.visualStep+1)){
      // An interrupted render or discarded prefix must never draw a shortcut.
      s.x=w.x;s.y=w.y;s.startX=w.x;s.startY=w.y;s.targetX=w.x;s.targetY=w.y;s.moveDuration=0;s.visualStep=visualPath.steps.at(-1)?.id??-1;s.facing=w.facing||'down';break;
     }
     const continuous=s.moveDuration>0&&time-s.moveStart-s.moveDuration<adventureMovementInterval(w);
     s.startX=s.targetX;s.startY=s.targetY;s.targetX=next.x;s.targetY=next.y;s.facing=next.facing;s.visualStep=next.id;
     s.moveStart=continuous?s.moveStart+s.moveDuration:time;s.moveDuration=adventureMovementInterval(w);s.walkUntil=time+140;
    }
   }else{
    const cancelled=s.visualGeneration!==-1;s.visualGeneration=-1;s.visualStep=-1;s.facing=w.facing||'down';
    if(cancelled||(!movedArea&&(s.targetX!==w.x||s.targetY!==w.y))){
     s.startX=s.x;s.startY=s.y;s.targetX=w.x;s.targetY=w.y;s.moveStart=time;
     // Corrections discard speculative waypoints immediately.
     s.moveDuration=cancelled||Math.abs(s.x-w.x)+Math.abs(s.y-w.y)>1.25?0:adventureMovementInterval(w)*.85;
     s.walkUntil=time+140;
    }
    const progress=reduce||!s.moveDuration?1:Math.min(1,Math.max(0,(time-s.moveStart)/s.moveDuration));
    s.x=s.startX+(s.targetX-s.startX)*progress;s.y=s.startY+(s.targetY-s.startY)*progress;moving=progress<1;
   }
   const walking=moving||time<s.walkUntil;
   const tile=width>=900?40:32;s.tile=tile;
   s.cameraX=Math.max(0,Math.min(w.map[0].length*tile-width,(s.x+.5)*tile-width/2));s.cameraY=Math.max(0,Math.min(w.map.length*tile-height,(s.y+.5)*tile-height/2));
   // If the viewport is larger than the map, center it.
   if(width>w.map[0].length*tile)s.cameraX=-(width-w.map[0].length*tile)/2;
   if(height>w.map.length*tile)s.cameraY=-(height-w.map.length*tile)/2;
   ctx.setTransform(2,0,0,2,0,0);ctx.imageSmoothingEnabled=false;
   const palette=palettes[w.areaInfo.biome]||palettes.meadow;
   ctx.fillStyle=palette[0];ctx.fillRect(0,0,width,height);ctx.save();ctx.translate(-Math.round(s.cameraX),-Math.round(s.cameraY));
   function sprite(name:string,x:number,y:number,size=tile){const t=(manifest.tiles as any)[name];if(!t)return;const img=images.get(t.image||manifest.image);if(img)ctx!.drawImage(img,t.x,t.y,t.w,t.h,Math.round(x),Math.round(y),size,size);}
   // Shared pixel textures keep layered city routes readable without changing
   // the underlying map, collisions, or historical saved positions.
   function canalWater(px:number,py:number,x:number,y:number){ctx!.fillStyle='#73adbb';ctx!.fillRect(px,py,tile,tile);ctx!.fillStyle='#a9d2d0';ctx!.fillRect(px+5+(x*7+y*3)%9,py+8,8,2);ctx!.fillRect(px+10,py+tile-9,11,2);}
   function roofPaving(px:number,py:number,x:number,y:number){ctx!.fillStyle=(x+y)%2?'#c3b6a6':'#d0c4b2';ctx!.fillRect(px,py,tile,tile);ctx!.fillStyle='#aa9e8e';ctx!.fillRect(px,py+tile-2,tile,2);ctx!.fillRect(px+(y%2?tile/2:2),py+2,2,tile-4);ctx!.fillStyle='#867d74';if(w.map[y-1]?.[x]==='#')ctx!.fillRect(px,py,tile,3);if(w.map[y+1]?.[x]==='#')ctx!.fillRect(px,py+tile-3,tile,3);if(w.map[y]?.[x-1]==='#')ctx!.fillRect(px,py,3,tile);if(w.map[y]?.[x+1]==='#')ctx!.fillRect(px+tile-3,py,3,tile);}
   function bridgeDeck(px:number,py:number,x:number){ctx!.fillStyle='#b3a184';ctx!.fillRect(px,py,tile,tile);ctx!.fillStyle='#ddd0b5';for(let j=5;j<tile;j+=8)ctx!.fillRect(px+2,py+j,tile-4,2);ctx!.fillStyle='#777c72';if(x===10)ctx!.fillRect(px,py,3,tile);if(x===12)ctx!.fillRect(px+tile-3,py,3,tile);}
   const buildings:Array<{x:number;y:number;kind:string}>=[],bounds=visibleFieldBounds(s.cameraX,s.cameraY,width,height,tile);
   w.map.forEach((row:string,y:number)=>Array.from(row).forEach((c,x)=>{
    if(x<bounds.left||x>bounds.right||y<bounds.top||y>bounds.bottom)return;
    const px=x*tile,py=y*tile;ctx.fillStyle=palette[0];ctx.fillRect(px,py,tile,tile);
    const royaleEntry=royaleFieldEntry(w);if(c==='T'&&royaleEntry&&x===royaleEntry.x&&y===royaleEntry.y){ctx.fillStyle='#ddd3c6';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#a84c54';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('로열',px+tile/2,py+20);return;}
    // Museum and laboratory maps have their own structures, not outdoor trees.
    // The 2D outlines and fixtures remain draft interpretations of the sources.
    if(w.district==='lumiose-rust'&&w.interior==='rustOffice'){
     // The office has black marble, a desk, bamboo and a black-and-white
     // court. Their positions and the compressed room outline are 2D drafts.
     // https://www.pokepedia.fr/Agence_D%C3%A9rouillard
     if(c==='#'){
      ctx.fillStyle='#25292c';ctx.fillRect(px,py,tile,tile);
      if(w.map[y+1]?.[x]&&w.map[y+1][x]!=='#'){
       ctx.fillStyle='#72383e';ctx.fillRect(px,py+4,tile,tile-8);ctx.fillStyle='#b49464';ctx.fillRect(px,py+3,tile,2);ctx.fillRect(px,py+tile-5,tile,2);
       ctx.fillStyle='#292d2f';ctx.fillRect(px+tile/2-2,py+5,4,tile-10);
      }else{ctx.fillStyle='#394043';ctx.fillRect(px+2,py+tile-4,tile-4,2);}
      return;
     }
     const court=x>=7&&x<=15&&y>=7&&y<=12;
     ctx.fillStyle=court?(x<=10?((x+y)%2?'#555957':'#626662'):((x+y)%2?'#d4d3c8':'#e4e1d4')):(x+y)%2?'#34383a':'#3d4141';ctx.fillRect(px,py,tile,tile);
     if(court){
      // Fine gravel and dark inlaid boundary are visual, not obstacles.
      ctx.fillStyle=x<=10?'#89908a':'#b4b4ac';ctx.fillRect(px+5+(x*5+y)%11,py+8,2,2);ctx.fillRect(px+tile-9,py+tile-10,2,2);
      ctx.fillStyle='#474c4c';if(x===7)ctx.fillRect(px+2,py,2,tile);if(x===15)ctx.fillRect(px+tile-4,py,2,tile);if(y===7)ctx.fillRect(px,py+2,tile,2);if(y===12)ctx.fillRect(px,py+tile-4,tile,2);
      if(x===11){ctx.fillStyle='#8c8b83';ctx.fillRect(px+tile/2-1,py,2,tile);}
     }else{
      ctx.fillStyle='#666a65';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:0),py+2,1,tile-4);
      if(x>=10&&x<=12&&y>=13){ctx.fillStyle='#1f2426';ctx.fillRect(px+2,py+2,tile-4,tile-4);ctx.fillStyle='#8e938c';ctx.fillRect(px+4,py+tile-5,tile-8,1);}
     }
     if(c==='k'){
      ctx.fillStyle='#241e1c';ctx.fillRect(px,py+5,tile,tile-9);ctx.fillStyle='#624940';ctx.fillRect(px,py+4,tile,6);ctx.fillStyle='#bc9c6b';ctx.fillRect(px,py+10,tile,2);ctx.fillStyle='#3e302b';ctx.fillRect(px+2,py+14,tile-4,tile-20);
     }
     if(c==='^'){
      ctx.fillStyle='#6c6252';ctx.fillRect(px+5,py+tile-7,tile-10,4);ctx.fillStyle='#729167';for(let j=0;j<3;j++){ctx.fillRect(px+8+j*7,py+5+(j%2)*2,3,tile-12);ctx.fillRect(px+5+j*7,py+10,8,2);}
     }
     if(c==='d'||c==='z'){
      // People mark the existing interaction tiles; their costumes are illustrative.
      ctx.fillStyle='#ddbc9b';ctx.beginPath();ctx.arc(px+tile/2,py+tile*.32,tile*.11,0,Math.PI*2);ctx.fill();ctx.fillStyle=c==='d'?'#682d38':'#525d56';ctx.fillRect(px+tile*.34,py+tile*.45,tile*.32,tile*.37);ctx.fillStyle='#d8bd8b';ctx.fillRect(px+tile*.44,py+tile*.47,tile*.12,tile*.07);
     }
     if(c==='X'){ctx.fillStyle='#655f52';ctx.fillRect(px+4,py+3,tile-8,tile-6);ctx.fillStyle='#c6b38d';ctx.fillRect(px+8,py+6,tile-16,tile-12);ctx.fillStyle='#4b5250';ctx.fillRect(px+tile/2-1,py+6,2,tile-12);}
     return;
    }
    if(w.district==='lumiose-museum-front'){
     const inside=w.interior==='museum1'||w.interior==='museum2',second=w.interior==='museum2';
     if(!inside){
      const facade=x>=3&&x<=19&&y>=2&&y<=6;
      ctx.fillStyle=facade?'#e6e2d6':c==='#'?'#a5a9a4':c===','?'#c7c9c1':(x+y)%2?'#d8dcd5':'#e1e3db';ctx.fillRect(px,py,tile,tile);
      if(facade){ctx.fillStyle=y===2?'#909f9e':y===6?'#c5c8bf':'#f2efe4';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#b3bdb9';if(y===2)ctx.fillRect(px,py+tile-6,tile,6);else if(y<6){ctx.fillRect(px+2,py,3,tile);ctx.fillRect(px+tile-5,py,3,tile);ctx.fillStyle='#70939b';ctx.fillRect(px+9,py+5,tile-18,tile-10);ctx.fillStyle='#d7e7e3';ctx.fillRect(px+11,py+7,3,tile-14);}else{ctx.fillStyle='#f6f2e6';ctx.fillRect(px+4,py,5,tile);ctx.fillRect(px+tile-9,py,5,tile);}}
      if(c==='u'){ctx.fillStyle='#e8e4d8';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#516e77';ctx.fillRect(px+3,py+4,tile-6,tile-4);ctx.fillStyle='#e9eee7';ctx.fillRect(px+tile/2-1,py+4,2,tile-4);}
      if(c===','){ctx.fillStyle='#e8e9df';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:0),py,1,tile);}
      if(c==='X'){ctx.fillStyle='#718c91';ctx.fillRect(px+6,py+5,tile-12,tile-10);}return;
     }
     ctx.fillStyle=c==='#'?(second?'#786d60':'#8a8375'):c===';'?(second?'#8f6259':'#c4ad83'):(x+y)%2?(second?'#dfd5c0':'#e7dfcb'):(second?'#ebe1ce':'#f0eadb');ctx.fillRect(px,py,tile,tile);
     if(c==='#'){ctx.fillStyle=second?'#bba88d':'#d0c5ad';ctx.fillRect(px,py+tile-5,tile,5);}
     if(c===';'){ctx.fillStyle=second?'#b89374':'#e1d0a9';ctx.fillRect(px+3,py+3,tile-6,2);ctx.fillRect(px+3,py+tile-5,tile-6,2);}
     if(c==='^'){ctx.fillStyle='#8d8272';ctx.fillRect(px+6,py+tile-8,tile-12,5);ctx.fillStyle='#e4e0d3';ctx.fillRect(px+11,py+8,tile-22,tile-16);ctx.fillRect(px+9,py+5,tile-18,5);}
     if(c==='t'&&y===4&&(x===5||x===17)){ctx.fillStyle='#745b43';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle=second?'#aebcb5':'#9ab3a1';ctx.fillRect(px+6,py+7,tile-12,tile-14);ctx.fillStyle=second?'#ece0ba':'#e9cc85';ctx.fillRect(px+10,py+11,tile-20,4);}
     if(c==='t'&&museumSide21Requester(w,{tile:c,x,y})){ctx.fillStyle='#b98b72';ctx.fillRect(px+11,py+5,10,7);ctx.fillStyle='#5d7182';ctx.fillRect(px+8,py+12,16,13);}
     const spewpa=museumSide21Spot(w,{tile:c,x,y});if(spewpa&&w.zaSide21Started&&!w.zaSide21Complete&&!w.zaSide21Found?.includes(spewpa)){ctx.fillStyle='#f6f5e9';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,7,9,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#373d40';ctx.fillRect(px+tile/2-4,py+tile/2-1,2,2);ctx.fillRect(px+tile/2+2,py+tile/2-1,2,2);}
     if(c==='l'){ctx.fillStyle='#806b55';for(let n=0;n<4;n++)ctx.fillRect(px+4,py+5+n*6,tile-8,3);}
     if(c==='X'){ctx.fillStyle='#637e86';ctx.fillRect(px+6,py+5,tile-12,tile-10);}return;
    }
    if(w.district==='lumiose-lysandre-lab'&&!w.interior){
     const wing=w.zaLysandreFloor===2?'b2':w.zaLysandreFloor===3?'b3':w.zaLysandreWing||'hub',accent=({a:'#c47b3e','a-side':'#9174a6',b:'#6a9d70','b-mid':'#6a9d70',e:'#9174a6','e-mid':'#9174a6','e-vault':'#9174a6','e-boss':'#795d91',hub:'#b5a28d',b2:'#718187',b3:'#655d77'} as Record<string,string>)[wing]||'#b5a28d';
     const floorTones=({a:['#bc9b7e','#cbb099'],'a-side':['#a093b3','#b4a9c3'],b:['#8eaa94','#a5bca8'],'b-mid':['#8eaa94','#a5bca8'],e:['#a093b3','#b4a9c3'],'e-mid':['#a093b3','#b4a9c3'],'e-vault':['#a093b3','#b4a9c3'],'e-boss':['#8c7b9e','#a99ab8'],hub:['#a99f91','#c1b8a9'],b2:['#849597','#a0afb0'],b3:['#716a7e','#8b8297']} as Record<string,string[]>)[wing]||['#9ba9a4','#acb8b1'];ctx.fillStyle=c==='#'?'#333f48':c==='|'?'#687379':floorTones[(x+y)%2];ctx.fillRect(px,py,tile,tile);
     if(c==='#'){ctx.fillStyle='#52616a';ctx.fillRect(px,py+tile-5,tile,4);ctx.fillRect(px+(y%2?tile/2:0),py,2,tile-5);}
     else if(c==='|'){ctx.fillStyle='#b7c2bd';for(let n=5;n<tile;n+=8)ctx.fillRect(px+n,py+2,3,tile-4);}
     else{ctx.fillStyle=accent;ctx.fillRect(px+2,py+tile-4,tile-4,2);ctx.fillStyle='#d2dad2';ctx.fillRect(px+1,py+1,tile-2,1);}
     // The side-room item is documented in front of a computer; placement is approximate.
     if(wing==='a-side'&&y===4&&[8,11,14].includes(x)){ctx.fillStyle='#4d485e';ctx.fillRect(px+4,py+3,tile-8,tile-6);ctx.fillStyle=x===11?'#9bddcb':'#7e7890';ctx.fillRect(px+7,py+6,tile-14,9);ctx.fillStyle='#d7d5cc';ctx.fillRect(px+8,py+20,tile-16,3);ctx.fillStyle='#78938b';ctx.fillRect(px+10,py+23,tile-20,3);}
     if(wing==='b-mid'&&y===8&&c!=='#'){ctx.fillStyle='#89a99b';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#c0d7c2';ctx.fillRect(px,py+2,tile,2);ctx.fillRect(px,py+tile-4,tile,2);}
     if(wing==='hub'&&['n','p','q'].includes(c)){ctx.fillStyle=({n:'#c47b3e',p:'#6a9d70',q:'#9174a6'} as Record<string,string>)[c];ctx.fillRect(px+3,py+2,tile-6,tile-4);ctx.fillStyle='#dce3da';ctx.fillRect(px+6,py+5,tile-12,tile-10);ctx.fillStyle='#435a5c';ctx.fillRect(px+9,py+8,tile-18,tile-16);}
     if(c==='t'&&['a','b','e'].includes(wing)){ctx.fillStyle='#454f55';ctx.fillRect(px+5,py+4,tile-10,tile-8);ctx.fillStyle=w.zaLysandrePowers?.includes(wing)?'#a5e3a3':'#e98173';ctx.fillRect(px+9,py+8,tile-18,7);}
     if(['e','e-vault'].includes(wing)&&c==='z'){ctx.fillStyle='#454f55';ctx.fillRect(px+5,py+4,tile-10,tile-8);ctx.fillStyle=w.zaLysandreExitPower?'#a5e3a3':'#e98173';ctx.fillRect(px+9,py+8,tile-18,7);}
     if(['e','e-vault'].includes(wing)&&c==='n'){ctx.fillStyle='#546a74';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.strokeStyle=w.zaLysandreExitPower?'#9ae5e2':'#8b9894';ctx.lineWidth=2;ctx.strokeRect(px+8,py+8,tile-16,tile-16);}
     if(c==='u'||(c==='v'&&wing==='a')){ctx.fillStyle='#546a74';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.strokeStyle=w.zaLysandrePowers?.includes(wing==='b-mid'?'b':wing==='e-mid'?'e':wing==='a-side'?'a':wing)?'#9ae5e2':'#8b9894';ctx.lineWidth=2;ctx.strokeRect(px+8,py+8,tile-16,tile-16);}
     if('abek'.includes(c)){ctx.fillStyle='#65787a';ctx.fillRect(px+5,py+4,tile-10,tile-8);ctx.fillStyle='#d9e5ce';ctx.fillRect(px+8,py+7,tile-16,8);ctx.fillStyle='#f3c95b';ctx.fillRect(px+10,py+18,tile-20,3);}
     if(c==='l'){ctx.fillStyle='#59696c';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#d6ded3';ctx.fillRect(px+7,py+5,tile-14,tile-10);ctx.fillStyle='#627578';ctx.fillRect(px+tile/2-1,py+5,2,tile-10);}
     if((c==='j'&&['e','e-boss','e-vault'].includes(wing))||(c==='f'&&wing==='e'&&w.zaLysandreBossRoomV5)){ctx.fillStyle='#5a5e70';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#d6ddd5';ctx.fillRect(px+6,py+5,tile-12,tile-10);ctx.fillStyle='#747084';ctx.fillRect(px+tile/2-1,py+7,2,tile-14);}
     if(c==='h'||c==='X'){ctx.fillStyle='#637f81';ctx.fillRect(px+6,py+5,tile-12,tile-10);}
     if(c==='o'){ctx.fillStyle='#e4d7b5';ctx.fillRect(px+10,py+10,12,12);ctx.fillStyle='#d4665b';ctx.fillRect(px+10,py+10,12,5);}
     return;
    }
    if(w.district==='lumiose-zone2-overlook'&&!w.interior){
     // A raised area and water are documented; this separate overlook's
     // shape and stairs are provisional. Paint only the existing tiles.
     if(c==='~'){canalWater(px,py,x,y);return;}
     ctx.fillStyle=c==='#'?'#728a7e':(x+y)%2?'#c9c5ac':'#dcd5bd';ctx.fillRect(px,py,tile,tile);
     if(c==='#'){
      ctx.fillStyle='#95a79a';ctx.fillRect(px+1,py+2,tile-2,tile-5);
      ctx.fillStyle='#c8d3c0';ctx.fillRect(px+2,py+2,tile-4,3);
      ctx.fillStyle='#637c71';ctx.fillRect(px,py+tile-4,tile,4);
     }else{
      ctx.fillStyle='#b1ad99';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:1),py+3,2,tile-5);
      ctx.fillStyle='#f0e7d2';if(w.map[y-1]?.[x]==='~')ctx.fillRect(px,py,tile,3);if(w.map[y+1]?.[x]==='~')ctx.fillRect(px,py+tile-3,tile,3);if(w.map[y]?.[x-1]==='~')ctx.fillRect(px,py,3,tile);if(w.map[y]?.[x+1]==='~')ctx.fillRect(px+tile-3,py,3,tile);
     }
     if(c==='h'){ctx.fillStyle='#8a7259';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#e9ddbc';for(let j=0;j<4;j++)ctx.fillRect(px+5,py+5+j*6,tile-10,3);ctx.fillStyle='#76877e';ctx.fillRect(px+2,py+3,3,tile-6);ctx.fillRect(px+tile-5,py+3,3,tile-6);}return;
    }
    if(w.district==='lumiose-bleu-cafe2'&&!w.interior){if(c==='~'){canalWater(px,py,x,y);return;}ctx.fillStyle=c==='#'?'#909488':c===','?'#c8bdae':(x+y)%2?'#e0ded0':'#ebe9dd';ctx.fillRect(px,py,tile,tile);if(c==='q'||c==='s'||c==='X'){ctx.fillStyle=c==='q'?'#a7534d':c==='s'?'#867156':'#537b85';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='q'?'카페':c==='s'?'계단':'거리',px+tile/2,py+20);}return;}
    if(w.district==='lumiose-aymlis-park'&&!w.interior){const lower=w.zaMission11ParkLower===true;if(c==='~'){canalWater(px,py,x,y);return;}ctx.fillStyle=c==='#'?(lower?'#71827f':'#779079'):c===','?'#d0c5b0':(x+y)%2?'#d9d5be':'#e7e1cc';ctx.fillRect(px,py,tile,tile);if(c==='H'||c==='j'||c==='d'||c==='X'||c===';'){ctx.fillStyle=c==='H'?'#c95d61':c==='j'?'#907758':c==='d'?'#668eaa':c===';'?'#aaa092':'#537b85';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='H'?'센터':c==='j'?'계단':c==='d'?'사건':c===';'?'아치':'거리',px+tile/2,py+20);}return;}
    if(w.district==='lumiose-mission21-glide'&&!w.interior){ctx.fillStyle=c==='#'?'#756d70':'#b59980';ctx.fillRect(px,py,tile,tile);if(c===','){ctx.fillStyle='#e1c5a2';ctx.fillRect(px+2,py+tile-5,tile-4,2);}if(c==='l'||c==='j'||(y===6&&(x===9||x===13))){ctx.fillStyle=c==='l'||c==='j'?'#936e40':'#477d93';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='l'||c==='j'?'사다리':'활공',px+tile/2,py+20);}return;}
    if(w.district==='lumiose-jaune-sector9'&&!w.interior){
     // City Hall, the fountain and surrounding scaffold are source-grounded;
     // their compressed footprint, colours and exact placement remain drafts.
     const hall=x>=3&&x<=7&&y>=2&&y<=5,east=x>=15&&x<=19&&y>=11&&y<=14;
     const plaza=x>=3&&x<=9&&y>=7&&y<=13;
     ctx.fillStyle=c==='#'?'#7d8480':c===','?'#b9b4a3':(x+y)%2?'#dcd8c8':'#e9e6d8';ctx.fillRect(px,py,tile,tile);
     if(c===','||plaza){ctx.fillStyle=plaza?'#c7c6b5':'#a9a79b';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:0),py,1,tile-3);}
     if(c==='#'&&(hall||east)){
      const roof=hall?y===2:y===11;ctx.fillStyle=roof?(hall?'#788480':'#777979'):(hall?'#e0dac7':'#cfc8b9');ctx.fillRect(px,py,tile,tile);
      if(roof){ctx.fillStyle='#adb4a5';ctx.fillRect(px+1,py+tile-5,tile-2,3);ctx.fillStyle='rgba(255,255,255,.22)';ctx.fillRect(px+2,py+4,tile-4,2);}
      else{ctx.fillStyle='#6d8e8a';ctx.beginPath();ctx.arc(px+tile/2,py+tile*.38,tile*.22,Math.PI,0);ctx.lineTo(px+tile*.72,py+tile*.78);ctx.lineTo(px+tile*.28,py+tile*.78);ctx.fill();ctx.fillStyle='#dce6d6';ctx.fillRect(px+tile/2-2,py+tile*.39,3,tile*.34);ctx.fillStyle='#aba694';ctx.fillRect(px,py+tile-3,tile,3);}
     }
     if(c==='u'){ctx.fillStyle='#d9d2bf';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#8c9f91';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#e4e4d0';for(let n=0;n<3;n++)ctx.fillRect(px+5,py+5+n*6,tile-10,2);ctx.fillStyle='#587b77';ctx.fillRect(px+tile/2-3,py+3,6,tile-6);}
     if(c===';'){ctx.fillStyle='#d5d0bd';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,tile*.42,0,Math.PI*2);ctx.fill();ctx.fillStyle='#7ab6be';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,tile*.31,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e9eee0';ctx.fillRect(px+tile/2-2,py+tile/2-7,4,10);ctx.fillRect(px+tile/2-5,py+tile/2+2,10,2);}
     if(c==='j'){ctx.fillStyle='#597f84';ctx.fillRect(px+5,py+4,tile-10,tile-8);ctx.fillStyle='#d1e7d9';ctx.fillRect(px+8,py+7,tile-16,3);ctx.fillRect(px+8,py+tile-10,tile-16,3);}
     if(c==='X'){ctx.fillStyle='#819c90';ctx.fillRect(px+6,py+6,tile-12,tile-12);ctx.fillStyle='#d8e8d8';ctx.fillRect(px+9,py+9,tile-18,tile-18);}
     return;
    }
    if(w.district==='lumiose-jaune-sector8'&&!w.interior){
     // The café and Wild Zone 19 are documented in this sector; the compressed
     // street plan, façade details and exact positions are a 2D approximation.
     const center=x>=3&&x<=7&&y>=3&&y<=5,cafe=x>=16&&x<=20&&y>=3&&y<=5;
     ctx.fillStyle=c==='#'?'#8b9690':c===','?'#b9b4a6':(x+y)%2?'#ded7c7':'#eae4d5';ctx.fillRect(px,py,tile,tile);
     if(c===','&&y>=7&&y<=9){ctx.fillStyle='#999e96';ctx.fillRect(px,py,tile,tile);if(x>=10&&x<=12){ctx.fillStyle='#eee8d9';ctx.fillRect(px+3,py+5,tile-6,4);ctx.fillRect(px+3,py+tile-9,tile-6,4);}}
     if(c==='#'&&(center||cafe)){
      const roof=y===3;ctx.fillStyle=roof?(center?'#b95655':'#58746d'):(center?'#ece7dd':'#d9d3c2');ctx.fillRect(px,py,tile,tile);
      if(roof){ctx.fillStyle=center?'#e6a29a':'#a6b8a4';ctx.fillRect(px+1,py+tile-5,tile-2,4);ctx.fillStyle='rgba(255,255,255,.15)';ctx.fillRect(px+2,py+4,tile-4,2);}
      else{ctx.fillStyle=center?'#89aaa8':'#698782';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#d9ebe0';ctx.fillRect(px+8,py+7,3,tile-14);ctx.fillStyle='#a99b89';ctx.fillRect(px,py+tile-3,tile,3);}
     }
     if(c==='H'||c==='M'||c==='q'){
      const color=c==='H'?'#b95055':c==='q'?'#638677':'#708d9d';ctx.fillStyle='#dfd5c4';ctx.fillRect(px,py,tile,tile);ctx.fillStyle=color;ctx.fillRect(px+2,py+2,tile-4,7);ctx.fillStyle='#eddfc9';for(let k=4;k<tile-3;k+=8)ctx.fillRect(px+k,py+2,4,7);ctx.fillStyle='#4d7071';ctx.fillRect(px+8,py+10,tile-16,tile-12);ctx.fillStyle='#d6eadf';ctx.fillRect(px+10,py+12,3,tile-17);
      if(c==='H'){ctx.fillStyle='#f7e9df';ctx.fillRect(px+tile/2-4,py+4,8,3);ctx.fillRect(px+tile/2-1,py+1,3,9);}
     }
     if(c==='^'){ctx.fillStyle='#77563d';ctx.fillRect(px+4,py+13,tile-8,5);ctx.fillRect(px+6,py+18,3,7);ctx.fillRect(px+tile-9,py+18,3,7);}
     if(c==='X'&&((x===11&&y===0)||(x===0&&y===8))){ctx.fillStyle='#60c9a4';ctx.fillRect(px+2,py+3,tile-4,tile-6);ctx.fillStyle='#b9f2d5';ctx.fillRect(px+5,py+5,3,tile-10);ctx.fillRect(px+tile-8,py+5,3,tile-10);ctx.fillRect(px+6,py+5,tile-12,2);}
     else if(c==='X'){ctx.fillStyle='#718d8b';ctx.fillRect(px+5,py+5,tile-10,tile-10);}
     if(c==='9'){ctx.fillStyle='#546a59';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,tile*.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f2d9b6';ctx.fillRect(px+tile/2-3,py+tile/2-5,6,9);}
     return;
    }
    if(w.district==='lumiose-mission32-courtyard'&&!w.interior){const layer=w.zaMission32Layer||'ground';ctx.fillStyle=c==='#'?'#777d78':c===','?'#aa9981':(x+y)%2?'#d8d0bb':'#e4dcc7';ctx.fillRect(px,py,tile,tile);if(layer==='roof'||layer==='high'){if(c===','){ctx.fillStyle='#897960';ctx.fillRect(px,py+tile-4,tile,2);}}if(c==='j'||c==='l'||c==='6'||c==='X'){ctx.fillStyle=c==='6'?'#b26470':c==='X'?'#537b85':'#936e40';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='j'?'승강':c==='l'?'사다리':c==='6'?'사건':'출구',px+tile/2,py+20);}if(layer==='high'&&y===6&&(x===11||x===15)){ctx.fillStyle='#477d93';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('활공',px+tile/2,py+20);}return;}
    if(w.district==='lumiose-mission33-alley'&&!w.interior){ctx.fillStyle=c==='#'?'#8b8580':c===','?'#b5afa5':(x+y)%2?'#d5c8b8':'#e0d4c4';ctx.fillRect(px,py,tile,tile);if(y===2&&x>=3&&x<=7){ctx.fillStyle='#d8c8bf';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#be5f61';ctx.fillRect(px,py,tile,5);if(x===5){ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('센터',px+tile/2,py+20);}}if(c==='H'||c==='M'){ctx.fillStyle=c==='H'?'#eae7dc':'#d2d7df';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle=c==='H'?'#c94c4c':'#4b7199';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='H'?'회복':'상점',px+tile/2,py+20);}if(c==='6'){ctx.fillStyle='#6d7650';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('사건',px+tile/2,py+20);}if(c==='X'){ctx.fillStyle='#537b85';ctx.fillRect(px+4,py+4,tile-8,tile-8);}return;}
    if(w.district==='lumiose-mission12-jaune3'&&!w.interior){const layer=w.zaMission12Layer||'ground';ctx.fillStyle=c==='#'?(layer==='ground'?'#8f8174':'#687177'):c===','?'#c7b795':layer==='scaffold'?'#b39a77':layer==='roof'?'#d3c4ae':(x+y)%2?'#ded4bd':'#e9dfca';ctx.fillRect(px,py,tile,tile);if(layer==='scaffold'&&c!=='#'){ctx.fillStyle='#91795e';ctx.fillRect(px,py+tile-3,tile,2);}if(c==='l'){ctx.fillStyle='#765538';ctx.fillRect(px+7,py+3,3,tile-6);ctx.fillRect(px+tile-10,py+3,3,tile-6);for(let j=0;j<3;j++)ctx.fillRect(px+9,py+8+j*7,tile-18,2);}if(c==='d'&&layer==='roof'){ctx.fillStyle='#a64b38';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('폭타',px+tile/2,py+20);}if(c==='X'){ctx.fillStyle='#668e7d';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-zone6'&&!w.interior){const layer=zone6Layer(w),roof=['roof','high'].includes(layer);ctx.fillStyle=c==='#'?'#66787a':c==='g'?'#8eae79':c===','&&layer==='ground'?'#b9ab95':(x+y)%2?'#d7cfbb':'#e2dcc8';ctx.fillRect(px,py,tile,tile);if(layer==='ground'&&x>=13&&x<=16&&y>=3&&y<=6&&(c==='g'||c==='b')){ctx.fillStyle=(x+y)%2?'#86a975':'#91b57d';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#c2d2aa';if(y===3)ctx.fillRect(px,py+2,tile,2);if(y===6)ctx.fillRect(px,py+tile-4,tile,2);if(x===13)ctx.fillRect(px+2,py,2,tile);if(x===16)ctx.fillRect(px+tile-4,py,2,tile);if(x===14||x===15)ctx.fillRect(px,py+tile-2,tile,1);}if(c==='%'){const cafe=layer==='ground'&&x>=17&&x<=19&&y<=2;if(cafe){ctx.fillStyle=y===1?'#75595c':'#e1d5c1';ctx.fillRect(px,py,tile,tile);if(y===1){ctx.fillStyle='#a57669';ctx.fillRect(px+2,py+4,tile-4,tile-7);ctx.fillStyle='#c79f8c';ctx.fillRect(px,py+tile-5,tile,3);}else{ctx.fillStyle='#758e8a';ctx.fillRect(px+7,py+5,tile-14,tile-10);ctx.fillStyle='#dce7db';ctx.fillRect(px+10,py+7,3,tile-15);ctx.fillStyle='#aa786c';ctx.fillRect(px,py+tile-6,tile,4);}}else{ctx.fillStyle='#765d55';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#b89a83';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#546d71';ctx.fillRect(px+7,py+9,tile-14,tile-16);}}if(roof&&c!=='#')roofPaving(px,py,x,y);if(c==='~'||(layer==='canal'&&(c==='a'||c==='w')))canalWater(px,py,x,y);if(layer==='canal'&&c==='w'){ctx.fillStyle='rgba(44,64,65,0.28)';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#aac7b7';ctx.fillRect(px+5,py+tile-6,tile-10,2);}if(layer==='ground'&&ZONE6_MARKET_STALLS.some(([sx,sy]:number[])=>sx===x&&sy===y)){ctx.fillStyle='#806a55';ctx.fillRect(px+1,py+8,tile-2,tile-8);ctx.fillStyle=x%2?'#e8d4a6':'#ba665c';ctx.fillRect(px,py+2,tile,8);ctx.fillStyle='#e5d5ad';ctx.fillRect(px+3,py+12,tile-6,3);ctx.fillStyle='#695743';ctx.fillRect(px+3,py+tile-5,tile-6,3);}if(c===';')bridgeDeck(px,py,x);if(c==='g'){ctx.fillStyle='#618f58';for(let j=0;j<3;j++)ctx.fillRect(px+5+j*9,py+tile-10-(j%2)*4,3,7);}if(c==='q'&&layer==='ground'){ctx.fillStyle='#c4b8a5';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#5d7779';ctx.fillRect(px+8,py+3,tile-16,tile-5);ctx.fillStyle='#dce7d9';ctx.fillRect(px+tile/2-1,py+4,2,tile-7);ctx.fillStyle='#a96559';ctx.fillRect(px+4,py+2,tile-8,4);}
     if(c==='l'||c==='h'){ctx.fillStyle='#806448';ctx.fillRect(px+8,py+5,3,tile-10);ctx.fillRect(px+tile-11,py+5,3,tile-10);for(let k=8;k<tile-6;k+=6)ctx.fillRect(px+8,py+k,tile-16,2);}if(c==='j'){ctx.fillStyle='#4c858c';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#d0eeee';ctx.fillRect(px+8,py+7,tile-16,3);ctx.fillRect(px+8,py+tile-10,tile-16,3);}
     if(c==='i'||c==='t'){ctx.fillStyle='#eee9da';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,7,0,Math.PI*2);ctx.fill();ctx.fillStyle=c==='t'?'#d6b75b':'#c65d58';ctx.fillRect(px+tile/2-6,py+tile/2-5,12,5);ctx.fillStyle='#4c5650';ctx.fillRect(px+tile/2-6,py+tile/2,12,2);}
     if(c==='X'||c==='v'){ctx.fillStyle=c==='v'?'#856f59':'#789488';ctx.fillRect(px+9,py+9,tile-18,tile-18);}return;}
    if(w.district==='lumiose-coulant-route'&&!w.interior&&w.zaCoulantLower){ctx.fillStyle=c==='#'?'#7c817c':c==='~'?'#6fa7b1':'#beb5a0';ctx.fillRect(px,py,tile,tile);if(c===','&&(x===6||x===16)){ctx.fillStyle='#8a847a';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#6d6963';ctx.fillRect(px,py,tile,4);}if(c==='l'||c==='X'){ctx.fillStyle='#8e795f';for(let j=0;j<3;j++)ctx.fillRect(px+3,py+5+j*8,tile-6,2);}return;}
    if(w.district==='lumiose-coulant-route'&&!w.interior){ctx.fillStyle=c==='#'?'#9e9388':c==='~'?'#7aafb8':c===':'?'#b9a587':c===','?'#c9bca7':(x+y)%2?'#d9ddce':'#e4e8d9';ctx.fillRect(px,py,tile,tile);if(c===':'){if(y>=6&&y<=10&&(x===6||x===16)){ctx.fillStyle='#ad9473';ctx.fillRect(px+3,py,tile-6,tile);ctx.fillStyle='#806b55';ctx.fillRect(px+3,py,2,tile);ctx.fillRect(px+tile-5,py,2,tile);for(let j=0;j<3;j++)ctx.fillRect(px+5,py+5+j*8,tile-10,1);}else{ctx.fillStyle='#8e795f';for(let j=0;j<3;j++)ctx.fillRect(px+3,py+5+j*8,tile-6,2);}}if(c==='l'){ctx.fillStyle='#8e795f';for(let j=0;j<3;j++)ctx.fillRect(px+3,py+5+j*8,tile-6,2);}if(c==='X'||c==='W'){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-mission34-roof'&&!w.interior){ctx.fillStyle=c==='#'?'#71818b':c===','?'#aa8f6e':c==='r'?'#8e625b':(x+y)%2?'#c6c8c3':'#d9dcd6';ctx.fillRect(px,py,tile,tile);if('jh67'.includes(c)){ctx.fillStyle=c==='j'||c==='h'?'#936e40':'#885c77';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='j'?'비계':c==='h'?'승강기':c==='6'?'필리프':'아쿠스타',px+tile/2,py+20);}return;}
    if(['lumiose-estival-approach','lumiose-bleu6-approach'].includes(w.district)&&!w.interior){ctx.fillStyle=c==='#'?'#a69b90':c===','?'#c7bcb0':(x+y)%2?'#e0d8ca':'#e9e1d5';ctx.fillRect(px,py,tile,tile);if(c==='h'){ctx.fillStyle='#936e40';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('비계',px+tile/2,py+20);}if(c==='X'){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-espace-vide'&&!w.interior){ctx.fillStyle=c==='#'?'#a2988d':c==='~'?'#79adc1':c===','?'#c2b7ab':(x+y)%2?'#ddd5c9':'#e7dfd2';ctx.fillRect(px,py,tile,tile);if(c===':'){ctx.fillStyle='#8e8d84';for(let j=0;j<3;j++)ctx.fillRect(px+3,py+5+j*8,tile-6,2);}if(c==='l'){ctx.fillStyle='#72523a';ctx.fillRect(px+6,py+8,tile-12,tile-16);}if(c==='W'||c==='X'){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-magenta-canal-route'&&!w.interior&&c==='u'&&x===8&&y===7){ctx.fillStyle='#8a9c85';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('퀴즈',px+tile/2,py+20);return;}
    if(w.district==='lumiose-magenta-canal-route'&&!w.interior){ctx.fillStyle=c==='#'?'#9c908a':c==='~'?'#7aafb8':c===','?'#c6bbb0':(x+y)%2?'#d9d4ca':'#e5dfd5';ctx.fillRect(px,py,tile,tile);if(c==='~')canalWater(px,py,x,y);if(c==='%'){ctx.fillStyle='#b0a08e';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#718b89';ctx.fillRect(px+7,py+6,tile-14,tile-12);}if(c==='z'){ctx.fillStyle='#735982';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('수도',px+tile/2,py+20);}if(c==='X'){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-magenta-sewer-bank'&&!w.interior){if(c==='~'){canalWater(px,py,x,y);return;}ctx.fillStyle=c==='#'?'#71837e':c===','?'#b0b3a4':(x+y)%2?'#d1cec0':'#dcd8ca';ctx.fillRect(px,py,tile,tile);if(c==='u'||c==='z'){ctx.fillStyle=c==='u'?'#8d786a':'#536b6b';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='u'?'경사로':'하수도',px+tile/2,py+20);}return;}
    if(w.district==='lumiose-magenta-sector8-route'&&!w.interior){ctx.fillStyle=c==='#'?'#988b8b':c===','?'#c5b3ad':(x+y)%2?'#ddd4cc':'#e8ded6';ctx.fillRect(px,py,tile,tile);if(c==='u'){ctx.fillStyle='#8d786a';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('경사로',px+tile/2,py+20);}if(c==='H'){ctx.fillStyle='#cf5a63';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.fillRect(px+tile/2-2,py+8,4,tile-16);ctx.fillRect(px+8,py+tile/2-2,tile-16,4);}if(c==='X'){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(['lumiose-station-alley','lumiose-station-roof'].includes(w.district)&&!w.interior){
     const roof=w.district==='lumiose-station-roof';ctx.fillStyle=c==='#'?(roof?'#526573':'#777d7a'):roof?'#c8baaa':(x+y)%2?'#d9d3c5':'#e5ded0';ctx.fillRect(px,py,tile,tile);
     if(c==='#'){ctx.fillStyle=roof?'#7f8f8e':'#b3ac9a';ctx.fillRect(px,py+tile-5,tile,5);if(!roof&&y%3===1){ctx.fillStyle='#718e94';ctx.fillRect(px+8,py+6,tile-16,tile-12);ctx.fillStyle='#d3ddd7';ctx.fillRect(px+tile/2,py+6,2,tile-12);}}
     if(c===','){ctx.fillStyle='#aa9c8d';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:1),py,1,tile-2);}
     if(c==='l'){ctx.fillStyle='#9b7650';ctx.fillRect(px+7,py+4,3,tile-8);ctx.fillRect(px+tile-10,py+4,3,tile-8);for(let i=7;i<tile-5;i+=6)ctx.fillRect(px+7,py+i,tile-14,2);}
     if(c==='v'){ctx.fillStyle='#777a72';ctx.fillRect(px,py+tile-6,tile,6);ctx.fillStyle='#f1e3c7';ctx.fillRect(px+6,py+tile-9,tile-12,3);}
     if(c==='X'){ctx.fillStyle='#849b8f';ctx.fillRect(px+9,py+9,tile-18,tile-18);}return;
    }
    if(w.district==='lumiose-vert-street-route'&&!w.interior){
     const station=x>=7&&x<=10&&y>=2&&y<=5;
     ctx.fillStyle=c==='#'?'#a69b8d':c===','?'#c8bdad':(x+y)%2?'#d9dfd1':'#e3e9dc';ctx.fillRect(px,py,tile,tile);
     if(c===','){ctx.fillStyle='#b4ab9c';ctx.fillRect(px,py+tile-2,tile,1);ctx.fillRect(px+(y%2?tile/2:0),py,1,tile);}
     if(station){ctx.fillStyle=y===2?'#687980':'#ddd5c4';ctx.fillRect(px,py,tile,tile);ctx.fillStyle=y===2?'#a8b0aa':'#b2a99a';ctx.fillRect(px,py+tile-4,tile,4);if(y===3||y===4){ctx.fillStyle='#728f94';ctx.fillRect(px+5,py+4,tile-10,tile-8);ctx.fillStyle='#d5e5dc';ctx.fillRect(px+8,py+6,3,tile-12);ctx.fillRect(px+tile/2,py+4,2,tile-8);}if(y===5){ctx.fillStyle=(x===8||x===9)?'#536e76':'#819698';ctx.fillRect(px+4,py+4,tile-8,tile-4);ctx.fillStyle='#d8ded3';ctx.fillRect(px+tile/2,py+5,2,tile-5);}}
     if(c==='r'){ctx.fillStyle='#c8bdad';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#746d63';ctx.fillRect(px+3,py+10,tile-6,tile-12);ctx.fillStyle='#aaa497';ctx.fillRect(px+7,py+5,tile-14,tile-14);ctx.fillStyle='#d0c7b7';ctx.fillRect(px+9,py+6,8,3);}
     if(c==='H'){ctx.fillStyle='#f0e8d8';ctx.fillRect(px+3,py+5,tile-6,tile-8);ctx.fillStyle='#bf4d55';ctx.fillRect(px+2,py+3,tile-4,8);ctx.fillStyle='#5b7780';ctx.fillRect(px+7,py+15,tile-14,tile-19);ctx.fillStyle='#fff';ctx.fillRect(px+tile/2-3,py+4,6,6);ctx.fillStyle='#a83d46';ctx.fillRect(px+tile/2-2,py+5,4,2);}
     if(c==='X'||c==='W'){ctx.fillStyle='#81998c';ctx.fillRect(px+9,py+9,tile-18,tile-18);}return;
    }
    if(w.district==='lumiose-zone5-drain'&&!w.interior){
     // The source describes a shallow waterway, sludge and a tunnel to the
     // clearing; the tile geometry and stonework remain provisional.
     ctx.fillStyle=c==='#'?'#526a6c':c==='w'?'#77a8a4':(x+y)%2?'#a1ada5':'#afbab0';ctx.fillRect(px,py,tile,tile);
     if(c==='#'){
      ctx.fillStyle='#718583';ctx.fillRect(px,py+tile/2,tile,2);ctx.fillRect(px+(y%2?tile/3:tile*2/3),py+2,2,tile/2-2);
      ctx.fillStyle='#3f5a5d';if(w.map[y+1]?.[x]&&w.map[y+1][x]!=='#')ctx.fillRect(px,py+tile-5,tile,5);
     }else if(c==='w'){
      ctx.fillStyle='#b5d3c6';ctx.fillRect(px+3,py+7,tile-8,2);ctx.fillRect(px+9,py+20,tile-12,2);
      ctx.fillStyle='#91bdb0';if(w.map[y]?.[x-1]==='#')ctx.fillRect(px,py,3,tile);if(w.map[y]?.[x+1]==='#')ctx.fillRect(px+tile-3,py,3,tile);
     }else{
      ctx.fillStyle='#8b9d97';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:2),py+4,2,tile-6);
     }
     if(c==='r'){
      ctx.fillStyle='#563b65';ctx.beginPath();ctx.moveTo(px+3,py+tile-5);ctx.lineTo(px+6,py+12);ctx.lineTo(px+12,py+8);ctx.lineTo(px+17,py+3);ctx.lineTo(px+tile-5,py+10);ctx.lineTo(px+tile-3,py+tile-5);ctx.closePath();ctx.fill();
      ctx.fillStyle='#a16ca9';ctx.fillRect(px+8,py+12,5,4);ctx.fillRect(px+18,py+8,4,3);ctx.fillStyle='#c79ac6';ctx.fillRect(px+10,py+11,3,2);
     }else if(c==='h'){
      ctx.fillStyle='#704e39';ctx.fillRect(px+7,py+3,4,tile-6);ctx.fillRect(px+tile-11,py+3,4,tile-6);ctx.fillStyle='#dfbd87';for(let j=7;j<tile-5;j+=6)ctx.fillRect(px+9,py+j,tile-18,3);
     }else if(c==='X'||c==='W'){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;
    }
    if(w.district==='lumiose-bleu3-sewer-approach'&&!w.interior){ctx.fillStyle=c==='#'?'#526a6c':c==='r'?'#75517d':(x+y)%2?'#a1ada5':'#afbab0';ctx.fillRect(px,py,tile,tile);if(c==='h'||c==='X'||c==='W'){ctx.fillStyle=c==='h'?'#946448':'#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-rouge-tower-interior'&&!w.interior){ctx.fillStyle=c==='#'?'#787d7c':(x+y)%2?'#d8d2c6':'#e5dfd1';ctx.fillRect(px,py,tile,tile);if(c==='i'){ctx.fillStyle='#9b9b92';ctx.fillRect(px+4,py+3,tile-8,tile-6);ctx.fillStyle='#e9e4d9';for(let j=0;j<4;j++)ctx.fillRect(px+5,py+6+j*6,tile-10,2);}if(c==='j'){ctx.fillStyle='#896b55';ctx.fillRect(px+5,py+4,tile-10,tile-8);}if(c==='p'){const img=w.zaWildShinyRolls?.['alpha:zone3-tower-litleo:667']===true?shinyFieldImages[667]:fieldImages[667];if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#b45d42';ctx.fillRect(px+5,py+5,tile-10,tile-10);}}return;}
    if(w.district==='lumiose-lune-roof'&&!w.interior){ctx.fillStyle=c==='#'?'#6d7779':c===','?'#a89b8b':c===';'?'#98c8ce':'#d4c9b8';ctx.fillRect(px,py,tile,tile);if(c==='.')roofPaving(px,py,x,y);if(c===','){ctx.fillStyle='#6e6c66';ctx.fillRect(px+2,py+5,tile-4,3);ctx.fillRect(px+2,py+tile-8,tile-4,3);}if(c===';'){ctx.strokeStyle='#dceff0';ctx.strokeRect(px+1,py+1,tile-2,tile-2);}if(c==='z'){ctx.fillStyle='#fbe5a5';ctx.fillRect(px+tile/2-2,py+5,4,tile-10);ctx.fillRect(px+5,py+tile/2-2,tile-10,4);}if(c==='h'||c==='l'){ctx.fillStyle='#806044';ctx.fillRect(px+6,py+4,tile-12,tile-8);}if(x===17&&(y===2||y===4)){ctx.fillStyle='#ecd07d';ctx.fillRect(px+4,py+4,tile-8,3);ctx.fillRect(px+4,py+tile-7,tile-8,3);}return;}
    if(w.district==='lumiose-rust-roof'&&!w.interior){ctx.fillStyle=c==='#'?'#68706c':c==='^'?'#698963':c==='l'?'#826347':'#b8aca0';ctx.fillRect(px,py,tile,tile);if(c==='.')roofPaving(px,py,x,y);if(c==='^'){ctx.fillStyle='#416e48';ctx.fillRect(px+6,py+3,4,tile-6);ctx.fillRect(px+tile-10,py+2,4,tile-4);ctx.fillStyle='#a7bd75';ctx.fillRect(px+4,py+8,tile-8,3);}if(x===15&&(y===6||y===9)){ctx.fillStyle='#ecd07d';ctx.fillRect(px+4,py+4,tile-8,3);ctx.fillRect(px+4,py+tile-7,tile-8,3);}if(c==='l'){ctx.fillStyle='#806044';ctx.fillRect(px+6,py+4,tile-12,tile-8);}return;}
    if(w.district==='lumiose-vert6-roof'&&!w.interior){ctx.fillStyle=c==='#'?'#687674':c==='l'?'#8c6a4b':'#c5b9a5';ctx.fillRect(px,py,tile,tile);if(c==='.')roofPaving(px,py,x,y);if(((x===9||x===13)&&y===8)||(x===16&&(y===2||y===4))){ctx.fillStyle='#ecd07d';ctx.fillRect(px+4,py+4,tile-8,3);ctx.fillRect(px+4,py+tile-7,tile-8,3);}if(c==='l'){ctx.fillStyle='#806044';ctx.fillRect(px+6,py+4,tile-12,tile-8);}return;}
    if(w.district==='lumiose-rouge7-roof'&&!w.interior){ctx.fillStyle=c==='#'?'#747875':c===','?'#af967e':(x+y)%2?'#cfc1af':'#ded2c0';ctx.fillRect(px,py,tile,tile);if(c!== '#'&&c!=='l')roofPaving(px,py,x,y);if(x===16&&(y===12||y===14)){ctx.fillStyle='#ecd07d';ctx.fillRect(px+4,py+4,tile-8,3);ctx.fillRect(px+4,py+tile-7,tile-8,3);}if(c==='l'){ctx.fillStyle='#806044';ctx.fillRect(px+6,py+4,tile-12,tile-8);}return;}
    if(w.district==='lumiose-zone7-west-roof'&&!w.interior){ctx.fillStyle=c==='#'?'#777770':(x+y)%2?'#c7bca9':'#d9ceba';ctx.fillRect(px,py,tile,tile);if(c!== '#'&&c!=='j')roofPaving(px,py,x,y);if(c==='X'){ctx.fillStyle='#537b85';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('옥상',px+tile/2,py+20);}if(c==='j'||c==='v'){ctx.fillStyle=c==='j'?'#896b55':'#637e87';ctx.fillRect(px+5,py+4,tile-10,tile-8);if(c==='v'){ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(y===10?'↓':'↑',px+tile/2,py+20);}}return;}
    if(w.district==='lumiose-jaune7-roof'&&!w.interior){ctx.fillStyle=c==='#'?'#767976':c===','?'#b1997e':(x+y)%2?'#cfc2b1':'#ded1c0';ctx.fillRect(px,py,tile,tile);if(c!== '#'&&c!=='X')roofPaving(px,py,x,y);if(c==='X'||c==='j'||c==='r'){ctx.fillStyle=c==='j'?'#896b55':c==='r'?'#e8e3d3':'#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-cafe-woof-roof'&&!w.interior){ctx.fillStyle=c==='#'?'#716d6a':c===','?'#af957c':(x+y)%2?'#c8b9a7':'#d8c8b5';ctx.fillRect(px,py,tile,tile);if(c==='l'||c==='r'||c==='t'){ctx.fillStyle=c==='l'?'#88643e':c==='r'?'#64835a':'#dfbe4f';ctx.fillRect(px+4,py+4,tile-8,tile-8);}return;}
    if(w.district==='lumiose-aymlis-west-roof'&&!w.interior){ctx.fillStyle=c==='#'?'#77828a':c===','?'#bdad98':(x+y)%2?'#d7d5cb':'#e5e1d7';ctx.fillRect(px,py,tile,tile);if(c==='E'){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-mission27-roof'&&!w.interior){ctx.fillStyle=c==='#'?'#748a98':c===','?(x===7&&y===11?'#d4c7ad':'#c1e1e6'):(x+y)%2?'#dbe9e8':'#edf4ef';ctx.fillRect(px,py,tile,tile);if(c==='r'||c==='7'||c==='j'){ctx.fillStyle=c==='r'?'#a4dce6':c==='7'?'#b75c72':'#936e40';ctx.fillRect(px+4,py+4,tile-8,tile-8);}return;}
    if(w.district==='lumiose-mission23-roof'&&!w.interior){ctx.fillStyle=c==='#'?'#73757f':c===','?'#b8a08b':w.zaMission23LowerRoof?((x+y)%2?'#b9aea0':'#ccc0b1'):(x+y)%2?'#cfc5b9':'#ddd3c6';ctx.fillRect(px,py,tile,tile);if(c===','){ctx.fillStyle='#987b60';for(let j=0;j<3;j++)ctx.fillRect(px+3,py+5+j*8,tile-6,2);}if('jlvht'.includes(c)){ctx.fillStyle=c==='v'?'#b75c72':c==='t'?'#d9ad3e':'#936e40';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='j'?'승강':c==='l'?'사다리':c==='h'?'낮은층':c==='t'?'TM':'!',px+tile/2,py+20);}return;}
    if(w.district==='lumiose-mission22-tunnel'&&!w.interior){ctx.fillStyle=c==='#'?'#53636b':c==='~'?'#6da5b7':c===','?'#c1e1e6':(x+y)%2?'#a9b7b0':'#bac8be';ctx.fillRect(px,py,tile,tile);if(c==='r'||c==='o'||c==='X'){ctx.fillStyle=c==='r'?'#b7e3e9':c==='o'?'#b75c72':'#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-mission16-roof'&&!w.interior){ctx.fillStyle=c==='#'?'#68718a':c===','?'#d8d5bd':(x+y)%2?'#d4c9ba':'#e0d5c6';ctx.fillRect(px,py,tile,tile);if(c==='r'||c===','){ctx.strokeStyle='#f7f2de';ctx.beginPath();ctx.moveTo(px+3,py+3);ctx.lineTo(px+tile-3,py+tile-3);ctx.moveTo(px+tile-3,py+3);ctx.lineTo(px+3,py+tile-3);ctx.stroke();}if(c==='d'||c==='W'){ctx.fillStyle=c==='d'?'#b75c72':'#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-zone11-nw-ledge'&&!w.interior){
     // The northwest entrance includes a drop to the bank; the dimensions,
     // paving and drop position on this separate layer are provisional.
     ctx.fillStyle=c==='#'?'#708b80':(x+y)%2?'#c3c7ae':'#d8d5bd';ctx.fillRect(px,py,tile,tile);
     if(c==='#'){
      ctx.fillStyle='#9bad9e';ctx.fillRect(px+1,py+2,tile-2,tile-5);
      ctx.fillStyle='#cad5bf';ctx.fillRect(px+2,py+2,tile-4,3);
      ctx.fillStyle='#617d72';ctx.fillRect(px,py+tile-4,tile,4);
     }else{
      ctx.fillStyle='#a9b09f';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:1),py+3,2,tile-5);
     }
     if(c==='v'){
      ctx.fillStyle='#5e7b70';ctx.fillRect(px+3,py+2,tile-6,tile-4);
      ctx.fillStyle='#bdceb5';ctx.fillRect(px+3,py+2,tile-6,4);
      ctx.fillStyle='#e4efe0';ctx.beginPath();ctx.moveTo(px+tile/2,py+tile-6);ctx.lineTo(px+8,py+12);ctx.lineTo(px+tile-8,py+12);ctx.closePath();ctx.fill();
     }else if(c==='W'){ctx.fillStyle='#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;
    }
    if(w.district==='lumiose-magenta6-scaffold'&&!w.interior){ctx.fillStyle=c==='#'?'#746c70':'#ae9278';ctx.fillRect(px,py,tile,tile);if(c===','){ctx.fillStyle='#e0c4a0';for(let j=0;j<3;j++)ctx.fillRect(px+3,py+6+j*8,tile-6,2);}if(c==='l'||c==='j'){ctx.fillStyle='#815e40';ctx.fillRect(px+6,py+4,tile-12,tile-8);ctx.fillStyle='#eddbc1';for(let j=0;j<3;j++)ctx.fillRect(px+8,py+8+j*6,tile-16,2);}return;}
    if(w.district==='lumiose-magenta3-gap'&&!w.interior){ctx.fillStyle=c==='#'?'#796e77':(x+y)%2?'#c1b4bb':'#cfc1c8';ctx.fillRect(px,py,tile,tile);if(c==='l'){ctx.fillStyle='#936e40';ctx.fillRect(px+6,py+4,tile-12,tile-8);ctx.fillStyle='#e8d9c3';for(let j=0;j<3;j++)ctx.fillRect(px+8,py+8+j*6,tile-16,2);}return;}
    if(w.district==='lumiose-magenta-street'&&!w.interior){if(c==='~'){canalWater(px,py,x,y);return;}ctx.fillStyle=c==='#'?'#8d7482':c===':'?'#bca99f':c===','?'#d4c2c9':(x+y)%2?'#e9dce1':'#f0e5e8';ctx.fillRect(px,py,tile,tile);if(c===':'){ctx.fillStyle='#f2e6dc';ctx.fillRect(px,py+4,tile,2);ctx.fillRect(px,py+tile-6,tile,2);}if(c==='#'&&x>0&&x<22&&y>0&&y<16){ctx.fillStyle='#b698a7';ctx.fillRect(px+3,py+4,tile-6,tile-8);}return;}
    if(w.district==='lumiose-magenta6-court-alley'&&!w.interior){const court=c===';';ctx.fillStyle=c==='#'?'#8f7a88':court?'#b98d96':(x+y)%2?'#d8ced3':'#e3d8db';ctx.fillRect(px,py,tile,tile);if(court){ctx.fillStyle='#f3e7e1';if(x===9)ctx.fillRect(px+3,py,2,tile);if(x===17)ctx.fillRect(px+tile-5,py,2,tile);if(y===10)ctx.fillRect(px,py+3,tile,2);if(y===14)ctx.fillRect(px,py+tile-5,tile,2);if(x===13)ctx.fillRect(px,py,2,tile);}if(c==='a'||c==='T'){ctx.fillStyle=c==='T'?'#aa454d':'#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='T'?'로열':'출구',px+tile/2,py+20);}return;}
    // Sector 6's building block surrounds an inner courtyard. Its exact roof
    // shapes are draft; only the existing blocked footprint is used here.
    if(w.district==='lumiose-magenta-sector6'&&!w.interior){
     const outer=x===0||x===22||y===0||y===16,block=c==='#'&&!outer,below=w.map[y+1]?.[x],above=w.map[y-1]?.[x];
     ctx.fillStyle=outer?'#88777d':block?'#786b76':c===','?'#c4b4ab':(x+y)%2?'#e0d7d0':'#e8ded6';ctx.fillRect(px,py,tile,tile);
     if(block){ctx.fillStyle=(x+y)%2?'#79717f':'#837987';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#6c606d';ctx.fillRect(px,py+tile-3,tile,3);ctx.fillStyle='#a694a0';ctx.fillRect(px+2,py+3,tile-4,2);ctx.fillStyle='#716873';ctx.fillRect(px+((y%2)*8),py+7,2,tile-10);if(above!=='#'){ctx.fillStyle='#d3c2b6';ctx.fillRect(px,py,tile,4);ctx.fillStyle='#574e5a';ctx.fillRect(px,py+4,tile,3);}if(below!=='#'){ctx.fillStyle='#c7b5a6';ctx.fillRect(px,py+tile-9,tile,9);ctx.fillStyle='#6c6066';ctx.fillRect(px+5,py+tile-7,6,4);ctx.fillRect(px+tile-11,py+tile-7,6,4);ctx.fillStyle='#efe0c8';ctx.fillRect(px+6,py+tile-6,4,2);ctx.fillRect(px+tile-10,py+tile-6,4,2);}}
     if(c===','||c==='.'){ctx.fillStyle=c===','?'#a99b94':'#d1c7bf';ctx.fillRect(px,py+tile-2,tile,1);ctx.fillRect(px+(y%2?tile/2:1),py+2,1,tile-4);}
     if(c==='l'){ctx.fillStyle='#7e5d44';ctx.fillRect(px+7,py+4,3,tile-8);ctx.fillRect(px+tile-10,py+4,3,tile-8);for(let i=7;i<tile-5;i+=6)ctx.fillRect(px+7,py+i,tile-14,2);}
     if(c==='a'){ctx.fillStyle='#738b83';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#d6e2d1';ctx.fillRect(px+9,py+9,tile-18,tile-13);}
     if(c==='X'){ctx.fillStyle='#768f85';ctx.fillRect(px+7,py+7,tile-14,tile-14);ctx.fillStyle='#e2ece0';ctx.fillRect(px+11,py+11,tile-22,tile-22);}
     return;
    }
    if(['lumiose-magenta-sector1','lumiose-magenta-sector2','lumiose-magenta-sector3','lumiose-magenta-sector3-roof','lumiose-magenta-sector4','lumiose-magenta-sector4-roof','lumiose-magenta-sector6','lumiose-magenta-sector6-roof','lumiose-magenta-sector9'].includes(w.district)&&!w.interior){ctx.fillStyle=c==='#'?'#987e91':c==='g'?'#9bb985':c===','?'#c8b2bd':(x+y)%2?'#e1d5df':'#eae0e8';ctx.fillRect(px,py,tile,tile);if(w.district==='lumiose-magenta-sector6'&&c==='a'&&x===5&&y===7){ctx.fillStyle='#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('코트',px+tile/2,py+20);}if(w.district==='lumiose-magenta-sector3-roof'&&c==='n'){ctx.fillStyle='#b97f70';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('Lida',px+tile/2,py+20);}if(w.district==='lumiose-magenta-sector9'&&!w.zaMagenta9Upper&&c==='d'&&x===12&&y===8){ctx.fillStyle='#769451';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('사건',px+tile/2,py+20);}if(w.district==='lumiose-magenta-sector6-roof'&&c==='j'){ctx.fillStyle='#936e40';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('사다리',px+tile/2,py+20);}if(w.district==='lumiose-magenta-sector6-roof'&&c===','){ctx.fillStyle='#987b60';for(let j=0;j<3;j++)ctx.fillRect(px+3,py+5+j*8,tile-6,2);}if(['lumiose-magenta-sector6','lumiose-magenta-sector6-roof','lumiose-magenta-sector9'].includes(w.district)&&c==='l'){ctx.fillStyle='#936e40';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('사다리',px+tile/2,py+20);}if(w.district==='lumiose-magenta-sector6-roof'&&c==='m'){ctx.fillStyle='#b75c72';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('!',px+tile/2,py+20);}if(w.district==='lumiose-magenta-sector3-roof'&&c===','){ctx.fillStyle='#987b60';for(let j=0;j<3;j++)ctx.fillRect(px+3,py+5+j*8,tile-6,2);}if(['lumiose-magenta-sector3','lumiose-magenta-sector3-roof'].includes(w.district)&&c==='j'){ctx.fillStyle='#936e40';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('승강',px+tile/2,py+20);}if(w.district==='lumiose-magenta-sector3-roof'&&c==='v'){ctx.fillStyle='#587b84';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('낙하',px+tile/2,py+20);}if(w.district==='lumiose-magenta-sector3-roof'&&c==='d'){ctx.fillStyle='#b75c72';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('!',px+tile/2,py+20);}if(['lumiose-magenta-sector2','lumiose-magenta-sector4'].includes(w.district)&&c==='u'&&x===17&&y===(w.district==='lumiose-magenta-sector2'?6:14)){ctx.fillStyle='#8c303c';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('카페',px+tile/2,py+20);return;}if(w.district==='lumiose-magenta-sector1'&&(c==='u'||c==='H')){ctx.fillStyle=c==='H'?'#cf5a63':'#90735e';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='H'?'센터':'카페',px+tile/2,py+20);return;}if(w.district==='lumiose-magenta-sector4-roof'&&c===','){ctx.fillStyle='#987b60';for(let j=0;j<3;j++)ctx.fillRect(px+3,py+5+j*8,tile-6,2);}if(['lumiose-magenta-sector4','lumiose-magenta-sector4-roof'].includes(w.district)&&c==='8'){ctx.fillStyle='#b75c72';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('!',px+tile/2,py+20);}if(c==='j'&&((w.district==='lumiose-magenta-sector4'&&x===9&&y===8)||(w.district==='lumiose-magenta-sector4-roof'&&x===1&&y===14))){ctx.fillStyle='#936e40';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('승강',px+tile/2,py+20);return;}if(w.district==='lumiose-magenta-sector4'&&c==='q'){ctx.fillStyle='#9a638d';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('카페',px+tile/2,py+20);}if(c==='X'||(w.district==='lumiose-magenta-sector9'&&w.zaMagenta9Upper&&c==='E')){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-rouge-sector5'&&!w.interior){
     // Looker Bureau and its grassy forecourt are documented in Rouge 5;
     // this compressed street, facades and exact tile positions are drafts.
     const bureau=x>=3&&x<=7&&y>=3&&y<=6,east=x>=15&&x<=19&&y>=10&&y<=13;
     const lawn=x>=3&&x<=9&&y>=7&&y<=9&&c!== 'W'&&c!== 'X';
     ctx.fillStyle=c==='#'?'#877a78':c===','?'#bbafa5':(x+y)%2?'#ded6ca':'#ece4d9';ctx.fillRect(px,py,tile,tile);
     if(c===','){ctx.fillStyle='#a89c94';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:0),py,1,tile-3);}
     if(lawn){ctx.fillStyle=(x+y)%2?'#a4b993':'#b3c6a3';ctx.fillRect(px,py,tile,tile);if(x===5){ctx.fillStyle='#c8bba5';ctx.fillRect(px+tile/2-5,py,10,tile);}else{ctx.fillStyle='#76996e';ctx.fillRect(px+5,py+tile-8,3,4);ctx.fillRect(px+tile-9,py+7,2,4);}}
     if(c==='#'&&(bureau||east)){
      const roof=bureau?y===3:y===10;ctx.fillStyle=roof?(bureau?'#735d66':'#806d72'):(bureau?'#ddcbb7':'#d1c5b4');ctx.fillRect(px,py,tile,tile);
      if(roof){ctx.fillStyle=bureau?'#b19993':'#ac9c95';ctx.fillRect(px+1,py+tile-5,tile-2,3);ctx.fillStyle='rgba(255,255,255,.16)';ctx.fillRect(px+2,py+4,tile-4,2);}
      else{ctx.fillStyle=bureau?'#658080':'#788d88';ctx.fillRect(px+6,py+5,tile-12,tile-11);ctx.fillStyle='#dbe4d8';ctx.fillRect(px+9,py+7,3,tile-17);ctx.fillStyle='#a79585';ctx.fillRect(px,py+tile-3,tile,3);}
     }
     if(c==='b'){ctx.fillStyle='#ddd1be';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#68565b';ctx.fillRect(px+5,py+3,tile-10,tile-5);ctx.fillStyle='#849e96';ctx.fillRect(px+8,py+7,tile-16,tile-12);ctx.strokeStyle='#f2e7d3';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,4,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(px+tile/2+3,py+tile/2+3);ctx.lineTo(px+tile/2+6,py+tile/2+6);ctx.stroke();}
     if(c==='j'){ctx.fillStyle='#548385';ctx.fillRect(px+5,py+4,tile-10,tile-8);ctx.fillStyle='#c9e5d7';ctx.fillRect(px+8,py+7,tile-16,3);ctx.fillRect(px+8,py+tile-10,tile-16,3);}
     if(c==='W'||c==='X'){ctx.fillStyle='#8da69a';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#d7e6d8';ctx.fillRect(px+8,py+8,tile-16,tile-16);}
     return;
    }
    if(['lumiose-rouge-sector3','lumiose-rouge-sector5','lumiose-rouge-sector7'].includes(w.district)&&!w.interior){ctx.fillStyle=c==='#'?'#987e79':c===';'?'#b58273':c===','?'#c5aaa0':(x+y)%2?'#e1d4ce':'#eadfd8';ctx.fillRect(px,py,tile,tile);if(w.district==='lumiose-rouge-sector7'&&c==='l'){ctx.fillStyle='#806044';ctx.fillRect(px+6,py+4,tile-12,tile-8);ctx.fillStyle='#e4ceae';for(let j=8;j<tile-5;j+=6)ctx.fillRect(px+7,py+j,tile-14,2);}if(w.district==='lumiose-rouge-sector5'&&c==='b'){ctx.fillStyle='#795c70';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('탐정',px+tile/2,py+20);}if(w.district==='lumiose-rouge-sector3'&&(c==='q'||c==='m')){ctx.fillStyle=c==='q'?'#b35d54':'#bf9374';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='q'?'식당':'볼',px+tile/2,py+20);}if(c==='X'){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-saison-canalside'&&!w.interior){
     // Draft visual interpretation of the existing canal, bridge and quays.
     ctx.fillStyle=c==='#'?'#8e8d7f':c===','?'#cbbfa9':(x+y)%2?'#d8dfd3':'#e4e9dd';ctx.fillRect(px,py,tile,tile);
     if(c==='~'){canalWater(px,py,x,y);return;}
     if(c===','){
      if(y>=11&&x>=14&&x<=16){ctx.fillStyle='#a9825c';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#d1aa77';for(let i=4;i<tile;i+=8)ctx.fillRect(px,py+i,tile,2);}
      else if(x===19&&y>=11){ctx.fillStyle='#b1a38d';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#e1d5c0';for(let i=3;i<tile;i+=8)ctx.fillRect(px+4,py+i,tile-8,2);ctx.fillStyle='#766e66';ctx.fillRect(px,py,3,tile);ctx.fillRect(px+tile-3,py,3,tile);}
      else{ctx.fillStyle='#b3a693';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:0),py,1,tile-3);if(y===10){ctx.fillStyle='#827f72';ctx.fillRect(px,py+tile-4,tile,4);ctx.fillStyle='#e4dac7';ctx.fillRect(px,py+tile-6,tile,2);}}
     }
     if(c==='%'){const lower=w.map[y+1]?.[x]!=='%';ctx.fillStyle=lower?'#dbd2bf':'#747e80';ctx.fillRect(px,py,tile,tile);ctx.fillStyle=lower?'#79979a':'#aeb4a9';ctx.fillRect(px+5,py+5,tile-10,tile-11);ctx.fillStyle=lower?'#d3e2da':'#616f73';ctx.fillRect(px+8,py+8,3,tile-17);if(lower){ctx.fillStyle='#a99a88';ctx.fillRect(px,py+tile-4,tile,4);}}
     if(c==='X'){ctx.fillStyle='#9bafa1';ctx.fillRect(px+8,py+8,tile-16,tile-16);}return;
    }
    if(w.district==='lumiose-vert-sector6'&&!w.interior&&c==='q'&&x===13&&y===13){ctx.fillStyle='#a77182';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('Terri',px+tile/2,py+20);return;}
    if(w.district==='lumiose-vert-sector6'&&!w.interior&&c==='u'&&x===17&&y===13){ctx.fillStyle='#6b8273';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('차고',px+tile/2,py+20);return;}if(['lumiose-vert-sector1','lumiose-vert-sector3','lumiose-vert-sector6','lumiose-vert-sector7'].includes(w.district)&&!w.interior){ctx.fillStyle=c==='#'?'#9c9588':c==='~'?'#78acc2':c==='g'?'#9bb985':c===':'?'#c4b49c':c===','?'#b6b9ab':(x+y)%2?'#d8e3cf':'#e5ecd9';ctx.fillRect(px,py,tile,tile);if(w.district==='lumiose-vert-sector3'&&c==='~'&&x===16&&y===4){ctx.fillStyle='#a5c8c1';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#79aeb0';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,tile*.4,tile*.32,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e7e3d6';ctx.fillRect(px+tile/2-3,py+7,6,tile-14);ctx.fillRect(px+tile/2-7,py+tile-11,14,3);}if(c==='l'){ctx.fillStyle='#806044';ctx.fillRect(px+6,py+4,tile-12,tile-8);}if(c===':'){ctx.fillStyle='#8e806f';for(let j=0;j<3;j++)ctx.fillRect(px+3,py+5+j*8,tile-6,2);}if(c==='W'||c==='X'){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-passage-palais'&&!w.interior){ctx.fillStyle=c==='#'?'#887b83':c===','?'#ddcdb6':'#eee5d9';ctx.fillRect(px,py,tile,tile);if('abcdefgh'.includes(c)){ctx.fillStyle='#a36d78';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('상점',px+tile/2,py+20);}if(c==='X'){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(['lumiose-bleu-sector4','lumiose-bleu4-tunnel'].includes(w.district)&&!w.interior){ctx.fillStyle=c==='#'?'#727b7d':c===','?'#b5c1bc':(x+y)%2?'#d6dcd2':'#e3e6dc';ctx.fillRect(px,py,tile,tile);if(c==='l'||c==='E'||c==='W'||c==='X'){ctx.fillStyle=c==='l'?'#8a6d4e':'#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='l'?'계단':'출구',px+tile/2,py+20);}return;}
    if(['lumiose-passage-felicite','lumiose-bleu-sector8','lumiose-bleu-sector9'].includes(w.district)&&!w.interior){ctx.fillStyle=c==='#'?'#777278':c==='c'?'#8f6589':c===','?'#c2d5d4':(x+y)%2?'#e1d9d1':'#eee5d9';ctx.fillRect(px,py,tile,tile);if(w.district==='lumiose-passage-felicite'&&'abdefg'.includes(c)){ctx.fillStyle='#a66b82';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('상점',px+tile/2,py+20);}if((w.district==='lumiose-bleu-sector8'&&c==='s')||(w.district==='lumiose-bleu-sector9'&&c==='b')){ctx.fillStyle='#827092';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='s'?'미용':'건물',px+tile/2,py+20);}if('EWX'.includes(c)){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-south-boulevard'&&!w.interior&&c==='j'){ctx.fillStyle='#8e7a61';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('승강기',px+tile/2,py+20);return;}
    if(w.district==='lumiose-south-boulevard'&&!w.interior&&c==='v'){ctx.fillStyle='#78a76a';ctx.fillRect(px,py+7,tile,tile-14);return;}
    if(w.district==='lumiose-jaune-street-north'&&!w.interior){
     // Urban facades and road pattern are visual drafts, not verified building positions.
     const building=c==='#'&&x>0&&x<22&&y>0&&y<16;
     ctx.fillStyle=building?'#cdbca1':c==='#'?'#8d877d':c===','?'#b6b1a5':'#e6deca';ctx.fillRect(px,py,tile,tile);
     if(c===','){ctx.fillStyle='#9f9b91';ctx.fillRect(px,py+tile-1,tile,1);ctx.fillRect(px+(y%2?tile/2:2),py+2,1,tile-4);}
     if(building){const row=(y<8?y-2:y-10);if(row===0){ctx.fillStyle='#657784';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#8b9ba0';ctx.fillRect(px+2,py+6,tile-4,2);ctx.fillRect(px+2,py+18,tile-4,2);}else{ctx.fillStyle='#ddceb6';ctx.fillRect(px+1,py,tile-2,tile);ctx.fillStyle='#b9a687';ctx.fillRect(px,py+tile-3,tile,3);ctx.fillStyle='#66818a';ctx.fillRect(px+8,py+5,tile-16,tile-12);ctx.fillStyle='#f0e7d6';ctx.fillRect(px+tile/2-1,py+5,2,tile-12);ctx.fillRect(px+8,py+tile/2,tile-16,2);}}
     if(c==='X'){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;
    }
    if(w.district==='lumiose-bleu-sector5'&&!w.interior){
     // Aymlis Park is east of this sector. Facades and the compressed streets
     // are an interpretation of the existing map, not surveyed coordinates.
     if(c==='~'){canalWater(px,py,x,y);return;}
     const building=x>=3&&x<=6&&((y>=3&&y<=5)||(y>=10&&y<=13));
     const courtyard=y===4&&x>=4&&x<=6;
     ctx.fillStyle=c==='#'?'#70817e':c===','?'#b8b8a6':(x+y)%2?'#d9dfd3':'#e7e9dc';ctx.fillRect(px,py,tile,tile);
     if(c===','){ctx.fillStyle='#a5aaa0';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:0),py,1,tile-3);}
     if(building&&c==='#'){
      const roof=y===3||y===10;ctx.fillStyle=roof?'#678583':'#d9d1be';ctx.fillRect(px,py,tile,tile);
      if(roof){ctx.fillStyle='#a5b4aa';ctx.fillRect(px+1,py+tile-5,tile-2,3);ctx.fillStyle='rgba(255,255,255,.2)';ctx.fillRect(px+2,py+4,tile-4,2);}
      else{ctx.fillStyle='#66888a';ctx.fillRect(px+5,py+5,tile-10,tile-11);ctx.fillStyle='#d9e6d6';ctx.fillRect(px+8,py+7,3,tile-16);ctx.fillStyle='#a99d89';ctx.fillRect(px,py+tile-4,tile,4);}
     }
     if(courtyard){ctx.fillStyle='#9fb69a';ctx.fillRect(px+2,py+2,tile-4,tile-4);ctx.fillStyle='#d8d3bd';ctx.fillRect(px+tile/2-3,py,6,tile);ctx.fillStyle='#688e71';ctx.fillRect(px+3,py+3,4,4);ctx.fillRect(px+tile-7,py+tile-7,4,4);}
     if(c==='s'){ctx.fillStyle='#827a69';ctx.fillRect(px+4,py+3,tile-8,tile-6);ctx.fillStyle='#e2d8bd';for(let k=7;k<tile-4;k+=6)ctx.fillRect(px+6,py+k,tile-12,2);}
     if(c==='X'&&x===22&&(y===5||y===12)){ctx.fillStyle='#7aa394';ctx.fillRect(px+2,py+3,tile-4,tile-6);ctx.fillStyle='#d9ead2';ctx.fillRect(px+4,py+5,3,tile-10);ctx.fillRect(px+tile-7,py+5,3,tile-10);ctx.fillRect(px+6,py+5,tile-12,3);}
     else if(c==='X'){ctx.fillStyle='#7e9a91';ctx.fillRect(px+6,py+6,tile-12,tile-12);}
     return;
    }
    if(['lumiose-bleu-sector3','lumiose-bleu-sector5','lumiose-bleu-sector7','lumiose-south-boulevard','lumiose-bleu-street','lumiose-autumnal-approach','lumiose-jaune-sector11','lumiose-hibernal-approach','lumiose-jaune-street','lumiose-jaune-sector2','lumiose-jaune-sector6','lumiose-jaune-sector7','lumiose-jaune-sector9','lumiose-jaune-sector10','lumiose-jaune-sector12'].includes(w.district)&&!w.interior){ctx.fillStyle=c==='#'?'#a79c8f':c==='%'?'#718c9b':c===','?'#b8b8ac':(x+y)%2?'#d6d9cd':'#e2e5d8';ctx.fillRect(px,py,tile,tile);if(w.district==='lumiose-bleu-sector7'&&c==='h'){ctx.fillStyle='#739ea5';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle=w.zaMission19Stage>=8?'#d7edf0':'#9ac9d3';ctx.fillRect(px+7,py+7,tile-14,tile-14);}if(w.district==='lumiose-bleu-sector7'&&c==='l'){ctx.fillStyle='#806044';ctx.fillRect(px+6,py+4,tile-12,tile-8);}if(w.district==='lumiose-bleu-sector3'&&c===':'){ctx.fillStyle='#8e806f';for(let j=0;j<3;j++)ctx.fillRect(px+3,py+5+j*8,tile-6,2);}if(w.district==='lumiose-bleu-street'&&c==='m'){ctx.fillStyle='#a57350';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('C',px+tile/2,py+20);}if(w.district==='lumiose-jaune-sector9'&&c===';'){ctx.fillStyle='#769aa2';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#b1d9dc';ctx.fillRect(px+7,py+7,tile-14,tile-14);}if(w.district==='lumiose-jaune-sector9'&&c==='u'){ctx.fillStyle='#857264';ctx.fillRect(px+5,py+4,tile-10,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('시청',px+tile/2,py+20);}if(w.district==='lumiose-jaune-sector9'&&c==='d'){ctx.fillStyle='#805978';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('!',px+tile/2,py+20);}if(['lumiose-bleu-sector3','lumiose-hibernal-approach'].includes(w.district)&&c==='j'){ctx.fillStyle='#936e40';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('승강',px+tile/2,py+20);}if(w.district==='lumiose-bleu-sector5'&&c==='s'){ctx.fillStyle='#886c56';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('계단',px+tile/2,py+20);}if(c==='H'){ctx.fillStyle='#cf5a63';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.fillRect(px+tile/2-2,py+8,4,tile-16);ctx.fillRect(px+8,py+tile/2-2,tile-16,4);}if(c==='X'||c==='h'){ctx.fillStyle=c==='h'?'#946448':'#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}if(w.district==='lumiose-south-boulevard'&&c==='h'){ctx.fillStyle=w.zaSide92Won?'#8d7952':'#756a89';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(w.zaSide92Won?'승강':'메탕',px+tile/2,py+20);}return;}
    if(w.district==='lumiose-vert-sector4'&&!w.interior&&['roof','courtyard'].includes(w.zaVert4Layer)){ctx.fillStyle=c==='#'?'#75827e':c===','?'#af9a7f':w.zaVert4Layer==='courtyard'?'#a4c88b':'#ded9cc';ctx.fillRect(px,py,tile,tile);if('jvl'.includes(c)){ctx.fillStyle=c==='v'?'#91b3a2':'#806044';ctx.fillRect(px+6,py+4,tile-12,tile-8);}return;}
    if(['lumiose-vert-sector4','lumiose-vert-sector5','lumiose-vert-sector8'].includes(w.district)&&!w.interior){ctx.fillStyle=c==='#'?'#a99b8b':c==='%'?'#b58b81':c===','?'#c1b7a4':c===';'?'#b5a696':(x+y)%2?'#ded9c9':'#ebe4d5';ctx.fillRect(px,py,tile,tile);if(w.district==='lumiose-vert-sector4'&&c===';'&&(x===4||x===7||y===10||y===13)){ctx.fillStyle='#ede6d9';if(x===4)ctx.fillRect(px+3,py,2,tile);if(x===7)ctx.fillRect(px+tile-5,py,2,tile);if(y===10)ctx.fillRect(px,py+3,tile,2);if(y===13)ctx.fillRect(px,py+tile-5,tile,2);}if(c===';'&&(x===15||x===20||y===4||y===10)){ctx.fillStyle='#ede6d9';if(x===15)ctx.fillRect(px+3,py,2,tile);if(x===20)ctx.fillRect(px+tile-5,py,2,tile);if(y===4)ctx.fillRect(px,py+3,tile,2);if(y===10)ctx.fillRect(px,py+tile-5,tile,2);}if(c==='X'){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(['lumiose-rouge-sector6','lumiose-rouge-sector8'].includes(w.district)&&!w.interior){ctx.fillStyle=c==='#'?'#a48d84':c===','?'#c6b9ac':(x+y)%2?'#ded4c8':'#e9e0d4';ctx.fillRect(px,py,tile,tile);if(c==='#'&&x>0&&x<22&&y>0&&y<16){ctx.fillStyle='#c7afa1';ctx.fillRect(px+3,py+4,tile-6,tile-8);}if(w.district==='lumiose-rouge-sector6'&&(c==='v'||c==='j')){ctx.fillStyle=c==='j'?'#936e40':'#b75c72';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='j'?'승강':'사건',px+tile/2,py+20);}if(c==='X'){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-magenta-west-courtyard'&&!w.interior){ctx.fillStyle=c==='%'?'#a89281':c==='#'?'#8a8178':c===','?'#c7bca8':(x+y)%2?'#ddd5c6':'#e8e0d1';ctx.fillRect(px,py,tile,tile);if(c==='%'){ctx.fillStyle='#c7b4a3';ctx.fillRect(px+3,py+4,tile-6,tile-8);}if(c==='j'&&w.district==='lumiose-vert-sector4'){ctx.fillStyle='#806044';ctx.fillRect(px+6,py+4,tile-12,tile-8);}if(c==='X'){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-bleu-plaza-route'&&!w.interior){ctx.fillStyle=c==='#'?'#a79c8f':c===','?'#b8b8ac':(x+y)%2?'#d6d9cd':'#e2e5d8';ctx.fillRect(px,py,tile,tile);if(c==='%'){ctx.fillStyle=y===10?'#425e70':'#d6e3df';ctx.fillRect(px+4,py+5,tile-8,y===10?5:tile-12);if(x===17&&y===12){ctx.fillStyle='#33566a';ctx.fillRect(px+tile/2-2,py+6,4,tile-12);ctx.fillRect(px+6,py+tile/2-2,tile-12,4);}}if(c==='X'){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-jaune-garden-route'&&!w.interior){ctx.fillStyle=c==='#'?'#aa9788':c===','?'#c8bba3':(x+y)%2?'#dfd8c6':'#e7e0cf';ctx.fillRect(px,py,tile,tile);if(c==='X'){ctx.fillStyle='#6f9e8c';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-vernal'&&!w.interior&&w.zaVernalSlowbroBank){ctx.fillStyle=c==='#'?'#7a7770':c==='~'?'#4b8794':(x+y)%2?'#c0b49c':'#d1c4a9';ctx.fillRect(px,py,tile,tile);if(c==='~'){ctx.fillStyle='#85b9bf';ctx.fillRect(px+5,py+10,tile-10,2);}if(c==='j'){ctx.fillStyle='#867463';ctx.fillRect(px+4,py+5,tile-8,tile-10);ctx.fillStyle='#eee1c8';for(let i=0;i<3;i++)ctx.fillRect(px+6,py+8+i*6,tile-12,2);}if(c==='d'){ctx.fillStyle='#bb7f96';ctx.fillRect(px+4,py+5,tile-8,tile-10);ctx.fillStyle='#fff';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText('야도란',px+tile/2,py+20);}return;}
    if(w.district==='lumiose-vernal'&&!w.interior&&w.zaVernalEastRoof){ctx.fillStyle=c==='#'?'#75827e':(x+y)%2?'#cfc8bc':'#e1d9cc';ctx.fillRect(px,py,tile,tile);if(c==='l'){ctx.fillStyle='#806044';ctx.fillRect(px+6,py+4,tile-12,tile-8);}return;}
    if(w.district==='lumiose-vert2'&&!w.interior&&w.zaVert2RoofUpper){ctx.fillStyle=c==='#'?'#75827e':(x+y)%2?'#d2d4c9':'#e1e1d6';ctx.fillRect(px,py,tile,tile);if(c==='l'){ctx.fillStyle='#806044';ctx.fillRect(px+6,py+4,tile-12,tile-8);}if(c==='j'){ctx.fillStyle='#9b805f';ctx.fillRect(px+5,py+9,tile-10,tile-13);ctx.fillStyle='#d5bd92';ctx.fillRect(px+7,py+11,tile-14,3);}return;}
    if(w.district==='lumiose-zone19'&&!w.interior){
     // Vineyard rows and slope shading are provisional artwork, not a new height layer.
     // Existing tile values still determine collision and wild encounters.
     const pavilion=c==='#'&&x>=8&&x<=14&&y>=5&&y<=11;
     const vineyard=c==='g'&&((x>=3&&x<=7)||(x>=15&&x<=19))&&[3,6,10,12].includes(y);
     ctx.fillStyle=pavilion?'#977f68':c==='#'?'#51764e':c==='g'?(y<8?'#a5c88a':'#90b776'):c===','?'#d4c49f':'#d6d4ba';ctx.fillRect(px,py,tile,tile);
     if(pavilion){
      // Existing blocked kiosk boundary, not a new roof or collision layer.
      ctx.fillStyle='#d6c6a6';ctx.fillRect(px+2,py+2,tile-4,tile-4);
      if(y===5){ctx.fillStyle='#735e58';ctx.fillRect(px,py+3,tile,tile-5);ctx.fillStyle='#a58072';for(let j=5;j<tile-4;j+=8)ctx.fillRect(px+2,py+j,tile-4,3);ctx.fillStyle='#e3d3b4';ctx.fillRect(px,py+tile-4,tile,4);}
      else if(y===11){ctx.fillStyle='#b5a286';ctx.fillRect(px,py+tile-7,tile,7);ctx.fillStyle='#eee1c5';ctx.fillRect(px+3,py+tile-11,tile-6,4);ctx.fillStyle='#8b775e';ctx.fillRect(px+5,py+7,5,tile-16);ctx.fillRect(px+tile-10,py+7,5,tile-16);}
      else{ctx.fillStyle='#8b775e';ctx.fillRect(px+tile/2-3,py,6,tile);ctx.fillStyle='#ece1c7';ctx.fillRect(px+tile/2-2,py+3,3,tile-6);}
     }
     if(c==='g'){ctx.fillStyle='#6b985e';for(let j=0;j<3;j++)ctx.fillRect(px+5+j*9,py+tile-10-(j%2)*4,3,7);}
     if(vineyard){ctx.fillStyle='#74523b';ctx.fillRect(px,py+tile-7,tile,3);ctx.fillRect(px+5,py+9,3,tile-15);ctx.fillRect(px+tile-8,py+9,3,tile-15);ctx.fillStyle='#3f7648';ctx.fillRect(px,py+6,tile,8);ctx.fillStyle='#77a75a';ctx.fillRect(px+3,py+5,7,3);ctx.fillRect(px+16,py+5,9,3);ctx.fillStyle='#694778';ctx.fillRect(px+8,py+12,5,5);ctx.fillRect(px+tile-13,py+12,5,5);ctx.fillStyle='#9874a1';ctx.fillRect(px+9,py+12,2,2);ctx.fillRect(px+tile-12,py+12,2,2);}
     if(c===','){ctx.fillStyle='#baa986';ctx.fillRect(px,py+tile-2,tile,1);ctx.fillRect(px+(y%2?tile/2:1),py+3,1,tile-5);}if(c==='r'){ctx.fillStyle='#496f42';ctx.fillRect(px+4,py+7,tile-8,tile-11);ctx.fillStyle='#7ca063';ctx.fillRect(px+7,py+5,7,6);ctx.fillRect(px+18,py+8,6,5);}if('ij'.includes(c)){ctx.fillStyle='#eee9da';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#bb5c56';ctx.fillRect(px+tile/2-6,py+tile/2-5,12,5);ctx.fillStyle='#4d5851';ctx.fillRect(px+tile/2-6,py+tile/2,12,2);}if('WEX'.includes(c)){ctx.fillStyle='#668b79';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;
    }
    if(w.district==='lumiose-zone18'&&!w.interior){
     // Rooftops and the southeast construction alley remain separate saved
     // layers. Scaffold outlines are drawn over existing blocked cells only.
     const alley=w.zaZone18Construction===true,upper=w.zaZone18Upper===true;
     ctx.fillStyle=alley?(c==='#'?'#8b8c86':c===','?'#bdb5a7':'#cfc9bc'):upper?(c==='#'?'#6d7a7c':'#bfb4a6'):c==='#'?'#8f8886':c==='g'?'#94b87c':c===','?'#baac9c':'#ddd3c9';ctx.fillRect(px,py,tile,tile);
     if(alley&&c==='#'){
      // A continuous facade behind steel uprights frames the narrow route.
      ctx.fillStyle=(x+y)%2?'#aaa59b':'#b8b1a5';ctx.fillRect(px+1,py+1,tile-2,tile-2);
      ctx.fillStyle='#8a887f';ctx.fillRect(px,py+tile-3,tile,2);ctx.fillRect(px+(y%2?tile/2:1),py+2,2,tile-5);
      ctx.fillStyle='#626f6e';ctx.fillRect(px+3,py,3,tile);ctx.fillRect(px+tile-6,py,3,tile);ctx.fillRect(px,py+6,tile,3);ctx.fillRect(px,py+tile-8,tile,3);
      ctx.strokeStyle='#879894';ctx.lineWidth=2;ctx.beginPath();if((x+y)%2){ctx.moveTo(px+5,py+8);ctx.lineTo(px+tile-5,py+tile-8);}else{ctx.moveTo(px+tile-5,py+8);ctx.lineTo(px+5,py+tile-8);}ctx.stroke();
     }
     if(alley&&c===','){ctx.fillStyle='#d5cec0';ctx.fillRect(px,py+2,tile,2);ctx.fillStyle='#a9a294';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:1),py+4,2,tile-6);}
     if(upper&&c!=='#'){
      if(c===','){ctx.fillStyle='#9d8c73';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#d5c4a4';for(let j=4;j<tile;j+=8)ctx.fillRect(px+2,py+j,tile-4,4);ctx.fillStyle='#646e6b';ctx.fillRect(px,py,3,tile);ctx.fillRect(px+tile-3,py,3,tile);}
      else roofPaving(px,py,x,y);
     }
     if(!alley&&!upper&&c===','){ctx.fillStyle='#d7ccbc';ctx.fillRect(px,py+2,tile,2);ctx.fillStyle='#a89a8c';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:2),py+4,2,tile-6);}
     if(c==='^'){
      ctx.fillStyle='#968e82';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#586a6c';ctx.fillRect(px+3,py,4,tile);ctx.fillRect(px+tile-7,py,4,tile);ctx.fillRect(px,py+6,tile,3);ctx.fillRect(px,py+tile-9,tile,3);
      ctx.strokeStyle='#b6c2b6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px+5,py+8);ctx.lineTo(px+tile-5,py+tile-8);ctx.moveTo(px+tile-5,py+8);ctx.lineTo(px+5,py+tile-8);ctx.stroke();ctx.fillStyle='#d6c5a7';ctx.fillRect(px+6,py+10,tile-12,3);
     }
     if(c==='E'||c==='W'||c==='X'){ctx.fillStyle='#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#9ec8b6';ctx.fillRect(px+8,py+7,tile-16,tile-14);}
     if(c==='h'){ctx.fillStyle='#617c78';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#a7beb0';ctx.fillRect(px+8,py+6,tile-16,tile-12);ctx.fillStyle='#526b68';ctx.fillRect(px+tile/2-1,py+6,2,tile-12);}
     if(c==='l'){ctx.fillStyle='#72523a';ctx.fillRect(px+8,py+4,3,tile-8);ctx.fillRect(px+tile-11,py+4,3,tile-8);ctx.fillStyle='#e5d1ad';for(let j=7;j<tile-5;j+=6)ctx.fillRect(px+9,py+j,tile-18,2);}
     if(c==='i'){ctx.fillStyle='#f4e069';ctx.fillRect(px+tile/2-4,py+tile/2-4,8,8);}if(c==='g'){ctx.fillStyle='#638f59';for(let j=0;j<3;j++)ctx.fillRect(px+5+j*9,py+tile-10-(j%2)*4,3,7);}return;}
    if(w.district==='lumiose-zone17'&&!w.interior&&w.zaZone17Promenade&&!w.zaZone17Upper){
     // Separate upper promenade: the Y-shaped path and three approaches use
     // the existing draft layer; landscape outlines are not surveyed.
     if(c==='#'){
      ctx.fillStyle=(x+y)%2?'#728a71':'#7b9578';ctx.fillRect(px,py,tile,tile);
      ctx.fillStyle='#637e68';ctx.fillRect(px,py+tile-5,tile,5);
      const edgeUp=w.map[y-1]?.[x]&&w.map[y-1][x]!=='#',edgeDown=w.map[y+1]?.[x]&&w.map[y+1][x]!=='#',edgeLeft=w.map[y]?.[x-1]&&w.map[y][x-1]!=='#',edgeRight=w.map[y]?.[x+1]&&w.map[y][x+1]!=='#';
      ctx.fillStyle='#87958a';if(edgeUp)ctx.fillRect(px,py,tile,7);if(edgeDown)ctx.fillRect(px,py+tile-7,tile,7);if(edgeLeft)ctx.fillRect(px,py,7,tile);if(edgeRight)ctx.fillRect(px+tile-7,py,7,tile);
      ctx.fillStyle='#d3d7c5';if(edgeUp)ctx.fillRect(px,py,tile,3);if(edgeDown)ctx.fillRect(px,py+tile-3,tile,3);if(edgeLeft)ctx.fillRect(px,py,3,tile);if(edgeRight)ctx.fillRect(px+tile-3,py,3,tile);
     }else{
      const path=c===','||c==='h';ctx.fillStyle=path?((x+y)%2?'#c9c0ac':'#d8d0bd'):(x+y)%2?'#a5be98':'#b0c8a1';ctx.fillRect(px,py,tile,tile);
      if(path){ctx.fillStyle='#b1aa98';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:1),py+3,2,tile-5);}
      else{ctx.fillStyle='#94b28b';ctx.fillRect(px+4+(x*5+y*3)%9,py+7,6,2);ctx.fillRect(px+17,py+20,7,2);}
     }
     if(c==='^'){
      ctx.fillStyle='#768b7a';ctx.fillRect(px+3,py+20,tile-6,6);ctx.fillStyle='#e3decb';ctx.fillRect(px+6,py+17,tile-12,7);ctx.fillRect(px+10,py+8,tile-20,10);ctx.fillRect(px+7,py+4,7,7);ctx.fillRect(px+tile-14,py+4,7,7);ctx.fillStyle='#b8c0ad';ctx.fillRect(px+12,py+10,3,7);
     }
     if(c==='h'){ctx.fillStyle='#a8977e';ctx.fillRect(px+2,py+1,tile-4,tile-2);ctx.fillStyle='#e8ddc5';for(let j=4;j<tile;j+=6)ctx.fillRect(px+3,py+j,tile-6,3);ctx.fillStyle='#867762';ctx.fillRect(px+1,py+2,3,tile-4);ctx.fillRect(px+tile-4,py+2,3,tile-4);}
     if(c==='l'){ctx.fillStyle='#72523a';ctx.fillRect(px+8,py+4,3,tile-8);ctx.fillRect(px+tile-11,py+4,3,tile-8);ctx.fillStyle='#e3cda8';for(let j=7;j<tile-5;j+=6)ctx.fillRect(px+9,py+j,tile-18,2);}
     if(c==='X'){ctx.fillStyle='#568578';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#a4d3b6';ctx.fillRect(px+7,py+6,tile-14,tile-12);}return;}
    if(w.district==='lumiose-zone17'&&!w.interior){if(w.zaZone17Upper){ctx.fillStyle=c==='#'?'#5e6c70':'#cbbdaa';ctx.fillRect(px,py,tile,tile);if(c!=='#')roofPaving(px,py,x,y);if(c==='l'){ctx.fillStyle='#72523a';ctx.fillRect(px+9,py+4,14,tile-8);ctx.fillStyle='#dfc8a1';for(let j=7;j<tile-5;j+=6)ctx.fillRect(px+10,py+j,12,2);}return;}ctx.fillStyle=c==='#'||c==='^'?'#898c80':c==='g'?'#9bb985':c===','||c===':'?'#c3b8a4':y>=13?'#a6c692':'#ddd9c9';ctx.fillRect(px,py,tile,tile);if(c===','){ctx.fillStyle='#a99e8c';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:2),py+3,2,tile-5);}if(c==='h'){ctx.fillStyle='#bba991';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#796b5c';for(let j=0;j<4;j++)ctx.fillRect(px+3,py+4+j*6,tile-6,2);}if(c===':'){ctx.fillStyle='#887e6f';for(let j=0;j<3;j++)ctx.fillRect(px+3,py+5+j*7,tile-6,2);}if(c==='^'){if(y===14){ctx.fillStyle='#8d694a';ctx.fillRect(px+4,py+10,tile-8,5);ctx.fillRect(px+6,py+17,3,7);ctx.fillRect(px+tile-9,py+17,3,7);}else if(y===13){ctx.fillStyle='#bd7960';ctx.fillRect(px+3,py+6,tile-6,6);ctx.fillStyle='#e9d7b6';ctx.fillRect(px+5,py+12,tile-10,12);}else{ctx.fillStyle='#e3d8bd';ctx.fillRect(px+7,py+18,tile-14,7);ctx.fillRect(px+10,py+9,tile-20,10);ctx.fillRect(px+7,py+5,8,7);ctx.fillRect(px+tile-15,py+5,8,7);}}if(c==='#'&&x===7&&y===3){ctx.fillStyle='#77736b';ctx.fillRect(px+7,py+4,tile-14,tile-6);ctx.fillStyle='#d8cbb3';ctx.fillRect(px+9,py+7,tile-18,tile-12);ctx.fillStyle='#a36e63';ctx.fillRect(px+10,py+9,tile-20,5);ctx.fillStyle='#6d6b64';ctx.fillRect(px+5,py+2,tile-10,3);}if(c==='l'){ctx.fillStyle='#72523a';ctx.fillRect(px+9,py+4,14,tile-8);}if(c==='i'){ctx.fillStyle='#f4e069';ctx.fillRect(px+tile/2-4,py+tile/2-4,8,8);}if(c==='g'){ctx.fillStyle='#6b9862';for(let j=0;j<3;j++)ctx.fillRect(px+5+j*9,py+tile-10-(j%2)*4,3,7);}return;}
    if(['lumiose-zone11-sw-top','lumiose-zone11-sw-middle'].includes(w.district)&&!w.interior){
     // The south bank is reached by two flights. Their map footprints and
     // landings are provisional; this affects the existing floor art only.
     const middle=w.district==='lumiose-zone11-sw-middle';
     ctx.fillStyle=c==='#'?(middle?'#667f78':'#7d8b80'):(x+y)%2?(middle?'#c2c5b0':'#d2cbb7'):(middle?'#d4d2be':'#e0d8c3');ctx.fillRect(px,py,tile,tile);
     if(c==='#'){
      ctx.fillStyle=middle?'#8da49a':'#a4afa0';ctx.fillRect(px+1,py+2,tile-2,tile-5);
      ctx.fillStyle='#c4ccba';ctx.fillRect(px+1,py+2,tile-2,3);
      ctx.fillStyle='#637972';ctx.fillRect(px,py+tile-4,tile,4);
     }else{
      ctx.fillStyle=middle?'#a8b1a4':'#b9b3a1';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:1),py+3,2,tile-5);
      if(x===6||x===16){ctx.fillStyle='#f0e8d2';ctx.fillRect(x===6?px+3:px+tile-5,py,2,tile);}
     }
     if(c==='h'||c==='j'){
      ctx.fillStyle='#866d56';ctx.fillRect(px+3,py+2,tile-6,tile-4);
      ctx.fillStyle='#dfcfad';for(let n=0;n<4;n++)ctx.fillRect(px+5,py+5+n*6,tile-10,3);
      ctx.fillStyle='#6c7971';ctx.fillRect(px+2,py+2,3,tile-4);ctx.fillRect(px+tile-5,py+2,3,tile-4);
     }
     if(c==='X'){ctx.fillStyle='#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;
    }
    if(isScrewGlideRoof(w.district)&&!w.interior){
     // Draft scaffold platforms and the street below their glide gap.
     const shade=w.district==='lumiose-screw-bleu3'?['#536e82','#91aeb7','#bdd2d3']:w.district==='lumiose-screw-vert5'?['#6f8170','#a4ae86','#cad1a2']:w.district==='lumiose-screw-vert8'?['#666f8c','#aaa5b4','#d2cbd4']:w.district==='lumiose-screw-jaune6'?['#677d89','#acaf9a','#d4d2bb']:w.district==='lumiose-screw-palais'?['#606a82','#ae9f9c','#cebfbb']:w.district==='lumiose-screw-jaune3'?['#78849a','#b7a68c','#dbcbb0']:w.district==='lumiose-screw-rouge1-court'?['#6c6978','#ab8f7e','#ccb39e']:w.district==='lumiose-screw-jaune9'?['#596679','#a49f96','#c5beb1']:w.district==='lumiose-screw-jaune11'?['#637d7f','#b2ac87','#d4cba4']:w.district==='lumiose-screw-vert3'?['#61766e','#aa987d','#c9bca0']:['#536b7a','#b89b78','#c9ad89'];ctx.fillStyle=c==='#'?shade[0]:(x+y)%2?shade[1]:shade[2];ctx.fillRect(px,py,tile,tile);
     if(c==='#'){ctx.fillStyle='#6d8490';ctx.fillRect(px,py+tile-3,tile,2);}
     else{ctx.fillStyle='#8c765f';ctx.fillRect(px,py+tile-3,tile,2);ctx.fillRect(px+(y%2?tile/2:0),py,2,tile);}
     if(screwGlideAt(w.district,x,y)){ctx.fillStyle='#f4d069';ctx.beginPath();ctx.moveTo(px+tile/2,py+tile/4);ctx.lineTo(px+tile*3/4,py+tile/2);ctx.lineTo(px+tile/2,py+tile*3/4);ctx.lineTo(px+tile/4,py+tile/2);ctx.fill();}
     if(c==='j'||c==='v'){ctx.fillStyle='#65584d';ctx.fillRect(px+4,py+3,tile-8,tile-6);ctx.fillStyle='#e7d8b6';for(let n=0;n<3;n++)ctx.fillRect(px+6,py+7+n*7,tile-12,2);}
     return;
    }
    if(w.district==='lumiose-zone9-scaffold'&&!w.interior){ctx.fillStyle=c==='#'?'#68787d':'#ac9475';ctx.fillRect(px,py,tile,tile);if(c===','){ctx.fillStyle='#d4b995';for(let n=5;n<tile;n+=8)ctx.fillRect(px+n,py+3,2,tile-6);ctx.fillStyle='#756b5d';if(w.map[y-1]?.[x]==='#')ctx.fillRect(px,py,tile,3);if(w.map[y+1]?.[x]==='#')ctx.fillRect(px,py+tile-3,tile,3);}if(c==='o'){ctx.fillStyle='#846742';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-zone16-garden'&&!w.interior){ctx.fillStyle=c==='#'?'#697e70':(x+y)%2?'#aac39a':'#b6cea4';ctx.fillRect(px,py,tile,tile);if(c==='j'){ctx.fillStyle='#917d60';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#e9ddbc';for(let n=0;n<3;n++)ctx.fillRect(px+5,py+7+n*7,tile-10,2);}return;}
    if(w.district==='lumiose-zone16'&&!w.interior&&w.zaZone16Upper){ctx.fillStyle=c==='#'?'#777e79':c===','?'#a68d76':(x+y)%2?'#cfc5b4':'#dfd7c7';ctx.fillRect(px,py,tile,tile);if(c==='l'){ctx.fillStyle='#806044';ctx.fillRect(px+6,py+4,tile-12,tile-8);}return;}
    if(w.district==='lumiose-zone16'&&!w.interior){
     // Bleu Plaza's island, monument and northern Florges fountain follow
     // the existing provisional tile map, not surveyed source coordinates.
     const fountain=x===19&&y===4;
     const pool=c==='~';
     ctx.fillStyle=fountain?'#94a8a5':c==='#'?'#839590':pool?'#72b2c1':c==='g'?'#9dbd88':c===','?'#c4bcaa':(x+y)%2?'#d5ded8':'#e4eae0';ctx.fillRect(px,py,tile,tile);
     if(pool){
      ctx.fillStyle='#8cc9d1';ctx.fillRect(px+3+(x*7+y*3)%9,py+8,10,2);ctx.fillRect(px+11,py+tile-9,12,2);
      // A stone coping marks the shore without changing which tiles are water.
      ctx.fillStyle='#aab7ad';if(w.map[y-1]?.[x]!=='~'&&!(x===19&&y===5))ctx.fillRect(px,py,tile,4);if(w.map[y+1]?.[x]!=='~'&&!(x===19&&y===3))ctx.fillRect(px,py+tile-4,tile,4);if(w.map[y]?.[x-1]!=='~'&&!(x===20&&y===4))ctx.fillRect(px,py,4,tile);if(w.map[y]?.[x+1]!=='~'&&!(x===18&&y===4))ctx.fillRect(px+tile-4,py,4,tile);
      ctx.fillStyle='#e1e5d8';if(w.map[y-1]?.[x]!=='~'&&!(x===19&&y===5))ctx.fillRect(px,py,tile,2);if(w.map[y+1]?.[x]!=='~'&&!(x===19&&y===3))ctx.fillRect(px,py+tile-4,tile,2);
     }
     if(fountain){
      ctx.fillStyle='#dde5d9';ctx.fillRect(px+1,py+2,tile-2,tile-4);ctx.fillStyle='#6aaeb7';ctx.fillRect(px+5,py+6,tile-10,tile-12);
      ctx.fillStyle='#f1eee0';ctx.fillRect(px+11,py+10,10,13);ctx.fillRect(px+8,py+20,16,4);
      ctx.fillStyle='#bbd0b5';ctx.fillRect(px+13,py+4,6,8);ctx.fillRect(px+8,py+7,5,4);ctx.fillRect(px+19,py+7,5,4);
      ctx.fillStyle='#f7f4e7';ctx.fillRect(px+13,py+3,6,5);ctx.fillRect(px+7,py+6,5,4);ctx.fillRect(px+20,py+6,5,4);
      ctx.fillStyle='#8bd0d1';ctx.fillRect(px+3,py+16,3,7);ctx.fillRect(px+tile-6,py+16,3,7);
     }
     if(c===','){ctx.fillStyle='#e7e2d3';ctx.fillRect(px,py+3,tile,2);ctx.fillStyle='#aaac9e';ctx.fillRect(px+(y%2?tile/2:1),py+5,2,tile-7);}
     if(c==='^'){ctx.fillStyle='#8c7561';ctx.fillRect(px+3,py+9,tile-6,tile-12);ctx.fillStyle='#d0ad82';ctx.fillRect(px+2,py+5,tile-4,7);ctx.fillStyle='#f2debb';ctx.fillRect(px+6,py+5,5,7);ctx.fillRect(px+17,py+5,5,7);}
     if(x===11&&y===8){ctx.fillStyle='#879b95';ctx.fillRect(px+3,py+21,tile-6,7);ctx.fillStyle='#e6e7d9';ctx.fillRect(px+5,py+19,tile-10,5);ctx.fillStyle='#a4b2aa';ctx.beginPath();ctx.moveTo(px+tile/2,py+2);ctx.lineTo(px+tile/2+6,py+19);ctx.lineTo(px+tile/2-6,py+19);ctx.closePath();ctx.fill();ctx.fillStyle='#f4f3e7';ctx.beginPath();ctx.moveTo(px+tile/2,py+3);ctx.lineTo(px+tile/2,py+18);ctx.lineTo(px+tile/2-5,py+18);ctx.closePath();ctx.fill();}
     if(c==='g'){ctx.fillStyle='#6b9862';for(let j=0;j<3;j++)ctx.fillRect(px+5+j*9,py+tile-10-(j%2)*4,3,7);}
     if(c==='i'){ctx.fillStyle='#f4e069';ctx.fillRect(px+tile/2-4,py+tile/2-4,8,8);}
     if(c==='l'||c==='j'){ctx.fillStyle='#806044';ctx.fillRect(px+6,py+4,tile-12,tile-8);}
     if(c==='X'){ctx.fillStyle='#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-zone15'&&!w.interior){
     // Zone 15 has a narrow street and a separate roof reached by a web.
     // The roof outlines and exact 2D coordinates are provisional.
     if(w.zaZone15Upper){
      const gap=x===11&&y===7;
      if(c==='#'||gap){
       // The gap is not walkable except on the server-authorized web tile.
       ctx.fillStyle='#657783';ctx.fillRect(px,py,tile,tile);
       ctx.fillStyle='#87959a';ctx.fillRect(px,py+tile-5,tile,5);
       ctx.fillStyle='#536673';ctx.fillRect(px,py+tile-5,tile,2);
      }else{
       ctx.fillStyle=x<=10?'#a4aeb0':'#969fa4';ctx.fillRect(px,py,tile,tile);
       // Metal roof panels and the parapets follow actual blocked neighbours.
       ctx.fillStyle=x<=10?'#c3cbca':'#b4bfc0';ctx.fillRect(px+2,py+2,tile-4,tile-4);
       ctx.fillStyle='#879799';ctx.fillRect(px+(y%2?tile/2:1),py+2,2,tile-4);ctx.fillRect(px,py+tile-3,tile,2);
       ctx.fillStyle='#687981';if(w.map[y-1]?.[x]==='#')ctx.fillRect(px,py,tile,4);if(w.map[y+1]?.[x]==='#')ctx.fillRect(px,py+tile-4,tile,4);if(w.map[y]?.[x-1]==='#')ctx.fillRect(px,py,4,tile);if(w.map[y]?.[x+1]==='#')ctx.fillRect(px+tile-4,py,4,tile);
       ctx.fillStyle='#dde1d9';if(w.map[y-1]?.[x]==='#')ctx.fillRect(px,py,tile,2);if(w.map[y+1]?.[x]==='#')ctx.fillRect(px,py+tile-4,tile,2);
      }
      if(gap){
       // The map switches r to floor when the web is opened; show both states.
       ctx.strokeStyle=w.zaZone15WebOpen?'#eef3ed':'#cbd9d6';ctx.lineWidth=2;ctx.beginPath();
       for(const dy of [4,10,16,22,28]){ctx.moveTo(px,py+dy);ctx.lineTo(px+tile,py+dy);}ctx.moveTo(px,py+4);ctx.lineTo(px+tile,py+28);ctx.moveTo(px,py+28);ctx.lineTo(px+tile,py+4);ctx.moveTo(px,py+16);ctx.lineTo(px+tile,py+16);ctx.stroke();
       if(!w.zaZone15WebOpen){ctx.fillStyle='#a5bcb9';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,8,10,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f0f2df';ctx.fillRect(px+tile/2-4,py+tile/2-7,8,14);ctx.fillStyle='#bbcfc5';ctx.fillRect(px+tile/2-3,py+tile/2-2,6,3);}
      }
      if(c==='l'){ctx.fillStyle='#667a78';ctx.fillRect(px+5,py+3,tile-10,tile-6);ctx.fillStyle='#e4c56a';ctx.fillRect(px+8,py+6,tile-16,tile-12);ctx.fillStyle='#85c8cc';ctx.fillRect(px+11,py+8,tile-22,tile-16);}
      if(c==='X'){ctx.fillStyle='#4d7379';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#8fc0b5';ctx.fillRect(px+7,py+6,tile-14,tile-12);}
      return;
     }
     const cafeBuilding=x>=16&&x<=19&&y>=3&&y<=5&&c==='#';
     ctx.fillStyle=cafeBuilding?'#c8b69b':c==='#'?'#777c75':c==='g'?'#94b17b':c===','?'#b9a990':(x+y)%2?'#dad5c3':'#e5dfce';ctx.fillRect(px,py,tile,tile);
     if(cafeBuilding){
      if(y===3){ctx.fillStyle='#70675c';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#9b8c78';ctx.fillRect(px+2,py+4,tile-4,tile-8);ctx.fillStyle='#d8c6a6';ctx.fillRect(px,py+tile-4,tile,4);}
      else{ctx.fillStyle='#e7dac0';ctx.fillRect(px+2,py+2,tile-4,tile-4);ctx.fillStyle='#897b6c';ctx.fillRect(px+7,py+7,tile-14,tile-11);ctx.fillStyle='#9bb2ae';ctx.fillRect(px+9,py+9,tile-18,tile-16);ctx.fillStyle='#f4ead7';ctx.fillRect(px+tile/2-1,py+9,2,tile-16);}
     }
     if(c===','){ctx.fillStyle='#d6c7ad';ctx.fillRect(px,py,tile,2);ctx.fillStyle='#a18f78';ctx.fillRect(px+(y%2?tile/2:1),py+3,2,tile-5);}
     if(c==='g'){ctx.fillStyle='#648e5c';for(let j=0;j<3;j++)ctx.fillRect(px+5+j*9,py+tile-10-(j%2)*4,3,7);}
     if(c==='^'&&ZONE15_TREES.some(([tx,ty])=>x===tx&&y===ty)){ctx.fillStyle='#6b4b34';ctx.fillRect(px+tile/2-3,py+tile/2,6,tile/2-2);ctx.fillStyle='#47724d';ctx.beginPath();ctx.arc(px+tile/2,py+11,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#79a469';ctx.beginPath();ctx.arc(px+tile/2-4,py+8,7,0,Math.PI*2);ctx.fill();}
     if(c==='^'&&ZONE15_BENCHES.some(([bx,by])=>x===bx&&y===by)){ctx.fillStyle='#604b39';ctx.fillRect(px+6,py+11,tile-12,10);ctx.fillStyle='#bc966d';ctx.fillRect(px+5,py+9,tile-10,5);ctx.fillRect(px+6,py+17,tile-12,4);ctx.fillStyle='#574638';ctx.fillRect(px+7,py+21,3,5);ctx.fillRect(px+tile-10,py+21,3,5);}
     if('ijk'.includes(c)){ctx.fillStyle='#d8b64f';ctx.fillRect(px+8,py+8,tile-16,tile-16);}
     if(c==='l'||c==='n'){ctx.fillStyle=c==='l'?'#d4b45f':'#816d52';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#85beb2';ctx.fillRect(px+9,py+8,tile-18,tile-16);}
     if(c==='q'){ctx.fillStyle='#6d5544';ctx.fillRect(px+3,py+2,tile-6,tile-4);ctx.fillStyle='#bc584d';ctx.fillRect(px,py+2,tile,6);ctx.fillStyle='#f0d7ad';for(let k=3;k<tile;k+=8)ctx.fillRect(px+k,py+2,4,6);ctx.fillStyle='#9cbab2';ctx.fillRect(px+8,py+11,tile-16,tile-15);}
     if(c==='W'||c==='X'){ctx.fillStyle='#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-zone14'&&!w.interior){
     // Substation buildings and electrical equipment use existing blocked
     // cells. Their exact shapes and coordinates remain provisional.
     const westRoof=x>=3&&x<=6&&y>=6&&y<=7&&c==='#',eastRoof=x>=16&&x<=19&&y>=4&&y<=6&&c==='#',roof=westRoof||eastRoof;
     const perimeter=c==='#'&&(x===0||x===22||y===0||y===16);
     ctx.fillStyle=roof?'#66777c':c==='#'?'#6d7880':c==='g'?'#c3aa7c':c===','?'#aeb8b8':(x+y)%2?'#d2d0c3':'#deddd0';ctx.fillRect(px,py,tile,tile);
     if(roof){
      // Repeated roof panels and edge caps make each blocked footprint a
      // single large building rather than a field of separate boxes.
      ctx.fillStyle='#8b9b9b';ctx.fillRect(px+1,py+2,tile-2,tile-4);ctx.fillStyle='#728584';ctx.fillRect(px+3,py+5,tile-6,tile-9);
      ctx.fillStyle='#aab7b1';ctx.fillRect(px+3,py+5,tile-6,2);ctx.fillStyle='#53686d';ctx.fillRect(px,py+tile-3,tile,3);ctx.fillRect(px+tile-3,py,3,tile);
      if((x===4&&y===6)||(x===18&&y===4)){ctx.fillStyle='#d4d7ca';ctx.fillRect(px+8,py+9,16,13);ctx.fillStyle='#617579';for(let k=0;k<3;k++)ctx.fillRect(px+10,py+11+k*3,12,1);}
     }else if(perimeter){
      // Chain-link boundary: background only; X exits remain existing tiles.
      ctx.fillStyle='#879894';ctx.fillRect(px,py,tile,tile);ctx.save();ctx.beginPath();ctx.rect(px,py,tile,tile);ctx.clip();ctx.strokeStyle='#c2cac0';ctx.lineWidth=1;ctx.beginPath();for(let k=-tile;k<tile*2;k+=8){ctx.moveTo(px+k,py);ctx.lineTo(px+k+tile,py+tile);ctx.moveTo(px+k,py+tile);ctx.lineTo(px+k+tile,py);}ctx.stroke();ctx.restore();ctx.fillStyle='#566d70';ctx.fillRect(px,py,tile,3);ctx.fillRect(px,py+tile-3,tile,3);
     }
     if(c===','){ctx.fillStyle='#cbd2c9';ctx.fillRect(px,py+3,tile,2);ctx.fillStyle='#8b9b98';ctx.fillRect(px+(y%2?tile/2:2),py+5,2,tile-7);}
     if(c==='g'){ctx.fillStyle='#9a8764';for(let j=0;j<3;j++)ctx.fillRect(px+5+j*9,py+tile-9-(j%2)*3,4,2);ctx.fillStyle='#dec99b';ctx.fillRect(px+4+(x*5+y*3)%9,py+6,5,2);}
     if('ijkl'.includes(c)){ctx.fillStyle='#f4ead9';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c45b50';ctx.fillRect(px+tile/2-6,py+tile/2-5,12,5);ctx.fillStyle='#445356';ctx.fillRect(px+tile/2-6,py+tile/2,12,2);}
     if(c==='^'){
      const rack=y===10||y===11;ctx.fillStyle='#697b7b';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#9dada7';ctx.fillRect(px+2,py+2,tile-4,tile-4);
      ctx.fillStyle='#556c70';ctx.fillRect(px+4,py+(rack&&y===10?11:6),tile-8,rack&&y===10?tile-14:tile-9);
      ctx.fillStyle='#aab9ae';ctx.fillRect(px+7,py+(rack&&y===10?13:9),tile-14,9);
      ctx.fillStyle='#d8bd70';ctx.fillRect(px+7,py+3,4,6);ctx.fillRect(px+tile-11,py+3,4,6);
      ctx.fillStyle='#e0d6a7';ctx.fillRect(px+8,py+2,2,4);ctx.fillRect(px+tile-10,py+2,2,4);
      ctx.fillStyle='#4b6065';ctx.fillRect(px,py+tile-4,tile,3);
     }
     if(c==='^'&&y===6&&x>=9&&x<=13){ctx.fillStyle='#627778';ctx.fillRect(px+2,py+4,tile-4,tile-8);ctx.fillStyle='#c1d0c1';ctx.fillRect(px+6,py+8,tile-12,tile-16);ctx.fillStyle='#dbbb67';for(let n=0;n<3;n++){ctx.fillRect(px+7+n*7,py+3,3,6);ctx.fillRect(px+7+n*7,py+tile-8,3,5);}ctx.fillStyle='#4d6468';ctx.fillRect(px+7,py+tile/2-1,tile-14,2);}
     if(c==='r'){ctx.fillStyle='#827769';ctx.beginPath();ctx.moveTo(px+3,py+tile-6);ctx.lineTo(px+7,py+8);ctx.lineTo(px+20,py+4);ctx.lineTo(px+tile-3,py+15);ctx.lineTo(px+tile-5,py+tile-5);ctx.closePath();ctx.fill();ctx.fillStyle='#b3a38b';ctx.fillRect(px+8,py+9,10,3);ctx.fillRect(px+6,py+12,4,6);}
     if(c==='X'){ctx.fillStyle='#5e8982';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#a1d7bb';ctx.fillRect(px+7,py+7,tile-14,tile-14);}return;}
    if(w.district==='lumiose-zone13'&&!w.interior){ctx.fillStyle=c==='#'?'#597350':c==='g'?'#93b37a':c===','?'#818984':(x+y)%2?'#a4bf8d':'#b2c99a';ctx.fillRect(px,py,tile,tile);
     if(c==='^'){if(ZONE13_STUMPS.some(([sx,sy]:number[])=>sx===x&&sy===y)){ctx.fillStyle='#6d5038';ctx.fillRect(px+6,py+15,tile-12,11);ctx.fillStyle='#c7a379';ctx.fillRect(px+5,py+12,tile-10,7);ctx.fillStyle='#8c6a4a';ctx.fillRect(px+9,py+14,tile-18,2);}else{ctx.fillStyle='#6f5137';ctx.fillRect(px+tile/2-3,py+tile-12,6,10);ctx.fillStyle='#365f3e';ctx.fillRect(px+3,py+8,tile-6,tile-18);ctx.fillRect(px+6,py+4,tile-12,6);ctx.fillStyle='#568b51';ctx.fillRect(px+5,py+8,tile-12,7);ctx.fillRect(px+9,py+4,tile-18,4);ctx.fillStyle='#81aa6c';ctx.fillRect(px+9,py+7,6,2);}}
     // North Boulevard cuts through the wooded zone; preserve encounter tiles.
     if(c===','&&y===8&&x%2===0){ctx.fillStyle='#e8e1d2';ctx.fillRect(px+5,py+Math.floor(tile/2)-1,tile-10,2);}
     if(c===','&&(y===7||y===9)){ctx.fillStyle='#adb0a3';ctx.fillRect(px,y===7?py:py+tile-2,tile,2);}
     if(c==='#'&&(y===0||y===16)&&x>0&&x<22){ctx.fillStyle='#739467';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#89a67b';ctx.fillRect(px+7,py+7,tile-14,4);}
     if(c==='g'){if((y<=6&&(x<=8||x>=15))||(y>=10&&(x<=7||x>=16))){ctx.fillStyle='#7ba56c';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,tile*.42,tile*.32,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a0be84';ctx.fillRect(px+7,py+9,6,2);ctx.fillRect(px+tile-11,py+13,4,2);}ctx.fillStyle='#638f5c';for(let j=0;j<3;j++)ctx.fillRect(px+5+j*9,py+tile-10-(j%2)*4,3,7);}if(c==='r'){ctx.fillStyle='#466d40';ctx.fillRect(px+2,py+8,tile-4,tile-10);ctx.strokeStyle='#92ab65';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px+5,py+tile-5);ctx.lineTo(px+tile-5,py+7);ctx.moveTo(px+5,py+7);ctx.lineTo(px+tile-5,py+tile-5);ctx.stroke();}if('ijkt'.includes(c)){ctx.fillStyle='#d8b64f';ctx.fillRect(px+8,py+8,tile-16,tile-16);}if(c==='W'||c==='E'||c==='X'){ctx.fillStyle='#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-zone12'&&!w.interior){const aquatic=!!zone12Visible(w,c)?.water,court=!w.zaZone12PondLower&&x>=3&&x<=8&&y>=3&&y<=6;ctx.fillStyle=c==='#'?(w.zaZone12PondLower?'#617c86':'#85999f'):c==='~'||aquatic?'#83b8c8':court?'#acbcc0':c==='g'?'#d6e9e8':w.zaZone12PondLower?'#b5cdd0':(x+y)%2?'#eef7f4':'#e1f0ef';ctx.fillRect(px,py,tile,tile);if(!w.zaZone12PondLower&&c==='#'&&(x===0||x===22||y===0||y===16)){ctx.fillStyle='#6e8d82';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#506f63';ctx.beginPath();ctx.moveTo(px+tile/2,py+2);ctx.lineTo(px+3,py+tile-4);ctx.lineTo(px+tile-3,py+tile-4);ctx.closePath();ctx.fill();ctx.fillStyle='#eef7ee';ctx.beginPath();ctx.moveTo(px+tile/2,py+3);ctx.lineTo(px+8,py+17);ctx.lineTo(px+tile/2,py+13);ctx.lineTo(px+tile-8,py+17);ctx.closePath();ctx.fill();ctx.fillRect(px+8,py+tile-9,tile-16,3);}if(!w.zaZone12PondLower&&c===','&&!court){ctx.fillStyle='#d2e2df';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#edf5ef';ctx.fillRect(px+4,py+6,tile-8,2);ctx.fillRect(px+8,py+tile-8,tile-13,2);}if(!w.zaZone12PondLower&&c==='^'){ctx.fillStyle='#819b90';ctx.fillRect(px+tile/2-2,py+tile-8,4,7);ctx.fillStyle='#4f7763';ctx.beginPath();ctx.moveTo(px+tile/2,py+2);ctx.lineTo(px+3,py+tile-7);ctx.lineTo(px+tile-3,py+tile-7);ctx.closePath();ctx.fill();ctx.fillStyle='#eff8ef';ctx.beginPath();ctx.moveTo(px+tile/2,py+3);ctx.lineTo(px+7,py+15);ctx.lineTo(px+tile/2,py+12);ctx.lineTo(px+tile-7,py+15);ctx.closePath();ctx.fill();ctx.fillRect(px+8,py+tile-10,tile-16,2);}if(w.zaZone12PondLower&&c==='#'&&((w.map[y+1]?.[x]||'#')!=='#')){ctx.fillStyle='#dbece8';ctx.fillRect(px,py+tile-5,tile,5);ctx.fillStyle='#97b7bc';ctx.fillRect(px,py+tile-2,tile,2);}if(c==='~'||aquatic){ctx.fillStyle='#639eaf';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#b6dae2';ctx.fillRect(px+3,py+5,tile-6,3);ctx.fillStyle='#e7f5f4';ctx.fillRect(px+6,py+tile-9,tile-12,2);}if(!w.zaZone12PondLower&&c==='~'&&((x===4&&y===12)||(x===5&&y===13))){ctx.fillStyle='#d4eef0';ctx.beginPath();ctx.moveTo(px+4,py+10);ctx.lineTo(px+12,py+5);ctx.lineTo(px+tile-5,py+9);ctx.lineTo(px+tile-7,py+tile-7);ctx.lineTo(px+8,py+tile-5);ctx.closePath();ctx.fill();ctx.fillStyle='#f0fbfa';ctx.fillRect(px+9,py+10,tile-18,2);}if(c===':'||c==='l'){ctx.fillStyle='#c5d6d2';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#91aaa4';for(let j=4;j<tile;j+=8)ctx.fillRect(px,py+j,tile,2);}if(court){ctx.fillStyle=(x+y)%2?'#9eb2b5':'#a8babe';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#d6e2df';ctx.fillRect(px+2,py+tile-2,tile-4,1);ctx.fillStyle='#e8f0ed';if(x===3)ctx.fillRect(px+3,py,2,tile);if(x===8)ctx.fillRect(px+tile-5,py,2,tile);if(y===3)ctx.fillRect(px,py+3,tile,2);if(y===6)ctx.fillRect(px,py+tile-5,tile,2);if(x===6)ctx.fillRect(px,py,2,tile);}if(c==='g'){ctx.fillStyle='#d2e7e3';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#f6fbf6';ctx.fillRect(px+3,py+5,11,2);ctx.fillRect(px+17,py+14,9,2);ctx.fillStyle='#afccca';for(let j=0;j<3;j++)ctx.fillRect(px+5+j*9,py+tile-9-(j%2)*3,4,3);}if(c==='r'){ctx.fillStyle=w.zaZone12PondLower?'#a6dbe4':'#827b70';ctx.beginPath();ctx.moveTo(px+4,py+tile-6);ctx.lineTo(px+7,py+11);ctx.lineTo(px+14,py+5);ctx.lineTo(px+tile-7,py+10);ctx.lineTo(px+tile-4,py+tile-7);ctx.closePath();ctx.fill();ctx.fillStyle=w.zaZone12PondLower?'#e6faf8':'#dfe7e0';ctx.fillRect(px+10,py+8,10,3);}if(c==='='){ctx.fillStyle='#c6edf0';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#8cbec8';ctx.fillRect(px,py+4,tile,2);ctx.fillRect(px,py+tile-6,tile,2);}if('ijkt'.includes(c)){ctx.fillStyle='#f2f0e6';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,7,0,Math.PI*2);ctx.fill();ctx.fillStyle=c==='t'?'#debb58':'#c45a5b';ctx.fillRect(px+tile/2-6,py+tile/2-5,12,5);ctx.fillStyle='#414f52';ctx.fillRect(px+tile/2-6,py+tile/2,12,2);ctx.fillStyle='#f8f7ef';ctx.fillRect(px+tile/2-1,py+tile/2-1,2,4);}if(c==='W'||c==='E'||c==='X'){ctx.fillStyle='#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-zone10'&&!w.interior){const aquatic=!!zone10Visible(w,c)?.water;ctx.fillStyle=c==='#'?'#66777a':c==='w'?'#a5c9cb':c==='~'||aquatic?'#79adc1':c==='g'?'#94ae80':c===','?'#c2b6a0':w.zaZone10Upper?'#c9bcb0':(x+y)%2?'#dad3bf':'#e7dfca';ctx.fillRect(px,py,tile,tile);if(!w.zaZone10Upper&&(c==='~'||c==='w'||aquatic)){canalWater(px,py,x,y);if(c==='w'){ctx.fillStyle='rgba(212,238,226,.35)';ctx.fillRect(px,py,tile,tile);}if(y>=8&&y<=10&&((x>=4&&x<=8)||(x>=14&&x<=18))){ctx.fillStyle='rgba(40,65,67,.20)';ctx.fillRect(px,py,tile,tile);}}
     if(!w.zaZone10Upper&&c===','){ctx.fillStyle='#c2b6a0';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#aa9f8d';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(x%2?tile/2:1),py+3,1,tile-5);if(y===7){ctx.fillStyle='#e5d9c0';ctx.fillRect(px,py+tile-4,tile,2);}}
     if(w.zaZone10Upper){if(c==='#'&&y>=8&&y<=12)canalWater(px,py,x,y);else if(c!=='#'){roofPaving(px,py,x,y);if(c==='g'){ctx.fillStyle='#8c725d';ctx.fillRect(px+4,py+tile-10,tile-8,5);ctx.fillStyle='#aa8a6d';ctx.fillRect(px+8,py+tile-12,tile-16,3);}}}if(c==='^'){ctx.fillStyle='#78604a';ctx.fillRect(px+4,py+12,tile-8,9);ctx.fillStyle='#ad8a63';ctx.fillRect(px+5,py+10,tile-10,4);ctx.fillStyle='#574538';ctx.fillRect(px+6,py+21,4,5);ctx.fillRect(px+tile-10,py+21,4,5);}if(c==='r'){ctx.fillStyle='#76527c';ctx.fillRect(px+4,py+7,tile-8,tile-11);}if(c==='i'||c==='j'||c==='t'){ctx.fillStyle='#eee9dc';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,7,0,Math.PI*2);ctx.fill();ctx.fillStyle=c==='t'?'#d4b557':'#c45d58';ctx.fillRect(px+tile/2-6,py+tile/2-5,12,5);ctx.fillStyle='#4c5855';ctx.fillRect(px+tile/2-6,py+tile/2,12,2);}if(c==='l'){ctx.fillStyle='#806448';ctx.fillRect(px+8,py+4,3,tile-8);ctx.fillRect(px+tile-11,py+4,3,tile-8);for(let k=7;k<tile-5;k+=6)ctx.fillRect(px+8,py+k,tile-16,2);}if(c==='W'||c==='E'||c==='X'){ctx.fillStyle='#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-zone9'&&!w.interior){
     // The two roofs, grass and raised scaffold follow existing provisional
     // cells; the drawing never changes movement, encounters or saved layers.
     const upper=w.zaZone9Upper===true,inside=x>0&&x<22&&y>0&&y<16;
     ctx.fillStyle=c==='#'?(upper?'#65777d':'#6d6b70'):c==='g'?'#98b27f':c===','?'#a1917d':upper?'#c8b8ac':(x+y)%2?'#dad2c0':'#e6decb';ctx.fillRect(px,py,tile,tile);
     if(upper&&c==='#'){
      // Dark lower city separates the roof footprints from the walkway.
      ctx.fillStyle=(x+y)%2?'#6b7b7f':'#728285';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#5f7277';ctx.fillRect(px,py+tile-4,tile,4);
     }
     if(upper&&c!=='#'&&c!=='g'&&c!==',')roofPaving(px,py,x,y);
     if(upper&&c==='g'){
      ctx.fillStyle=(x+y)%2?'#8cae78':'#9abb83';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#608e5b';for(let j=0;j<3;j++)ctx.fillRect(px+5+j*9,py+tile-10-(j%2)*4,3,7);ctx.fillRect(px+9,py+5,2,5);
     }
     if(upper&&c===','){
      ctx.fillStyle='#786856';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#d0b38a';for(let j=3;j<tile;j+=8)ctx.fillRect(px+j,py+4,5,tile-8);ctx.fillStyle='#5d6c69';ctx.fillRect(px,py+1,tile,3);ctx.fillRect(px,py+tile-4,tile,3);ctx.fillStyle='#b9c3b4';ctx.fillRect(px,py+1,tile,1);ctx.fillRect(px,py+tile-4,tile,1);
     }
     if(!upper&&c==='#'&&inside){
      // Existing ground-level building footprints have continuous roof caps.
      ctx.fillStyle='#a28d7d';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#c4b39f';ctx.fillRect(px+1,py+2,tile-2,tile-4);ctx.fillStyle='#9d8c7d';ctx.fillRect(px+3,py+5,tile-6,tile-9);ctx.fillStyle='#e0d2ba';ctx.fillRect(px+3,py+5,tile-6,2);ctx.fillStyle='#756f69';ctx.fillRect(px,py+tile-3,tile,3);ctx.fillRect(px+tile-3,py,3,tile);
     }
     if(!upper&&c===','){ctx.fillStyle='#b9b4a7';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#d8d3c4';ctx.fillRect(px,py+2,tile,2);ctx.fillStyle='#a19e93';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:1),py+4,2,tile-6);}
     if(!upper&&x>=8&&x<=14&&y===11){ctx.fillStyle='rgba(71,74,71,.18)';ctx.fillRect(px,py+3,tile,tile-6);ctx.fillStyle='#79817c';ctx.fillRect(px,py+4,tile,2);ctx.fillRect(px,py+tile-6,tile,2);}
     if('ijk'.includes(c)){ctx.fillStyle='#f1eadb';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c85e55';ctx.fillRect(px+tile/2-6,py+tile/2-5,12,5);ctx.fillStyle='#4f5d59';ctx.fillRect(px+tile/2-6,py+tile/2,12,2);}
     if(c==='l'||c==='h'){ctx.fillStyle='#72543d';ctx.fillRect(px+8,py+4,3,tile-8);ctx.fillRect(px+tile-11,py+4,3,tile-8);ctx.fillStyle='#e8d4af';for(let j=7;j<tile-5;j+=6)ctx.fillRect(px+9,py+j,tile-18,2);}
     if(c==='o'){ctx.fillStyle='#667976';ctx.fillRect(px+3,py+6,tile-6,tile-12);ctx.fillStyle='#c1b091';for(let j=7;j<tile-5;j+=7)ctx.fillRect(px+5,py+j,tile-10,3);ctx.fillStyle='#e2d1b0';ctx.fillRect(px+4,py+4,tile-8,2);}
     if(c==='*'){ctx.fillStyle='#ca69b4';ctx.fillRect(px+9,py+5,tile-18,tile-10);ctx.fillStyle='#ffe0f6';ctx.fillRect(px+13,py+8,4,tile-16);}
     if(c==='X'){ctx.fillStyle='#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#a1cbb8';ctx.fillRect(px+8,py+7,tile-16,tile-14);}return;}
    if(w.district==='lumiose-zone8'&&!w.interior){
     // Jaune Plaza's central earth and surrounding sand ring are visual only:
     // the existing map tile continues to control movement and encounters.
     const r=Math.sqrt(((x-11)/9)**2+((y-8)/6)**2);
     ctx.fillStyle=c==='#'?'#857c69':r<=.48?'#b58c5e':r<=.9?'#dfc387':r<=1.1?'#e8dcc3':(x+y)%2?'#ddd4bd':'#e6dec9';ctx.fillRect(px,py,tile,tile);
     if(c===','){ctx.fillStyle='#cfb992';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#ead8b4';ctx.fillRect(px,py+2,tile,2);ctx.fillStyle='#af9777';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:2),py+4,2,tile-6);}
     if(c==='^'){ctx.fillStyle='#6f4b32';ctx.fillRect(px+4,py+10,tile-8,tile-11);ctx.fillStyle='#ac8053';ctx.fillRect(px+7,py+15,tile-14,tile-18);ctx.fillStyle='#a63f42';ctx.fillRect(px+2,py+4,tile-4,8);ctx.fillStyle='#f3dfb6';for(let i=3;i<tile-3;i+=8)ctx.fillRect(px+i,py+4,4,8);ctx.fillStyle='#d6a764';ctx.fillRect(px+3,py+12,tile-6,3);ctx.fillStyle='#b54749';ctx.fillRect(px+7,py+16,4,4);ctx.fillStyle='#9fbc68';ctx.fillRect(px+14,py+16,4,4);ctx.fillStyle='#efc46d';ctx.fillRect(px+21,py+16,4,4);}
     if(c==='g'){ctx.fillStyle=r<=.48?'#98734d':'#b9975f';for(let j=0;j<3;j++)ctx.fillRect(px+5+j*9,py+tile-8-(j%2)*4,4,2);if((x*3+y)%4===0){ctx.fillStyle='#efd39a';ctx.fillRect(px+4,py+8,13,2);ctx.fillRect(px+10,py+6,9,2);ctx.fillStyle='#9b794b';ctx.fillRect(px+8,py+20,12,2);}}if('ijkl'.includes(c)){ctx.fillStyle='#d8b64f';ctx.fillRect(px+8,py+8,tile-16,tile-16);}if(c==='X'){ctx.fillStyle='#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-zone7'&&!w.interior){
     // Magenta Plaza stands between the two halves of the canal. Keep the
     // visual ring independent of the tiles that govern encounters.
     const r=Math.sqrt(((x-11)/9)**2+((y-8)/6)**2);
     // The grass ring remains visibly grassy and encounter-capable; the
     // existing comma tiles are paved even inside the central circle.
     ctx.fillStyle=c==='#'?'#787d76':c==='g'?(x+y)%2?'#8eaf7d':'#9cba87':c===','?(x+y)%2?'#d4cab4':'#e3dac7':r<=1.12?'#cbc0ae':(x+y)%2?'#ddd4c1':'#e8decb';ctx.fillRect(px,py,tile,tile);
     if(c===','){ctx.fillStyle='#b8ad9b';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:2),py+3,2,tile-5);ctx.fillStyle='#eee5d3';ctx.fillRect(px+2,py+2,tile-4,2);}
     if(r>.88&&r<1.12&&c!== '#'&&c!=='X'&&c!=='W'){ctx.fillStyle=c==='g'?'#bfd0a4':'#eee5d6';ctx.fillRect(px+2,py+tile-4,tile-4,2);}
     if(c==='~'){if(x===19&&y===5){ctx.fillStyle='#a39a8f';ctx.fillRect(px+1,py+2,tile-2,tile-4);ctx.fillStyle='#79b8c7';ctx.fillRect(px+5,py+6,tile-10,tile-12);ctx.fillStyle='#e8f4ef';ctx.fillRect(px+13,py+7,6,11);ctx.fillRect(px+9,py+15,14,3);}else canalWater(px,py,x,y);}if(x===11&&y>=7&&y<=9){
      // Monument silhouette and pedestal use only the existing landmark footprint.
      if(y===7){ctx.fillStyle='#c3b7a6';ctx.beginPath();ctx.moveTo(px+tile/2,py+1);ctx.lineTo(px+tile-7,py+tile);ctx.lineTo(px+7,py+tile);ctx.closePath();ctx.fill();ctx.fillStyle='#eee5d7';ctx.beginPath();ctx.moveTo(px+tile/2,py+3);ctx.lineTo(px+tile/2,py+tile);ctx.lineTo(px+9,py+tile);ctx.closePath();ctx.fill();}
      if(y===8){ctx.fillStyle='#b0a494';ctx.fillRect(px+7,py,tile-14,tile);ctx.fillStyle='#e7ddcd';ctx.fillRect(px+9,py,tile/2-9,tile);ctx.fillStyle='#958879';ctx.fillRect(px+tile/2+2,py+8,3,13);}
      if(y===9){ctx.fillStyle='#9a8e7f';ctx.fillRect(px+5,py,tile-10,tile-9);ctx.fillStyle='#d9d0c0';ctx.fillRect(px+7,py,tile-14,tile-13);ctx.fillStyle='#8b8074';ctx.fillRect(px+2,py+tile-9,tile-4,9);ctx.fillStyle='#e2d8c6';ctx.fillRect(px+3,py+tile-8,tile-6,3);}
     }if(c==='g'){ctx.fillStyle='#608c5a';for(let j=0;j<3;j++)ctx.fillRect(px+5+j*9,py+tile-10-(j%2)*4,3,7);ctx.fillRect(px+8,py+6,2,5);ctx.fillRect(px+22,py+11,2,5);}
     if(c==='X'||c==='W'){ctx.fillStyle='#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#a5cfb8';ctx.fillRect(px+8,py+7,tile-16,tile-14);}
     if(c==='j'){ctx.fillStyle='#6c7d78';ctx.fillRect(px+4,py+3,tile-8,tile-6);ctx.fillStyle='#dfc678';ctx.fillRect(px+7,py+5,tile-14,tile-10);ctx.fillStyle='#a1d5ca';ctx.fillRect(px+10,py+7,tile-20,tile-14);}return;}
    if(w.district==='lumiose-zone11'&&!w.interior){
     // The Saison Canal separates the banks. Beach and path details are a
     // visual approximation; the underlying collision and encounter tiles stay intact.
     const aquatic=zone11WaterAt(w.map,x,y),shore=c!=='g'&&c!=='#'&&!aquatic&&(zone11WaterAt(w.map,x,y-1)||zone11WaterAt(w.map,x,y+1));
     ctx.fillStyle=c==='#'?'#597573':c==='g'?'#87af76':c===','?'#b9ad95':shore?'#c6b996':y<7?'#a9c99a':'#c9c2a6';ctx.fillRect(px,py,tile,tile);
     if(c==='#'){
      // Existing blocked boundary reads as an embankment, not a walkable bank.
      ctx.fillStyle='#718d81';ctx.fillRect(px+1,py+1,tile-2,tile-4);ctx.fillStyle='#a4b6a4';ctx.fillRect(px+1,py+1,tile-2,3);ctx.fillStyle='#526e68';ctx.fillRect(px,py+tile-4,tile,4);
     }
     if(c===','){ctx.fillStyle='#a39680';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:2),py+4,2,tile-6);}
     if(aquatic){
      canalWater(px,py,x,y);ctx.fillStyle='#548d9c';ctx.fillRect(px,py+tile/2,tile,2);
      ctx.fillStyle='#506f70';if(!zone11WaterAt(w.map,x,y-1))ctx.fillRect(px,py,tile,3);if(!zone11WaterAt(w.map,x,y+1))ctx.fillRect(px,py+tile-3,tile,3);
     }
     if(c==='u'&&w.zaSide72Stage===1){ctx.fillStyle='#f8f4e9';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ad514b';ctx.fillRect(px+tile/2-6,py+tile/2-5,12,4);ctx.fillStyle='#353638';ctx.fillRect(px+tile/2-6,py+tile/2,12,2);}
     if(c==='z'){ctx.fillStyle='#c9b994';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#f6e5b2';ctx.fillRect(px+tile/2-2,py+5,4,tile-10);ctx.fillRect(px+5,py+tile/2-2,tile-10,4);}
     if(shore){ctx.fillStyle='#a99f7e';ctx.fillRect(px+4+(x%3)*4,py+6,5,2);ctx.fillRect(px+18,py+22,4,2);}
     if(c==='g'){ctx.fillStyle='#5e8f58';for(let j=0;j<4;j++){const h=5+(x+y+j)%5;ctx.fillRect(px+4+j*7,py+tile-5-h,2,h);}ctx.fillStyle='#b4d393';ctx.fillRect(px+7+(x*3+y)%12,py+8,3,2);}
     if(c==='X'){ctx.fillStyle='#d3dec7';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#4a8272';ctx.fillRect(px+3,py+4,4,tile-8);ctx.fillRect(px+tile-7,py+4,4,tile-8);ctx.fillStyle='#a8ded0';ctx.fillRect(px+8,py+8,tile-16,tile-16);}return;
    }
    if(w.district==='lumiose-galerie-lune'&&!w.interior){
     // Galerie de la Lune has a glass-domed central hall and three access
     // corridors. The 2D footprint, boutique order and details are drafts.
     // https://www.pokepedia.fr/Galerie_Clair_de_Lune
     const boutique='abcdefgh'.includes(c),salon=c==='s',hall=x>=6&&x<=16&&y>=3&&y<=10;
     if(c==='#'){
      ctx.fillStyle='#9e9195';ctx.fillRect(px,py,tile,tile);
      const nearby=[w.map[y-1]?.[x],w.map[y+1]?.[x],w.map[y]?.[x-1],w.map[y]?.[x+1]].some(t=>t&&t!=='#');
      if(nearby){ctx.fillStyle='#d1bfb3';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#e8dbcc';ctx.fillRect(px+2,py+2,tile-4,tile-4);ctx.fillStyle='#a68c7d';ctx.fillRect(px,py+tile-4,tile,4);ctx.fillStyle='#f3e7d7';ctx.fillRect(px+3,py+4,tile-6,3);}
      return;
     }
     // A tiled stone floor and curved glass reflection make the central hall
     // distinct from the adjoining passages without changing any map tiles.
     ctx.fillStyle=hall?((x+y)%2?'#d8d2c9':'#e8e1d6'):((x+y)%2?'#c7bcb1':'#d7cdc0');ctx.fillRect(px,py,tile,tile);
     ctx.fillStyle=hall?'#bcb2a8':'#ae9f92';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:0),py+2,2,tile-4);
     if(hall&&!boutique&&!salon){
      ctx.save();ctx.beginPath();ctx.rect(px,py,tile,tile);ctx.clip();
      const cx=11.5*tile,cy=7*tile,rx=4.35*tile,ry=3.1*tile;
      ctx.fillStyle='rgba(176,216,218,.22)';ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(240,250,244,.65)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.clip();
      ctx.strokeStyle='rgba(115,155,159,.42)';ctx.lineWidth=2;for(const dx of [-.65,-.3,0,.3,.65]){ctx.beginPath();ctx.moveTo(cx+dx*rx,cy-ry);ctx.lineTo(cx+dx*rx,cy+ry);ctx.stroke();}
      ctx.beginPath();ctx.ellipse(cx,cy,rx*.78,ry*.55,0,0,Math.PI*2);ctx.stroke();ctx.restore();
     }
     if(boutique||salon){
      // Stylised shopfronts stand on their existing interaction cells; these
      // are not a survey of individual original boutique facades.
      const palette=['#a64f64','#668890','#a37559','#8f6a94','#bc785c','#527c87','#8a7564','#7d6685'];
      ctx.fillStyle='#a89686';ctx.fillRect(px+1,py+3,tile-2,tile-5);ctx.fillStyle='#ead8c6';ctx.fillRect(px+3,py+5,tile-6,tile-7);
      ctx.fillStyle=salon?'#537f81':palette['abcdefgh'.indexOf(c)];ctx.fillRect(px+3,py+5,tile-6,6);
      ctx.fillStyle='#f8e5c5';for(let j=5;j<tile-4;j+=8)ctx.fillRect(px+j,py+5,3,6);
      ctx.fillStyle='#54757b';ctx.fillRect(px+6,py+13,tile-12,tile-17);ctx.fillStyle='#d7ebdf';ctx.fillRect(px+8,py+15,tile-16,tile-21);
      ctx.fillStyle='#eed6aa';ctx.fillRect(px+5,py+tile-4,tile-10,2);
      if(salon){ctx.fillStyle='#f2ece4';ctx.fillRect(px+tile/2-2,py+15,4,8);ctx.fillStyle='#a64b57';ctx.fillRect(px+tile/2-2,py+17,4,2);}
      else{ctx.fillStyle='#e8b9a6';ctx.fillRect(px+tile/2-3,py+16,6,7);ctx.fillRect(px+tile/2-5,py+18,10,2);}
     }
     if(c==='z'){ctx.fillStyle='#806e76';ctx.beginPath();ctx.arc(px+tile/2,py+tile*.38,tile*.11,0,Math.PI*2);ctx.fill();ctx.fillStyle='#534f5a';ctx.fillRect(px+tile*.37,py+tile*.5,tile*.26,tile*.3);}
     if(c==='W'||c==='E'||c==='X'){ctx.fillStyle='#7c9693';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#dbe7d8';ctx.fillRect(px+6,py+6,tile-12,tile-12);ctx.fillStyle='#93b5ad';ctx.fillRect(px+9,py+9,tile-18,tile-18);}
     return;
    }
    if(w.district==='lumiose-ombrage-arcade'&&!w.interior){
     // Passage Ombragé is a long glazed arcade with shops and north/south
     // entrances. Facade colours and the 2D footprint remain approximations.
     // https://www.pokepedia.fr/Passage_de_l%27Ombre
     const shop='abcdefghijklmn'.includes(c),salon=c==='s';
     if(c==='#'){
      ctx.fillStyle='#716a73';ctx.fillRect(px,py,tile,tile);
      const adjoining=[w.map[y-1]?.[x],w.map[y+1]?.[x],w.map[y]?.[x-1],w.map[y]?.[x+1]].some(t=>t&&t!=='#');
      if(adjoining){ctx.fillStyle='#9a8583';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#bdaaa2';ctx.fillRect(px+2,py+2,tile-4,tile-4);ctx.fillStyle='#6c5b5e';ctx.fillRect(px,py+tile-4,tile,4);ctx.fillStyle='#d9c9b7';ctx.fillRect(px+3,py+3,tile-6,2);}
      return;
     }
     // Rectangular glass-roof reflections distinguish this north–south
     // arcade from the domed Galerie de la Lune, without changing movement.
     ctx.fillStyle=(x+y)%2?'#d5cbc2':'#e5dcd0';ctx.fillRect(px,py,tile,tile);
     ctx.fillStyle='#b8aaa1';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:0),py+2,2,tile-4);
     if(x>=9&&x<=13&&y>=1&&y<=15){
      ctx.fillStyle=(x+y)%2?'rgba(147,188,188,.25)':'rgba(188,216,208,.32)';ctx.fillRect(px+1,py+1,tile-2,tile-2);
      ctx.fillStyle='#8ca2a0';ctx.fillRect(px,py+tile-3,tile,2);if(x===9)ctx.fillRect(px+2,py,2,tile);if(x===13)ctx.fillRect(px+tile-4,py,2,tile);
      ctx.fillStyle='rgba(247,250,231,.5)';ctx.fillRect(px+5,py+5,tile-10,2);
     }
     if(shop||salon){
      // Existing shop tiles carry the interactions. Storefront artwork is
      // illustrative; exact real-world colour and individual order are unknown.
      const colors=['#a05e6d','#718b88','#5c596f','#bb8d8a','#857451','#54838a','#9c796b','#665e78','#a1767d','#594c61','#8e765c','#786d77','#b77b85','#756b78'];
      const color=salon?'#548887':colors['abcdefghijklmn'.indexOf(c)];
      ctx.fillStyle='#544750';ctx.fillRect(px+1,py+1,tile-2,tile-2);ctx.fillStyle='#d7c0ac';ctx.fillRect(px+3,py+3,tile-6,tile-6);
      ctx.fillStyle=color;ctx.fillRect(px+3,py+3,tile-6,7);ctx.fillStyle='#f0dbc1';for(let j=5;j<tile-4;j+=8)ctx.fillRect(px+j,py+3,3,7);
      ctx.fillStyle='#4f6f76';ctx.fillRect(px+6,py+12,tile-12,tile-17);ctx.fillStyle='#cde2da';ctx.fillRect(px+8,py+14,tile-16,tile-21);
      ctx.fillStyle=salon?'#f8f4e7':'#e7b6a4';ctx.fillRect(px+tile/2-3,py+15,6,7);ctx.fillRect(px+tile/2-5,py+17,10,2);
      if(salon){ctx.fillStyle='#bd5559';ctx.fillRect(px+tile/2-3,py+17,6,2);}ctx.fillStyle='#dcc59d';ctx.fillRect(px+5,py+tile-4,tile-10,2);
     }
     if(c==='u'){
      ctx.fillStyle='#eee4d5';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#76557f';ctx.fillRect(px+tile/2-6,py+tile/2-5,12,5);ctx.fillStyle='#394344';ctx.fillRect(px+tile/2-6,py+tile/2,12,2);ctx.fillStyle='#fff';ctx.fillRect(px+tile/2-1,py+tile/2-1,2,3);
     }
     if(c==='$'){ctx.fillStyle='#65584d';ctx.fillRect(px+4,py+3,tile-8,tile-6);ctx.fillStyle='#e7d8b6';for(let n=0;n<3;n++)ctx.fillRect(px+6,py+7+n*7,tile-12,2);}
     if(c==='X'){ctx.fillStyle='#6f807e';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#d8e5d9';ctx.fillRect(px+6,py+6,tile-12,tile-12);ctx.fillStyle='#87aaa1';ctx.fillRect(px+9,py+9,tile-18,tile-18);}
     return;
    }
    if(w.district==='lumiose-rouge-sector4'&&!w.interior){ctx.fillStyle=c==='#'?'#8a7472':c==='g'?'#a8c7cb':c===','?'#b8b2aa':(x+y)%2?'#e2d8ca':'#eee5d7';ctx.fillRect(px,py,tile,tile);if(c==='q'||c==='W'||c==='E'){ctx.fillStyle=c==='q'?'#715c73':'#537b85';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='q'?'상점가':'출구',px+tile/2,py+20);}return;}
    if(w.district==='lumiose-north-rouge-roof'&&!w.interior){ctx.fillStyle=c==='#'?'#827d7a':c==='b'?'#a68060':c==='n'?'#b59d78':(x+y)%2?'#ddd4c5':'#eee6d7';ctx.fillRect(px,py,tile,tile);if(c==='j'||c==='q'||c==='l'){ctx.fillStyle=c==='j'||c==='l'?'#936e40':'#759a77';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='j'?'승강기':c==='l'?'사다리':'옥상',px+tile/2,py+20);}return;}
    if(['lumiose-rouge-sector1','lumiose-rouge-sector1-roof','lumiose-rouge-sector3-roof'].includes(w.district)&&!w.interior){ctx.fillStyle=c==='#'?'#91857d':c==='g'?'#a7bc83':c==='w'?'#ded6cf':c==='b'?'#9b7658':c==='v'?'#7c9c61':c===';'?'#c89575':c===','?'#b9b1a3':(x+y)%2?'#e1dacb':'#ebe5d8';ctx.fillRect(px,py,tile,tile);if(c==='g')sprite('grassDetail',px,py);if(c==='j'||c==='E'||c==='X'||c==='t'||c==='o'||c==='d'||(c==='l'&&w.district==='lumiose-rouge-sector3-roof')||(c==='q'&&w.district==='lumiose-rouge-sector3-roof')){ctx.fillStyle=c==='o'||c==='d'?'#716589':c==='t'?'#d8b64f':c==='j'?(w.zaSide04Won?'#c7a75f':'#9d6e55'):'#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='q'?'르 예':c==='l'?'사다리':c==='j'?'승강기':c==='t'?'TM':c==='o'?'SBC':c==='d'?'은행':'출구',px+tile/2,py+20);}return;}
    if(w.district==='lumiose-zone1-high-roof'&&!w.interior){
     // Second roof and its ladder are confirmed; roof outline and materials are draft.
     if(c==='#'){
      ctx.fillStyle=(x+y)%2?'#899787':'#92a08e';ctx.fillRect(px,py,tile,tile);
      if(y>=11&&x>=3&&x<=19){ctx.fillStyle='#a79c8b';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#c7bba7';ctx.fillRect(px,py,tile,3);}
     }else{
      roofPaving(px,py,x,y);
      if(c==='j'){
       ctx.fillStyle='#6b5041';ctx.fillRect(px+7,py+2,4,tile-4);ctx.fillRect(px+tile-11,py+2,4,tile-4);
       ctx.fillStyle='#e1c18d';for(let j=6;j<tile-4;j+=6)ctx.fillRect(px+9,py+j,tile-18,3);
      }
     }return;
    }
    if(w.district==='lumiose-vert-sector9'&&!w.interior){ctx.fillStyle=c==='#'?'#97a18c':c===','?'#bbb9aa':c==='k'?'#a4c58e':(x+y)%2?'#e0ddcb':'#ebe6d4';ctx.fillRect(px,py,tile,tile);if(c==='~')canalWater(px,py,x,y);if(c===':'){ctx.fillStyle='#b7aa94';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#e6ddcd';for(let i=4;i<tile;i+=8)ctx.fillRect(px,py+i,tile,2);}if(c==='W'||c==='X'){ctx.fillStyle='#537b85';ctx.fillRect(px+5,py+5,tile-10,tile-10);}return;}
    if(w.district==='lumiose-zone3'&&w.zaZone3TowerUpper&&!w.interior){
     // The garden building has an accessible roof. Its footprint and stone
     // detailing are a visual approximation of the existing 2D floor.
     ctx.fillStyle=c==='#'?'#77807a':(x+y)%2?'#c8c1b0':'#ddd5c3';ctx.fillRect(px,py,tile,tile);
     if(c==='#'){
      ctx.fillStyle='#a4aaa0';ctx.fillRect(px+1,py+1,tile-2,tile-5);
      ctx.fillStyle='#d3d2c3';ctx.fillRect(px+1,py+2,tile-2,3);
      ctx.fillStyle='#68736f';ctx.fillRect(px,py+tile-4,tile,4);
     }else roofPaving(px,py,x,y);
     if(c==='i'){
      ctx.fillStyle='#647873';ctx.fillRect(px+7,py+4,tile-14,tile-8);
      ctx.fillStyle='#ded4be';for(let j=7;j<tile-6;j+=6)ctx.fillRect(px+9,py+j,tile-18,3);
     }else if(c==='t'){
      ctx.fillStyle='#b89343';ctx.fillRect(px+6,py+6,tile-12,tile-12);
      ctx.fillStyle='#f4df92';ctx.fillRect(px+9,py+9,tile-18,tile-18);
      ctx.fillStyle='#fff';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText('TM',px+tile/2,py+20);
     }else if(c==='p'){
      const img=w.zaWildShinyRolls?.['alpha:zone3-roof-fletchling:661']===true?shinyFieldImages[661]:fieldImages[661];
      if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#b45d42';ctx.fillRect(px+5,py+5,tile-10,tile-10);}
     }return;
    }
    if(w.district==='lumiose-zone1-courtyard'&&!w.interior){
     // Building courtyard and its connection are retained; planting and paving are approximate.
     if(c==='#'){
      ctx.fillStyle='#819088';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#b1bbb0';ctx.fillRect(px+1,py+1,tile-2,tile-4);ctx.fillStyle='#72827a';ctx.fillRect(px,py+tile-4,tile,4);
      if(x>0&&x<22&&y>1&&y<15){ctx.fillStyle='#788e89';ctx.fillRect(px+8,py+7,tile-16,tile-14);ctx.fillStyle='#cfdbcc';ctx.fillRect(px+tile/2-1,py+8,2,tile-16);}
     }else if(c==='g'){
      ctx.fillStyle='#8eb676';ctx.fillRect(px,py,tile,tile);sprite('grassDetail',px,py);
     }else{
      ctx.fillStyle=(x+y)%2?'#d7d0bc':'#e7dfcc';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#bcb5a3';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:1),py+3,2,tile-5);
      if(c==='E'){ctx.fillStyle='#879a86';ctx.fillRect(px+2,py+3,tile-4,tile-6);ctx.fillStyle='#e6e4cd';ctx.fillRect(px+tile-9,py+5,3,tile-10);}
     }return;
    }
    if(w.district==='lumiose-zone1-roof'&&!w.interior){
     // Ladder access and two roof levels are documented; the 2D footprint,
     // parapet shape and paving are approximations of the existing map.
     ctx.fillStyle=c==='#'?'#6d7572':c==='g'?'#9ab389':(x+y)%2?'#c5b8a4':'#d5cab7';ctx.fillRect(px,py,tile,tile);
     if(c==='#'){
      ctx.fillStyle='#89908a';ctx.fillRect(px+1,py+2,tile-2,tile-5);
      ctx.fillStyle='#adb0a1';ctx.fillRect(px+1,py+2,tile-2,3);
      ctx.fillStyle='#626d69';ctx.fillRect(px,py+tile-4,tile,4);
     }else if(c==='g'){
      ctx.fillStyle='#668f61';for(let j=0;j<3;j++)ctx.fillRect(px+5+j*9,py+tile-10-(j%2)*4,3,7);
      ctx.fillStyle='#bcd1a4';ctx.fillRect(px+6,py+6,4,2);ctx.fillRect(px+20,py+12,5,2);
     }else roofPaving(px,py,x,y);
     if(c==='l'||c==='j'){
      ctx.fillStyle='#76513a';ctx.fillRect(px+7,py+3,4,tile-6);ctx.fillRect(px+tile-11,py+3,4,tile-6);
      ctx.fillStyle='#dfbf87';for(let j=7;j<tile-5;j+=6)ctx.fillRect(px+9,py+j,tile-18,3);
     }else if(c==='d'){
      ctx.fillStyle='#65877d';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#e7eee1';ctx.beginPath();ctx.moveTo(px+tile/2,py+tile-7);ctx.lineTo(px+8,py+12);ctx.lineTo(px+tile-8,py+12);ctx.closePath();ctx.fill();
     }else if(c==='p'){
      ctx.fillStyle='#b64d42';ctx.fillRect(px+5,py+5,tile-10,tile-10);const img=w.zaWildShinyRolls?.['alpha:zone1-roof-pidgey:16']===true?shinyFieldImages[16]:fieldImages[16];if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-10,py-18,tile+20,tile+20);else{ctx.fillStyle='#e2b3a7';ctx.fillRect(px+8,py+8,tile-16,tile-12);}
     }else if(c==='t'||c==='k'){
      ctx.fillStyle='#e1c456';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='t'?'TM':'도구',px+tile/2,py+20);
     }return;
    }
    if(w.district==='lumiose-zone5'&&!w.interior){
     // Existing Bleu Street, roofs and canal use provisional 2D footprints.
     // Drawing stays inside each tile and does not alter route or encounters.
     const roof=w.zaZone5Upper===true,internalBuilding=!roof&&c==='#'&&x>0&&x<22&&y>0&&y<16;
     ctx.fillStyle=c==='#'?'#677e7e':c==='g'?'#82ad70':(x+y)%2?'#d7d0bd':'#e6decc';ctx.fillRect(px,py,tile,tile);
     const westStall=!roof&&ZONE5_WEST_STALL.some(([sx,sy]:number[])=>sx===x&&sy===y);
     if(westStall){
      // Small awning and counter beside the western clearing. Shape is draft.
      ctx.fillStyle='#80604a';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#f0d8b1';ctx.fillRect(px+2,py+3,tile-4,tile-8);
      ctx.fillStyle='#b4433f';ctx.fillRect(px+1,py+2,tile-2,9);ctx.fillStyle='#f9e4bd';for(let i=3;i<tile-3;i+=10)ctx.fillRect(px+i,py+2,5,9);
      ctx.fillStyle='#784e37';ctx.fillRect(px+3,py+tile-8,tile-6,5);ctx.fillStyle='#d6b777';ctx.fillRect(px+7,py+tile-14,7,5);
     }else if(internalBuilding){
      // Existing blocked footprints represent buildings next to the road.
      ctx.fillStyle='#927e70';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#c5b4a0';ctx.fillRect(px+1,py+2,tile-2,tile-4);
      ctx.fillStyle='#a99a88';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#e3d6bd';ctx.fillRect(px+3,py+4,tile-6,2);
      ctx.fillStyle='#7b7469';ctx.fillRect(px,py+tile-4,tile,4);ctx.fillRect(px+tile-3,py,3,tile);
      if((x===3&&y===2)||(x===18&&y===4)){ctx.fillStyle='#e6dfcd';ctx.fillRect(px+8,py+9,16,11);ctx.fillStyle='#8c9993';for(let j=0;j<3;j++)ctx.fillRect(px+10,py+11+j*3,12,1);}
     }
     if(roof&&c!=='#')roofPaving(px,py,x,y);
     if(c==='~'){
      canalWater(px,py,x,y);ctx.fillStyle='#688986';if(w.map[y-1]?.[x]!=='~')ctx.fillRect(px,py,tile,3);if(w.map[y+1]?.[x]!=='~')ctx.fillRect(px,py+tile-3,tile,3);if(w.map[y]?.[x-1]!=='~')ctx.fillRect(px,py,3,tile);if(w.map[y]?.[x+1]!=='~')ctx.fillRect(px+tile-3,py,3,tile);
     }
     if(c===','&&!roof){ctx.fillStyle='#c9bda9';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#ece2d0';ctx.fillRect(px,py+2,tile,2);ctx.fillStyle='#ab9e8d';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:2),py+4,2,tile-6);}
     if(c==='g'){ctx.fillStyle='#588d53';for(let j=0;j<3;j++)ctx.fillRect(px+5+j*9,py+tile-10-(j%2)*4,3,7);}
     if(roof&&x===11&&y===6){
      // Closed and opened web are distinct and still use the existing tile.
      ctx.fillStyle='#71868a';ctx.fillRect(px,py,tile,tile);ctx.strokeStyle='#e6eee6';ctx.lineWidth=2;ctx.beginPath();for(const dy of [5,11,17,23,28]){ctx.moveTo(px,py+dy);ctx.lineTo(px+tile,py+dy);}ctx.moveTo(px,py+5);ctx.lineTo(px+tile,py+28);ctx.moveTo(px,py+28);ctx.lineTo(px+tile,py+5);ctx.stroke();
      if(!w.zaZone5WebOpen){ctx.fillStyle='#c8d6ca';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,7,9,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f0f1e4';ctx.fillRect(px+13,py+10,6,12);}
     }else if(c==='r'){ctx.fillStyle='#76507d';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,12,9,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ae80ab';ctx.fillRect(px+9,py+10,12,3);ctx.fillRect(px+18,py+16,4,3);}
     if(c==='s'){ctx.fillStyle='#697a77';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,11,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a5b6aa';ctx.fillRect(px+8,py+14,16,3);}
     if(c==='l'||c==='h'){ctx.fillStyle='#79583f';ctx.fillRect(px+8,py+4,3,tile-8);ctx.fillRect(px+tile-11,py+4,3,tile-8);ctx.fillStyle='#e8d2a9';for(let k=7;k<tile-5;k+=6)ctx.fillRect(px+9,py+k,tile-18,2);}
     if(c==='c'){ctx.fillStyle='#765d51';ctx.fillRect(px+5,py+9,tile-10,tile-12);ctx.fillStyle='#c3a58e';ctx.fillRect(px+3,py+6,tile-6,5);ctx.fillStyle='#584a43';ctx.fillRect(px+7,py+7,tile-14,2);}
     if(c==='t'||c==='k'){ctx.fillStyle='#f2eadb';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,7,0,Math.PI*2);ctx.fill();ctx.fillStyle=c==='t'?'#d4b557':'#c45d58';ctx.fillRect(px+tile/2-6,py+tile/2-5,12,5);ctx.fillStyle='#4c5855';ctx.fillRect(px+tile/2-6,py+tile/2,12,2);}
     if(c==='0'){ctx.fillStyle='#795589';ctx.fillRect(px+9,py+6,tile-18,tile-12);ctx.fillStyle='#f1dfae';ctx.fillRect(px+13,py+8,5,5);}
     if(c==='W'||c==='X'){ctx.fillStyle='#568578';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#a4d3b6';ctx.fillRect(px+7,py+6,tile-14,tile-12);}return;}
    if(w.district==='lumiose-zone20'&&!w.interior&&w.zaMission42Underground){ctx.fillStyle=c==='#'?'#343c3e':(x+y)%2?'#8c968a':'#9aa395';ctx.fillRect(px,py,tile,tile);if(c==='#'){ctx.fillStyle='#59605b';ctx.fillRect(px,py+tile-5,tile,4);}else{ctx.fillStyle='#717e75';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillStyle='#b9c3af';ctx.fillRect(px+2,py+2,tile-4,1);}if(c==='h'){ctx.fillStyle='#647b76';for(let n=0;n<4;n++)ctx.fillRect(px+5,py+5+n*6,tile-10,3);}if(c==='n'){ctx.fillStyle='#496c60';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.strokeStyle='#9fc4a8';ctx.strokeRect(px+6,py+6,tile-12,tile-12);}return;}
    if(w.district==='lumiose-zone20'&&!w.interior){ctx.fillStyle=c==='#'?'#57625b':c==='|'?'#707d7c':c==='~'?'#7aabb2':c==='g'?'#9baa8c':y>=10&&x<=8?'#a89072':y<=6&&x<=5?'#a2a6a1':(x+y)%2?'#d6d2c2':'#ded9c9';ctx.fillRect(px,py,tile,tile);if(c==='|'){ctx.fillStyle='#435354';ctx.fillRect(px+1,py+5,tile-2,tile-6);ctx.fillStyle='#83938c';ctx.beginPath();ctx.moveTo(px+4,py+8);ctx.lineTo(px+8,py+3+(y%2)*3);ctx.lineTo(px+16,py+6);ctx.lineTo(px+tile-6,py+2);ctx.lineTo(px+tile-4,py+tile-6);ctx.lineTo(px+4,py+tile-6);ctx.closePath();ctx.fill();ctx.fillStyle='#c3cec0';ctx.fillRect(px+7,py+8,6,3);ctx.fillRect(px+tile-11,py+5,4,3);ctx.fillStyle='#536962';ctx.fillRect(px+13,py+11,3,8);ctx.fillRect(px+16,py+17,4,3);ctx.fillStyle='#a7b7a8';ctx.fillRect(px+4,py+tile-7,tile-8,3);}if(c==='%'){ctx.fillStyle='#6d7471';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#9da8a0';for(let j=5;j<tile;j+=7)ctx.fillRect(px+j,py+3,2,tile-6);ctx.fillStyle='#485a54';ctx.fillRect(px+2,py+3,tile-4,3);}if(c==='^'){ctx.fillStyle='#95806b';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#71665b';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,tile*.4,tile*.32,-.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b1a08b';ctx.fillRect(px+8,py+10,9,3);}if(c==='~'){canalWater(px,py,x,y);ctx.fillStyle='#b1d6d0';ctx.fillRect(px+5,py+7,6,2);}if(c==='g'){ctx.fillStyle='#78926e';for(let j=0;j<3;j++)ctx.fillRect(px+5+j*8,py+tile-8-(j%2)*3,3,5);ctx.fillStyle='#b5cba0';ctx.fillRect(px+4+(x*5+y)%13,py+6,5,2);}if(c===';'){ctx.fillStyle='#aa9272';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#8e765d';ctx.fillRect(px+5,py+7,3,2);ctx.fillRect(px+tile-10,py+tile-8,4,2);}if(c===','&&!(y===11&&x>=18&&x<=20)){ctx.fillStyle=y<=6&&x<=4?'#8d9692':'#c6bda9';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#a99e8b';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:2),py+3,2,tile-5);}if(c===','&&y===11&&x>=18&&x<=20){ctx.fillStyle='#a8815c';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#70543e';for(let j=4;j<tile;j+=8)ctx.fillRect(px+j,py,2,tile);}if('ij'.includes(c)){ctx.fillStyle='#f4e069';ctx.fillRect(px+tile/2-4,py+tile/2-4,8,8);}if(c==='n'){if(w.zaMission42ChamberV1&&!w.zaMission42Complete){ctx.fillStyle='#596860';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#b5c1ac';for(let step=0;step<4;step++)ctx.fillRect(px+6,py+7+step*5,tile-12,2);}else{ctx.fillStyle='#92a78d';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#3c7a5c';ctx.beginPath();ctx.moveTo(px+tile/2,py+3);ctx.lineTo(px+tile-6,py+tile/2);ctx.lineTo(px+tile/2,py+tile-4);ctx.lineTo(px+6,py+tile/2);ctx.closePath();ctx.fill();ctx.fillStyle='#c6df9b';ctx.fillRect(px+tile/2-2,py+8,4,tile-16);}}if(c==='X'||c==='W'||c==='E'){ctx.fillStyle='#789489';ctx.fillRect(px+9,py+9,tile-18,tile-18);}return;}
    if(w.district==='lumiose-research-zone'&&!w.interior){ctx.fillStyle=c==='#'?'#566465':c==='~'?'#78a8bc':c==='g'?'#90b177':(x+y)%2?'#d8d3c1':'#e0dac9';ctx.fillRect(px,py,tile,tile);if(c==='0'||c==='X'){ctx.fillStyle='#735982';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='X'?'출구':'조사',px+tile/2,py+20);}return;}
    if(w.district==='lumiose-protect'&&!w.interior){
      if(w.zaProtectLayout===5&&w.zaProtectTowerApproachV1&&w.zaProtectTowerApproach&&w.zaMission37Stage===7){ctx.fillStyle=c==='#'?'#404c57':c===','?'#92795f':(x+y)%2?'#a4a8b1':'#b9bdc5';ctx.fillRect(px,py,tile,tile);if(c==='#'){ctx.fillStyle='#64717c';ctx.fillRect(px,py+tile-4,tile,3);}else if(c===','){ctx.fillStyle='#bcaa88';ctx.fillRect(px,py+3,tile,3);ctx.fillRect(px,py+tile-6,tile,3);}else{ctx.fillStyle='#d0d3d6';ctx.fillRect(px,py+tile-2,tile,1);}if(c==='n'||c==='h'){ctx.fillStyle='#676d68';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.strokeStyle='#b8d4b2';ctx.lineWidth=2;ctx.strokeRect(px+7,py+7,tile-14,tile-14);}return;}
      if(w.zaProtectLayout===5&&w.zaProtectScaffoldV1&&w.zaProtectScaffoldUpper&&w.zaMission37Stage===4){ctx.fillStyle=c==='#'?'#535d61':'#b09a7f';ctx.fillRect(px,py,tile,tile);if(c==='#'){ctx.fillStyle='#859096';ctx.fillRect(px,py+tile-5,tile,3);ctx.fillRect(px+tile/2,py,2,tile-5);}else{ctx.fillStyle='#806e5e';ctx.fillRect(px,py+tile-4,tile,2);ctx.fillRect(px+tile/2,py,2,tile);ctx.fillStyle='#d6c4a9';ctx.fillRect(px,py+2,tile,2);}if(c==='h'||c==='l'||c==='j'){ctx.fillStyle='#5c6e70';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#e6d3a9';for(let j=0;j<4;j++)ctx.fillRect(px+7,py+6+j*5,tile-14,2);}if(c==='o'){ctx.fillStyle='#e8dfcf';ctx.fillRect(px+10,py+10,tile-20,tile-20);ctx.fillStyle='#d96b62';ctx.fillRect(px+10,py+10,tile-20,4);}if(w.zaProtectScaffoldPlatform&&x===19&&y===8){ctx.strokeStyle='#a5dce2';ctx.lineWidth=2;ctx.strokeRect(px+4,py+4,tile-8,tile-8);}return;}
      if(w.zaMission36DescentPending&&w.zaMission36RooftopRoute&&!w.zaMission36AtPlaza){ctx.fillStyle=c==='#'?'#444e5e':c===','?'#9d8a77':(x+y)%2?'#a4acb6':'#bac1c8';ctx.fillRect(px,py,tile,tile);if(c==='#'){ctx.fillStyle='#68717c';ctx.fillRect(px,py+tile-4,tile,3);}else if(c===','){ctx.fillStyle='#d8c1a2';ctx.fillRect(px,py+3,tile,2);ctx.fillRect(px,py+tile-5,tile,2);}else{ctx.fillStyle='#d3d9db';ctx.fillRect(px,py+tile-2,tile,1);}if(c==='h'||c==='X'){ctx.fillStyle='#725e50';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#e5d8bd';for(let j=0;j<4;j++)ctx.fillRect(px+7,py+6+j*5,tile-14,2);}return;}
      if([4,5].includes(w.zaProtectLayout)&&w.zaProtectCanal){ctx.fillStyle=c==='#'?'#536268':c==='~'?'#6ba8b4':'#b9ad97';ctx.fillRect(px,py,tile,tile);if(c==='h'){ctx.fillStyle='#776a5c';for(let j=0;j<4;j++)ctx.fillRect(px+3,py+4+j*6,tile-6,2);}return;}
      if(w.zaProtectLayout===5&&(w.zaProtectBuilding||w.zaProtectRoof)){
        ctx.fillStyle=c==='#'?'#505a64':c===','?'#b9a48c':c===':'?'#756f65':w.zaProtectRoof?((x+y)%2?'#aeb3bd':'#c1c5cd'):((x+y)%2?'#d0bfb0':'#ddcdbd');ctx.fillRect(px,py,tile,tile);
        if('ijgnh'.includes(c)){ctx.fillStyle=c==='i'?'#987858':c==='h'?'#98764e':'#735982';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(({i:'출입',h:'사다리',j:'건물',g:'옥상',n:'최종'} as Record<string,string>)[c],px+tile/2,py+20);}return;
      }
      const layout=[2,3,4,5].includes(w.zaProtectLayout),zone=y<8?(x<7?0:x<15?1:2):(x>15?3:x>7?4:5);
      const floors=[['#98b68d','#a4c19a'],['#bd9e79','#c9ad88'],['#a8b7b3','#b6c2bc'],['#bca68a','#cbb79d'],['#c7b2aa','#d4c1b7'],['#a5a8b7','#b2b5c4']];
      ctx.fillStyle=c==='#'?(layout&&zone===3?'#786b60':'#4e5364'):layout?floors[zone][(x+y)%2]:(x+y)%2?'#aca69e':'#bdb5a9';ctx.fillRect(px,py,tile,tile);
      if(layout&&zone===3&&c==='#'&&x>15&&x<22&&y>8&&y<16){ctx.fillStyle='#b79c7e';ctx.fillRect(px+3,py+5,tile-6,3);ctx.fillRect(px+5,py+tile-8,tile-10,3);}
      if(layout&&c!== '#'&&zone===1){ctx.fillStyle='rgba(113,75,48,.28)';ctx.fillRect(px,py+tile/2,tile,2);}
      if(layout&&c!== '#'&&zone===3){ctx.fillStyle='rgba(115,80,47,.25)';ctx.fillRect(px+4,py,2,tile);ctx.fillRect(px+tile-6,py,2,tile);}
      if(layout&&c!== '#'&&zone===5){ctx.fillStyle='rgba(68,74,98,.19)';ctx.fillRect(px,py+tile-3,tile,2);}
      if(c==='h'){ctx.fillStyle='#776a5c';for(let j=0;j<4;j++)ctx.fillRect(px+3,py+4+j*6,tile-6,2);}
      if('abekjgnXi'.includes(c)){ctx.fillStyle=c==='X'||c==='i'?'#8a5e50':'#735982';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(layout?(({a:'탈출',b:'공원',e:'다리',k:'비계',j:'건물',g:'옥상',n:'최종',X:'출구',i:'건물'} as Record<string,string>)[c]||'작전'):c==='X'?'출구':c==='n'?'최종':'작전',px+tile/2,py+20);}return;
    }
    if(w.district==='lumiose-crystal-sewer'&&!w.interior){ctx.fillStyle=c==='#'?'#526a6c':(x+y)%2?'#a1ada5':'#afbab0';ctx.fillRect(px,py,tile,tile);if(c==='g'){ctx.fillStyle='#6f8a7b';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#bdc9b6';ctx.fillRect(px+6,py+tile/2,tile-12,2);}if(c==='c'){ctx.fillStyle='#cc76b0';ctx.fillRect(px+8,py+4,tile-16,tile-8);ctx.fillStyle='#f9d3ed';ctx.fillRect(px+12,py+7,5,tile-14);}if(c==='X'){ctx.fillStyle='#8a5e50';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('출구',px+tile/2,py+20);}return;}
    if(w.district==='lumiose-ghost-house'&&!w.interior){ctx.fillStyle=c==='#'?'#6f666d':(x+y)%2?'#c9b7a8':'#d5c5b4';ctx.fillRect(px,py,tile,tile);if('qabnX'.includes(c)){ctx.fillStyle=c==='X'?'#8a5e50':'#77617f';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(({q:'고오스',a:'팬텀',b:'팬텀',n:'입주자',X:'출구'} as Record<string,string>)[c]||'',px+tile/2,py+20);}return;}
    if(w.district==='lumiose-sewer'&&!w.interior){
     // The investigation objects and ice bridge are documented in Mission 19.
     // Wall texture, pipe shapes and exact room geometry are 2D approximations.
     const branch=w.zaSewerIceBranch===true,inner=w.zaMission19Inner===true;
     if(c==='#'){
      ctx.fillStyle=inner?'#494755':'#465d60';ctx.fillRect(px,py,tile,tile);
      ctx.fillStyle=inner?'#686276':'#688083';ctx.fillRect(px+1,py+2,tile-2,tile-5);
      ctx.fillStyle=inner?'#8b8290':'#91a59f';ctx.fillRect(px+1,py+2,tile-2,3);
      ctx.fillStyle=inner?'#575262':'#50696a';ctx.fillRect(px,py+tile-5,tile,5);ctx.fillRect(px+(y%2?tile/2:1),py+6,2,tile-11);
      return;
     }
     if(c==='~'){
      ctx.fillStyle='#326b72';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#498991';ctx.fillRect(px,py+tile/2,tile,2);
      ctx.fillStyle='#8ab7b0';ctx.fillRect(px+3+(x*7+y*3)%7,py+7,10,2);ctx.fillRect(px+13,py+tile-9,10,2);return;
     }
     if(branch&&c===':'){
      ctx.fillStyle='#b8dfe5';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#eaf8f5';ctx.fillRect(px,py+3,tile,4);ctx.fillRect(px,py+tile-6,tile,3);
      ctx.fillStyle='#77b5c7';ctx.fillRect(px,py+tile/2,tile,2);ctx.fillRect(px+(x%2?8:20),py+8,2,tile-16);return;
     }
     ctx.fillStyle=inner?((x+y)%2?'#aaa2aa':'#b6afb3'):((x+y)%2?'#9baea6':'#a9bab0');ctx.fillRect(px,py,tile,tile);
     ctx.fillStyle=inner?'#8a818c':'#82978f';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:1),py+3,2,tile-5);
     if(branch&&c==='i'){
      ctx.fillStyle='#83bed0';ctx.beginPath();ctx.moveTo(px+tile/2,py+2);ctx.lineTo(px+tile-5,py+tile-5);ctx.lineTo(px+5,py+tile-5);ctx.closePath();ctx.fill();ctx.fillStyle='#e9faf8';ctx.fillRect(px+tile/2-2,py+7,3,13);
     }else if(c==='a'&&!branch&&!inner){
      ctx.fillStyle='#556d70';ctx.fillRect(px+5,py+3,tile-10,tile-6);ctx.fillStyle='#b9c2ad';ctx.fillRect(px+8,py+6,tile-16,tile-12);ctx.fillStyle='#d7ae6e';ctx.fillRect(px+10,py+10,4,4);ctx.fillRect(px+18,py+10,4,4);
     }else if(c==='b'&&!branch&&!inner){
      ctx.fillStyle='#5a6b68';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#97a79a';ctx.fillRect(px+6,py+7,tile-12,tile-14);ctx.fillStyle='#455c5d';for(let j=9;j<tile-6;j+=5)ctx.fillRect(px+8,py+j,tile-16,2);
     }else if(c==='e'&&!branch&&!inner){
      ctx.fillStyle='#697d77';ctx.fillRect(px+3,py+12,tile-6,8);ctx.fillStyle='#adc0ac';ctx.fillRect(px+3,py+12,tile-6,3);ctx.strokeStyle='#b65f4f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px+tile/2,py+16,6,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#b65f4f';ctx.fillRect(px+tile/2-1,py+8,2,16);
     }else if(c==='d'&&!branch&&!inner){
      ctx.fillStyle='#a58b6c';ctx.fillRect(px+4,py+5,tile-8,tile-10);ctx.fillStyle='#d4c19e';ctx.fillRect(px+5,py+6,tile-10,3);ctx.fillStyle='#705f50';ctx.fillRect(px+tile/2-1,py+8,2,tile-13);
     }else if(c==='t'||c==='X'){
      ctx.fillStyle='#526d68';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#bdcbb7';ctx.fillRect(px+5,py+5,tile-10,3);ctx.fillStyle='#d3d8c6';ctx.fillRect(px+tile/2-1,py+9,2,tile-14);
     }else if(c==='o'&&(branch||(x===3&&y===8)||(x===9&&y===14)||(x===19&&y===11))){
      ctx.fillStyle='#e6ebe3';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b95251';ctx.fillRect(px+tile/2-6,py+tile/2-5,12,4);ctx.fillStyle='#414d4d';ctx.fillRect(px+tile/2-6,py+tile/2,12,2);
     }
     return;
    }
    if(w.interior==='canariQuiz'){ctx.fillStyle=c==='#'?'#65736d':c===','?'#99c89a':c===';'?'#dc9b9b':'#d6d5bd';ctx.fillRect(px,py,tile,tile);if(c==='v'||c==='w'){ctx.fillStyle=c==='v'?'#3f9870':'#bc5660';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#fff';ctx.font='bold 18px sans-serif';ctx.textAlign='center';ctx.fillText(c==='v'?'O':'X',px+tile/2,py+23);}if(c==='X'){ctx.fillStyle='#927562';ctx.fillRect(px+4,py+4,tile-8,tile-8);}return;}
    if(w.interior==='cafeGallant'){ctx.fillStyle=c==='#'?'#907f71':(x+y)%2?'#dbd1bd':'#e8dfcc';ctx.fillRect(px,py,tile,tile);if(c==='k'){ctx.fillStyle='#a27555';ctx.fillRect(px+2,py+5,tile-4,tile-10);}if(c==='X'){ctx.fillStyle='#9b745b';ctx.fillRect(px+4,py+4,tile-8,tile-8);}return;}
    if(['racineGarage','racineRoom'].includes(w.interior)){ctx.fillStyle=c==='#'?'#747977':w.interior==='racineRoom'?(x+y)%2?'#d9cce0':'#e4d7e8':(x+y)%2?'#c8ccbe':'#d7d9ce';ctx.fillRect(px,py,tile,tile);if(c==='k'){ctx.fillStyle='#866c91';ctx.fillRect(px+2,py+5,tile-4,tile-10);}if(c==='u'||c==='X'){ctx.fillStyle=c==='u'?'#816c8c':'#927562';ctx.fillRect(px+4,py+4,tile-8,tile-8);}return;}
    if(w.interior==='lysandreCafe'){ctx.fillStyle=c==='#'?'#733d43':(x+y)%2?'#cfa8a1':'#e1bcb0';ctx.fillRect(px,py,tile,tile);if(c==='k'||c==='u'){ctx.fillStyle=c==='u'?'#6a3039':'#91645b';ctx.fillRect(px+2,py+3,tile-4,tile-6);if(c==='u'){ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('책장',px+tile/2,py+20);}}if(c==='X'){ctx.fillStyle='#a95850';ctx.fillRect(px+3,py+4,tile-6,tile-8);}return;}
    if(['lab','lumioseLab','lumioseDirector','sushi','quasarticoOffice'].includes(w.interior)||['hotel','hotel2f','hotel202','hotelRoof'].includes(w.interior)){
     ctx.fillStyle=c==='#'?(!['lab','lumioseLab','lumioseDirector'].includes(w.interior)?'#a78375':'#64817e'):(x+y)%2?'#e6e2cc':'#f0ecd9';ctx.fillRect(px,py,tile,tile);
     if(c==='#'){ctx.fillStyle=!['lab','lumioseLab','lumioseDirector'].includes(w.interior)?'#ddc0a1':'#a3bcb1';ctx.fillRect(px+3,py+4,tile-6,tile-8);}
     if(w.interior==='lumioseDirector'&&c==='k'){ctx.fillStyle='#87634c';ctx.fillRect(px,py+5,tile,tile-10);ctx.fillStyle='#c4a180';ctx.fillRect(px,py+5,tile,4);}
     if(w.interior==='sushi'&&c===';'){ctx.fillStyle=(x+y)%2?'#ac8581':'#bb9690';ctx.fillRect(px,py,tile,tile);ctx.strokeStyle='#e8d8b8';ctx.strokeRect(px+1,py+1,tile-2,tile-2);}
     if(w.interior==='hotelRoof'&&'12345'.includes(c)){ctx.fillStyle=({1:'#8b6a70',2:'#9b5844',3:'#8b6a70',4:'#765b48',5:'#70935c'} as Record<string,string>)[c];ctx.fillRect(px+3,py+5,tile-6,tile-9);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(({1:'의자',2:'화로',3:'소파',4:'탁자',5:'화분'} as Record<string,string>)[c],px+tile/2,py+20);}
     if(c==='i'||c==='o'||(c==='b'&&w.interior==='hotel2f')||(c==='z'&&w.interior==='hotel202')){ctx.fillStyle=c==='i'?'#796b82':c==='o'||c==='b'?'#875d46':'#af746f';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='i'?'승강기':c==='o'?'202':c==='b'?'객실':'침대',px+tile/2,py+20);}
     if(w.interior==='hotel202'&&c==='g'){ctx.fillStyle='#9b704c';ctx.fillRect(px+3,py+tile*.55,tile-6,tile*.27);ctx.fillStyle='#f6f4ed';ctx.beginPath();ctx.arc(px+tile/2,py+tile*.48,tile*.18,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d54845';ctx.beginPath();ctx.arc(px+tile/2,py+tile*.48,tile*.18,Math.PI,0);ctx.fill();ctx.strokeStyle='#34343a';ctx.lineWidth=1;ctx.beginPath();ctx.arc(px+tile/2,py+tile*.48,tile*.18,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(px+tile*.32,py+tile*.48);ctx.lineTo(px+tile*.68,py+tile*.48);ctx.stroke();}
     if(c==='X'){ctx.fillStyle='#a95850';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('출구',px+tile/2,py+21);}
     return;
    }
    if(w.district==='lumiose-zone4'&&['#','.','g',',','%','|','^'].includes(c)){
     // Dormez Bien cemetery: use the existing enclosure, graves and southern
     // crypt footprints. The exact path and architectural shapes are drafts.
     ctx.fillStyle=c==='#'?'#73847d':c==='g'?'#91ae82':c===','?'#c9c3b0':c==='|'?'#95a292':c==='%'?'#8ba880':c==='^'?'#adb6ab':(x+y)%2?'#d6d5c4':'#e1dfce';ctx.fillRect(px,py,tile,tile);
     if(c==='#'){
      ctx.fillStyle='#9aa9a0';ctx.fillRect(px+1,py+2,tile-2,tile-4);ctx.fillStyle='#71847d';ctx.fillRect(px,py+tile/2,tile,2);ctx.fillRect(px+(y%2?tile/3:tile*2/3),py+2,2,tile/2-2);ctx.fillStyle='#c9d0c0';ctx.fillRect(px,py,tile,2);
     }
     if(c===','){
      ctx.fillStyle='#e2ddca';ctx.fillRect(px+2,py+2,tile-4,tile-4);ctx.fillStyle='#aaa998';ctx.fillRect(px,py+tile-3,tile,2);ctx.fillRect(px+(y%2?tile/2:2),py+4,2,tile-7);
     }
     if(c==='g'){
      // Existing visual paths cross encounter grass; retain obvious grass.
      const vertical=(x===10&&y>=4&&y<=8)||(x===11&&y>=8&&y<=12)||(x===13&&y>=6&&y<=10),horizontal=(y===6&&x>=7&&x<=13)||(y===9&&x>=10&&x<=15)||(y===11&&x>=8&&x<=11);
      if(vertical||horizontal){ctx.fillStyle='#bcbba1';if(vertical)ctx.fillRect(px+tile*.35,py,tile*.30,tile);if(horizontal)ctx.fillRect(px,py+tile*.35,tile,tile*.30);}
      ctx.fillStyle='#5d885b';for(const [dx,dy] of [[5,6],[19,8],[9,20],[24,23],[15,14]]){ctx.fillRect(px+dx,py+dy,2,5);ctx.fillRect(px+dx-2,py+dy+2,3,2);}
     }
     if(c==='%'){
      ctx.fillStyle='#667c70';ctx.fillRect(px+3,py+23,tile-6,5);ctx.fillStyle='#c2c9ba';ctx.fillRect(px+5,py+20,tile-10,5);ctx.fillStyle='#aab7aa';ctx.fillRect(px+7,py+7,tile-14,14);ctx.fillRect(px+10,py+4,tile-20,4);ctx.fillStyle='#e2e2d1';ctx.fillRect(px+9,py+9,tile-18,2);ctx.fillRect(px+tile/2-1,py+8,2,9);
     }
     if(c==='|'){
      const vertical=x===5||x===17;ctx.fillStyle='#667b72';if(vertical)ctx.fillRect(px+tile/2-5,py,10,tile);else ctx.fillRect(px,py+tile/2-5,tile,10);ctx.fillStyle='#c8d0bd';if(vertical)ctx.fillRect(px+tile/2-4,py,3,tile);else ctx.fillRect(px,py+tile/2-4,tile,3);ctx.fillStyle='#e0e1d1';if(vertical)ctx.fillRect(px+tile/2-5,py+4,10,3);else ctx.fillRect(px+4,py+tile/2-5,3,10);
     }
     if(c==='^'){
      if(y===12){ctx.fillStyle='#627475';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#899994';ctx.fillRect(px,py+5,tile,4);ctx.fillRect(px,py+15,tile,3);ctx.fillStyle='#d1d2c3';ctx.fillRect(px,py+tile-5,tile,5);ctx.fillStyle='#9aa8a1';ctx.fillRect(px+tile-3,py+4,2,tile-9);}
      else{ctx.fillStyle='#d6d8c9';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#a8b2a8';ctx.fillRect(px,py+tile-4,tile,4);ctx.fillStyle='#798d86';ctx.fillRect(px+8,py+7,tile-16,tile-11);ctx.fillStyle='#dae1d1';ctx.fillRect(px+11,py+9,3,tile-17);ctx.fillRect(px+tile/2,py+7,2,tile-13);if(x===15||x===16){ctx.fillStyle='#5c6c66';ctx.fillRect(px+7,py+8,tile-14,tile-8);ctx.fillStyle='#e5dfce';ctx.fillRect(px+tile/2-1,py+10,2,tile-10);}}
     }return;}
    if(w.district==='lumiose-rust'||w.district==='lumiose'||w.district==='lumiose-floral'||w.district==='lumiose-vernal'||w.district==='lumiose-vert-plaza'||w.district==='lumiose-vert2'||w.district==='lumiose-centrico-route'||w.district==='lumiose-rouge-north'||w.district==='lumiose-north-boulevard'||w.district==='lumiose-quasartico'||w.district==='lumiose-rooftop'||w.district==='lumiose-zone1'||w.district==='lumiose-zone2'||w.district==='lumiose-zone3'||w.district==='lumiose-zone4'||w.district==='lumiose-bureau'||w.district==='lumiose-garden'||w.district==='lumiose-site'||w.district==='lumiose-wild'||w.district==='lumiose-observation'||w.district==='lumiose-royale'){
     ctx.fillStyle=w.district==='lumiose-zone3'?((x+y)%2?'#ddd2ba':'#e8dec9'):((x+y)%2?'#e7dfce':'#ded7c5');ctx.fillRect(px,py,tile,tile);
     // Southern Street crosses Zone 1 from west to east. Only ordinary floor
     // and existing road tiles are paved: grass and event tiles retain their
     // appearance and behaviour. Exact width and pavement are provisional.
     if(w.district==='lumiose-zone1'&&!w.interior&&x>0&&x<22){
      if(y===8&&(c==='.'||c===',')){
       ctx.fillStyle='#7e8783';ctx.fillRect(px,py,tile,tile);
       ctx.fillStyle='#aeb5a9';ctx.fillRect(px,py+2,tile,2);ctx.fillRect(px,py+tile-4,tile,2);
       if(x%3===1){ctx.fillStyle='#e3ddc4';ctx.fillRect(px+5,py+tile/2-1,tile-10,2);}
      }else if((y===7||y===9)&&c==='.'){
       ctx.fillStyle='#ccc6b4';ctx.fillRect(px,py,tile,tile);
       ctx.fillStyle='#afa998';ctx.fillRect(px,py+tile-2,tile,2);ctx.fillRect(px+(y%2?tile/2:1),py+3,2,tile-5);
      }
     }
     // Hotel Z's paved forecourt, drawn on existing walkable tiles only.
     if(w.district==='lumiose'&&c==='.') {ctx.fillStyle=(x+y)%2?'#ded7c7':'#e7e0d0';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#cfc7b7';ctx.fillRect(px,py+tile-2,tile,1);ctx.fillRect(px+(y%2?tile/2:1),py+2,1,tile-4);if(x>=10&&x<=12&&y>=6&&y<=14){ctx.fillStyle='#c7bca9';ctx.fillRect(px,py,tile,2);ctx.fillStyle='#f0e9d9';ctx.fillRect(px+2,py+3,tile-4,tile-5);}}

     if(w.district==='lumiose-royale'&&w.zaRoyaleRank==='B'&&((c==='a'&&x===3&&y===5)||(c==='b'&&x===19&&y===11))){ctx.fillStyle='#ad656b';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('대전',px+tile/2,py+20);return;}
     if(w.district==='lumiose-royale'&&['D','C'].includes(w.zaRoyaleRank)&&c==='a'&&x===3&&y===5){ctx.fillStyle='#ad656b';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('대전',px+tile/2,py+20);return;}
     if(w.district==='lumiose-royale'&&w.zaRoyaleRank==='E'&&c==='a'&&x===3&&y===5){ctx.fillStyle='#ad656b';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('대전',px+tile/2,py+20);return;}
     if(w.district==='lumiose-royale'&&w.zaRoyaleRank==='F'&&((c==='a'&&x===3&&y===5)||(c==='b'&&x===19&&y===11))){ctx.fillStyle='#ad656b';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('대전',px+tile/2,py+20);return;}
     if(w.district==='lumiose-royale'&&w.zaRoyaleRank==='V'&&((c==='a'&&x===3&&y===5)||(c==='b'&&x===19&&y===11)||(c==='e'&&x===12&&y===5)||(c==='t'&&x===3&&y===11)||(c==='j'&&x===9&&y===11)||(c==='k'&&x===15&&y===11)||(c==='n'&&x===19&&y===5))){ctx.fillStyle='#ad656b';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('대전',px+tile/2,py+20);return;}
     if(w.district==='lumiose-rust'&&c===','){ctx.fillStyle='#c3c1b6';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#deddd2';ctx.fillRect(px+4,py+tile-5,tile-8,2);}
     if(c===','&&['lumiose-zone3','lumiose-zone4'].includes(w.district)){ctx.fillStyle='#cfc2aa';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#e5dac7';ctx.fillRect(px,py+tile-3,tile,2);}
     // Zone 1's east–west street continues through the ordinary floor on
     // either side of the encounter grass. Its exact width is provisional.
     if(w.district==='lumiose-zone1'&&c==='%'){ctx.fillStyle=y===5?'#8e8275':'#d3c1a8';ctx.fillRect(px,py,tile,tile);ctx.fillStyle=y===5?'#b4a08a':'#77918a';ctx.fillRect(px+4,py+5,tile-8,tile-10);if(y===6){ctx.fillStyle=x%2?'#e7d8ba':'#b16c5e';ctx.fillRect(px+2,py+2,tile-4,5);}}
     if(w.district==='lumiose-vert-plaza'&&c===','){ctx.fillStyle=(x+y)%2?'#d0c4af':'#dbd0bc';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#eee4d2';ctx.fillRect(px+2,py+tile-3,tile-4,1);}
     if(w.district==='lumiose-vert-plaza'&&c==='%'){ctx.fillStyle=y===2||y===12?'#917f71':'#c4b5a1';ctx.fillRect(px,py,tile,tile);ctx.fillStyle=y===2||y===12?'#b2a08c':'#79918a';ctx.fillRect(px+5,py+6,tile-10,tile-12);}
     if(w.district==='lumiose-zone3'&&!w.zaZone3TowerUpper&&c==='^'&&x===17&&y===12){
      // Roserade-like stone figure and pedestal; exact sculpture is provisional.
      ctx.fillStyle='#b6b7a7';ctx.fillRect(px+4,py+tile-7,tile-8,5);ctx.fillStyle='#73877a';ctx.fillRect(px+11,py+12,10,14);ctx.fillRect(px+7,py+13,18,4);
      ctx.fillStyle='#c9d2c4';ctx.fillRect(px+9,py+6,14,9);ctx.fillRect(px+12,py+2,8,5);ctx.fillStyle='#809b87';ctx.fillRect(px+5,py+10,5,5);ctx.fillRect(px+22,py+10,5,5);
     }
     if(w.district==='lumiose-zone3'&&!w.zaZone3TowerUpper&&c==='o'&&x===16&&y===12){ctx.fillStyle='#f7ede1';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c95757';ctx.fillRect(px+tile/2-6,py+tile/2-5,12,5);ctx.fillStyle='#52605c';ctx.fillRect(px+tile/2-6,py+tile/2,12,2);}
     if(w.district==='lumiose-zone3'&&c==='.'){
      ctx.fillStyle='#cfc2aa';if((x+y)%2===0)ctx.fillRect(px+3,py+tile/2,tile-6,1);
      ctx.fillRect(px+tile/2,py+3,1,5);ctx.fillRect(px+tile/2,py+tile-8,1,5);
     }
     if(c==='%'&&w.district==='lumiose-vernal'&&!w.zaVernalEastRoof&&!w.zaVernalSlowbroBank){const cafe=x>=10&&x<=14;ctx.fillStyle=cafe?'#ad6b5a':'#8e8174';ctx.fillRect(px,py,tile,tile);ctx.fillStyle=cafe?(y===2?'#854d48':'#e0c3a0'):'#d9cbb7';ctx.fillRect(px+2,py+2,tile-4,tile-4);if(cafe&&y===4){ctx.fillStyle='#a74e49';ctx.fillRect(px+2,py+2,tile-4,7);ctx.fillStyle='#f9e9ce';for(let j=4;j<tile-3;j+=8)ctx.fillRect(px+j,py+2,4,7);ctx.fillStyle='#789796';ctx.fillRect(px+5,py+12,tile-10,tile-16);}else{ctx.fillStyle=cafe&&y===2?'#c68872':'#9ab1a8';ctx.fillRect(px+5,py+7,tile-10,tile-13);}}
     if(c===','&&w.district==='lumiose-vernal'){ctx.fillStyle=(x+y)%2?'#dfc4a1':'#e9d2b2';ctx.fillRect(px,py,tile,tile);ctx.strokeStyle='#b69677';ctx.strokeRect(px+.5,py+.5,tile-1,tile-1);if(y===7&&(x===10||x===14)){ctx.fillStyle='#8b6a55';ctx.fillRect(px+12,py+12,8,8);ctx.fillStyle='#fbedd9';ctx.fillRect(px+13,py+13,6,6);}}
     if(w.district==='lumiose-north-boulevard'&&c==='q'&&x===14&&y===3){ctx.fillStyle='#d7ccb4';ctx.fillRect(px+2,py+2,tile-4,tile-4);ctx.fillStyle='#816d69';ctx.fillRect(px+6,py+5,tile-12,tile-10);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('호텔',px+tile/2,py+20);}
     if(w.district==='lumiose-north-boulevard'&&c==='d'&&x===15&&y===8){ctx.fillStyle='#879772';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#7b3488';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('사건',px+tile/2,py+20);}
     if((c===','||c===';')&&['lumiose-centrico-route','lumiose-rouge-north','lumiose-north-boulevard'].includes(w.district)){ctx.fillStyle='#737c7b';ctx.fillRect(px,py,tile,tile);if(c===';'){ctx.fillStyle='#e5e2d4';for(let i=3;i<tile;i+=8)ctx.fillRect(px+3,py+i,tile-6,4);}else if(y===8&&x%3===0){ctx.fillStyle='#dfddd0';ctx.fillRect(px+5,py+tile/2-1,tile-10,2);}}
     if(c==='%'&&w.district==='lumiose-zone4'){ctx.fillStyle='#90aa80';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#7d8580';ctx.fillRect(px+6,py+10,tile-12,tile-14);ctx.fillRect(px+9,py+6,tile-18,5);ctx.fillStyle='#d3d6ca';ctx.fillRect(px+8,py+12,tile-16,3);ctx.fillRect(px+tile/2-1,py+10,2,8);}
     // Cemetery chapel: use only its existing blocked footprint. Shape is a draft.
     if(c==='^'&&w.district==='lumiose-zone4'){
      ctx.fillStyle=y===12?'#596b6d':'#d2d0c4';ctx.fillRect(px,py,tile,tile);
      if(y===12){ctx.fillStyle='#7b8b89';for(let i=4;i<tile;i+=7)ctx.fillRect(px+2,py+i,tile-4,2);ctx.fillStyle='#a6b1a9';ctx.fillRect(px,py+tile-5,tile,5);}
      else{ctx.fillStyle='#aaa99d';ctx.fillRect(px,py+tile-4,tile,4);ctx.fillStyle='#647979';ctx.fillRect(px+8,py+6,tile-16,tile-10);ctx.fillStyle='#bdcec4';ctx.fillRect(px+11,py+9,3,tile-16);ctx.fillRect(px+tile/2,py+7,2,tile-12);if(x===15||x===16){ctx.fillStyle='#5a605d';ctx.fillRect(px+8,py+9,tile-16,tile-9);ctx.fillStyle='#d9d7c8';ctx.fillRect(px+tile/2-1,py+11,2,tile-11);}}
     }
     if(c==='#'){ctx.fillStyle=w.district==='lumiose-zone3'?'#547e60':'#8e9c91';ctx.fillRect(px,py,tile,tile);if(w.district==='lumiose-zone3'){ctx.fillStyle='#78a47a';ctx.fillRect(px+3,py+5,tile-6,4);ctx.fillRect(px+5,py+tile-9,tile-10,3);}}if(w.district==='lumiose-zone2'&&c==='#'&&(x===0||x===22||y===0||y===16)){ctx.fillStyle='#5b805c';ctx.fillRect(px,py,tile,tile);sprite((x+y)%2?'tree':'treeRound',px,py);}if(c==='r'){ctx.fillStyle='#757b78';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,tile*.4,tile*.33,-.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c7cbc5';ctx.fillRect(px+8,py+10,9,3);}
     if(w.district==='lumiose-rust'&&c==='#'&&x>0&&x<22&&y>0&&y<16){ctx.fillStyle=y===2?'#292e32':'#464b4b';ctx.fillRect(px,py,tile,tile);ctx.fillStyle=y===2?'#858681':'#696c68';ctx.fillRect(px+2,py+tile-5,tile-4,3);}
     if(w.district==='lumiose-rouge-north'&&c==='h'){ctx.fillStyle='#767a76';ctx.fillRect(px+5,py+3,tile-10,tile-6);ctx.fillStyle='#d8d3c5';ctx.fillRect(px+5,py+9,tile-10,3);ctx.fillRect(px+5,py+19,tile-10,3);}
     if(w.district==='lumiose-rust'&&c==='l'){ctx.fillStyle='#806044';ctx.fillRect(px+6,py+4,tile-12,tile-8);}
     if(w.district==='lumiose-rust'&&c==='^'){if(y===8){ctx.fillStyle='#727a78';ctx.fillRect(px+5,py+tile-9,tile-10,6);ctx.fillStyle=x===8?'#7f8480':'#697a75';ctx.fillRect(px+10,py+7,tile-20,tile-16);ctx.fillRect(px+8,py+4,tile-16,5);ctx.fillStyle='#c9cebf';ctx.fillRect(px+12,py+8,3,3);ctx.fillRect(px+tile-15,py+8,3,3);}else{ctx.fillStyle='#55794e';for(let j=0;j<3;j++)ctx.fillRect(px+7+j*7,py+4+(j%2)*3,3,tile-9);ctx.fillStyle='#a4bd7e';ctx.fillRect(px+4,py+9,tile-8,3);ctx.fillRect(px+8,py+18,tile-12,3);}}
     if(w.district==='lumiose-rust'&&c==='|'){ctx.fillStyle='#555b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);ctx.fillStyle='#9a9d92';ctx.fillRect(px+4,py+5,tile-8,3);}
     // Draft court surface near Centrico Center; the tile remains walkable.
     if(w.district==='lumiose-centrico-route'&&x>=14&&x<=20&&y>=2&&y<=4&&(c===';'||c==='o')){ctx.fillStyle='#b77d69';ctx.fillRect(px,py,tile,tile);ctx.strokeStyle='#f2e2ce';ctx.lineWidth=2;if(x===14||x===20||y===2||y===4)ctx.strokeRect(px+2,py+2,tile-4,tile-4);if(x===17){ctx.beginPath();ctx.moveTo(px+tile/2,py);ctx.lineTo(px+tile/2,py+tile);ctx.stroke();}}
     if(w.district==='lumiose-centrico-route'&&c==='G'){ctx.fillStyle='#8d9e8e';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#4d846f';ctx.fillRect(px+2,py+5,4,tile-10);ctx.fillRect(px+tile-6,py+5,4,tile-10);ctx.fillStyle='#8bd6a5';ctx.fillRect(px+6,py+7,tile-12,3);ctx.fillStyle='#f0fff2';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText(y===4?'북문':x===3?'서문':'동문',px+tile/2,py+22);}
     if(c==='k'||c==='K'){ctx.fillStyle=c==='K'?'#79a36d':w.district==='lumiose-zone3'?'#78a66f':'#a6c692';ctx.fillRect(px+2,py+2,tile-4,tile-4);if(c==='K'||w.district==='lumiose-zone3'){ctx.fillStyle=c==='K'?'#fff3be':'#e7c6b4';ctx.fillRect(px+8,py+10,4,4);ctx.fillRect(px+20,py+16,4,4);}}
     if(c==='k'&&w.district==='lumiose-zone1'){ctx.fillStyle='#92b97c';ctx.fillRect(px,py,tile,tile);sprite('grassDetail',px,py);}
     if(c==='~'||c==='w'){
      ctx.fillStyle=w.district==='lumiose-zone2'?(c==='w'?'#91c7bf':'#68a8af'):(c==='w'?'#a0ccd0':'#76abc1');ctx.fillRect(px,py,tile,tile);
      if(w.district==='lumiose-zone2'){
       const e=zone2WaterEdges(w.map,x,y),edge=Math.max(3,Math.floor(tile/8));
       ctx.fillStyle='#9bc6b7';if(e.north)ctx.fillRect(px,py,tile,edge);if(e.south)ctx.fillRect(px,py+tile-edge,tile,edge);if(e.west)ctx.fillRect(px,py,edge,tile);if(e.east)ctx.fillRect(px+tile-edge,py,edge,tile);
       ctx.fillStyle='#bedbd0';const ripple=(x*13+y*7)%11;ctx.fillRect(px+7+ripple,py+Math.floor(tile*.58),7,2);if((x+y)%3===0)ctx.fillRect(px+4,py+Math.floor(tile*.33),5,2);
      }else if(c==='w'){ctx.fillStyle='#d8eeee';ctx.fillRect(px+5,py+15,tile-10,2);}
     }
     if(c==='='&&w.district==='lumiose-zone2'){
      // Wooden crossings are documented; the three 2D axes are still provisional.
      const vertical=zone2BridgeAxis(w.map,x,y);ctx.fillStyle='#a5794e';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#d1ad78';
      for(let i=4;i<tile;i+=7)vertical==='vertical'?ctx.fillRect(px+3,py+i,tile-6,2):ctx.fillRect(px+i,py+3,2,tile-6);
      const rails=zone2BridgeRails(w.map,x,y);ctx.fillStyle='#725238';if(rails.west)ctx.fillRect(px+1,py,3,tile);if(rails.east)ctx.fillRect(px+tile-4,py,3,tile);if(rails.north)ctx.fillRect(px,py+1,tile,3);if(rails.south)ctx.fillRect(px,py+tile-4,tile,3);
     }
     if(c===':'&&w.district==='lumiose-centrico-route'){ctx.fillStyle='#b9ac99';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#e6dccb';for(let i=4;i<tile;i+=8)ctx.fillRect(px,py+i,tile,2);}
     if(c==='j'&&w.district==='lumiose-vernal'&&x===20&&y===10){ctx.fillStyle='#867463';ctx.fillRect(px+4,py+5,tile-8,tile-10);ctx.fillStyle='#eee1c8';for(let i=0;i<3;i++)ctx.fillRect(px+6,py+8+i*6,tile-12,2);}
     if(c==='l'&&w.district==='lumiose-vernal'&&x===18&&y===4){ctx.fillStyle='#806044';ctx.fillRect(px+6,py+4,tile-12,tile-8);}
     if(c==='l'&&w.district==='lumiose-vert2'){ctx.fillStyle='#806044';ctx.fillRect(px+6,py+4,tile-12,tile-8);}
     if(c==='h'&&w.district==='lumiose-zone2'){ctx.fillStyle='#917d60';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#e9ddbc';for(let j=0;j<3;j++)ctx.fillRect(px+5,py+7+j*7,tile-10,2);}
     if(c===':'&&['lumiose-zone2','lumiose-vert2'].includes(w.district)){ctx.fillStyle='#c9c2ae';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#8f8a7c';for(let i=5;i<tile;i+=8)ctx.fillRect(px,py+i,tile,2);}
     if(c===';'&&w.district==='lumiose-zone2'){ctx.fillStyle='#b5aa90';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#ded6be';ctx.fillRect(px+2,py+2,tile-4,tile-7);ctx.fillStyle='#837f70';ctx.fillRect(px+2,py+tile-5,tile-4,3);}
     if(c==='g'){
      ctx.fillStyle=w.district==='lumiose-zone3'?((x+y)%2?'#8bb97d':'#98c68a'):'#92b97c';ctx.fillRect(px,py,tile,tile);
      if(!['lumiose-zone2','lumiose-zone3'].includes(w.district))sprite('bush',px,py);
      sprite('grassDetail',px,py);
      // Grass remains an encounter tile. The narrow, provisional paths are visual overlays.
      const gardenGrassPath=w.district==='lumiose-zone3'&&y===8&&(x===9||x===13);
      let cemeteryGrassPath=false;
      if(gardenGrassPath){ctx.fillStyle='#d5c8ae';ctx.fillRect(px,py+tile*.39,tile,tile*.22);}
      if(w.district==='lumiose-zone4'){
       const vertical=(x===10&&y>=4&&y<=8)||(x===11&&y>=8&&y<=12)||(x===13&&y>=6&&y<=10);
       const horizontal=(y===6&&x>=7&&x<=13)||(y===9&&x>=10&&x<=15)||(y===11&&x>=8&&x<=11);
       cemeteryGrassPath=vertical||horizontal;
       if(cemeteryGrassPath){ctx.fillStyle='#bdb79b';if(vertical)ctx.fillRect(px+tile*.39,py,tile*.22,tile);if(horizontal)ctx.fillRect(px,py+tile*.39,tile,tile*.22);}
      }
      // Grass on top of each path signals that the underlying encounter rule still applies.
      if(gardenGrassPath||cemeteryGrassPath){ctx.fillStyle='#4c814b';for(const [dx,dy] of [[.43,.45],[.54,.56],[.60,.42]])ctx.fillRect(px+tile*dx,py+tile*dy,2,3);}
      // Ground mosaics, sampled only inside existing encounter grass tiles;
      // their source-inspired shapes and exact positions remain provisional.
      if(w.district==='lumiose-zone3'&&!gardenGrassPath&&((x>=7&&x<=9)||(x>=13&&x<=15))&&((y>=5&&y<=7)||(y>=9&&y<=11))){
       const colors:Record<string,string>={bud:'#c2d38e',leaf:'#6f9c6d','rose-red':'#d9a5a0','rose-blue':'#a1b8d0'};
       const cell=tile/8;
       for(let iy=0;iy<8;iy++)for(let ix=0;ix<8;ix++){
        const part=zone3GardenPattern(x+(ix+.5)/8,y+(iy+.5)/8);
        if(part){ctx.fillStyle=colors[part];ctx.fillRect(px+ix*cell,py+iy*cell,Math.ceil(cell),Math.ceil(cell));}
       }
      }
      if(w.district==='lumiose-zone3'&&(x+y)%3===0){ctx.fillStyle='#f4ddd0';ctx.fillRect(px+7,py+9,3,3);ctx.fillRect(px+22,py+19,3,3);}
     }
     if(('HMJ'.includes(c)&&!(c==='H'&&w.district==='lumiose-zone3'))||(c==='P'&&w.district==='lumiose-floral')||(c==='l'&&w.district==='lumiose-rouge-north'))buildings.push({x,y,kind:c});
     if(c==='|'&&w.district==='lumiose-zone4'){const vertical=x===5||x===17;ctx.fillStyle='#8c948a';if(vertical)ctx.fillRect(px+tile/2-3,py,6,tile);else ctx.fillRect(px,py+tile/2-3,tile,6);ctx.fillStyle='#cbd0be';if(vertical)ctx.fillRect(px+tile/2-1,py+2,2,tile-4);else ctx.fillRect(px+2,py+tile/2-1,tile-4,2);}
     if(c==='|'&&w.district==='lumiose-zone3'){
      const vertical=x===9||x===13||x===6||x===16;ctx.fillStyle='#407a51';
      if(vertical){ctx.fillRect(px+tile/2-3,py,6,tile);ctx.fillStyle='#9ecb92';ctx.fillRect(px+tile/2-1,py+2,2,tile-4);}
      else{ctx.fillRect(px,py+tile/2-3,tile,6);ctx.fillStyle='#9ecb92';ctx.fillRect(px+2,py+tile/2-1,tile-4,2);}
     }
     // A monumental arch faces the central garden. Its precise orientation,
     // dimensions and placement are not established: this is a visual draft.
     // Reuse existing fence piers and leave the three path cells passable.
     if(w.district==='lumiose-zone3'&&!w.zaZone3TowerUpper&&y===4&&x>=9&&x<=13){
      ctx.fillStyle='#777d78';ctx.fillRect(px,py+3,tile,8);
      ctx.fillStyle='#d4cbbb';ctx.fillRect(px,py+2,tile,6);
      ctx.fillStyle='#eee5d2';ctx.fillRect(px,py+2,tile,2);
      ctx.fillStyle='#a59d8c';ctx.fillRect(px,py+8,tile,3);
      if(x===9||x===13){
       ctx.fillStyle='#8a8d82';ctx.fillRect(px+tile*.25,py+6,tile*.5,tile-7);
       ctx.fillStyle='#dcd4c0';ctx.fillRect(px+tile*.30,py+6,tile*.4,tile-10);
       ctx.fillStyle='#f0e8d5';ctx.fillRect(px+tile*.25,py+8,tile*.5,3);
       ctx.fillStyle='#a49b89';ctx.fillRect(px+tile*.25,py+tile-5,tile*.5,4);
      }
     }
     if(c==='l'&&w.district==='lumiose-zone1'){ctx.fillStyle='#73503a';ctx.fillRect(px+7,py+3,4,tile-6);ctx.fillRect(px+tile-11,py+3,4,tile-6);ctx.fillStyle='#e1c18d';for(let j=7;j<tile-5;j+=6)ctx.fillRect(px+9,py+j,tile-18,3);}
     if(c==='i'&&w.district==='lumiose-zone3'){
      ctx.fillStyle='#bbb8a8';ctx.fillRect(px+4,py+8,tile-8,tile-10);ctx.fillStyle='#f5efdf';ctx.fillRect(px+6,py+5,tile-12,tile-10);ctx.fillStyle='#858d89';ctx.fillRect(px+4,py+4,tile-8,4);ctx.fillRect(px+9,py+1,tile-18,4);ctx.fillStyle='#617b76';ctx.fillRect(px+tile/2-3,py+12,6,12);ctx.fillStyle='#ded7c5';ctx.fillRect(px+4,py+tile-6,tile-8,3);
     }
     if(c==='H'&&w.district==='lumiose-zone3'){ctx.fillStyle='#e4d8b9';ctx.fillRect(px+2,py+10,tile-4,tile-10);ctx.fillStyle='#cc6559';ctx.fillRect(px+1,py+5,tile-2,7);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('회복',px+tile/2,py+24);}
     if(c==='a'&&!w.zaWildAlphaSpent){ctx.fillStyle='#8e4939';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,tile*.38,tile*.30,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';const arrow=({up:'↑',down:'↓',left:'←',right:'→'} as any)[wildAlphaPosition(w).facing];ctx.fillText((w.zaWildAlphaAlert?'!':'왕')+arrow,px+tile/2,py+20);}if(c==='T'){ctx.fillStyle='#769b88';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('광장',px+tile/2,py+20);}
     if(c==='f'&&w.district==='lumiose-floral'){ctx.fillStyle='#537b85';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('북쪽',px+tile/2,py+20);}
     if(c==='s'&&w.district==='lumiose'){
      // Wild Zone 1's entrance is a green holographic barrier, not a building.
      ctx.fillStyle='#d1dbc5';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#4a8272';ctx.fillRect(px+2,py+5,4,tile-9);ctx.fillRect(px+tile-6,py+5,4,tile-9);
      ctx.fillStyle='#a5edbb';ctx.fillRect(px+6,py+6,tile-12,3);ctx.fillStyle='#64c99a';ctx.fillRect(px+7,py+10,tile-14,tile-16);
      ctx.fillStyle='#e5fff0';for(let i=10;i<tile-7;i+=7)ctx.fillRect(px+i,py+10,2,tile-16);
     }
     if(c==='d'){ctx.fillStyle='#273e35';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,11,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText('?',px+tile/2,py+21);}
     if((c==='o'||c==='d')&&w.district==='lumiose-centrico-route'){ctx.fillStyle='#716589';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='o'?'SBC':'은행',px+tile/2,py+20);}
     if(c==='h'||c==='c'||c==='x'){ctx.fillStyle=c==='c'?'#d67aad':'#786884';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='c'?'결정':c==='x'?'교환':w.district==='lumiose-vernal'?'분수':'옥상',px+tile/2,py+20);}
     if(w.district==='lumiose-vernal'&&((x===7&&[3,5,7].includes(y))||(x===16&&[3,5,7].includes(y)))){const color=c==='n'?'#5c9090':c==='p'?'#8e6696':c==='a'?'#5584a1':c==='o'?'#ac6d57':c==='e'?'#c18b9b':'#7d9874';ctx.fillStyle='#e8d8c1';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle=color;ctx.fillRect(px+3,py+3,tile-6,7);ctx.fillStyle='#f7eddb';for(let j=5;j<tile-4;j+=8)ctx.fillRect(px+j,py+3,4,7);ctx.fillStyle='#709493';ctx.fillRect(px+6,py+13,tile-12,tile-17);ctx.fillStyle='#e7d7a7';ctx.fillRect(px+tile/2-2,py+15,4,4);}
     if(['lumiose-rouge-north','lumiose-north-boulevard'].includes(w.district)&&c==='j'){ctx.fillStyle='#936e40';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('승강',px+tile/2,py+20);}
     if((c==='v'&&['lumiose-vernal','lumiose-rouge-north'].includes(w.district))||(c==='z'&&w.district==='lumiose-vernal')||(c==='m'&&w.district==='lumiose-rooftop')){ctx.fillStyle='#735982';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='z'?'하수도':c==='v'&&w.district==='lumiose-vernal'?'사무소':'사건',px+tile/2,py+20);}
     if('abegkjl'.includes(c)&&w.district==='lumiose-lysandre-lab'){ctx.fillStyle='#735982';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='l'?'승강기':'조사',px+tile/2,py+20);}
     if(c==='0'&&w.district==='lumiose-zone3'&&w.zaMission40Stage===1&&!w.zaMission40Anomalies?.includes('steelix')){ctx.fillStyle='#9a5a4a';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('조사',px+tile/2,py+20);}
     if(c==='0'&&w.district==='lumiose-rouge-north'&&w.zaMission41Stage===3){ctx.fillStyle='#735982';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('옥상',px+tile/2,py+20);}
     if(c==='0'&&w.district==='lumiose-site'&&[3,4,5].includes(w.zaMission35Stage)){ctx.fillStyle='#735982';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('카페',px+tile/2,py+20);}
     if(c==='6'&&w.zaMission31Stage>=3){ctx.fillStyle='#735982';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('사건',px+tile/2,py+20);}
     if('789'.includes(c)&&w.zaMission26Stage>=3){ctx.fillStyle='#735982';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('사건',px+tile/2,py+20);}
     if(c==='b'&&w.district==='lumiose-vernal'){ctx.fillStyle='#775e70';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('빈집',px+tile/2,py+20);}
     if(c==='t'&&w.district==='lumiose-rouge-north'){ctx.fillStyle='#667c99';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('시청',px+tile/2,py+20);}
     if(c==='p'&&w.district!=='lumiose-vernal'){ctx.fillStyle='#94534b';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,tile*.38,tile*.3,0,0,Math.PI*2);ctx.fill();const alpha=w.district==='lumiose-zone2'?{id:'zone2-island',species:props.current.period==='night'?120:129}:w.district==='lumiose-zone4'?{id:'zone4-spinarak',species:167}:w.district==='lumiose-zone1-roof'?{id:'zone1-roof-pidgey',species:16}:w.district==='lumiose-zone3'&&w.zaZone3TowerUpper?{id:'zone3-roof-fletchling',species:661}:null;if(alpha){const img=w.zaWildShinyRolls?.[`alpha:${alpha.id}:${alpha.species}`]===true?shinyFieldImages[alpha.species]:fieldImages[alpha.species];if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-10,py-18,tile+20,tile+20);else{ctx.fillStyle='#e2b3a7';ctx.fillRect(px+8,py+8,tile-16,tile-12);}}else{ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('왕',px+tile/2,py+20);}}
     if(c==='z'&&w.district!=='lumiose-vernal'){ctx.fillStyle='#777d73';ctx.fillRect(px+5,py+4,tile-10,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('묘지',px+tile/2,py+20);}
     if(c==='y'&&w.district==='lumiose-quasartico'){const img=fieldImages[702];if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-4,py-8,tile+8,tile+8);else{ctx.fillStyle='#dfaa45';ctx.fillRect(px+8,py+8,tile-16,tile-12);}}
     if((c==='t'&&w.district==='lumiose-north-boulevard')||(c==='m'&&w.district==='lumiose-centrico-route')){ctx.fillStyle=c==='t'?'#667c99':'#ac7255';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='t'?'퀴즈':'갈랑',px+tile/2,py+20);}
     if(w.district==='lumiose-vernal'&&c==='l'&&x===12&&y===4){ctx.fillStyle='#88643e';ctx.fillRect(px+8,py+3,tile-16,tile-6);ctx.fillStyle='#e3c49e';for(let j=0;j<3;j++)ctx.fillRect(px+8,py+7+j*7,tile-16,2);}
     if(c==='q'&&w.district!=='lumiose-north-boulevard'){const cafe=w.district==='lumiose-vernal'||w.district==='lumiose-centrico-route';ctx.fillStyle=cafe?'#a44c45':'#6e7780';ctx.fillRect(px+3,py+3,tile-6,tile-6);if(cafe){ctx.fillStyle='#f4e2c9';for(let i=5;i<tile-4;i+=8)ctx.fillRect(px+i,py+4,4,5);ctx.fillStyle='#dac4aa';ctx.fillRect(px+5,py+tile-7,tile-10,3);}ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(cafe?'카페':'골목',px+tile/2,py+20);}
     if(c==='%'&&w.district==='lumiose-centrico-route'){
      // One continuous footprint for Prism Tower, rather than nine separate buildings.
      ctx.fillStyle='#a8bab8';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#789396';
      if(x===10)ctx.fillRect(px,py,4,tile);if(x===12)ctx.fillRect(px+tile-4,py,4,tile);
      if(y===11)ctx.fillRect(px,py,tile,4);if(y===13)ctx.fillRect(px,py+tile-4,tile,4);
      if(x===11&&y===12){ctx.fillStyle='#dce7de';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#547985';ctx.fillRect(px+9,py+8,tile-18,tile-16);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('탑',px+tile/2,py+20);}
     }
     if(c==='b'&&w.district!=='lumiose-vernal'){ctx.fillStyle='#765e81';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('탐정',px+tile/2,py+20);}
     if(c==='Y'||c==='Z'){ctx.fillStyle='#8d684d';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('안내',px+tile/2,py+20);}
     if(c==='E'||c==='W'){ctx.fillStyle='#537b85';ctx.font='bold 23px sans-serif';ctx.textAlign='center';ctx.fillText(w.district==='lumiose-zone2'?(c==='E'?'↓':'↑'):(c==='E'?'›':'‹'),px+tile/2,py+25);}
     if(w.district==='lumiose-rooftop'&&w.zaMission15Stage>=2&&w.zaRooftopCrystalCleared&&x===8&&y===10){ctx.fillStyle='#447e9a';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('활공 ↑',px+tile/2,py+20);}if(w.district==='lumiose-rooftop'&&w.zaMission15Stage>=2&&w.zaRooftopCrystalCleared&&x===6&&y===8){ctx.fillStyle='#447e9a';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('활공 ↓',px+tile/2,py+20);}
     if(c==='X'){ctx.fillStyle='#537b85';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(w.district==='lumiose-north-boulevard'&&x===18&&y===0?'구역6':w.district==='lumiose-vert2'&&x===17?(y===0?'구역6':'구역11'):w.district==='lumiose-centrico-route'&&x===18&&y===16?'구역5':w.district==='lumiose-royale'?'광장':w.district==='lumiose-bureau'?'출구':w.district==='lumiose-rooftop'?'광장':w.district==='lumiose-zone3'?zone3ExitLabel(x,y):w.district==='lumiose-rouge-north'?'광장':w.district==='lumiose-vernal'?'연구소':'항구',px+tile/2,py+20);}
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
   if(w.district==='lumiose-zone8'&&!w.interior){
    // Circular plaza boundary is a floor marking, not an additional wall.
    ctx.save();ctx.strokeStyle='#b09a75';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(11.5*tile,8.5*tile,9.2*tile,6.2*tile,0,0,Math.PI*2);ctx.stroke();ctx.restore();
   }
   for(const b of buildings){
    ctx.fillStyle=palette[2];ctx.fillRect((b.x-1)*tile,(b.y-3)*tile,3*tile,4*tile);
    if(w.district==='lumiose'&&b.kind==='J'){
     // Hotel Z's cream facade, dark mansard roof and ivy are stylized from the
     // original exterior; its 3x4 footprint remains the existing draft.
     const bx=(b.x-1)*tile,by=(b.y-3)*tile;
     ctx.fillStyle='#d7cdb4';ctx.fillRect(bx,by+tile,3*tile,3*tile);
     ctx.fillStyle='#66716f';ctx.fillRect(bx+5,by+3,3*tile-10,tile-4);ctx.fillStyle='#505d5d';ctx.fillRect(bx,by+tile-5,3*tile,6);
     ctx.fillStyle='#ede5d2';for(let i=0;i<3;i++){ctx.fillRect(bx+11+i*tile,by+8,10,12);ctx.fillRect(bx+10+i*tile,by+tile+8,12,18);if(i!==1)ctx.fillRect(bx+10+i*tile,by+2*tile+8,12,18);}
     ctx.fillStyle='#718a86';for(let i=0;i<3;i++){ctx.fillRect(bx+13+i*tile,by+10,6,8);ctx.fillRect(bx+13+i*tile,by+tile+10,6,13);if(i!==1)ctx.fillRect(bx+13+i*tile,by+2*tile+10,6,13);}
     ctx.fillStyle='#4e6c69';for(let i=0;i<3;i++){const wx=bx+10+i*tile;ctx.fillRect(wx-3,by+tile+9,3,15);ctx.fillRect(wx+12,by+tile+9,3,15);ctx.fillStyle='#f1e9d6';ctx.fillRect(wx-2,by+tile+25,16,3);ctx.fillStyle='#4e6c69';}
     ctx.fillStyle='#719569';for(const [ix,iy] of [[2,0],[8,0],[0,1],[4,1],[7,2],[1,2]]){ctx.fillRect(bx+ix*tile/8,by+tile+iy*tile,10,13);ctx.fillRect(bx+3*tile-12-ix*tile/8,by+tile+iy*tile,9,12);}
     ctx.fillStyle='#6b5040';ctx.fillRect(bx+tile+7,by+3*tile+3,tile-14,tile-3);ctx.fillStyle='#b79870';ctx.fillRect(bx+tile+tile/2-1,by+3*tile+5,2,tile-8);
     ctx.fillStyle='#efe7d2';ctx.fillRect(bx+tile+5,by+3*tile-4,tile-10,4);ctx.fillStyle='#51685a';ctx.fillRect(bx+tile+6,by+2*tile+8,tile-12,10);ctx.fillStyle='#fff5d9';ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.fillText('HOTEL Z',bx+tile*1.5,by+2*tile+16);
     continue;
    }
    if(w.district==='lumiose'&&(b.kind==='H'||b.kind==='M')){
     // Distinct clinic and shop silhouettes, kept within their existing 3x4 blocks.
     const bx=(b.x-1)*tile,by=(b.y-3)*tile,clinic=b.kind==='H';
     ctx.fillStyle='#c5bcae';ctx.fillRect(bx,by+tile,3*tile,3*tile);
     ctx.fillStyle=clinic?'#9b3542':'#415f77';ctx.fillRect(bx+2,by+6,3*tile-4,tile+4);
     ctx.fillStyle=clinic?'#cf5660':'#658aa0';ctx.fillRect(bx+5,by+3,3*tile-10,tile-3);for(let i=0;i<3;i++)sprite(clinic?'roofRedMiddle':'roofBlueMiddle',bx+i*tile,by);ctx.fillStyle=clinic?'#8e3643':'#405c75';ctx.fillRect(bx,by+tile-4,3*tile,5);
     ctx.fillStyle=clinic?'#ede7dd':'#ddd6c7';ctx.fillRect(bx+4,by+tile+5,3*tile-8,2*tile-6);
     ctx.fillStyle=clinic?'#873c49':'#3c667e';ctx.fillRect(bx+4,by+tile+5,3*tile-8,8);
     ctx.fillStyle='#4d7380';ctx.fillRect(bx+9,by+tile+17,tile-13,tile-1);ctx.fillRect(bx+2*tile+4,by+tile+17,tile-13,tile-1);
     ctx.fillStyle='#b9d4d3';ctx.fillRect(bx+12,by+tile+20,3,tile-8);ctx.fillRect(bx+2*tile+7,by+tile+20,3,tile-8);
     ctx.fillStyle='#526370';ctx.fillRect(bx+tile+7,by+2*tile+16,tile-14,tile+12);ctx.fillStyle='#c7dbd7';ctx.fillRect(bx+tile+9,by+2*tile+18,tile-18,tile+5);
     ctx.fillStyle='#777b75';ctx.fillRect(bx+tile+4,by+4*tile-5,tile-8,5);
     if(clinic){ctx.fillStyle='#eee9dc';ctx.fillRect(bx+tile+9,by+8,14,14);ctx.fillStyle='#cc4b4f';ctx.fillRect(bx+tile+10,by+9,12,6);ctx.fillStyle='#34444b';ctx.fillRect(bx+tile+10,by+15,12,2);ctx.fillStyle='#eee9dc';ctx.fillRect(bx+tile+10,by+17,12,4);ctx.fillStyle='#34444b';ctx.fillRect(bx+tile+14,by+14,4,4);ctx.fillStyle='#fff';ctx.fillRect(bx+tile+15,by+15,2,2);}else{ctx.fillStyle='#d9be83';ctx.fillRect(bx+tile+10,by+8,12,11);ctx.fillStyle='#506879';ctx.fillRect(bx+tile+12,by+10,8,7);ctx.fillStyle='#e7e0cf';for(let i=0;i<6;i++)if(i%2===0)ctx.fillRect(bx+5+i*14,by+tile+5,7,8);}
     continue;
    }
    const layout=b.kind==='H'?manifest.buildings.center.layout:manifest.buildings.shop.layout;
    for(let y=0;y<4;y++)for(let x=0;x<3;x++)sprite(layout[y][x],(b.x+x-1)*tile,(b.y+y-3)*tile);
    // Red clinic / blue shop signs, independent of the source sheet roof colors.
    ctx.fillStyle=b.kind==='H'?'#d44e4c':b.kind==='M'?'#417fae':b.kind==='G'?'#bd8c37':b.kind==='J'?'#ad8865':'#6e7d8c';ctx.fillRect((b.x-1)*tile,(b.y-3)*tile,3*tile,4);
    const label=b.kind==='H'?'포켓몬 센터':b.kind==='M'?'프렌들리숍':b.kind==='G'?'GYM':b.kind==='J'?'호텔 안내소':b.kind==='l'?'스시 식당':'연구소';
    ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillStyle='#253e3c';ctx.fillRect(b.x*tile-24,(b.y+1)*tile-2,80,19);ctx.fillStyle='#ffffff';ctx.fillText(label,b.x*tile+16,(b.y+1)*tile+11);
   }
   if(w.area===9&&!w.expedition){for(let y=1;y<=4;y++)for(let x=7;x<=21;x++)sprite(y===1?'castleBattlement':y===3?'castleWindow':'castleWall',x*tile,y*tile);[8,11,14,17,20].forEach((x,i)=>{sprite('castleDoor',x*tile,4*tile);ctx.fillStyle='#fff4bc';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(i===4?'챔피언':`${i+1} 사천왕`,x*tile+16,6*tile-8);});}
   function trainer(x:number,y:number,color:string,face:string,walk=false,appearance?:{style:string;color:string}){
    const px=Math.round(x*tile+tile/2-12),py=Math.round(y*tile+tile-29),step=walk&&!reduce?(Math.floor(time/95)%2===0?3:-3):0;
    ctx!.fillStyle='#28473155';ctx!.beginPath();ctx!.ellipse(px+12,py+28,12,4,0,0,Math.PI*2);ctx!.fill();
    const colors:Record<string,string>={R:color,W:'#f3f2dd',S:'#f4c48d',K:'#263e51',B:'#3d79aa',Y:'#f4cf64',D:'#4b3741',H:(SALON_COLORS as any)[appearance?.color||'brown']?.value||'#79503b'};
    adventureAvatarRows(face,appearance?.style).forEach((row:string,ry:number)=>Array.from(row).forEach((p,rx)=>{if(p==='.')return;ctx!.fillStyle=colors[p];ctx!.fillRect(px+rx*2,py+ry*2+(ry>10?(rx<6?step:-step):0),2,2);}));
   }
   // Naveen and Lida lead across the draft rooftop; positions are visual only.
   if(w.district==='lumiose-protect'&&!w.interior&&w.zaMission36DescentPending&&w.zaMission36RooftopRoute&&w.zaMission37Stage===1){
    const key=`${w.x},${w.y},${!!w.zaMission36AtPlaza}`;
    if(key!==descentKey){const targets=w.zaMission36AtPlaza?[{x:5,y:4,direction:'down'},{x:6,y:4,direction:'down'}]:descentGuideTargets(w.map,w);descentGuides=targets.map((target:any,index:number)=>{const old=descentGuides[index],snap=!old||Math.abs(target.x-old.x)+Math.abs(target.y-old.y)>1.5;return {x:snap?target.x:old.x,y:snap?target.y:old.y,startX:snap?target.x:old.x,startY:snap?target.y:old.y,targetX:target.x,targetY:target.y,start:time,direction:target.direction};});descentKey=key;}
    descentGuides.forEach((p,index)=>{const progress=reduce?1:Math.min(1,Math.max(0,(time-p.start)/140));p.x=p.startX+(p.targetX-p.startX)*progress;p.y=p.startY+(p.targetY-p.startY)*progress;if(Math.abs(p.x-w.x)+Math.abs(p.y-w.y)>.5)trainer(p.x,p.y,index===0?'#6b8799':'#b07883',p.direction,walking);});
   }else{descentKey='';descentGuides=[];}
   // The server saves the companion’s last step; it never blocks the player.
   if(w.zaMission03Stage===2&&w.zaMission03DetourRequired===true&&!w.interior&&['lumiose','lumiose-vert-street-route','lumiose-station-alley','lumiose-station-roof'].includes(w.district)){
    const p=w.zaMission03CompanionPosition;
    if(p?.district===w.district&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&!(p.x===w.x&&p.y===w.y)&&walkable(w.map[p.y]?.[p.x]))trainer(p.x,p.y,'#a17d72',p.facing||'down',walking);
   }
   w.map.forEach((row:string,y:number)=>Array.from(row).forEach((c,x)=>{if(cloudNpcTile(c,w))trainer(x,y,c==='N'?'#8d5ca8':c==='R'?'#719f9a':c==='F'?'#9e758e':c==='D'?'#bb9c42':c==='A'?'#59855b':c==='B'?'#477e9a':'#cf9254','down');}));
   w.map.forEach((row:string,y:number)=>Array.from(row).forEach((c,x)=>{if(c==='!'){const px=x*tile,py=y*tile;ctx!.fillStyle='#692975';ctx!.beginPath();ctx!.arc(px+tile/2,py+tile/2,8,0,Math.PI*2);ctx!.fill();ctx!.fillStyle='#db90e8';ctx!.fillRect(px+tile/2-5,py+tile/2-5,10,4);ctx!.fillStyle='#f6e6fa';ctx!.fillRect(px+tile/2-2,py+tile/2-2,4,4);}else if(c==='$')trainer(x,y,'#d1a94d','down');}));
   // The rooftop discussion includes AZ and the team. Companion placement and
   // clothing are visual approximations and do not change movement or saves.
   if(w.district==='lumiose'&&w.interior==='hotelRoof'&&w.zaMission35Stage===6&&w.zaMission35RoofRequired){for(const [x,color] of [[9,'#597f9d'],[13,'#ad8175']] as const)if(!(w.x===x&&w.y===7))trainer(x,7,color,'down');}
   if(w.district==='lumiose-zone1'&&!w.interior&&[4,5].includes(w.zaMission03Stage)){const isFletchling=w.zaMission03Stage===4,x=isFletchling?8:14,y=6,px=x*tile,py=y*tile,img=fieldImages[isFletchling?661:659];if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#668c80';ctx.fillRect(px+4,py+5,tile-8,tile-10);ctx.fillStyle='#fff';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText(isFletchling?'화살꼬빈':'파르빗',px+tile/2,py+20);}}
   if(w.district==='lumiose-sewer'&&!w.interior&&!w.zaSewerIceBranch&&!w.zaMission19Inner&&w.zaBleuSewerOpened&&!w.zaMission57Won)trainer(17,4,'#8d7763','down');
   if(w.district==='lumiose-sewer'&&!w.interior&&!w.zaSewerIceBranch&&w.zaMission19Stage===13&&(w.zaMission19Inner||!w.zaMission19InnerEnabled))trainer(w.zaMission19Inner?18:11,w.zaMission19Inner?3:2,'#916c8e','down');
   if(w.district==='lumiose-sewer'&&!w.interior&&!w.zaSewerIceBranch&&!w.zaMission19Inner&&w.zaMission19Stage===10){const px=16*tile,py=10*tile,img=fieldImages[707];if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#b8c7c3';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#6b7776';ctx.stroke();}}
   if(w.district==='lumiose-sewer'&&!w.interior&&!w.zaMission19Inner&&w.zaMission19Stage===11&&[0,1].includes(w.zaMission19ChandelureStep)){const x=w.zaMission19ChandelureStep===0?16:11,y=w.zaMission19ChandelureStep===0?8:5,px=x*tile,py=y*tile,img=fieldImages[609];if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#80699a';ctx.fillRect(px+7,py+7,tile-14,tile-14);ctx.fillStyle='#fff';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText('샹델라',px+tile/2,py+20);}}
   // Side Mission 17's one-time rooftop Mareep is always shiny. Its tile is
   // removed by the saved catch flag, so old saves keep the existing lifecycle.
   if(w.district==='lumiose-zone1-high-roof'&&!w.interior&&w.map[5]?.[8]==='m'){
    const px=8*tile,py=5*tile,img=shinyFieldImages[179];
    if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);
    else{ctx.fillStyle='#ebadc6';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,10,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#465375';ctx.fillRect(px+20,py+13,6,7);ctx.fillRect(px+8,py+22,3,5);ctx.fillRect(px+18,py+22,3,5);}
   }
   const budew=zone2BudewPosition(w);if(budew){const px=budew.x*tile,py=budew.y*tile;const img=w.zaWildShinyRolls?.['field2:budew:406']===true?shinyFieldImages[406]:budewImage;if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-13,tile+16,tile+16);else{ctx.fillStyle='#79a85d';ctx.fillRect(px+8,py+8,tile-16,tile-12);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('꼬몽울',px+tile/2,py+20);}}
   const kakuna=zone2KakunaPosition(w);if(kakuna){const px=kakuna.x*tile,py=kakuna.y*tile;const img=w.zaWildShinyRolls?.['field2:kakuna:14']===true?shinyFieldImages[14]:kakunaImage;if(img.complete&&img.naturalWidth)ctx.drawImage(img,px,py-8,tile,tile);else{ctx.fillStyle='#e0bc46';ctx.fillRect(px+10,py+3,12,23);}}
   for(const m of zone2FieldMonsters(w,props.current.period)){const px=m.x*tile,py=m.y*tile,img=w.zaWildShinyRolls?.[`field2:${m.id}:${m.speciesId}`]===true?shinyFieldImages[m.speciesId]:fieldImages[m.speciesId];if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#e6d39d';ctx.fillRect(px+8,py+8,tile-16,tile-12);ctx.fillStyle='#263e51';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText(m.name,px+tile/2,py+20);}}
   for(const m of magentaSewerMonsters(w,props.current.period)){const px=m.x*tile,py=m.y*tile,img=w.zaWildShinyRolls?.[`sewer:${m.id}:${m.speciesId}`]===true?shinyFieldImages[m.speciesId]:fieldImages[m.speciesId];if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#d5d8be';ctx.fillRect(px+8,py+8,tile-16,tile-12);ctx.fillStyle='#263e51';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText(m.name,px+tile/2,py+20);}}
   for(const m of zone3FieldMonsters(w,props.current.period)){const px=m.x*tile,py=m.y*tile,img=w.zaWildShinyRolls?.[`field3:${m.id}:${m.speciesId}`]===true?shinyFieldImages[m.speciesId]:fieldImages[m.speciesId];if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#eee0b4';ctx.fillRect(px+8,py+8,tile-16,tile-12);ctx.fillStyle='#263e51';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText(m.name,px+tile/2,py+20);}}
   if(w.district==='lumiose-zone6'&&!w.interior)for(const m of ZONE6_VISIBLE.filter(p=>zone6Visible(w,p.tile)===p)){const px=m.x*tile,py=m.y*tile,img=(w.zaWildShinyRolls?.[`zone6:${m.id}:${m.species}`]===true?shinyFieldImages[m.species]:fieldImages[m.species]);if(m.alpha){ctx.fillStyle='#d95b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);}if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#8c6d74';ctx.fillRect(px+6,py+6,tile-12,tile-10);ctx.fillStyle='#fff';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText(m.name,px+tile/2,py+20);}}
   if(w.district==='lumiose-zone20'&&!w.interior&&w.zaMission42Underground&&[1,2,3].includes(w.zaMission42Stage)){const px=11*tile,py=6*tile,img=fieldImages[10181];if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#83af8a';ctx.fillRect(px+7,py+6,tile-14,tile-12);}}
   if(w.district==='lumiose-zone20'&&!w.interior&&!w.zaMission42Underground)for(const m of [...ZONE20_VISIBLE,zone20Visible(w,'d'),zone20Visible(w,'e')].filter((p): p is NonNullable<typeof p> => !!p&&!w.zaZone20Spent?.[p.id])){const img=(w.zaWildShinyRolls?.[`zone20:${m.id}:${m.species}`]===true?shinyFieldImages[m.species]:fieldImages[m.species]),px=m.x*tile,py=m.y*tile;if(m.alpha){ctx.fillStyle='#d95b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);}if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#668c80';ctx.fillRect(px+6,py+6,tile-12,tile-12);}}
   if(w.district==='lumiose-zone19'&&!w.interior)for(const m of ZONE19_VISIBLE.filter(p=>zone19Visible(w,p.tile)===p)){const img=(w.zaWildShinyRolls?.[`zone19:${m.id}:${m.species}`]===true?shinyFieldImages[m.species]:fieldImages[m.species]),px=m.x*tile,py=m.y*tile;if(m.alpha){ctx.fillStyle='#d95b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);}if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#668c80';ctx.fillRect(px+6,py+6,tile-12,tile-12);}}
   if(w.district==='lumiose-zone18'&&!w.interior)for(const m of ZONE18_VISIBLE.filter(p=>zone18Visible(w,p.tile)===p)){const img=(w.zaWildShinyRolls?.[`zone18:${m.id}:${m.species}`]===true?shinyFieldImages[m.species]:fieldImages[m.species]),px=m.x*tile,py=m.y*tile;if(m.alpha){ctx.fillStyle='#d95b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);}if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#668c80';ctx.fillRect(px+6,py+6,tile-12,tile-12);}}
   if(w.district==='lumiose-zone17'&&!w.interior)for(const m of ZONE17_VISIBLE.filter(p=>zone17Visible(w,p.tile)===p)){const img=(w.zaWildShinyRolls?.[`zone17:${m.id}:${m.species}`]===true?shinyFieldImages[m.species]:fieldImages[m.species]),px=m.x*tile,py=m.y*tile;if(m.alpha){ctx.fillStyle='#d95b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);}if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#668c80';ctx.fillRect(px+6,py+6,tile-12,tile-12);}}
   if(['lumiose-zone16','lumiose-zone16-garden'].includes(w.district)&&!w.interior&&!w.zaZone16Upper)for(const m of ZONE16_VISIBLE.filter(p=>zone16Visible(w,p.tile)===p)){const img=(w.zaWildShinyRolls?.[`zone16:${m.id}:${m.species}`]===true?shinyFieldImages[m.species]:fieldImages[m.species]),px=m.x*tile,py=m.y*tile;if(m.alpha){ctx.fillStyle='#d95b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);}if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#668c80';ctx.fillRect(px+6,py+6,tile-12,tile-12);}}
   if(w.district==='lumiose-zone15'&&!w.interior)for(const m of ZONE15_VISIBLE.filter(p=>zone15Visible(w,p.tile)===p)){const img=(w.zaWildShinyRolls?.[`zone15:${m.id}:${m.species}`]===true?shinyFieldImages[m.species]:fieldImages[m.species]),px=m.x*tile,py=m.y*tile;if(m.alpha){ctx.fillStyle='#d95b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);}if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#728464';ctx.fillRect(px+6,py+6,tile-12,tile-12);}}
   if(w.district==='lumiose-zone14'&&!w.interior)for(const m of ZONE14_VISIBLE.filter(p=>!!zone14Visible(w,p.tile))){const img=(w.zaWildShinyRolls?.[`zone14:${m.id}:${m.species}`]===true?shinyFieldImages[m.species]:fieldImages[m.species]),px=m.x*tile,py=m.y*tile;if(m.alpha){ctx.fillStyle='#d95b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);}if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#786c5b';ctx.fillRect(px+6,py+6,tile-12,tile-12);}}
   if(w.district==='lumiose-protect'&&w.zaProtectTowerApproachV1&&w.zaProtectTowerApproach&&w.zaMission37Stage===7){
    const key=`${w.x},${w.y}`;if(!guide||guide.key!==key){const target=zygardeGuideTarget(w.map,w);if(!target)guide=null;else if(!guide)guide={key,x:target.x,y:target.y,startX:target.x,startY:target.y,targetX:target.x,targetY:target.y,start:time};else if(Math.abs(target.x-guide.x)+Math.abs(target.y-guide.y)>1.5)guide={key,x:target.x,y:target.y,startX:target.x,startY:target.y,targetX:target.x,targetY:target.y,start:time};else guide={...guide,key,startX:guide.x,startY:guide.y,targetX:target.x,targetY:target.y,start:time};}
    if(guide){const progress=reduce?1:Math.min(1,Math.max(0,(time-guide.start)/140));guide.x=guide.startX+(guide.targetX-guide.startX)*progress;guide.y=guide.startY+(guide.targetY-guide.startY)*progress;const img=fieldImages[718],px=guide.x*tile,py=guide.y*tile;if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#5e9b75';ctx.fillRect(px+8,py+7,tile-16,tile-14);}}
   }else guide=null;
   if(w.district==='lumiose-lysandre-lab'&&!w.interior){
    const visible:Array<{id:string;tile:string;x:number;y:number;species:number;level:number;name:string;alpha?:boolean}>=LYSANDRE_WILD.filter(p=>lysandreWild(w,{tile:p.tile,x:p.x,y:p.y}));
    if(w.zaLysandreFloor!==2&&w.zaLysandreFloor!==3&&w.zaMission35Stage===4&&!w.zaLysandreAegislashWon&&(!w.zaLysandreMazeV2||(w.zaLysandreWing==='e'&&!w.zaLysandreBossRoomV5)||w.zaLysandreWing==='e-boss'))visible.push({id:'guardian',tile:'g',x:w.zaLysandreWing==='e-boss'?11:w.zaLysandreMazeV2?17:19,y:w.zaLysandreWing==='e-boss'?6:w.zaLysandreMazeV2?9:4,species:681,level:50,name:'킬가르도',alpha:true});
    if(w.zaLysandreWing==='e-boss'&&w.zaMission35Stage===4&&!w.zaLysandreAegislashWon)for(const x of [9,13])visible.push({id:`honedge-${x}`,tile:'',x,y:6,species:679,level:34,name:'단칼빙'});
    for(const m of visible){const px=m.x*tile,py=m.y*tile,img=w.zaWildShinyRolls?.[`lab:${m.id}:${m.species}`]===true?shinyFieldImages[m.species]:fieldImages[m.species];if(m.alpha){ctx.fillStyle='#aa4b4c';ctx.fillRect(px+3,py+3,tile-6,tile-6);}if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle=m.alpha?'#d18b7a':'#a2bac1';ctx.fillRect(px+8,py+7,tile-16,tile-14);}}
   }
   if(w.district==='lumiose-zone13'&&!w.interior)for(const m of ZONE13_VISIBLE.filter(p=>!!zone13Visible(w,p.tile))){const img=(w.zaWildShinyRolls?.[`zone13:${m.id}:${m.species}`]===true?shinyFieldImages[m.species]:fieldImages[m.species]),px=m.x*tile,py=m.y*tile;if(m.alpha){ctx.fillStyle='#d95b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);}if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#658b5e';ctx.fillRect(px+6,py+6,tile-12,tile-12);}}
   if(w.district==='lumiose-zone12'&&!w.interior)for(const m of ZONE12_VISIBLE.filter(p=>!w.zaZone12Spent?.[p.id]&&(!w.zaZone12PondLower||p.water))){const img=(w.zaWildShinyRolls?.[`zone12:${m.id}:${m.species}`]===true?shinyFieldImages[m.species]:fieldImages[m.species]),px=m.x*tile,py=m.y*tile;if(m.alpha){ctx.fillStyle='#d95b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);}if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#769097';ctx.fillRect(px+6,py+6,tile-12,tile-12);}}
   if(w.district==='lumiose-zone10'&&!w.interior)for(const m of ZONE10_VISIBLE.filter(p=>p.upper===(w.zaZone10Upper===true)&&!w.zaZone10Spent?.[p.id])){const img=(w.zaWildShinyRolls?.[`zone10:${m.id}:${m.species}`]===true?shinyFieldImages[m.species]:fieldImages[m.species]),px=m.x*tile,py=m.y*tile;if(m.alpha){ctx.fillStyle='#d95b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);}if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#796d85';ctx.fillRect(px+6,py+6,tile-12,tile-12);}}
   if(w.district==='lumiose-lune-roof'&&!w.interior&&w.map?.[2]?.[16]==='0'){const px=16*tile,py=2*tile,img=fieldImages[717];ctx.fillStyle='#bc5862';ctx.fillRect(px+2,py+2,tile-4,tile-4);if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#824a58';ctx.fillRect(px+5,py+6,tile-10,tile-12);ctx.fillStyle='#fff';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText('이벨타르',px+tile/2,py+20);}}
   if(w.district==='lumiose-zone5'&&!w.interior&&!w.zaZone5Upper&&w.map?.[6]?.[5]==='0'){const px=5*tile,py=6*tile,img=fieldImages[475];ctx.fillStyle='#d95b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#4d7664';ctx.fillRect(px+6,py+6,tile-12,tile-12);ctx.fillStyle='#fff';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText('엘레이드',px+tile/2,py+20);}}
   if(w.district==='lumiose-zone9'&&!w.interior&&w.zaZone9Upper&&w.map?.[9]?.[5]==='0'){const px=5*tile,py=9*tile,img=fieldImages[675];ctx.fillStyle='#d95b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#4d5361';ctx.fillRect(px+6,py+6,tile-12,tile-12);ctx.fillStyle='#fff';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText('부란다',px+tile/2,py+20);}}
   if(w.district==='lumiose-zone9'&&!w.interior)for(const m of ZONE9_VISIBLE.filter(p=>p.upper===(w.zaZone9Upper===true)&&!w.zaZone9Spent?.[p.id])){const img=w.zaWildShinyRolls?.[`zone9:${m.id}:${m.species}`]===true?shinyFieldImages[m.species]:fieldImages[m.species],px=m.x*tile,py=m.y*tile;if(m.alpha){ctx.fillStyle='#d95b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);}if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#796d85';ctx.fillRect(px+6,py+6,tile-12,tile-12);}}
   if(w.district==='lumiose-zone8'&&!w.interior)for(const m of ZONE8_VISIBLE.filter(p=>!w.zaZone8Spent?.[p.id])){if(m.burrow){const px=m.x*tile,py=m.y*tile;ctx.fillStyle='#7d5939';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile*.7,tile*.38,tile*.19,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c6955f';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile*.62,tile*.3,tile*.18,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e8c189';ctx.fillRect(px+tile*.28,py+tile*.53,tile*.19,2);ctx.fillStyle='#846246';ctx.fillRect(px+tile*.6,py+tile*.68,tile*.16,2);if(zone8BurrowSpecies(w,m.id)===443){ctx.fillStyle='#347cb0';ctx.beginPath();ctx.moveTo(px+tile*.52,py+tile*.55);ctx.lineTo(px+tile*.58,py+tile*.31);ctx.lineTo(px+tile*.68,py+tile*.58);ctx.closePath();ctx.fill();}else{ctx.fillStyle='#e99e9d';ctx.fillRect(px+tile*.46,py+tile*.47,tile*.16,tile*.11);}continue;}const img=(w.zaWildShinyRolls?.[`zone8:${m.id}:${m.species}`]===true?shinyFieldImages[m.species]:fieldImages[m.species]),px=m.x*tile,py=m.y*tile;if(m.alpha){ctx.fillStyle='#d95b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);}if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#856d4b';ctx.fillRect(px+6,py+6,tile-12,tile-12);}}
   if(w.district==='lumiose-zone7'&&!w.interior&&!w.zaZone7AlphaSpent){const img=w.zaWildShinyRolls?.['alpha:zone7-fletchinder:662']===true?shinyFieldImages[662]:fieldImages[662],px=11*tile,py=8*tile;ctx.fillStyle='#d95b58';ctx.fillRect(px+3,py+3,tile-6,tile-6);if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);}
   if(w.district==='lumiose-zone11'&&!w.interior){const visible=ZONE11_VISIBLE.filter(p=>!w.zaZone11Spent?.[p.id]);if(w.zaMission40Stage===2&&!w.zaMission40Complete&&w.zaMission40XerneasRevealed!==false)visible.push({id:'xerneas',tile:'0',species:716,level:75,name:'제르네아스',x:11,y:w.zaMission40XerneasRevealed===true?6:3});for(const m of visible){const px=m.x*tile,py=m.y*tile,img=(w.zaWildShinyRolls?.[`zone11:${m.id}:${m.species}`]===true?shinyFieldImages[m.species]:fieldImages[m.species]);if(m.alpha){ctx.fillStyle='#d95b58';ctx.fillRect(px+2,py+2,tile-4,tile-4);}if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#7c6d93';ctx.fillRect(px+6,py+6,tile-12,tile-10);ctx.fillStyle='#fff';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText(m.name,px+tile/2,py+20);}}}
   if(['lumiose-zone5','lumiose-zone5-drain'].includes(w.district)&&!w.interior)for(const m of ZONE5_VISIBLE.filter(p=>(w.district==='lumiose-zone5-drain'?p.drain===true:!p.drain&&p.upper===(w.zaZone5Upper===true))&&!w.zaZone5Spent?.[p.id])){const px=m.x*tile,py=m.y*tile,img=(w.zaWildShinyRolls?.[`zone5:${m.id}:${m.species}`]===true?shinyFieldImages[m.species]:fieldImages[m.species]);if(img?.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle=m.alpha?'#af5462':'#d6b57d';ctx.fillRect(px+6,py+6,tile-12,tile-10);ctx.fillStyle='#fff';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText(m.name,px+tile/2,py+20);}}
   const companion=w.zaRooftopCompanionPosition;if(w.district==='lumiose-rooftop'&&w.zaRooftopIntroduced&&!w.zaRooftopTraversed&&Number.isInteger(companion?.x)&&Number.isInteger(companion?.y)&&(companion.x!==w.x||companion.y!==w.y))trainer(companion.x,companion.y,'#a87fbd',companion.facing||'down',moving);
   for(const member of w.unionMembers||[])if(member.x!==w.x||member.y!==w.y)trainer(member.x,member.y,'#e7b93e','down');
   trainer(s.x,s.y,'#d95250',s.facing,walking,salonAppearance(w));
   ctx.restore();
   // Soft border is part of the camera, never a fullscreen tint over sprites.
   ctx.strokeStyle='#284d3b55';ctx.lineWidth=4;ctx.strokeRect(2,2,width-4,height-4);
   return walking&&!reduce;
  }
  scheduler.invalidate();return()=>{disposed=true;invalidate.current=null;scheduler.dispose();observer.disconnect();motion.removeEventListener('change',scheduler.invalidate);};
 },[]);
 useEffect(()=>{invalidate.current?.();},[w,period]);
 return <div className="adv-field-wrap"><canvas ref={canvas} className="adv-field" tabIndex={0} aria-label={`${w.areaInfo.name} 필드. 방향키 또는 WASD로 이동, E로 대화. 현재 위치 ${w.x}, ${w.y}${zone2BudewPosition(w)?'. 야생 꼬몽울이 보입니다.':''}${!w.interior&&['lumiose-zone3','lumiose-zone4'].includes(w.district)?'. 풀이 자란 길에서도 야생 포켓몬이 나타납니다.':''}`} onClick={e=>{if(disabled)return;const rect=e.currentTarget.getBoundingClientRect(),s=scene.current,x=Math.floor(((e.clientX-rect.left)/rect.width*(e.currentTarget.width/2)+s.cameraX)/s.tile),y=Math.floor(((e.clientY-rect.top)/rect.height*(e.currentTarget.height/2)+s.cameraY)/s.tile),budew=zone2BudewPosition(w);if(budew&&budew.x===x&&budew.y===y){onAimBudew();return;}const kakuna=zone2KakunaPosition(w);if(kakuna&&kakuna.x===x&&kakuna.y===y){onAimKakuna();return;}const fieldMon=zone2FieldMonsters(w,period).find((m:any)=>m.x===x&&m.y===y);if(fieldMon){onAimField(fieldMon.id);return;}const sewerMon=magentaSewerMonsters(w,period).find((m:any)=>m.x===x&&m.y===y);if(sewerMon){onAimSewer(sewerMon.id);return;}const zone3Mon=zone3FieldMonsters(w,period).find((m:any)=>m.x===x&&m.y===y);if(zone3Mon){onAimZone3(zone3Mon.id);return;}if(w.district==='lumiose-zone2'&&w.map[y]?.[x]==='p'){onAimIslandAlpha();return;}if(w.district==='lumiose-wild'&&w.map[y]?.[x]==='a'&&!w.zaWildAlphaSpent){onAimAlpha();return;}if(x===w.x&&y===w.y){onInteract();return;}}}/><div className="adv-field-hint">{!w.interior&&['lumiose-zone3','lumiose-zone4'].includes(w.district)?'풀이 자란 길에서도 야생 포켓몬이 나타납니다':'방향키 또는 이동 버튼으로 걸으세요'}</div>{assetError&&<span className="adv-asset-error" role="status">일부 타일 이미지를 불러오지 못했습니다.</span>}</div>;
}
