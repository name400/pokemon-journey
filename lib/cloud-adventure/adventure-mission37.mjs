// Original enemy group ordering; the corridor and levels are provisional.
export const PROTECT_WAVES=[
 {tile:'a',name:'옥상의 팀 MZ',team:[10038,10047]},
 {tile:'b',name:'Ivor와 Gwynn',team:[10073,10039,10058]},
 {tile:'e',name:'Ivor와 다리',team:[10072,10036]},
 {tile:'k',name:'Canari와 Tarragon',team:[10053,10089]},
 {tile:'j',name:'Jacinthe와 Lebanne',team:[10051,10068]},
 {tile:'g',name:'Corbeau와 옥상',team:[10076,10042,10037]},
];
export function protectWave(s,tile){const stage=Number(s.zaMission37Stage)||0,w=PROTECT_WAVES[stage-1];return s.district==='lumiose-protect'&&!s.interior&&w?.tile===tile?w:undefined;}
export function protectMap(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 const stage=Number(s.zaMission37Stage)||1;
 if(s.zaMission36DescentPending&&s.zaMission36RooftopRoute&&!s.zaMission36AtPlaza){
  // Rooftop descent precedes the plaza encounter; exact geometry is a draft.
  for(let y=1;y<16;y++)for(let x=1;x<22;x++)g[y][x]='#';
  for(let y=10;y<=14;y++)for(let x=8;x<=14;x++)g[y][x]='.';
  for(let y=5;y<=9;y++)for(let x=4;x<=12;x++)g[y][x]='.';
  for(let y=8;y<=11;y++)for(let x=10;x<=12;x++)g[y][x]=',';
  for(let y=3;y<=6;y++)for(let x=3;x<=6;x++)g[y][x]='.';
  g[15][11]='X';g[3][4]='h';return g.map(row=>row.join(''));
 }
 if(s.zaMission36DescentPending&&s.zaMission36RooftopRoute&&s.zaMission36AtPlaza){g[15][11]='X';g[14][18]='h';g[4][3]='a';return g.map(row=>row.join(''));}
 if(s.zaProtectLayout===5&&s.zaProtectBuilding===true){
  // The open building contains the Gardevoir/Gallade battle; after it,
  // a human ladder leads to the roofs. Dimensions and positions are draft.
  for(let y=1;y<16;y++)for(let x=1;x<22;x++)g[y][x]='#';
  for(let y=2;y<=14;y++)for(let x=5;x<=17;x++)g[y][x]='.';
  g[14][11]='i';if(stage===5)g[5][11]='j';if(stage>=6)g[2][11]='h';
  return g.map(row=>row.join(''));
 }
 if(s.zaProtectLayout===5&&s.zaProtectRoof===true){
  // Rooftops, scaffolding and tower roots lead to the last encounter.
  // Their shapes and precise heights are provisional.
  for(let y=1;y<16;y++)for(let x=1;x<22;x++)g[y][x]='#';
  for(let y=9;y<=13;y++)for(let x=2;x<=10;x++)g[y][x]='.';
  for(let x=9;x<=16;x++)for(let y=9;y<=10;y++)g[y][x]=',';
  for(let y=3;y<=10;y++)for(let x=15;x<=20;x++)g[y][x]='.';
  for(let y=4;y<=9;y++)g[y][16]=':';
  g[13][2]='h';if(stage===6)g[4][18]='g';if(stage>=7)g[2][18]='n';
  if(stage>=7)g[2][17]='.';
  return g.map(row=>row.join(''));
 }
 if([4,5].includes(s.zaProtectLayout)&&s.zaProtectCanal===true){
  // After the bridge, stairs descend to a canal-side walkway and rise again.
  // Exact lengths, orientation and landing positions are provisional.
  // https://www.thonky.com/pokemon-legends-z-a/main-mission-37-operation-protect-lumiose
  for(let y=1;y<16;y++)for(let x=1;x<22;x++)g[y][x]='#';
  for(let y=11;y<=13;y++)for(let x=2;x<=20;x++)g[y][x]=',';
  for(let y=3;y<=13;y++)for(let x=18;x<=20;x++)g[y][x]=',';
  for(let y=5;y<=10;y++)for(let x=2;x<=17;x++)g[y][x]='~';
  g[13][2]='h';g[3][20]='h';return g.map(row=>row.join(''));
 }
 if(![2,3,4,5].includes(s.zaProtectLayout)){g[15][11]='X';g[8][11]='n';for(const [i,t] of ['a','b','e','k','j','g'].entries())g[4][3+i*3]=t;return g.map(row=>row.join(''));}
 // Six connected areas approximate the documented park, bridge, scaffolding,
 // building and rooftop sequence. Positions and dimensions are provisional.
 for(let y=1;y<16;y++){g[y][7]='#';g[y][15]='#';}
 for(let x=1;x<22;x++)g[8][x]='#';
 for(const [x,y,required] of [[7,5,2],[15,5,3],[19,8,4],[15,12,5],[7,12,6]])if(stage>=required)g[y][x]='.';
 // Layout 4 routes the bridge section through the lower canal path. Older
 // saved layouts retain their original direct doorway and positions.
 if([4,5].includes(s.zaProtectLayout)&&stage>=3){g[5][15]='#';g[5][14]='h';g[5][16]='h';}
 // New runs take a switchback through the scaffold platform. The precise
 // shape is provisional; keep the previous layout for existing saves.
 if([3,4,5].includes(s.zaProtectLayout)){for(let x=16;x<=20;x++)g[10][x]='#';g[12][17]='#';g[12][18]='#';}
 for(const [x,y,tile] of [[3,1,'X'],[3,4,'a'],[11,4,'b'],[19,4,'e'],[19,12,'k'],[11,12,'j'],[3,12,'g'],[3,9,'n']])g[y][x]=tile;
 if(s.zaProtectLayout===5&&stage>=5){g[12][14]='i';g[12][11]='.';g[12][3]='.';g[9][3]='.';}
 return g.map(row=>row.join(''));
}
