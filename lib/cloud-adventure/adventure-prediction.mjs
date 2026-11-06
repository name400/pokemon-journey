import {stepField} from './adventure-world.mjs';
export function predictCloudStep(world,direction){if(!world||world.zaWildAlphaAlert||world.district==='lumiose-wild')return null;const step=stepField(world,direction);if(step.blocked||step.transitioned||step.tile==='g')return null;return {x:step.x,y:step.y,facing:direction};}

// Only already displayed, safe held steps may wait behind one in-flight request.
export function createCloudMoveBuffer(world,first,direction,limit=4){
 let position=first,done=false;const path=[];
 return {
  push(){if(done||!position||path.length>=Math.max(0,Math.min(4,limit)))return null;const next=predictCloudStep({...world,...position},direction);if(!next){done=true;return null;}position=next;path.push(direction);return next;},
  get path(){return [...path];},
  get position(){return position;},
  matches(result){const w=result?.world;return !!(first&&w&&!result.battle&&!w.adventureCatchWindow&&!w.adventurePendingMoves?.length&&w.area===world.area&&w.district===world.district&&w.interior===world.interior&&w.locationId===world.locationId&&w.x===first.x&&w.y===first.y);},
 };
}
