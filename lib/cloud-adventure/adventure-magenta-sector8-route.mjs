// Wild Zone 18 has a Magenta Sector 8 approach and a North Boulevard approach.
// This connecting street's layout, boundaries, and gate coordinates are drafts.
export function magentaSector8RouteMap(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=8;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let x=10;x<=21;x++)for(let y=7;y<=9;y++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=4;x<=9;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[14][16]='u';g[12][22]='X';g[13][15]='M';g[14][12]='H';if([1,2].includes(s.zaSide88Stage))g[14][13]='n';g[0][11]='X';g[8][0]='X';g[16][11]='X';g[8][22]='X';return g.map(row=>row.join(''));
}

// The lower canal bank and sewer door are documented near Magenta Pokémon Center.
// The bank's width, ramp position and precise sewer doorway remain provisional.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-20-a-request-from-the-rust-syndicate
export function magentaSewerBankMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=4;y++)for(let x=1;x<=21;x++)g[y][x]='~';
 for(let y=5;y<=8;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=9;y<=13;y++)for(let x=16;x<=19;x++)g[y][x]=',';
 for(let y=9;y<=11;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 g[7][4]='z';g[13][18]='u';return g.map(row=>row.join(''));
}
