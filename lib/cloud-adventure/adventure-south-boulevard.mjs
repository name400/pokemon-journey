// The boulevard borders Bleu Sector 7 and serves the Pokémon Research Lab.
// Building geometry, route length and exact gate locations are provisional.
export function southBoulevardMap(s={}){
 if(s.zaVert7RoofUpper===true){
  // Holovator and leaf bridge are documented; the roof dimensions are draft.
  // https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/Exploring_Lumiose_City
  const g=Array.from({length:17},()=>Array(23).fill('#'));
  for(let y=5;y<=10;y++)for(let x=2;x<=8;x++)g[y][x]='.';
  for(let x=9;x<=13;x++)g[8][x]='v';
  for(let y=5;y<=10;y++)for(let x=14;x<=20;x++)g[y][x]='.';
  g[11][5]='j';return g.map(row=>row.join(''));
 }
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=1;y<=8;y++)for(let x=7;x<=9;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=12;x<=17;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=4;x<=9;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 // Mission 4 taxi lot is on South Boulevard; its exact footprint is provisional.
 // https://bulbapedia.bulbagarden.net/wiki/Zach/Quotes
 if(s.zaMission04Started===true&&s.zaRoyaleRank==='Z'){for(const x of [13,14,15])g[7][x]=';';g[6][14]='n';}
 // South of Vert Sector 7 near Racine Construction; exact placement is draft.
 g[11][5]='j';g[6][4]='h';g[0][12]='X';g[0][20]='X';g[0][18]='X';g[0][16]='X';g[0][14]='X';g[0][11]='X';g[0][8]='X';g[0][4]='X';g[8][0]='X';g[8][22]='X';g[12][22]='X';g[14][22]='X';return g.map(row=>row.join(''));
}
