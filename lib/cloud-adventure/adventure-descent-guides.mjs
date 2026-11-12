import {fieldPath} from './adventure-world.mjs';

// Visual-only leaders on the provisional rooftop path. They never block input.
export function descentGuideTargets(map,player){
 if(!Array.isArray(map)||!Number.isInteger(player?.x)||!Number.isInteger(player?.y))return [];
 const path=fieldPath(map,player,{x:4,y:4});if(path.length<2)return [];
 const delta={up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]},points=[];
 let {x,y}=player;for(const direction of path){const [dx,dy]=delta[direction];x+=dx;y+=dy;points.push({x,y,direction});}
 const first=points[Math.min(1,points.length-1)],second=points[Math.min(3,points.length-1)];
 return first.x===second.x&&first.y===second.y?[first]:[first,second];
}
