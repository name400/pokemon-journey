import {fixedAlphaPlayerThreat} from './adventure-fixed-alpha-threat.mjs';
import {zone10PlayerThreat} from './adventure-zone10.mjs';
import {zone9PlayerThreat} from './adventure-zone9.mjs';
import {zone8PlayerThreat} from './adventure-zone8.mjs';
import {zone6PlayerThreat} from './adventure-zone6.mjs';
import {zone5PlayerThreat,zone5PlayerAlertKnown} from './adventure-zone5.mjs';
import {MAX_CLOUD_MOVEMENT_STEPS,fieldMap,stepField,walkable,zone2BudewPosition,zone2FieldMonsters,zone3FieldMonsters,magentaSewerMonsters} from './adventure-world.mjs';
export function predictCloudStep(world,direction,{allowGrass=false,allowTransition=false,allowHazard=false}={}){
 if(!world)return null;
 const budew=zone2BudewPosition(world),zone2=zone2FieldMonsters(world,'day'),roaming=zone2.filter(p=>p.contactBattle),fish=zone2.find(p=>p.reaction==='bridgeJump');
 const zone5Threat=zone5PlayerAlertKnown(world)?zone5PlayerThreat(world):null;
 const zone6Threat=zone6PlayerThreat(world);
 const zone8Threat=zone8PlayerThreat(world);
 const zone9Threat=zone9PlayerThreat(world);
 const zone10Threat=zone10PlayerThreat(world);
 const fixedThreat=fixedAlphaPlayerThreat(world);
 const hazard=!!(fixedThreat&&Math.abs(world.x-fixedThreat.x)+Math.abs(world.y-fixedThreat.y)<=3)||!!(zone10Threat&&Math.abs(world.x-zone10Threat.x)+Math.abs(world.y-zone10Threat.y)<=3)||!!(zone9Threat&&Math.abs(world.x-zone9Threat.x)+Math.abs(world.y-zone9Threat.y)<=3)||!!(zone8Threat&&Math.abs(world.x-zone8Threat.x)+Math.abs(world.y-zone8Threat.y)<=3)||!!(zone6Threat&&Math.abs(world.x-zone6Threat.x)+Math.abs(world.y-zone6Threat.y)<=3)||!!(zone5Threat&&Math.abs(world.x-zone5Threat.x)+Math.abs(world.y-zone5Threat.y)<=2)||!!world.zaWildAlphaAlert||world.district==='lumiose-wild'||(world.district==='lumiose-ghost-house'&&!world.interior&&world.zaMission20Stage===7&&!!world.zaMission20GhostMotionV1)||!!(budew&&Math.abs(world.x-budew.x)+Math.abs(world.y-budew.y)<=5)||roaming.some(p=>Math.abs(world.x-p.x)+Math.abs(world.y-p.y)<=3)||!!(fish&&Math.abs(world.x-fish.x)+Math.abs(world.y-fish.y)<=3)||zone3FieldMonsters(world,'day').some(p=>{const level=world.zaWildVisibleAlphaLevels?.[`field3:${p.id}:${p.speciesId}`];return (p.reaction!=='calm'||(Number.isInteger(level)&&level>=1&&level<=100))&&Math.abs(world.x-p.x)+Math.abs(world.y-p.y)<=3;})||magentaSewerMonsters(world,'night').some(p=>Math.abs(world.x-p.x)+Math.abs(world.y-p.y)<=3);
 if(hazard&&!allowHazard)return null;
 const step=stepField(world,direction);if(step.blocked)return null;
 if(step.transitioned){if(!allowTransition)return null;const {tile,transitioned,...position}=step,target={...world,...position},map=fieldMap(target);if(!walkable(map[position.y]?.[position.x]))return null;return {...position,facing:direction,map,predictedTransition:true};}
 if(step.tile==='g'&&!allowGrass)return null;return {x:step.x,y:step.y,facing:direction,...(hazard?{predictedHazard:true}:{})};
}

// Preview queued input in order, stopping before crossing a second map boundary.
export function predictCloudPathSteps(world,directions,{allowTransition=false}={}){
 let current=world;const steps=[];
 for(const direction of directions){const next=predictCloudStep(current,direction,{allowGrass:true,allowHazard:true,allowTransition});if(!next)break;steps.push(next);if(next.predictedTransition)break;current={...current,...next};}
 return steps;
}
export function predictCloudPath(world,directions,options={}){
 return predictCloudPathSteps(world,directions,options).at(-1)||null;
}

// A visual queue can preserve a suffix only when the exact sent prefix was
// confirmed. Ambiguous responses always require an authoritative reset.
export function confirmedCloudPathPrefix(world,steps,sentCount,revision,result){
 const w=result?.world;
 if(!world||!w||!Array.isArray(steps)||!Number.isSafeInteger(sentCount)||sentCount<1||sentCount>steps.length||!Number.isSafeInteger(revision)||result.revision!==revision+1||!Number.isSafeInteger(world.steps)||w.steps!==world.steps+sentCount||result.battle||result.battleResult||w.encounter||w.adventureCatchWindow||w.adventurePendingMoves?.length)return null;
 if(['area','district','interior','locationId','activeId'].some(key=>(world[key]??null)!==(w[key]??null)))return null;
 let prev=world;for(const step of steps){if(!step||step.predictedTransition||step.predictedHazard||!Number.isInteger(step.x)||!Number.isInteger(step.y)||Math.abs(step.x-prev.x)+Math.abs(step.y-prev.y)!==1)return null;prev=step;}
 const last=steps[sentCount-1];if(last.x!==w.x||last.y!==w.y||last.facing!==w.facing)return null;
 return {confirmed:steps.slice(0,sentCount),pending:steps.slice(sentCount)};
}

// Only already displayed, safe held steps may wait behind one in-flight request.
// Extend only known quiet paved paths; grass, events, moving encounters,
// transitions and all other maps retain the existing four-step limit.
const EXTENDED_GROUND_MAPS=new Set(['lumiose','lumiose-centrico-route','lumiose-vert-street-route','lumiose-zone1','lumiose-zone4','lumiose-zone6','lumiose-north-boulevard','lumiose-south-boulevard','lumiose-jaune-sector11','lumiose-jaune-sector12','lumiose-floral']);
const plainGround=(world,position)=>!!position&&!position.predictedHazard&&!position.predictedTransition&&(['lumiose-zone4','lumiose-zone6','lumiose-north-boulevard','lumiose-south-boulevard','lumiose-jaune-sector11','lumiose-jaune-sector12','lumiose-floral'].includes(world?.district)?['.',',']:['.',',',':']).includes(fieldMap({...world,...position})[position.y]?.[position.x]);
export function createCloudMoveBuffer(world,first,direction,limit=MAX_CLOUD_MOVEMENT_STEPS){
 // The server may stop on any grass step; never commit pending steps until
 // the previous response confirms its position and no encounter.
 // Encounters and moving field events still stop authoritative batches.
 // A transition preview ends the buffer until the server confirms it.
 let position=first,done=first?.predictedTransition===true,extended=EXTENDED_GROUND_MAPS.has(world?.district)&&!world?.interior&&!world?.inUnion&&(world?.district!=='lumiose-zone6'||!['canal','roof','high'].includes(world.zaZone6Layer))&&plainGround(world,first);const path=[];
 return {
  push(nextDirection=direction){if(done||!position||path.length>=Math.max(0,Math.min(extended?MAX_CLOUD_MOVEMENT_STEPS:4,limit)))return null;const next=predictCloudStep({...world,...position},nextDirection,{allowGrass:true,allowHazard:true});if(!next){done=true;return null;}if(extended&&!plainGround(world,next)){extended=false;if(path.length>=4){done=true;return null;}}position=next;path.push(nextDirection);return next;},
  get path(){return [...path];},
  get position(){return position;},
  matches(result){const w=result?.world;return !!(first&&w&&!result.battle&&!w.adventureCatchWindow&&!w.adventurePendingMoves?.length&&w.area===world.area&&w.district===world.district&&w.interior===world.interior&&w.locationId===world.locationId&&w.x===first.x&&w.y===first.y);},
 };
}

// Project-specific cadence: the original clothing's speed multiplier is unverified.
export function adventureMovementInterval(world){return world?.zaFieldCrouched===true?150:world?.zaMission19Sneakers===true?75:100;}
