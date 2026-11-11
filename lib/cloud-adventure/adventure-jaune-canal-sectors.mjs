// Zone 11's north bank borders Jaune Sector 10 to the west and Sector 12
// to the east. Streets, buildings and precise entrance positions are drafts.
export function jauneCanalSectorMap(sector,s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=1;y<=8;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 if(sector===2){for(let y=2;y<=9;y++)for(let x=2;x<=9;x++)g[y][x]='#';for(let y=4;y<=7;y++)for(let x=4;x<=7;x++)g[y][x]=',';g[8][5]=',';g[9][5]=',';g[10][5]='j';g[0][11]='X';g[16][11]='X';}else if(sector===6){g[0][11]='X';g[8][22]='X';g[16][11]='X';}else if(sector===7){g[0][11]='X';g[8][0]='X';}else if(sector===9){g[6][5]='u';g[11][6]=';';if(s.zaMission19Stage===4)g[11][7]='F';g[0][11]='X';g[8][22]='X';g[10][0]='X';g[16][11]='X';}else if(sector===10){g[0][11]='X';g[8][0]='X';g[4][22]='X';g[8][22]='X';g[9][22]='X';}else{g[4][0]='X';g[8][0]='X';g[0][11]='X';g[0][15]='X';}
 // Draft street-side connection to Zone 15's southwest entrance.
 if(sector===7)g[12][22]='X';
 // The Mission 18 encounter is in Jaune Sector 9; the exact position is draft.
 // https://www.thonky.com/pokemon-legends-z-a/main-mission-18-a-rogue-mega-banette
 if(sector===9&&((s.zaMission15Stage===2&&!s.zaMission18Complete)||s.zaMission18RewardPending===true))g[8][14]='d';
 return g.map(row=>row.join(''));
}

// Saison promenade: two levels along the north bank, with a small dock.
// Exact elevation, shore and doorway coordinates are provisional.
export function saisonCanalsideMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 // Continue the blocked water to the display edge; the x=19 bridge remains an exit.
 for(let y=11;y<=15;y++)for(let x=0;x<=22;x++)g[y][x]='~';
 for(let x=1;x<=21;x++)g[16][x]='~';
 for(let x=1;x<=21;x++){g[5][x]=',';g[6][x]=',';g[9][x]=',';g[10][x]=',';}
 // Draft building blocks along the northern promenade; preserve the three access streets.
 for(const [x0,x1] of [[2,3],[7,8],[13,14]])for(let y=2;y<=3;y++)for(let x=x0;x<=x1;x++)g[y][x]='%';
 for(let x=14;x<=16;x++)for(let y=11;y<=13;y++)g[y][x]=',';
 for(let y=11;y<=15;y++)g[y][19]=','; // provisional bridge to Vert Sector 3
 g[16][19]='X';g[0][5]='X';g[0][11]='X';g[0][17]='X';g[8][0]='X';
 return g.map(row=>row.join(''));
}

// Jaune Street links Centrico and the Jaune Plaza area; layout remains a draft.
export function jauneStreetMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=10;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=4;x<=8;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=16;x<=19;x++)g[y][x]='#';
 g[0][5]='X';g[0][11]='X';g[0][15]='X';g[0][17]='X';g[0][19]='X';g[8][0]='X';g[8][22]='X';g[16][11]='X';g[16][15]='X';
 return g.map(row=>row.join(''));
}

// The other side of Jaune Plaza opens onto Jaune Street. The street's
// exact dimensions, buildings and connection to Sector 8 are provisional.
// https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_8
// https://bulbapedia.bulbagarden.net/wiki/Jaune_Sector_8
export function jauneStreetNorthMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<16;y++)for(let x=9;x<=13;x++)g[y][x]=',';
 for(const [x0,x1,y0,y1] of [[2,6,2,5],[16,20,2,5],[2,6,10,13],[16,20,10,13]])for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)g[y][x]='#';
 g[0][11]='X';g[16][11]='X';return g.map(row=>row.join(''));
}
