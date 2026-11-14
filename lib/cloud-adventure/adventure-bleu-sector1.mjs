// Bleu Sector 1 adjoins Bleu Plaza to the southwest and Bleu Sector 3 to the south.
// Much of the sector belongs to Wild Zone 5; this is the accessible street edge,
// not a reconstruction of the zone or its unverified building geometry.
// https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/bleu-sector-1.html
export function bleuSector1Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=11;y<=13;y++)for(let x=1;x<=12;x++)g[y][x]=',';
 // The officer is next to Bleu Plaza; both frontage and street are provisional.
 for(let y=3;y<=6;y++)for(let x=4;x<=7;x++)g[y][x]='#';
 // A green edge represents the existing nearby wild zone without adding encounters.
 for(let y=2;y<=8;y++)for(let x=16;x<=20;x++)g[y][x]=';';
 g[12][0]='X';g[16][11]='X';g[0][11]='X';return g.map(row=>row.join(''));
}
