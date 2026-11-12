import {fieldPath} from './adventure-world.mjs';

// Visual-only guide: stay a few walkable tiles ahead towards the finale.
// The path is a 2D adaptation, not a claim about the original animation.
export function zygardeGuideTarget(map,player){
 if(!Array.isArray(map)||!Number.isInteger(player?.x)||!Number.isInteger(player?.y))return null;
 const path=fieldPath(map,player,{x:19,y:4});
 if(path.length<2)return null;
 const delta={up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]};
 let {x,y}=player;
 for(const direction of path.slice(0,Math.min(3,path.length))){const [dx,dy]=delta[direction];x+=dx;y+=dy;}
 return {x,y};
}
