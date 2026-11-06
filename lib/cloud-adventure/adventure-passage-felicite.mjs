// The three glass-roofed corridors link Bleu Sector 6, Sector 8 and Bleu Street.
// Shop order, building widths and exact gate coordinates remain provisional.
// https://www.pokepedia.fr/Passage_du_Bonheur
// https://bulbapedia.bulbagarden.net/wiki/Passage_de_la_F%C3%A9licit%C3%A9
export const FELICITE_SHOPS={a:'Marché Bleu',b:'In the Zone',d:'Équipement',e:'Kickspin',f:'Triathlon Bleu',g:'DEFOG Eyewear'};
export function passageFeliciteMap(){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 // Keep the older broad passage traversable for existing saved positions.
 for(let y=5;y<=11;y++)for(let x=1;x<=21;x++)g[y][x]='.';
 for(let x=3;x<=19;x+=4){g[5][x]='c';g[11][x]='c';}
 for(let y=1;y<=15;y++)for(const x of [4,11,18])if(g[y][x]==='#'||g[y][x]==='.')g[y][x]=',';
 for(const [x,y,c] of [[3,5,'a'],[7,5,'b'],[11,5,'d'],[3,11,'e'],[7,11,'f'],[11,11,'g']])g[y][x]=c;
 g[6][0]='X';g[8][0]='W';g[8][22]='E';g[0][11]='X';g[16][11]='X';return g.map(row=>row.join(''));
}
// Street and building coordinates within Sector 8 are a draft.
export function bleuSector8Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=14;x<=18;x++)g[y][x]='#';
 g[8][22]='X';return g.map(row=>row.join(''));
}
