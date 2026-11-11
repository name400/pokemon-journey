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

// Exterior scaffolding, gallery roof and glass dome are documented; all tile
// footprints and this compressed scaffold route are provisional.
// https://www.nintendolife.com/guides/pokemon-legends-z-a-how-to-catch-xerneas-and-yveltal
// https://pokejungle.net/pokemon-legends-z-a/tm-list-locations/
export function galerieLuneRoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=5;y<=11;y++)for(let x=2;x<=8;x++)g[y][x]=',';
 for(let y=4;y<=12;y++)for(let x=12;x<=20;x++)g[y][x]='.';
 for(let y=1;y<=2;y++)for(let x=14;x<=20;x++)g[y][x]=';';
 g[8][3]='h';g[8][8]='l';g[8][12]='l';
 // Yveltal lands on the glass dome after the simulator. Exact tile is provisional.
 if(s.zaMission41Stage===3&&!s.zaMission41Complete)g[2][16]=s.zaMission41DomeInvestigated===false?'z':'0';
 return g.map(row=>row.join(''));
}
