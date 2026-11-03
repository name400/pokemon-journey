import {stepField} from './adventure-field-core.mjs';

// The server remains authoritative. Never predict encounters or transitions.
export function predictSafeStep(world,direction){
 const step=stepField(world,direction);
 if(step.blocked||step.transitioned||step.tile==='g')return null;
 return {x:step.x,y:step.y,facing:direction};
}
/** At most one additional already-visible held step may wait behind an in-flight step. */
export function predictBufferedStep(world,first,direction){
 if(!first)return null;
 return predictSafeStep({...world,...first},direction);
}

// Never issue a queued held step after a server warning, battle or transition.
export function hasNewGardenSpook(before,after){
 return Object.entries(after?.pcGardenSpooked||{}).some(([tile,until])=>Number(until)>Number(before?.pcGardenSpooked?.[tile]||0));
}
export function canContinueBufferedMove(before,after,projected){
 return !!(after&&projected&&after.world.x===projected.x&&after.world.y===projected.y&&after.world.area===before.world.area&&after.world.cityVisit===before.world.cityVisit&&after.world.interior===before.world.interior&&after.world.locationId===before.world.locationId&&!after.battle&&!after.world.pcAlphaAlert&&!hasNewGardenSpook(before.world,after.world));
}

/** Group only a short, known route; an encounter tile or exit must end the batch. */
export function plannedMoveBatch(world,path,limit=3){
 const result=[];let position={...world};
 for(const direction of path.slice(0,Math.max(1,Math.min(8,limit)))){
  const step=stepField(position,direction);if(step.blocked)break;
  result.push(direction);if(step.transitioned||step.tile==='g')break;
  position={...position,...step};
 }
 return result;
}
