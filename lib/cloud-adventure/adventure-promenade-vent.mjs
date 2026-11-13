// Promenade du Vent is an outdoor shopping area on both sides of Vernal Avenue.
// Boutique Couture and Changing Gears are on the Vert side; three shops are
// on the Bleu side. Tile positions and ordering are provisional.
// https://bulbapedia.bulbagarden.net/wiki/Promenade_du_Vent
// https://www.dbltap.com/guides/pokemon-legends-za-clothing-store-locations
const shops={
 '7,3':{tile:'a',name:'Fresh Fits'},
 '7,5':{tile:'o',name:'BRAVELY'},
 '7,7':{tile:'e',name:'Dessert du Moment'},
 '16,3':{tile:'i',name:'Changing Gears'},
 '16,5':{tile:'p',name:'Boutique Couture'},
 '16,7':{tile:'n',name:'미용실'}
};
export function promenadeVentShop(x,y){return shops[`${x},${y}`]||null;}
// Provisional façades behind the existing shop interaction cells.
export const VERNAL_SHOP_BUILDINGS=[...[2,3,4,5,6,7,8].flatMap(y=>[[4,y],[5,y]]),[18,2],[19,2],[18,3],[19,3],[19,4],[18,7],[19,7],[18,8],[19,8]];
export function addPromenadeVent(g){
 for(let y=2;y<=9;y++)for(const x of [6,7,8,15,16,17])g[y][x]=';';
 for(const [x,y] of VERNAL_SHOP_BUILDINGS)g[y][x]='%';
 for(const [pos,shop] of Object.entries(shops)){const [x,y]=pos.split(',').map(Number);g[y][x]=shop.tile;}
 return g;
}
