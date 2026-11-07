import {stepField,zone2BudewPosition,zone2FieldMonsters,zone3FieldMonsters} from './adventure-world.mjs';
export function predictCloudStep(world,direction,{allowGrass=false}={}){if(!world||world.zaWildAlphaAlert||world.district==='lumiose-wild')return null;const budew=zone2BudewPosition(world);if(budew&&Math.abs(world.x-budew.x)+Math.abs(world.y-budew.y)<=5)return null;const roaming=zone2FieldMonsters(world,'day').filter(p=>p.contactBattle);if(roaming.some(p=>Math.abs(world.x-p.x)+Math.abs(world.y-p.y)<=3))return null;const fish=zone2FieldMonsters(world,'day').find(p=>p.reaction==='bridgeJump');if(fish&&Math.abs(world.x-fish.x)+Math.abs(world.y-fish.y)<=3)return null;const nearZone3=zone3FieldMonsters(world,'day').some(p=>p.reaction!=='calm'&&Math.abs(world.x-p.x)+Math.abs(world.y-p.y)<=3);if(nearZone3)return null;const step=stepField(world,direction);if(step.blocked||step.transitioned||(step.tile==='g'&&!allowGrass))return null;return {x:step.x,y:step.y,facing:direction};}

// Only already displayed, safe held steps may wait behind one in-flight request.
export function createCloudMoveBuffer(world,first,direction,limit=4){
 // The server may stop on any grass step; never commit pending steps until
 // the previous response confirms its position and no encounter.
 let position=first,done=false;const path=[];
 return {
  push(){if(done||!position||path.length>=Math.max(0,Math.min(4,limit)))return null;const next=predictCloudStep({...world,...position},direction,{allowGrass:true});if(!next){done=true;return null;}position=next;path.push(direction);return next;},
  get path(){return [...path];},
  get position(){return position;},
  matches(result){const w=result?.world;return !!(first&&w&&!result.battle&&!w.adventureCatchWindow&&!w.adventurePendingMoves?.length&&w.area===world.area&&w.district===world.district&&w.interior===world.interior&&w.locationId===world.locationId&&w.x===first.x&&w.y===first.y);},
 };
}

// Project-specific cadence: the original clothing's speed multiplier is unverified.
export function adventureMovementInterval(world){return world?.zaMission19Sneakers===true?75:100;}
