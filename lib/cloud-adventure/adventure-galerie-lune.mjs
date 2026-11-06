// Galerie de la Lune: central domed hall, west Rouge Street, east Hibernal
// Avenue and south Centrico Plaza entrances. Tile scale and store order are drafts.
// https://www.pokepedia.fr/Galerie_Clair_de_Lune
export const LUNE_SHOPS={a:'SUBATOMIC 4',b:'Kikonashi',c:'Le Pays des Vêtements',d:'Triathlon Rouge',e:'La Tornade',f:'Masterpiece',g:'Le Pays des Pieds',h:'SUBATOMIC',s:'미용실'};
export function galerieLuneMap(){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=3;y<=10;y++)for(let x=6;x<=16;x++)g[y][x]='.';
 for(let x=1;x<=5;x++)for(let y=6;y<=8;y++)g[y][x]=',';
 for(let x=17;x<=21;x++)for(let y=6;y<=8;y++)g[y][x]=',';
 for(let y=11;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let i=0;i<4;i++){const y=4+i*2;g[y][6]='abcdefgh'[i*2];g[y][16]='abcdefgh'[i*2+1];}
 g[3][11]='s';g[7][0]='W';g[7][22]='E';g[16][11]='X';return g.map(row=>row.join(''));
}
