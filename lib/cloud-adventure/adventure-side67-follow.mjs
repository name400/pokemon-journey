// A short client-only visual trail. No follower state is sent to the server;
// unknown tiles, layer changes and non-adjacent corrections restart the trail.
const SAFE=new Set(['.',',',':',';','l']);
const STEP={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const valid=(map,p)=>Number.isInteger(p?.x)&&Number.isInteger(p?.y)&&SAFE.has(map?.[p.y]?.[p.x]);
const same=(a,b)=>a?.x===b?.x&&a?.y===b?.y;
const adjacent=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y)===1;
function initial(map,player,facing){
 const [dx,dy]=STEP[facing]||STEP.down,candidates=[[-dx,-dy],[dy,-dx],[-dy,dx],[dx,dy]];
 const tail=[];let from=player;
 for(let i=0;i<2;i++){
  const next=candidates.map(([x,y])=>({x:from.x+x,y:from.y+y})).find(p=>valid(map,p)&&!same(p,player)&&!tail.some(t=>same(t,p)));
  if(!next)break;tail.push(next);from=next;
 }
 return tail;
}
export function advanceSide67VisualTrail(previous,map,player,layer,facing='down'){
 if(!valid(map,player))return null;
 if(!previous||previous.layer!==layer||!valid(map,previous.player)||(!same(previous.player,player)&&!adjacent(previous.player,player)))return {layer,player:{...player},tail:initial(map,player,facing)};
 if(same(previous.player,player))return previous;
 const tail=[];for(const p of [previous.player,...previous.tail]){const last=tail.at(-1)||player;if(valid(map,p)&&!same(p,player)&&!tail.some(q=>same(q,p))&&adjacent(last,p))tail.push(p);if(tail.length===2)break;}
 return {layer,player:{...player},tail};
}
