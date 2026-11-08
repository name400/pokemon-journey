// Mission 17 uses a Holovator and scaffolding to reach a second roof.
// The shape, elevations and exact tile positions are provisional.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-17-a-rogue-mega-hawlucha
export function magenta3RoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=3;y<=13;y++)for(let x=1;x<=8;x++)g[y][x]='.';
 for(let y=3;y<=11;y++)for(let x=15;x<=21;x++)g[y][x]='.';
 for(let y=6;y<=8;y++)for(let x=9;x<=14;x++)g[y][x]=',';
 // A second ledge descends toward the Sector 6 scaffold approach.
 // Its exact placement and the intervening alley are draft.
 g[14][2]='j';g[10][20]='v';g[11][20]='v';
 if((s.zaMission15Stage===2&&!s.zaMission17Complete)||s.zaMission17RewardPending===true)g[5][18]='d';
 return g.map(row=>row.join(''));
}

// Lower gap between the buildings, reached after crossing the rooftop bridge.
// Exact footprint, depth and ladder positions are provisional.
// https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/Exploring_Lumiose_City
export function magenta3LowerGapMap(){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=3;y<=13;y++)for(let x=5;x<=8;x++)g[y][x]='.';
 g[3][6]='l';return g.map(row=>row.join(''));
}
