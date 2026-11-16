// Only retrace the segment already drawn; never interpolate through a corner.
export function correctionDuration(scene,world,interval){
 const {x,y,startX,startY,targetX,targetY}=scene;
 const axisX=startY===targetY&&Math.abs(targetX-startX)===1;
 const axisY=startX===targetX&&Math.abs(targetY-startY)===1;
 if(!axisX&&!axisY)return 0;
 if(!((world.x===startX&&world.y===startY)||(world.x===targetX&&world.y===targetY)))return 0;
 const epsilon=1e-6;
 if(axisX&&(Math.abs(y-startY)>epsilon||x<Math.min(startX,targetX)-epsilon||x>Math.max(startX,targetX)+epsilon))return 0;
 if(axisY&&(Math.abs(x-startX)>epsilon||y<Math.min(startY,targetY)-epsilon||y>Math.max(startY,targetY)+epsilon))return 0;
 const distance=Math.abs(x-world.x)+Math.abs(y-world.y);
 return distance<=1+epsilon?interval*distance:0;
}

// A direct update without waypoints may animate only one cardinal segment.
export function directMovementDuration(scene,world,interval){
 const dx=Math.abs(scene.x-world.x),dy=Math.abs(scene.y-world.y),epsilon=1e-6;
 if((dx>epsilon&&dy>epsilon)||dx+dy>1+epsilon)return 0;
 return (dx+dy)*interval;
}

// Restart only on the segment already displayed. A new turn first returns to
// its confirmed origin; continuing along the same segment keeps moving ahead.
export function restartVisualSegment(scene,origin,next,interval){
 const e=1e-6,{x,y,startX,startY,targetX,targetY}=scene;
 if(![x,y,startX,startY,targetX,targetY,origin?.x,origin?.y,interval].every(Number.isFinite)||interval<=0)return null;
 const dx=Math.abs(targetX-startX),dy=Math.abs(targetY-startY);
 if((dx>e&&dy>e)||dx+dy<=e||dx+dy>1+e)return null;
 if(!((origin.x===startX&&origin.y===startY)||(origin.x===targetX&&origin.y===targetY)))return null;
 const between=(v,a,b)=>v>=Math.min(a,b)-e&&v<=Math.max(a,b)+e;
 if(!between(x,startX,targetX)||!between(y,startY,targetY)||(dx>e&&Math.abs(y-startY)>e)||(dy>e&&Math.abs(x-startX)>e))return null;
 let target=origin,step=-1,facing=null;
 if(next&&Number.isSafeInteger(next.id)&&Math.abs(next.x-origin.x)+Math.abs(next.y-origin.y)===1&&between(x,origin.x,next.x)&&between(y,origin.y,next.y)&&((next.x===origin.x&&Math.abs(x-origin.x)<=e)||(next.y===origin.y&&Math.abs(y-origin.y)<=e))){target=next;step=next.id;facing=next.facing;}
 const distance=Math.abs(x-target.x)+Math.abs(y-target.y);
 return {targetX:target.x,targetY:target.y,step,facing,duration:distance*interval};
}

export function playerWalkStep(distance,moving,reduced,interval=100){
 const amplitude=interval<=75?4:interval>=150?2:3;
 return moving&&!reduced?(Math.floor(distance*2)%2===0?amplitude:-amplitude):0;
}
