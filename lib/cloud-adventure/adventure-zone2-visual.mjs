// Visual-only joins for the provisional Zone 2 water and bridges. These do
// not alter the authoritative movement map or its saved coordinates.
export function zone2WaterEdges(map,x,y){
 // Bridges cross water; do not draw a shoreline along their sides.
 const water=(xx,yy)=>['~','w','='].includes(map[yy]?.[xx]);
 return {north:!water(x,y-1),east:!water(x+1,y),south:!water(x,y+1),west:!water(x-1,y)};
}
export function zone2BridgeAxis(map,x,y){
 const bridge=(xx,yy)=>map[yy]?.[xx]==='=';
 return bridge(x,y-1)||bridge(x,y+1)?'vertical':'horizontal';
}
// Omit railings where a perpendicular bridge joins, so an elbow stays open.
export function zone2BridgeRails(map,x,y){
 const bridge=(xx,yy)=>map[yy]?.[xx]==='=',vertical=zone2BridgeAxis(map,x,y)==='vertical';
 return {north:!vertical&&!bridge(x,y-1),south:!vertical&&!bridge(x,y+1),west:vertical&&!bridge(x-1,y),east:vertical&&!bridge(x+1,y)};
}
