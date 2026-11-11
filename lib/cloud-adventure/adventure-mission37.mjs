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
 if(![2,3].includes(s.zaProtectLayout)){g[15][11]='X';g[8][11]='n';for(const [i,t] of ['a','b','e','k','j','g'].entries())g[4][3+i*3]=t;return g.map(row=>row.join(''));}
 // Six connected areas approximate the documented park, bridge, scaffolding,
 // building and rooftop sequence. Positions and dimensions are provisional.
 for(let y=1;y<16;y++){g[y][7]='#';g[y][15]='#';}
 for(let x=1;x<22;x++)g[8][x]='#';
 const stage=Number(s.zaMission37Stage)||1;
 for(const [x,y,required] of [[7,5,2],[15,5,3],[19,8,4],[15,12,5],[7,12,6]])if(stage>=required)g[y][x]='.';
 // New runs take a switchback through the scaffold platform. The precise
 // shape is provisional; keep the previous layout for existing saves.
 if(s.zaProtectLayout===3){for(let x=16;x<=20;x++)g[10][x]='#';g[12][17]='#';g[12][18]='#';}
 for(const [x,y,tile] of [[3,1,'X'],[3,4,'a'],[11,4,'b'],[19,4,'e'],[19,12,'k'],[11,12,'j'],[3,12,'g'],[3,9,'n']])g[y][x]=tile;
 return g.map(row=>row.join(''));
}
