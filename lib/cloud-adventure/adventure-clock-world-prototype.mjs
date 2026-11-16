// Test-only adapter for a worlds-shaped D1 table. This module is not imported
// by the API. Real activation must include *all* world mutations and reads.
import {adventureFixedClockPaused} from './adventure-clock.mjs';
import {prototypeClockFromLegacy,prototypeClockProject,prototypeClockTransition} from './adventure-clock-lease-prototype.mjs';

const KEY='zaClockLeasePrototypeV1';
function readClock(world,revision,now){
 if(!world||typeof world!=='object'||Array.isArray(world))throw Error('invalid world');
 const clock=world[KEY]===undefined?prototypeClockFromLegacy(world,revision,now):world[KEY];
 if(clock?.revision!==revision)throw Error('uncoordinated world revision');
 if(clock.fixed!==adventureFixedClockPaused(world))throw Error('uncoordinated fixed state');
 prototypeClockProject(clock,now);return clock;
}
export function prototypeWorldClock(world,revision,now){return prototypeClockProject(readClock(world,revision,now),now);}

// A trusted game action supplies its before/after world. The old fixed state
// accounts for time up to `now`; the resulting location/battle takes effect
// from that instant. Rest/legacy clock edits need a separate, reviewed adapter.
export function preparePrototypeWorldTransition(before,after,revision,now,{field=false}={}){
 const old=readClock(before,revision,now);
 if(!after||typeof after!=='object'||Array.isArray(after))throw Error('invalid world');
 for(const key of ['zaClockOffsetHours','zaClockPausedMs','zaClockPauseStartedAt',KEY])if(JSON.stringify(before[key])!==JSON.stringify(after[key]))throw Error('uncoordinated clock edit');
 const next=prototypeClockTransition(old,revision,now,field?{type:'field'}:{type:'fixed',paused:old.fixed});
 next.fixed=adventureFixedClockPaused(after);
 const copy=structuredClone(after);copy[KEY]=next;
 for(const name of ['districtPosition','interiorPosition','adventureCatchWindow'])if(copy[name]&&typeof copy[name]==='object'&&!Array.isArray(copy[name])&&copy[name].revision===revision)copy[name].revision=next.revision;
 return copy;
}

// A test harness must call this for every write, including movement fencing.
// A fence changes no ownership; field activity revokes all menu leases.
// The matching position/catch revisions follow movementFence's existing rule.
export function preparePrototypeWorldClockWrite(world,revision,now,command){
 const old=readClock(world,revision,now);
 // A new clock starts recording every subsequent field action at this revision.
 // Older experimental clocks have no proof of their earlier history.
 if(world[KEY]===undefined){old.trackingSinceRevision=revision;old.lastFieldRevision=revision;}
 const effective=command?.type==='fence'?{type:'fixed',paused:old.fixed}:command;
 if(command?.type==='fixed')throw Error('fixed state must follow a world transition');
 const next=prototypeClockTransition(old,revision,now,command?.type==='fence'?{type:'fixed',paused:old.fixed}:effective);
 const copy=structuredClone(world);copy[KEY]=next;
 for(const name of ['districtPosition','interiorPosition','adventureCatchWindow'])if(copy[name]&&typeof copy[name]==='object'&&!Array.isArray(copy[name])&&copy[name].revision===revision)copy[name].revision=next.revision;
 return copy;
}

// The JSON and revision are committed together; a failed compare-and-swap has
// no side effects. Time and owner tokens must originate in trusted code.
export async function savePrototypeWorldClock(db,userId,expectedRevision,now,command){
 if(typeof userId!=='string'||!userId||!Number.isSafeInteger(expectedRevision)||expectedRevision<0)throw Error('invalid request');
 const row=await db.prepare('SELECT state,revision FROM worlds WHERE user_id=?').bind(userId).first();
 if(!row||row.revision!==expectedRevision)throw Error('revision conflict');
 const next=preparePrototypeWorldClockWrite(JSON.parse(row.state),row.revision,now,command);
 const result=await db.prepare('UPDATE worlds SET state=?,revision=revision+1,updated_at=? WHERE user_id=? AND revision=?').bind(JSON.stringify(next),now,userId,expectedRevision).run();
 if(result.meta.changes!==1)throw Error('revision conflict');
 return {state:next,revision:expectedRevision+1};
}
