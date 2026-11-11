// Sector 6 joins South Boulevard and a northern Wild Zone 17 entrance.
// Water, bridge, street shapes and exact gate coordinates are provisional.
export function vertSector6Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=5;y<=6;y++)for(let x=1;x<=21;x++)g[y][x]='~';
 for(let y=5;y<=6;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=8;y<=10;y++)for(let x=1;x<=10;x++)g[y][x]=',';
 for(let y=9;y<=12;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 for(let x=17;x<=21;x++)g[3][x]=':'; // bridge approach to Sector 7, approximate
 g[13][17]='u';g[13][13]='q';g[2][18]='l';g[8][0]='W';g[12][0]='X';g[3][22]='X';g[12][22]='X';g[0][19]='X';g[16][11]='X';return g.map(row=>row.join(''));
}

// The northeastern ladder roof and Racine Construction roof are distinct.
// Exact footprints, gap and return route are provisional.
// https://raiderking.com/pokemon-legends-z-a-all-tms-locations/
export function vert6RoofMap(){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=11;y++)for(const [left,right] of [[3,9],[13,19]])for(let x=left;x<=right;x++)g[y][x]='.';
 // A separate roof overlooks Coulant Waterway. Its exact geometry is a draft.
 // https://www.psypokes.com/plza/tm.php
 for(let y=1;y<=2;y++)for(let x=13;x<=19;x++)g[y][x]='.';
 g[10][18]='l';return g.map(row=>row.join(''));
}

// Vert Sector 3 links the Saison bridge to Vert Plaza. Exact geometry is provisional.
export function vertSector3Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=4;y<=12;y++)for(let x=3;x<=8;x++)g[y][x]='g';
 for(let y=2;y<=5;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 // Northeastern courtyard and Florges fountain are documented; tiles and gate are draft.
 // https://www.nintendolife.com/guides/pokemon-legends-z-a-the-many-flowers-of-flabebe-side-mission-where-to-find-all-five-colours
 for(let y=3;y<=4;y++)for(let x=16;x<=18;x++)g[y][x]=',';
 g[4][16]='~';g[5][17]=',';
 // Three draft approaches face the western Coulant Waterway stairs.
 for(const y of [4,7,10]){g[y][21]=':';g[y][22]='X';}
 g[0][11]='X';g[7][0]='X';g[7][22]='X';g[16][11]='X';g[16][17]='X';
 return g.map(row=>row.join(''));
}

// Vert Sector 1 is west of Sector 3, near Vert Street. Exact geometry is provisional.
export function vertSector1Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=9;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=3;x<=8;x++)g[y][x]='#';
 // Vert Sector 1 has a building courtyard; the footprint and opening are drafts.
 // https://sportsrant.indiatimes.com/gaming/list-of-all-colourful-screw-locations-in-pokmon-legends-z-a/articleshow/126639673.html
 for(let y=3;y<=4;y++)for(let x=4;x<=7;x++)g[y][x]=',';g[5][5]=',';
 for(let y=2;y<=6;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[7][22]='X';g[16][11]='X';
 return g.map(row=>row.join(''));
}

// Vert Sector 7 includes a grassy plaza by the bridge from Sector 6.
// Building outlines, precise bridge alignment and elevation are provisional.
export function vertSector7Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=4;y<=12;y++)for(let x=6;x<=16;x++)g[y][x]='g';
 for(let x=1;x<=21;x++)for(let y=7;y<=9;y++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=2;x<=5;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=16;x<=20;x++)g[y][x]='#';
 for(let x=1;x<=4;x++)g[8][x]=':'; // continuation of the bridge, approximate
 g[8][0]='X';g[0][11]='X';g[0][18]='X';g[16][11]='X';
 return g.map(row=>row.join(''));
}

// Racine Construction's garage and small streaming room are documented;
// doorway, furnishing and tile proportions are provisional 2D layouts.
// https://bulbapedia.bulbagarden.net/wiki/Racine_Construction
export function racineGarageMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let x=3;x<=8;x++)g[3][x]='#';for(let x=14;x<=19;x++)g[3][x]='#';
 g[5][11]='d';g[6][17]='u';g[15][11]='X';return g.map(row=>row.join(''));
}
export function racineCanariRoomMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let x=7;x<=15;x++)g[4][x]='k';g[5][11]='c';g[15][11]='X';return g.map(row=>row.join(''));
}
