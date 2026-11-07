// Bleu Plaza lies south of Zone 5 near the Rust Syndicate Office. The street's
// tile dimensions, office approach and gate coordinates are provisional.
export function bleuPlazaRouteMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let x=10;x<=21;x++)for(let y=7;y<=9;y++)g[y][x]=',';
 for(let y=3;y<=6;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 // The east Zone 16 entrance faces a police station. Its exact footprint and
 // street alignment in this compressed screen are provisional.
 // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_16
 for(let y=10;y<=13;y++)for(let x=15;x<=19;x++)g[y][x]='%';
 g[0][11]='X';g[16][11]='X';g[16][16]='X';g[16][20]='X';g[16][5]='X';g[8][22]='X';g[8][0]='W';return g.map(row=>row.join(''));
}
