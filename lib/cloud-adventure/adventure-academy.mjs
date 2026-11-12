// Académie Étoile has a large courtyard beside the road from Hibernal Avenue
// to Rouge Plaza and lies south of Rouge Sector 6. Screen scale, facade,
// gate placement and the fountain are a provisional 2D interpretation.
// https://bulbapedia.bulbagarden.net/wiki/Acad%C3%A9mie_%C3%89toile
// https://www.nintendolife.com/guides/pokemon-legends-z-a-all-z-a-royale-promotion-matches
export function academyCourtyardMap(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 // Academy facade and broad court. No grass encounters are introduced.
 for(let y=2;y<=4;y++)for(let x=3;x<=19;x++)g[y][x]='%';
 for(let x=9;x<=13;x++)g[4][x]=':';for(let y=1;y<=4;y++)g[y][11]=':';
 for(let y=5;y<=10;y++)for(let x=4;x<=18;x++)g[y][x]=';';
 for(let y=11;y<=13;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)if(g[y][x]==='.')g[y][x]=',';
 for(const [x,y] of [[5,7],[17,7],[5,10],[17,10]])g[y][x]='^';
 g[9][10]='~';g[9][11]='~';g[9][12]='~';g[10][11]='~';
 if(s.zaMission07Started===true&&s.zaRoyaleRank==='X'&&s.zaNaveenComplete===true)g[6][11]='n';
 g[12][0]='W';g[12][22]='E';g[0][11]='X';g[16][11]='X';return g.map(row=>row.join(''));
}
