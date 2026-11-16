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

export function playerWalkStep(distance,moving,reduced){
 return moving&&!reduced?(Math.floor(distance*2)%2===0?3:-3):0;
}
