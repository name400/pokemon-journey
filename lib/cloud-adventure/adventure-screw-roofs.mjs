// Provisional 2D access to documented rooftop/scaffold screw locations.
// https://www.gamerguides.com/pokemon-legends-z-a/checklists/colorful-screw-locations/
// Exact entrance locations, roof geometry and glide landings are approximations.
export const SCREW_ROOFS=Object.freeze([
 {district:'lumiose-vert-sector1',roof:'lumiose-screw-vert1',x:9,y:1},
 {district:'lumiose-rouge-sector5',roof:'lumiose-screw-rouge5',x:9,y:3},
 {district:'lumiose-rouge-sector8',roof:'lumiose-screw-rouge8',x:9,y:3},
 {district:'lumiose-jaune-sector11',roof:'lumiose-screw-jaune11',x:9,y:3},
]);
export function screwRoofConfig(s){return !s?.interior?SCREW_ROOFS.find(p=>p.district===s?.district||p.roof===s?.district):undefined;}
export function screwRoofMap(){const g=Array.from({length:17},()=>Array(23).fill('#'));for(let y=4;y<=12;y++)for(let x=3;x<=19;x++)g[y][x]='.';for(let x=7;x<=15;x++)g[8][x]=',';g[12][4]='j';return g.map(row=>row.join(''));}
export function screwRoofEntrance(s,spot){const p=screwRoofConfig(s);if(!p||spot?.tile!=='j')return null;return s.district===p.district&&spot.x===p.x&&spot.y===p.y?p:s.district===p.roof&&spot.x===4&&spot.y===12?p:null;}
