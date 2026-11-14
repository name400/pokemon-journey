// The NPC and café share a blocked wall tile in the draft 2D map.
// https://bulbapedia.bulbagarden.net/wiki/Task_(Legends:_Z-A)
export function side18Available(s={}){return [1,2].includes(s.zaSide18Stage)||s.zaLidaStage>=2||s.zaMission08Complete===true||['V','F','E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side18Spot(s,p){return s?.district==='lumiose-vert-sector3'&&!s.interior&&p?.tile==='^'&&p.x===15&&p.y===2;}
