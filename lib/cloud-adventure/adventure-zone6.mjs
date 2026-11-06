// The north/south street, waterway, ladder and rooftop are based on Zone 6
// references. Exact coordinates, layer links and building shapes are provisional.
export const ZONE6_VISIBLE=[
 {id:'houndour',tile:'a',species:228,level:18,name:'델빌',x:6,y:5,layer:'ground'},
 {id:'meditite',tile:'b',species:307,level:20,name:'요가랑',x:15,y:5,layer:'ground'},
 {id:'buneary',tile:'d',species:427,level:18,name:'이어롤',x:8,y:13,layer:'ground'},
 {id:'magikarp',tile:'a',species:129,level:18,name:'잉어킹',x:12,y:8,layer:'canal',water:true},
 {id:'binacle',tile:'b',species:688,level:20,name:'거북손손',x:5,y:6,layer:'canal'},
 {id:'flaaffy',tile:'a',species:180,level:20,name:'보송송',x:7,y:5,layer:'roof'},
 {id:'swablu',tile:'b',species:333,level:19,name:'파비코',x:9,y:7,layer:'roof'},
];
export function zone6Layer(s){return s.zaZone6Layer==='canal'||s.zaZone6Layer==='roof'?s.zaZone6Layer:'ground';}
export function zone6Visible(s,tile){return ZONE6_VISIBLE.find(p=>p.tile===tile&&p.layer===zone6Layer(s)&&!s.zaZone6Spent?.[p.id])||null;}
export function zone6Map(s={}){
 const layer=zone6Layer(s),g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 if(layer==='canal'){
  for(let y=1;y<16;y++)for(let x=1;x<22;x++)g[y][x]='#';
  for(let y=4;y<=12;y++)for(let x=2;x<=20;x++)g[y][x]='.';
  for(let y=8;y<=11;y++)for(let x=4;x<=18;x++)g[y][x]='~';
  for(let x=10;x<=12;x++)g[7][x]=';'; // passage beneath the bridge
  g[5][3]='l';
 }else if(layer==='roof'){
  for(let y=1;y<16;y++)for(let x=1;x<22;x++)g[y][x]='#';
  for(let y=3;y<=13;y++)for(let x=4;x<=18;x++)g[y][x]='.';
  g[3][17]='h';if(!s.zaZone6Tm041)g[12][12]='t';
 }else{
  for(let y=9;y<=12;y++)for(let x=1;x<=21;x++)g[y][x]='~';
  for(let y=9;y<=12;y++)for(let x=10;x<=12;x++)g[y][x]=';';
  for(let y=3;y<=7;y++)for(let x=3;x<=8;x++)g[y][x]='g';
  for(let y=3;y<=6;y++)for(let x=13;x<=16;x++)g[y][x]='g';
  g[0][11]='X';g[16][11]='X';g[3][18]='q';g[8][5]='l';g[4][18]='h';
 }
 for(const p of ZONE6_VISIBLE)if(p.layer===layer&&!s.zaZone6Spent?.[p.id])g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
// Initial ground species and source level ranges; probabilities are provisional.
export function zone6Encounter(rng=Math.random){const pool=[[228,17,18],[307,19,20],[427,17,18]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
