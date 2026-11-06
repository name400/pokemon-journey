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

// The glazed arcade has a north entrance from Sector 3 and south entrance from Sector 1.
// Store order and tile dimensions are provisional.
// https://www.pokepedia.fr/Passage_de_l%27Ombre
export const OMBRAGE_SHOPS={
 a:'Glammor Pretti',b:'Les Chaussures',c:'NIGHTSIDE',d:'Glammor Cuti',
 e:'Atelier Heads',f:'DENSOKU Lumiose',g:'Bundle Up',h:'Wisp',
 i:'Glammor Sporti',j:'Midnight Rite',k:'FILMFAN',l:'Mode Mature',
 m:'Glammor Girli',n:'Mode Magnifique',s:'미용실'
};
export function ombrageArcadeMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=1;y<=15;y++)for(let x=7;x<=15;x++)g[y][x]=',';
 for(let i=0;i<7;i++){const y=2+i*2;g[y][6]='abcdefghijklmn'[i*2];g[y][16]='abcdefghijklmn'[i*2+1];}
 g[8][16]='s';g[9][16]='h'; // Keep the salon central without replacing a boutique.
 if(!s.zaOmbrageDuskBall)g[3][14]='u'; // Dusk Ball is near the north entrance; tile is provisional.
 g[0][11]='X';g[16][11]='X';return g.map(row=>row.join(''));
}
