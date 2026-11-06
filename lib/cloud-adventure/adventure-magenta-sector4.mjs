// Magenta Sector 4 lies north of Magenta Plaza beside Autumnal Avenue.
// The plaza outline, café position and street dimensions are provisional.
export function magentaSector4Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=7;y<=9;y++)for(let x=10;x<=21;x++)g[y][x]=',';
 for(let y=3;y<=6;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 for(let y=7;y<=10;y++)for(let x=3;x<=7;x++)g[y][x]='g';
 // Mission 28 takes place on a rooftop; this street marker is a provisional access point.
 // https://pokequery.com/games/legends-za/walkthrough (Mission 28)
 if((s.zaMission26Stage===3&&!s.zaMission28Complete)||s.zaMission28RewardPending===true)g[8][14]='8';
 g[6][5]='q';g[8][9]='j';g[8][22]='X';g[16][11]='X';return g.map(row=>row.join(''));
}

// The rooftop approach and dimensions remain a draft; the sources describe a lift,
// a rooftop circuit and scaffolding, but do not provide exact tile coordinates.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-28-a-rogue-mega-altaria
// https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/A_Rogue_Mega_Altaria
export function magentaSector4RoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=3;y<=14;y++)for(let x=1;x<=3;x++)g[y][x]='.';
 for(let y=3;y<=5;y++)for(let x=1;x<=19;x++)g[y][x]='.';
 for(let y=3;y<=9;y++)for(let x=17;x<=21;x++)g[y][x]='.';
 // An approximate rooftop circuit leads to scaffolding and the battle roof.
 // Existing walkable tiles are retained for saves made in the earlier draft.
 for(let y=11;y<=13;y++)for(let x=3;x<=14;x++)g[y][x]='.';
 for(let y=5;y<=12;y++)for(let x=12;x<=14;x++)g[y][x]='.';
 for(let y=3;y<=5;y++)for(let x=15;x<=16;x++)g[y][x]=',';
 g[14][1]='j';
 if((s.zaMission26Stage===3&&!s.zaMission28Complete)||s.zaMission28RewardPending===true)g[4][19]='8';
 return g.map(row=>row.join(''));
}
