// Passage Ombragé is in Rouge Sector 4, between the Poké Ball Boutique and Looker Bureau.
// The road shape, entrances and building footprints are schematic.
// https://www.dbltap.com/guides/pokemon-legends-za-clothing-store-locations
export function rougeSector4Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 // Long shopping arcade with an entrance on the street.
 for(let y=2;y<=5;y++)for(let x=7;x<=15;x++)g[y][x]='#';
 for(let x=8;x<=14;x++)g[3][x]='g';
 g[5][11]='q';g[8][0]='W';g[8][22]='E';return g.map(row=>row.join(''));
}
