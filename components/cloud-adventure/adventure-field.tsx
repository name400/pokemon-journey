'use client';
import {useEffect,useRef,useState} from 'react';
import manifest from '@/data/cloud-town-tiles.json';
import {fieldPath,wildAlphaPosition,zone2BudewPosition,zone2KakunaPosition,zone2FieldMonsters,zone3FieldMonsters,cloudNpcTile} from '@/lib/cloud-adventure/adventure-world.mjs';
import {adventureAvatarRows} from '@/lib/cloud-adventure/adventure-avatar.mjs';

type Props={world:any;disabled:boolean;onPath:(path:string[])=>void;onInteract:()=>void;onAimAlpha:()=>void;onAimBudew:()=>void;onAimKakuna:()=>void;onAimIslandAlpha:()=>void;onAimField:(id:string)=>void;onAimZone3:(id:string)=>void;period:string};
const palettes:Record<string,string[]>={city:['#d7d0b9','#bed3bf','#e8dfc9'],meadow:['#82bd68','#b5da82','#e5d0a0'],rock:['#aab584','#d3d5aa','#c9b58a'],water:['#80bc9f','#c0dba1','#e9dcad'],electric:['#98c09a','#c9dcb2','#d8c7a4'],forest:['#69a86a','#9dc97c','#dbcda0'],poison:['#8eaa8d','#bdcaa2','#c9bea4'],psychic:['#a0b49a','#cfdbb8','#dfd3bd'],volcano:['#ae9f7d','#c7b68d','#cfb393'],ground:['#b3af7f','#d4ca95','#cdb887'],league:['#82ab93','#b8cdb5','#c6c5b3']};

export default function AdventureField({world:w,disabled,onPath,onInteract,onAimAlpha,onAimBudew,onAimKakuna,onAimIslandAlpha,onAimField,onAimZone3,period}:Props){
 const canvas=useRef<HTMLCanvasElement>(null),props=useRef({w,disabled,onPath,onInteract,onAimAlpha,onAimBudew,onAimKakuna,onAimIslandAlpha,onAimField,onAimZone3,period}),scene=useRef({x:w.x,y:w.y,area:w.area,expedition:w.locationId||0,interior:w.interior||null,district:w.district||null,cameraX:0,cameraY:0,tile:32}),[assetError,setAssetError]=useState(false);
 props.current={w,disabled,onPath,onInteract,onAimAlpha,onAimBudew,onAimKakuna,onAimIslandAlpha,onAimField,onAimZone3,period};
 useEffect(()=>{
  const el=canvas.current;if(!el)return;const ctx=el.getContext('2d');if(!ctx)return;
  const images=new Map<string,HTMLImageElement>();let disposed=false,frame=0,last=0,width=736,height=544;
  const fieldImages:Record<number,HTMLImageElement>={};for(const id of [504,688,129,120,667,674,677,672,25,669,702]){const img=new Image();img.src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;fieldImages[id]=img;}
  const kakunaImage=new Image();kakunaImage.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png';
  const budewImage=new Image();budewImage.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/406.png';
  for(const src of [...new Set([manifest.image,...Object.values(manifest.tiles).map((t:any)=>t.image||manifest.image)])]){const img=new Image();img.onload=()=>images.set(src,img);img.onerror=()=>setAssetError(true);img.src=src;}
  const observer=new ResizeObserver(([entry])=>{width=Math.max(280,Math.round(entry.contentRect.width));height=Math.round(width*(width<560?.87:17/23));if(el.width!==width*2||el.height!==height*2){el.width=width*2;el.height=height*2;}});observer.observe(el);
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
    if(['lab','lumioseLab','sushi'].includes(w.interior)||['hotel','hotel2f','hotel202','hotelRoof'].includes(w.interior)){
     ctx.fillStyle=c==='#'?(!['lab','lumioseLab'].includes(w.interior)?'#a78375':'#64817e'):(x+y)%2?'#e6e2cc':'#f0ecd9';ctx.fillRect(px,py,tile,tile);
     if(c==='#'){ctx.fillStyle=!['lab','lumioseLab'].includes(w.interior)?'#ddc0a1':'#a3bcb1';ctx.fillRect(px+3,py+4,tile-6,tile-8);}
     if(w.interior==='sushi'&&c===';'){ctx.fillStyle=(x+y)%2?'#ac8581':'#bb9690';ctx.fillRect(px,py,tile,tile);ctx.strokeStyle='#e8d8b8';ctx.strokeRect(px+1,py+1,tile-2,tile-2);}
     if(w.interior==='hotelRoof'&&'12345'.includes(c)){ctx.fillStyle=({1:'#8b6a70',2:'#9b5844',3:'#8b6a70',4:'#765b48',5:'#70935c'} as Record<string,string>)[c];ctx.fillRect(px+3,py+5,tile-6,tile-9);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(({1:'의자',2:'화로',3:'소파',4:'탁자',5:'화분'} as Record<string,string>)[c],px+tile/2,py+20);}
     if(c==='i'||c==='o'||(c==='b'&&w.interior==='hotel2f')||(c==='z'&&w.interior==='hotel202')){ctx.fillStyle=c==='i'?'#796b82':c==='o'||c==='b'?'#875d46':'#af746f';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='i'?'승강기':c==='o'?'202':c==='b'?'객실':'침대',px+tile/2,py+20);}
     if(c==='X'){ctx.fillStyle='#a95850';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('출구',px+tile/2,py+21);}
     return;
    }
    if(w.district==='lumiose'||w.district==='lumiose-floral'||w.district==='lumiose-vernal'||w.district==='lumiose-vert-plaza'||w.district==='lumiose-vert2'||w.district==='lumiose-centrico-route'||w.district==='lumiose-rouge-north'||w.district==='lumiose-north-boulevard'||w.district==='lumiose-quasartico'||w.district==='lumiose-rooftop'||w.district==='lumiose-zone1'||w.district==='lumiose-zone2'||w.district==='lumiose-zone3'||w.district==='lumiose-zone4'||w.district==='lumiose-bureau'||w.district==='lumiose-garden'||w.district==='lumiose-site'||w.district==='lumiose-wild'||w.district==='lumiose-observation'||w.district==='lumiose-royale'){
     ctx.fillStyle=(x+y)%2?'#e7dfce':'#ded7c5';ctx.fillRect(px,py,tile,tile);
     if(c===','&&w.district==='lumiose-vernal'){ctx.fillStyle=(x+y)%2?'#dfc4a1':'#e9d2b2';ctx.fillRect(px,py,tile,tile);ctx.strokeStyle='#b69677';ctx.strokeRect(px+.5,py+.5,tile-1,tile-1);if(y===7&&(x===10||x===14)){ctx.fillStyle='#8b6a55';ctx.fillRect(px+12,py+12,8,8);ctx.fillStyle='#fbedd9';ctx.fillRect(px+13,py+13,6,6);}}
     if((c===','||c===';')&&['lumiose-centrico-route','lumiose-rouge-north','lumiose-north-boulevard'].includes(w.district)){ctx.fillStyle='#737c7b';ctx.fillRect(px,py,tile,tile);if(c===';'){ctx.fillStyle='#e5e2d4';for(let i=3;i<tile;i+=8)ctx.fillRect(px+3,py+i,tile-6,4);}else if(y===8&&x%3===0){ctx.fillStyle='#dfddd0';ctx.fillRect(px+5,py+tile/2-1,tile-10,2);}}
     if(c==='#'){ctx.fillStyle='#8e9c91';ctx.fillRect(px,py,tile,tile);}if(c==='r'){ctx.fillStyle='#757b78';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,tile*.4,tile*.33,-.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c7cbc5';ctx.fillRect(px+8,py+10,9,3);}
     if(c==='k'||c==='K'){ctx.fillStyle=c==='K'?'#79a36d':'#a6c692';ctx.fillRect(px+2,py+2,tile-4,tile-4);if(c==='K'){ctx.fillStyle='#fff3be';ctx.fillRect(px+8,py+10,5,5);ctx.fillRect(px+20,py+16,5,5);}}
     if(c==='~'||c==='w'){ctx.fillStyle=c==='w'?'#a0ccd0':'#76abc1';ctx.fillRect(px,py,tile,tile);if(c==='w'){ctx.fillStyle='#d8eeee';ctx.fillRect(px+5,py+15,tile-10,2);}}if(c==='='&&w.district==='lumiose-zone2'){ctx.fillStyle='#94704e';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#cfa87b';for(let i=3;i<tile;i+=7)ctx.fillRect(px,py+i,tile,2);}
     if(c===':'&&w.district==='lumiose-zone2'){ctx.fillStyle='#c9c2ae';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#8f8a7c';for(let i=5;i<tile;i+=8)ctx.fillRect(px,py+i,tile,2);}
     if(c===';'&&w.district==='lumiose-zone2'){ctx.fillStyle='#b5aa90';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#ded6be';ctx.fillRect(px+2,py+2,tile-4,tile-7);ctx.fillStyle='#837f70';ctx.fillRect(px+2,py+tile-5,tile-4,3);}
     if(c==='g'){ctx.fillStyle='#92b97c';ctx.fillRect(px,py,tile,tile);sprite('bush',px,py);sprite('grassDetail',px,py);}
     if(('HMJ'.includes(c)&&!(c==='H'&&w.district==='lumiose-zone3'))||(c==='P'&&w.district==='lumiose-floral')||(c==='l'&&w.district==='lumiose-rouge-north'))buildings.push({x,y,kind:c});
     if(c==='|'&&w.district==='lumiose-zone3'){ctx.fillStyle='#397b56';ctx.fillRect(px+2,py+12,tile-4,6);ctx.fillRect(px+5,py+7,3,17);ctx.fillRect(px+tile-8,py+7,3,17);ctx.fillStyle='#a4e0a9';ctx.fillRect(px+4,py+12,tile-8,2);}
     if(c==='i'&&w.district==='lumiose-zone3'){ctx.fillStyle=w.zaZone3TowerUpper?'#c4bfb0':'#eee9d9';ctx.fillRect(px+3,py+2,tile-6,tile-4);ctx.fillStyle='#70857e';ctx.fillRect(px+11,py+8,10,18);ctx.fillStyle='#d8ccb3';for(let j=10;j<25;j+=5)ctx.fillRect(px+11,py+j,10,2);}
     if(c==='H'&&w.district==='lumiose-zone3'){ctx.fillStyle='#e4d8b9';ctx.fillRect(px+2,py+10,tile-4,tile-10);ctx.fillStyle='#cc6559';ctx.fillRect(px+1,py+5,tile-2,7);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('회복',px+tile/2,py+24);}
     if(c==='a'&&!w.zaWildAlphaSpent){ctx.fillStyle='#8e4939';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,tile*.38,tile*.30,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';const arrow=({up:'↑',down:'↓',left:'←',right:'→'} as any)[wildAlphaPosition(w).facing];ctx.fillText((w.zaWildAlphaAlert?'!':'왕')+arrow,px+tile/2,py+20);}if(c==='T'){ctx.fillStyle='#769b88';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('광장',px+tile/2,py+20);}
     if(c==='f'&&w.district==='lumiose-floral'){ctx.fillStyle='#537b85';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('북쪽',px+tile/2,py+20);}
     if(c==='s'&&w.district==='lumiose'){ctx.fillStyle='#438766';ctx.fillRect(px+2,py+3,tile-4,tile-6);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('구역 1',px+tile/2,py+20);}
     if(c==='d'){ctx.fillStyle='#273e35';ctx.beginPath();ctx.arc(px+tile/2,py+tile/2,11,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText('?',px+tile/2,py+21);}
     if(c==='h'||c==='c'||c==='x'){ctx.fillStyle=c==='c'?'#d67aad':'#786884';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(c==='c'?'결정':c==='x'?'교환':'옥상',px+tile/2,py+20);}
     if(c==='p'){ctx.fillStyle='#94534b';ctx.beginPath();ctx.ellipse(px+tile/2,py+tile/2,tile*.38,tile*.3,0,0,Math.PI*2);ctx.fill();if(w.district==='lumiose-zone2'){const img=fieldImages[props.current.period==='night'?120:129];if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-10,py-18,tile+20,tile+20);}ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('왕',px+tile/2,py+20);}
     if(c==='z'){ctx.fillStyle='#777d73';ctx.fillRect(px+5,py+4,tile-10,tile-8);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('묘지',px+tile/2,py+20);}
     if(c==='y'&&w.district==='lumiose-quasartico'){const img=fieldImages[702];if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-4,py-8,tile+8,tile+8);else{ctx.fillStyle='#dfaa45';ctx.fillRect(px+8,py+8,tile-16,tile-12);}}
     if(c==='q'){const cafe=w.district==='lumiose-vernal';ctx.fillStyle=cafe?'#a44c45':'#6e7780';ctx.fillRect(px+3,py+3,tile-6,tile-6);if(cafe){ctx.fillStyle='#f4e2c9';for(let i=5;i<tile-4;i+=8)ctx.fillRect(px+i,py+4,4,5);ctx.fillStyle='#dac4aa';ctx.fillRect(px+5,py+tile-7,tile-10,3);}ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(cafe?'카페':'골목',px+tile/2,py+20);}
     if(c==='%'&&w.district==='lumiose-centrico-route'){ctx.fillStyle='#91a7aa';ctx.fillRect(px,py,tile,tile);ctx.fillStyle='#dce6e1';ctx.fillRect(px+4,py+4,tile-8,tile-8);ctx.fillStyle='#547985';ctx.fillRect(px+8,py+7,tile-16,tile-14);if(x===11&&y===12){ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('탑',px+tile/2,py+20);}}
     if(c==='b'){ctx.fillStyle='#765e81';ctx.fillRect(px+3,py+3,tile-6,tile-6);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('탐정',px+tile/2,py+20);}
     if(c==='Y'||c==='Z'){ctx.fillStyle='#8d684d';ctx.fillRect(px+5,py+5,tile-10,tile-10);ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('안내',px+tile/2,py+20);}
     if(c==='E'||c==='W'){ctx.fillStyle='#537b85';ctx.font='bold 23px sans-serif';ctx.textAlign='center';ctx.fillText(w.district==='lumiose-zone2'?(c==='E'?'↓':'↑'):(c==='E'?'›':'‹'),px+tile/2,py+25);}
     if(c==='X'){ctx.fillStyle='#537b85';ctx.fillRect(px+3,py+4,tile-6,tile-8);ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(w.district==='lumiose-royale'?'광장':w.district==='lumiose-bureau'?'출구':w.district==='lumiose-rooftop'?'광장':w.district==='lumiose-zone3'?(y===0?'북쪽':'남쪽'):w.district==='lumiose-rouge-north'?'광장':w.district==='lumiose-vernal'?'연구소':'항구',px+tile/2,py+20);}
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
    const label=b.kind==='H'?'포켓몬 센터':b.kind==='M'?'프렌들리숍':b.kind==='G'?'GYM':b.kind==='J'?'호텔 안내소':b.kind==='l'?'스시 식당':'연구소';
    ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillStyle='#253e3c';ctx.fillRect(b.x*tile-24,(b.y+1)*tile-2,80,19);ctx.fillStyle='#ffffff';ctx.fillText(label,b.x*tile+16,(b.y+1)*tile+11);
   }
   if(w.area===9&&!w.expedition){for(let y=1;y<=4;y++)for(let x=7;x<=21;x++)sprite(y===1?'castleBattlement':y===3?'castleWindow':'castleWall',x*tile,y*tile);[8,11,14,17,20].forEach((x,i)=>{sprite('castleDoor',x*tile,4*tile);ctx.fillStyle='#fff4bc';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(i===4?'챔피언':`${i+1} 사천왕`,x*tile+16,6*tile-8);});}
   function trainer(x:number,y:number,color:string,face:string,walk=false){
    const px=Math.round(x*tile+tile/2-12),py=Math.round(y*tile+tile-29),step=walk&&!reduce?Math.sin(time/70)*2:0;
    ctx!.fillStyle='#28473155';ctx!.beginPath();ctx!.ellipse(px+12,py+28,12,4,0,0,Math.PI*2);ctx!.fill();
    const colors:Record<string,string>={R:color,W:'#f3f2dd',S:'#f4c48d',K:'#263e51',B:'#3d79aa',Y:'#f4cf64',D:'#4b3741'};
    adventureAvatarRows(face).forEach((row:string,ry:number)=>Array.from(row).forEach((p,rx)=>{if(p==='.')return;ctx!.fillStyle=colors[p];ctx!.fillRect(px+rx*2,py+ry*2+(ry>10?(rx<6?step:-step):0),2,2);}));
   }
   w.map.forEach((row:string,y:number)=>Array.from(row).forEach((c,x)=>{if(cloudNpcTile(c,w))trainer(x,y,c==='N'?'#8d5ca8':c==='R'?'#719f9a':c==='F'?'#9e758e':c==='D'?'#bb9c42':c==='A'?'#59855b':c==='B'?'#477e9a':'#cf9254','down');}));
   const budew=zone2BudewPosition(w);if(budew){const px=budew.x*tile,py=budew.y*tile;if(budewImage.complete&&budewImage.naturalWidth)ctx.drawImage(budewImage,px-8,py-13,tile+16,tile+16);else{ctx.fillStyle='#79a85d';ctx.fillRect(px+8,py+8,tile-16,tile-12);ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('꼬몽울',px+tile/2,py+20);}}
   const kakuna=zone2KakunaPosition(w);if(kakuna){const px=kakuna.x*tile,py=kakuna.y*tile;if(kakunaImage.complete&&kakunaImage.naturalWidth)ctx.drawImage(kakunaImage,px,py-8,tile,tile);else{ctx.fillStyle='#e0bc46';ctx.fillRect(px+10,py+3,12,23);}}
   for(const m of zone2FieldMonsters(w,props.current.period)){const px=m.x*tile,py=m.y*tile,img=fieldImages[m.speciesId];if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#e6d39d';ctx.fillRect(px+8,py+8,tile-16,tile-12);ctx.fillStyle='#263e51';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText(m.name,px+tile/2,py+20);}}
   for(const m of zone3FieldMonsters(w,props.current.period)){const px=m.x*tile,py=m.y*tile,img=fieldImages[m.speciesId];if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-8,py-12,tile+16,tile+16);else{ctx.fillStyle='#eee0b4';ctx.fillRect(px+8,py+8,tile-16,tile-12);ctx.fillStyle='#263e51';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText(m.name,px+tile/2,py+20);}}
   const companion=w.zaRooftopCompanionPosition;if(w.district==='lumiose-rooftop'&&w.zaRooftopIntroduced&&!w.zaRooftopTraversed&&Number.isInteger(companion?.x)&&Number.isInteger(companion?.y)&&(companion.x!==w.x||companion.y!==w.y))trainer(companion.x,companion.y,'#a87fbd',companion.facing||'down',moving);
   for(const member of w.unionMembers||[])if(member.x!==w.x||member.y!==w.y)trainer(member.x,member.y,'#e7b93e','down');
   trainer(s.x,s.y,'#d95250',w.facing||'down',moving);
   ctx.restore();
   // Soft border is part of the camera, never a fullscreen tint over sprites.
   ctx.strokeStyle='#284d3b55';ctx.lineWidth=4;ctx.strokeRect(2,2,width-4,height-4);
   frame=requestAnimationFrame(draw);
  }
  frame=requestAnimationFrame(draw);return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();};
 },[]);
 return <div className="adv-field-wrap"><canvas ref={canvas} className="adv-field" tabIndex={0} aria-label={`${w.areaInfo.name} 필드. 방향키 또는 WASD로 이동, E로 대화. 현재 위치 ${w.x}, ${w.y}${zone2BudewPosition(w)?'. 야생 꼬몽울이 보입니다.':''}`} onClick={e=>{if(disabled)return;const rect=e.currentTarget.getBoundingClientRect(),s=scene.current,x=Math.floor(((e.clientX-rect.left)/rect.width*(e.currentTarget.width/2)+s.cameraX)/s.tile),y=Math.floor(((e.clientY-rect.top)/rect.height*(e.currentTarget.height/2)+s.cameraY)/s.tile),budew=zone2BudewPosition(w);if(budew&&budew.x===x&&budew.y===y){onAimBudew();return;}const kakuna=zone2KakunaPosition(w);if(kakuna&&kakuna.x===x&&kakuna.y===y){onAimKakuna();return;}const fieldMon=zone2FieldMonsters(w,period).find((m:any)=>m.x===x&&m.y===y);if(fieldMon){onAimField(fieldMon.id);return;}const zone3Mon=zone3FieldMonsters(w,period).find((m:any)=>m.x===x&&m.y===y);if(zone3Mon){onAimZone3(zone3Mon.id);return;}if(w.district==='lumiose-zone2'&&w.map[y]?.[x]==='p'){onAimIslandAlpha();return;}if(w.map[y]?.[x]==='a'&&!w.zaWildAlphaSpent){onAimAlpha();return;}if(x===w.x&&y===w.y){onInteract();return;}onPath(fieldPath(w.map,{x:w.x,y:w.y},{x,y}));}}/><div className="adv-field-hint">필드를 누르면 그곳까지 걷습니다</div>{assetError&&<span className="adv-asset-error" role="status">일부 타일 이미지를 불러오지 못했습니다.</span>}</div>;
}
