// The Sector 11 guide describes a small western roof and an eastern ledge
// accessed from the large Sector 9 complex. Geometry and the connection to
// this project's existing scaffold are provisional 2D interpretations.
// https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/jaune-sector-11.html
export const JAUNE11_WEST_ROOF_ITEMS=Object.freeze([
 {id:'west-roof-fullheal',tile:'i',x:9,y:5,name:'만병통치약',kind:'fullheal'},
 {id:'east-ledge-bigpearl',tile:'k',x:18,y:10,name:'큰진주',kind:'bigpearl'},
]);
export function jaune11WestRoofItem(s,tile){return JAUNE11_WEST_ROOF_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaJaune11WestRoofItems)&&s.zaJaune11WestRoofItems.includes(p.id)))||null;}
export function jaune11WestRoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=11;y++)for(let x=2;x<=14;x++)g[y][x]='.';
 // Eastern ledge and its compressed approach; no claim of original stairs.
 for(let y=8;y<=11;y++)for(let x=15;x<=19;x++)g[y][x]=',';
 for(let x=1;x<=3;x++)g[6][x]='.';g[6][0]='X';
 for(const p of JAUNE11_WEST_ROOF_ITEMS)if(jaune11WestRoofItem(s,p.tile))g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
