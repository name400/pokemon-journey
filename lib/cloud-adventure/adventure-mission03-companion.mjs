// The companion follows the player's previous tile using ordinary ground only.
// It does not occupy collision space or cross exits, ladders, water or events.
const DIRECTIONS=[[0,-1,'up'],[1,0,'right'],[0,1,'down'],[-1,0,'left']];
const traversable=(map,x,y)=>['.',',',';'].includes(map[y]?.[x]);
/** @param {{x?: number, y?: number}|null} playerNext */
export function advanceMission03Companion(s,map,playerNext=null){
 const target={x:s.x,y:s.y},p=s.zaMission03CompanionPosition;
 if(!traversable(map,target.x,target.y)){
  if(p?.district!==s.district)return null;
  // Step aside if the player leaves a ladder directly into the companion's tile.
  if(playerNext&&p.x===playerNext.x&&p.y===playerNext.y)for(const [dx,dy,facing] of DIRECTIONS){const x=p.x+dx,y=p.y+dy;if(traversable(map,x,y)&&!(x===playerNext.x&&y===playerNext.y))return {district:s.district,x,y,facing};}
  return p;
 }
 if(!p||p.district!==s.district||!Number.isInteger(p.x)||!Number.isInteger(p.y)||!traversable(map,p.x,p.y))return {district:s.district,...target,facing:s.facing||'down'};
 if(p.x===target.x&&p.y===target.y)return p;
 const key=(x,y)=>`${x},${y}`,queue=[{x:p.x,y:p.y}],seen=new Set([key(p.x,p.y)]),previous=new Map();
 for(let i=0;i<queue.length;i++){const cur=queue[i];if(cur.x===target.x&&cur.y===target.y)break;for(const [dx,dy,facing] of DIRECTIONS){const x=cur.x+dx,y=cur.y+dy,k=key(x,y);if(seen.has(k)||!traversable(map,x,y)||(playerNext&&x===playerNext.x&&y===playerNext.y))continue;seen.add(k);previous.set(k,{...cur,facing});queue.push({x,y});}}
 let x=target.x,y=target.y;if(!seen.has(key(x,y)))return p;
 while(true){const prev=previous.get(key(x,y));if(!prev)return p;if(prev.x===p.x&&prev.y===p.y)return {district:s.district,x,y,facing:prev.facing};x=prev.x;y=prev.y;}
}
