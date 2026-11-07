// Visual-only joins for the provisional Zone 2 water and bridges. These do
// not alter the authoritative movement map or its saved coordinates.
export function zone2WaterEdges(map,x,y){
 const water=(xx,yy)=>['~','w'].includes(map[yy]?.[xx]);
 return {north:!water(x,y-1),east:!water(x+1,y),south:!water(x,y+1),west:!water(x-1,y)};
}
export function zone2BridgeAxis(map,x,y){
 const bridge=(xx,yy)=>map[yy]?.[xx]==='=';
 return bridge(x,y-1)||bridge(x,y+1)?'vertical':'horizontal';
}
