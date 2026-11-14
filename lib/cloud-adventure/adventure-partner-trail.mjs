// Presentation only: never persist this trail or use it for collision/encounters.
const offsets={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const same=(a,b)=>a.x===b.x&&a.y===b.y;
const adjacent=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y)===1;
export function partnerTrail(previous, map, target, layer, facing, passable){
 const valid=p=>Number.isInteger(p?.x)&&Number.isInteger(p?.y)&&passable(map?.[p.y]?.[p.x]);
 if(!valid(target))return null;
 const initial=()=>{const [dx,dy]=offsets[facing]||offsets.down;const tail=[[-dx,-dy],[dy,-dx],[-dy,dx],[dx,dy]].map(([x,y])=>({x:target.x+x,y:target.y+y})).find(valid);return tail?{layer,target:{...target},from:tail,to:tail}:null;};
 if(!previous||previous.layer!==layer||!valid(previous.to)||!valid(previous.target))return initial();
 if(same(previous.target,target))return previous;
 if(!adjacent(previous.target,target))return initial();
 return {layer,target:{...target},from:previous.to,to:previous.target};
}
export function partnerTrailPosition(trail, progress){
 if(!trail)return null;
 const t=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:1));
 return {x:trail.from.x+(trail.to.x-trail.from.x)*t,y:trail.from.y+(trail.to.y-trail.from.y)*t};
}
