import {side38Available} from './adventure-side38.mjs';
import {side37Available} from './adventure-side37.mjs';
// Magenta 7 has northern and southern complexes, with a southern courtyard.
// Footprints, entrance and compressed road junctions are provisional.
// https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/magenta-sector-7.html
export const MAGENTA7_COURTYARD_ITEMS=[{id:'courtyard-awakening',tile:'i',x:15,y:12,name:'잠깨는약',kind:'awakening'},{id:'courtyard-hyper',tile:'j',x:18,y:12,name:'고급상처약',kind:'hyper_potions'},{id:'north-great',tile:'k',x:4,y:3,name:'슈퍼볼',kind:'greatball'},{id:'north-pearl',tile:'n',x:7,y:3,name:'진주',kind:'pearl'}];
export function magenta7CourtyardItem(s,tile){return MAGENTA7_COURTYARD_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaMagenta7Items)&&s.zaMagenta7Items.includes(p.id)))||null;}
export const MAGENTA7_ROOF_ITEMS=[{id:'west-great',tile:'i',x:4,y:8,name:'슈퍼볼',kind:'greatball'},{id:'west-thunder',tile:'j',x:5,y:5,name:'천둥의돌',kind:'thunderstone'},{id:'west-ultra',tile:'k',x:7,y:9,name:'하이퍼볼',kind:'ultraball'},{id:'north-super',tile:'n',x:12,y:3,name:'좋은상처약',kind:'super_potions'},{id:'southeast-candy',tile:'t',x:18,y:10,name:'경험사탕 S',kind:'za-exp-candy-s'}];
export const MAGENTA7_SOUTH_ROOF_ITEMS=[{id:'south-firestone',tile:'i',x:4,y:11,name:'불꽃의돌',kind:'firestone'},{id:'south-revive',tile:'j',x:18,y:11,name:'기력의조각',kind:'revive'},{id:'south-candy',tile:'k',x:12,y:4,name:'경험사탕 M',kind:'za-exp-candy-m'}];
export function magenta7RoofItem(s,tile){const items=s.district==='lumiose-magenta7-south-roof'?MAGENTA7_SOUTH_ROOF_ITEMS:MAGENTA7_ROOF_ITEMS;return items.find(p=>p.tile===tile&&!(Array.isArray(s.zaMagenta7RoofItems)&&s.zaMagenta7RoofItems.includes(p.id)))||null;}
// Separate 2D roof: precise stairs, roof footprint and item tiles are provisional.
export function magenta7NorthRoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=3;y<=10;y++)for(let x=3;x<=19;x++)g[y][x]='.';
 for(let y=11;y<=15;y++)for(let x=9;x<=13;x++)g[y][x]='.';
 g[16][11]='X';for(const p of MAGENTA7_ROOF_ITEMS)if(magenta7RoofItem(s,p.tile))g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
// The guide identifies a southern roof reached by gliding, not exact geometry.
export function magenta7SouthRoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=3;y<=13;y++)for(let x=3;x<=19;x++)g[y][x]='.';
 for(const p of MAGENTA7_SOUTH_ROOF_ITEMS)if(magenta7RoofItem(s,p.tile))g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
export function magentaSector7Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=3;x<=8;x++)g[y][x]='#';
 // A grass courtyard exists in the northern complex; shape and entrance are provisional.
 for(let y=3;y<=4;y++)for(let x=4;x<=7;x++)g[y][x]='g';
 g[5][6]=s.zaMagenta7NorthOpen===true?',':'r';
 if(s.zaMagenta7NorthOpen===true)g[2][6]='X';
 // A walkable marker preserves old positions even while the city individual appears.
 if(s.zaMagenta7NorthOpen===true&&s.zaCityResearchSpent?.['magenta7-ralts']!==true)g[4][5]='p';
 for(let y=10;y<=14;y++)for(let x=14;x<=19;x++)g[y][x]='#';
 for(let y=11;y<=13;y++)for(let x=15;x<=18;x++)g[y][x]=';';
 g[10][16]=';';for(const p of MAGENTA7_COURTYARD_ITEMS)if(magenta7CourtyardItem(s,p.tile))g[p.y][p.x]=p.tile;g[0][7]='X';g[0][11]='X';g[16][11]='X';g[8][0]='X';g[8][22]='X';
 return g.map(row=>row.join(''));
}
// Magenta Sector 4 lies north of Magenta Plaza beside Autumnal Avenue.
// The plaza outline, café position and street dimensions are provisional.
export function magentaSector4Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=7;y<=9;y++)for(let x=10;x<=21;x++)g[y][x]=',';
 for(let y=3;y<=6;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 for(let y=7;y<=10;y++)for(let x=3;x<=7;x++)g[y][x]='g';
 // Mission 28 takes place on a rooftop; this street marker is a provisional access point.
 // https://pokequery.com/games/legends-za/walkthrough (Mission 28)
 if((s.zaMission26Stage===3&&!s.zaMission28Complete)||s.zaMission28RewardPending===true)g[8][14]='8';
 g[8][0]='X';g[12][0]='X';g[11][22]='X'; // provisional connections to adjacent sectors
 g[10][15]='^'; // provisional refuse collection point, previously impassable
 g[14][17]='u'; // provisional approach to nearby Magenta Sector 2 café
 g[0][11]='X';g[6][5]='q';g[8][9]='j';g[8][22]='X';g[16][11]='X';return g.map(row=>row.join(''));
}

// The rooftop approach and dimensions remain a draft; the sources describe a lift,
// a rooftop circuit and scaffolding, but do not provide exact tile coordinates.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-28-a-rogue-mega-altaria
// https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/A_Rogue_Mega_Altaria
export function magentaSector4RoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=3;y<=14;y++)for(let x=1;x<=3;x++)g[y][x]='.';
 for(let y=3;y<=5;y++)for(let x=1;x<=19;x++)g[y][x]='.';
 for(let y=3;y<=9;y++)for(let x=17;x<=21;x++)g[y][x]='.';
 // An approximate rooftop circuit leads to scaffolding and the battle roof.
 // Existing walkable tiles are retained for saves made in the earlier draft.
 for(let y=11;y<=13;y++)for(let x=3;x<=14;x++)g[y][x]='.';
 for(let y=5;y<=12;y++)for(let x=12;x<=14;x++)g[y][x]='.';
 // Continue around the south and east sides; dimensions are a 2D draft.
 // Keep the older northern connection for existing saves.
 for(let y=11;y<=13;y++)for(let x=14;x<=19;x++)g[y][x]='.';
 for(let y=6;y<=13;y++)for(let x=17;x<=19;x++)g[y][x]='.';
 for(let y=7;y<=9;y++)for(let x=17;x<=19;x++)g[y][x]=','; // scaffold between roof sections
 for(let y=3;y<=5;y++)for(let x=15;x<=16;x++)g[y][x]=',';
 // Draft link to the roof reached by Zone 7's western Holovator.
 g[6][0]='X';
 g[14][1]='j';
 if((s.zaMission26Stage===3&&!s.zaMission28Complete)||s.zaMission28RewardPending===true)g[4][19]='8';
 return g.map(row=>row.join(''));
}

// Sector 2 is south of Sector 4 and adjacent to Autumnal Avenue; coordinates are a draft.
// https://bulbapedia.bulbagarden.net/wiki/Magenta_Sector_2
export function magentaSector2Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 for(let y=11;y<=13;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=11;y<=13;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 // Southeastern ground approach to Centrico Plaza; coordinates are draft.
 for(let x=12;x<=16;x++)g[15][x]=',';
 g[6][17]='u';g[16][16]='X';g[16][11]='X';g[0][11]='X';g[8][0]='X';g[8][22]='X';return g.map(row=>row.join(''));
}

// Compressed central Magenta Street with a canal-side path and bridge.
// Relative destinations follow documented city geography; all tile positions are drafts.
// https://bulbapedia.bulbagarden.net/wiki/Magenta_Street
export function magentaStreetMap(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=4;x<=7;x++)g[y][x]='~';
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let x=4;x<=7;x++)for(let y=7;y<=9;y++)g[y][x]=':';
 for(let y of [4,12])for(let x=10;x<=21;x++)g[y][x]=',';
 for(const [x0,y0,x1,y1] of [[15,1,19,3],[15,5,19,6],[15,10,19,11],[15,13,19,15]])for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)g[y][x]='#';
 if(side38Available(s)){g[5][15]='^';g[5][17]='^';} // Maxen and Deb, provisional positions.
 if(side37Available(s))g[5][7]='^'; // Barnie at the waterside; position is a draft.
 g[15][14]=',';g[16][14]='X';g[0][12]='X';g[0][11]='X';g[16][11]='X';g[6][0]='X';g[8][0]='X';g[4][22]='X';g[6][22]='X';g[8][22]='X';g[12][22]='X';return g.map(row=>row.join(''));
}
