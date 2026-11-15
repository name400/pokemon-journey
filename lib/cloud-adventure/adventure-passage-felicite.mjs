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
// Courtyard locations are documented; compressed grid coordinates are provisional.
// https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/bleu-sector-8.html
export const BLEU8_COURTYARD_ITEMS=[{id:'northeast-great',tile:'i',x:6,y:3,name:'슈퍼볼',kind:'greatball'},{id:'southwest-hyper',tile:'j',x:4,y:4,name:'고급상처약',kind:'hyper_potions'},{id:'northwest-super',tile:'k',x:4,y:3,name:'좋은상처약',kind:'super_potions'},{id:'northwest-ultra',tile:'l',x:5,y:3,name:'하이퍼볼',kind:'ultraball'}];
export function bleu8CourtyardItem(s,tile){return BLEU8_COURTYARD_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaBleu8Items)&&s.zaBleu8Items.includes(p.id)))||null;}
export function bleuSector8Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=14;x<=18;x++)g[y][x]='#';
 // Sector 8 includes a courtyard; its compressed footprint and entrance are
 // provisional. Keep the existing show-registration marker on its old tile.
 for(let y=3;y<=4;y++)for(let x=4;x<=6;x++)g[y][x]=';';
 g[5][4]=';';
 for(const p of BLEU8_COURTYARD_ITEMS)if(bleu8CourtyardItem(s,p.tile))g[p.y][p.x]=p.tile;
 g[5][5]='^'; // Show registration, previously a blocked building tile.
 // Ground-level north access to Sector 6; the exact gate is provisional.
 for(let y=1;y<=6;y++)g[y][11]=',';
 g[14][16]='s';g[6][22]='X';g[8][0]='W';g[8][22]='X';g[0][11]='X';g[16][11]='X';return g.map(row=>row.join(''));
}
// The Old Building entrance is in Bleu Sector 9; its exact street is a draft.
// https://bulbapedia.bulbagarden.net/wiki/Old_Building
// The courtyard and two items by the Sector 8 building are documented.
// https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/bleu-sector-9.html
export const BLEU9_GROUND_ITEMS=[{id:'court-protein',tile:'i',x:12,y:3,name:'타우린',kind:'protein'},{id:'east-super',tile:'j',x:20,y:4,name:'좋은상처약',kind:'super_potions'},{id:'east-awakening',tile:'k',x:19,y:6,name:'잠깨는약',kind:'awakening'}];
export function bleu9GroundItem(s,tile){return BLEU9_GROUND_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaBleu9Items)&&s.zaBleu9Items.includes(p.id)))||null;}
export function bleuSector9Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=8;x<=14;x++)g[y][x]='#';
 // The district guide mentions a building-complex courtyard. Its relation to
 // the Old Building and its precise footprint are not established.
 for(let y=3;y<=4;y++)for(let x=9;x<=13;x++)g[y][x]=';';
 g[5][10]=';';
 // The north-eastern ground approach leads toward Bleu Sector 6.
 for(let y=1;y<=6;y++)g[y][20]=',';
 // The southern approach joins South Boulevard; exact coordinates are draft.
 for(let y=10;y<=15;y++)g[y][11]=',';
 for(const p of BLEU9_GROUND_ITEMS)if(bleu9GroundItem(s,p.tile))g[p.y][p.x]=p.tile;
 g[5][11]='b';g[0][11]='X';g[0][20]='X';g[16][11]='X';g[8][22]='E';return g.map(row=>row.join(''));
}

// Bleu 10 borders sectors 9 and 6 and contains Shutterbug Café.
// This non-wild street, buildings and portal tiles are provisional 2D geometry.
// https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/bleu-sector-10.html
export function bleuSector10StreetMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(const x of [5,17])for(let y=9;y<=15;y++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=8;x<=14;x++)g[y][x]='#';
 g[5][11]='^';g[0][11]='X';g[8][0]='X';g[16][5]='X';g[16][17]='X';return g.map(row=>row.join(''));
}
