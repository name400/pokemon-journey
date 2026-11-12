import {fieldMap,stepField,walkable,zone2BudewPosition,zone2FieldMonsters,zone3FieldMonsters,magentaSewerMonsters} from './adventure-world.mjs';
export function predictCloudStep(world,direction,{allowGrass=false,allowTransition=false,allowHazard=false}={}){
 if(!world)return null;
 const budew=zone2BudewPosition(world),roaming=zone2FieldMonsters(world,'day').filter(p=>p.contactBattle),fish=zone2FieldMonsters(world,'day').find(p=>p.reaction==='bridgeJump');
 const hazard=!!world.zaWildAlphaAlert||world.district==='lumiose-wild'||!!(budew&&Math.abs(world.x-budew.x)+Math.abs(world.y-budew.y)<=5)||roaming.some(p=>Math.abs(world.x-p.x)+Math.abs(world.y-p.y)<=3)||!!(fish&&Math.abs(world.x-fish.x)+Math.abs(world.y-fish.y)<=3)||zone3FieldMonsters(world,'day').some(p=>p.reaction!=='calm'&&Math.abs(world.x-p.x)+Math.abs(world.y-p.y)<=3)||magentaSewerMonsters(world,'night').some(p=>Math.abs(world.x-p.x)+Math.abs(world.y-p.y)<=3);
 if(hazard&&!allowHazard)return null;
 const step=stepField(world,direction);if(step.blocked)return null;
 if(step.transitioned){if(!allowTransition)return null;const {tile,transitioned,...position}=step,target={...world,...position},map=fieldMap(target);if(!walkable(map[position.y]?.[position.x]))return null;return {...position,facing:direction,map,predictedTransition:true};}
 if(step.tile==='g'&&!allowGrass)return null;return {x:step.x,y:step.y,facing:direction,...(hazard?{predictedHazard:true}:{})};
}

// Only already displayed, safe held steps may wait behind one in-flight request.
// Only quiet city pavement gets a longer preview; encounters, events,
// transitions and all other maps retain the existing four-step limit.
const EXTENDED_STREETS=new Set(['lumiose','lumiose-centrico-route','lumiose-vert-street-route']);
const plainStreet=(world,position)=>!!position&&!position.predictedHazard&&!position.predictedTransition&&['.',',',':'].includes(fieldMap({...world,...position})[position.y]?.[position.x]);
export function createCloudMoveBuffer(world,first,direction,limit=8){
 // The server may stop on any grass step; never commit pending steps until
 // the previous response confirms its position and no encounter.
 // Encounters and moving field events still stop authoritative batches.
 // A transition preview ends the buffer until the server confirms it.
 let position=first,done=first?.predictedTransition===true,extended=EXTENDED_STREETS.has(world?.district)&&!world?.interior&&!world?.inUnion&&plainStreet(world,first);const path=[];
 return {
  push(){if(done||!position||path.length>=Math.max(0,Math.min(extended?8:4,limit)))return null;const next=predictCloudStep({...world,...position},direction,{allowGrass:true,allowHazard:true});if(!next){done=true;return null;}if(extended&&!plainStreet(world,next)){extended=false;if(path.length>=4){done=true;return null;}}position=next;path.push(direction);return next;},
  get path(){return [...path];},
  get position(){return position;},
  matches(result){const w=result?.world;return !!(first&&w&&!result.battle&&!w.adventureCatchWindow&&!w.adventurePendingMoves?.length&&w.area===world.area&&w.district===world.district&&w.interior===world.interior&&w.locationId===world.locationId&&w.x===first.x&&w.y===first.y);},
 };
}

// Project-specific cadence: the original clothing's speed multiplier is unverified.
export function adventureMovementInterval(world){return world?.zaMission19Sneakers===true?75:100;}
