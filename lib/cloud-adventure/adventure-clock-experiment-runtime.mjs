// Internal integration under the test-only gate. No production action creates
// an experimental lease, and the client is not wired to this protocol.
import {adventureClockExperimentEnabled} from './adventure-clock-experiment-gate.mjs';
import {adventureFixedClockPaused} from './adventure-clock-policy.mjs';
import {prototypeClockTransition,prototypeClockProject} from './adventure-clock-lease-prototype.mjs';
const actions=new WeakMap();
// A field action from any tab invalidates menu ownership. Menu-only actions
// retain it; an unrecognized action takes the conservative field path.
const MENU_ACTIONS=new Set(['team','equip','teachStoryTm','teachResearchTm','teachResearchRockSmash','teachResearchMudShot','resolveAdventureMove','buy','buyAdventureMedicine','useAdventureMint','hyperTrainAdventure','masterAdventureMove','resetAdventureEvs']);
export function markExperimentalClockAction(world,action){if(adventureClockExperimentEnabled()&&world?.zaClockLeasePrototypeV1!==undefined)actions.set(world,action);}
export function validateExperimentalClockRevision(world,revision){
 if(adventureClockExperimentEnabled()&&world?.zaClockLeasePrototypeV1!==undefined&&world.zaClockLeasePrototypeV1?.revision!==revision)throw Error('experimental clock revision conflict');
}
export function advanceExperimentalClockForWrite(world,revision,now,{automatic=false}={}){
 if(!adventureClockExperimentEnabled()||world?.zaClockLeasePrototypeV1===undefined)return;
 validateExperimentalClockRevision(world,revision);
 const clock=world.zaClockLeasePrototypeV1,action=actions.get(world),field=!automatic&&!MENU_ACTIONS.has(action);
 const next=prototypeClockTransition(clock,revision,now,field?{type:'field'}:{type:'fixed',paused:clock.fixed});
 next.fixed=adventureFixedClockPaused(world);world.zaClockLeasePrototypeV1=next;
 // Writes that only update the experimental clock must not invalidate an
 // otherwise valid capture window or existing position snapshot.
 for(const name of ['districtPosition','interiorPosition','adventureCatchWindow'])if(world[name]&&typeof world[name]==='object'&&!Array.isArray(world[name])&&world[name].revision===revision)world[name].revision=next.revision;
}

// A reset backup is a snapshot, not an active world: account time through the
// reset, then start a new timeline on restoration with no resurrected tab.
export function restoreExperimentalClock(world,oldRevision,newRevision,resetAt,now){
 if(!adventureClockExperimentEnabled()||world?.zaClockLeasePrototypeV1===undefined)return;
 validateExperimentalClockRevision(world,oldRevision);
 if(!Number.isSafeInteger(newRevision)||newRevision<0||!Number.isSafeInteger(now)||now<resetAt)throw Error('invalid clock restore');
 const clock=world.zaClockLeasePrototypeV1,projected=prototypeClockProject(clock,resetAt);
 world.zaClockLeasePrototypeV1={...clock,revision:newRevision,at:now,pausedMs:projected.pausedMs,fixed:adventureFixedClockPaused(world),leases:[]};
 if(Number.isSafeInteger(clock.trackingSinceRevision)&&Number.isSafeInteger(clock.lastFieldRevision)){world.zaClockLeasePrototypeV1.trackingSinceRevision=newRevision;world.zaClockLeasePrototypeV1.lastFieldRevision=newRevision;}
 for(const name of ['districtPosition','interiorPosition','adventureCatchWindow'])if(world[name]&&typeof world[name]==='object'&&!Array.isArray(world[name])&&world[name].revision===oldRevision)world[name].revision=newRevision;
}
