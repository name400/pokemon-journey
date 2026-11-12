// Mission 21 reaches a rooftop in Magenta Sector 6 via scaffolding.
// Coordinates, roof heights and the connecting platform are provisional.
// https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/magenta-sector-6.html
export function magenta6RoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=13;y++)for(let x=1;x<=8;x++)g[y][x]='.';
 for(let y=3;y<=11;y++)for(let x=15;x<=21;x++)g[y][x]='.';
 for(let y=6;y<=8;y++)for(let x=9;x<=14;x++)g[y][x]=',';
 g[14][2]='l';g[10][16]='j';
 if((s.zaMission20Stage===5&&!s.zaMission21Complete)||s.zaMission21RewardPending===true)g[5][18]='m';
 return g.map(row=>row.join(''));
}

// Scaffold approach with a turning walkway and steps; exact coordinates and
// intermediate heights remain provisional.
// https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/Exploring_Lumiose_City
export function magenta6ScaffoldMap(){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let x=2;x<=6;x++)g[11][x]=',';
 for(let y=5;y<=11;y++)g[y][6]=',';
 for(let x=6;x<=18;x++)g[5][x]=',';
 g[12][2]=',';g[13][2]='l';g[4][11]='l';g[4][18]=',';g[3][18]='j';
 return g.map(row=>row.join(''));
}

// Battle court side alley linking the Sector 3 roof descent to Sector 6.
// Court outline, alley width, and landing positions are provisional.
// https://sportsrant.indiatimes.com/gaming/list-of-all-colourful-screw-locations-in-pokmon-legends-z-a/articleshow/126639673.html
export function magenta6CourtAlleyMap(){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=12;y++)for(let x=3;x<=6;x++)g[y][x]='.';
 for(let y=6;y<=8;y++)for(let x=6;x<=19;x++)g[y][x]='.';
 // The nearby court is walkable; its exact footprint and orientation are draft.
 for(let y=10;y<=14;y++)for(let x=9;x<=17;x++)g[y][x]=';';
 g[9][12]='.';g[7][20]='a';
 return g.map(row=>row.join(''));
}
