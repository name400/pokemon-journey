// Transitional Jaune Sector street. Zone 19 is northeast of Zone 8 and near
// Café Acton; road widths, building outlines and entrance tile positions are drafts.
export function jauneGardenRouteMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=15;y++)for(let x=3;x<=5;x++)g[y][x]=',';
 for(let x=3;x<=19;x++)for(let y=6;y<=8;y++)g[y][x]=',';
 for(let y=1;y<=8;y++)for(let x=17;x<=19;x++)g[y][x]=',';
 for(let y=2;y<=4;y++)for(let x=8;x<=13;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=10;x<=16;x++)g[y][x]='#';
 g[8][0]='X';g[16][11]='X';g[16][4]='X';g[0][18]='X';return g.map(row=>row.join(''));
}
