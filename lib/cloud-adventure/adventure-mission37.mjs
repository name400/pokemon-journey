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
export function protectMap(){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));g[15][11]='X';g[8][11]='n';for(const [i,t] of ['a','b','e','k','j','g'].entries())g[4][3+i*3]=t;return g.map(row=>row.join(''));}
