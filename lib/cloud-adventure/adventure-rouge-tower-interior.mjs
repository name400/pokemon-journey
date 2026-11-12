// The stone building in Wild Zone 3 has an internal staircase to its roof.
// Floor dimensions and the exact position of its doorway remain provisional.
// https://www.pockettactics.com/pokemon-legends-z-a/wild-zone-3
export function rougeTowerInteriorMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=13;y++)for(let x=7;x<=15;x++)g[y][x]='.';
 g[5][11]='i';g[13][11]='j';
 if(s.zaBunnelbyQuest===3&&!s.zaZone3LitleoSpent)g[8][9]='p';
 return g.map(row=>row.join(''));
}
