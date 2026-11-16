// Isolated model only: no API, browser, D1 or saved-world integration.
// Callers must use a trusted server clock and atomic revision compare-and-swap.
import {adventureFixedClockPaused} from './adventure-clock.mjs';

export const CLOCK_LEASE_MS=20000;
const MAX_OWNERS=8;
const validInt=n=>Number.isSafeInteger(n)&&n>=0;
const validId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{16,128}$/.test(id);
const add=(a,b)=>{const n=a+b;if(!validInt(n))throw Error('clock overflow');return n;};

// Capture the existing clock at one instant; never mutate or rewrite the save.
// Unsupported data fails closed instead of inventing an earlier history.
export function prototypeClockFromLegacy(world,revision,now){
 if(!world||!validInt(revision)||!validInt(now))throw Error('invalid baseline');
 const offset=world.zaClockOffsetHours??0,saved=world.zaClockPausedMs??0,start=world.zaClockPauseStartedAt;
 if(!validInt(offset)||offset>10000000||!validInt(saved)||(start!==undefined&&!validInt(start)))throw Error('unsupported legacy clock');
 const elapsed=start===undefined?0:Math.max(0,now-start);
 return {version:1,revision,at:now,offsetHours:offset,pausedMs:add(saved,elapsed),fixed:adventureFixedClockPaused(world),nextGeneration:1,leases:[]};
}

function validate(s,now){
 if(!s||s.version!==1||!validInt(s.revision)||!validInt(s.at)||!validInt(now)||now<s.at||!validInt(s.offsetHours)||s.offsetHours>10000000||!validInt(s.pausedMs)||typeof s.fixed!=='boolean'||!validInt(s.nextGeneration)||s.nextGeneration<1||!Array.isArray(s.leases)||s.leases.length>MAX_OWNERS)throw Error('invalid clock state');
 const ids=new Set(),gens=new Set();for(const l of s.leases){if(!l||!validId(l.owner)||!validInt(l.generation)||l.generation<1||l.generation>=s.nextGeneration||!validInt(l.until)||l.until-s.at>CLOCK_LEASE_MS||ids.has(l.owner)||gens.has(l.generation))throw Error('invalid lease');ids.add(l.owner);gens.add(l.generation);}
}

// All active leases started no later than s.at, so their union after s.at is
// [s.at, max(until)). Fixed pauses cover the whole interval. Expiry is exclusive.
export function prototypeClockProject(s,now){
 validate(s,now);const end=s.fixed?now:Math.min(now,Math.max(s.at,...s.leases.map(l=>l.until)));
 const pausedMs=add(s.pausedMs,end-s.at);
 return {pausedMs,offsetHours:s.offsetHours-pausedMs/50000,paused:s.fixed||s.leases.some(l=>l.until>now)};
}

// A successful transition is pure and advances one revision. No-op projections
// never write. A stale revision/token cannot release or renew another lease.
// `field` revokes all menu owners; renewed/expired owners must explicitly open
// again rather than silently reclaiming a pause after another tab acts.
export function prototypeClockTransition(s,expectedRevision,now,command){
 validate(s,now);if(expectedRevision!==s.revision)throw Error('revision conflict');
 if(!command||typeof command!=='object')throw Error('invalid command');
 const p=prototypeClockProject(s,now),next={...s,revision:add(s.revision,1),at:now,pausedMs:p.pausedMs,leases:s.leases.filter(l=>l.until>now).map(l=>({...l}))};
 if(command.type==='fixed'){
  if(typeof command.paused!=='boolean')throw Error('invalid fixed state');next.fixed=command.paused;
 }else if(command.type==='field'){
  next.leases=[];
 }else if(command.type==='open'){
  if(!validId(command.owner))throw Error('invalid owner');
  next.leases=next.leases.filter(l=>l.owner!==command.owner);
  if(next.leases.length>=MAX_OWNERS)throw Error('too many owners');
  const generation=next.nextGeneration;next.nextGeneration=add(generation,1);
  next.leases.push({owner:command.owner,generation,until:add(now,CLOCK_LEASE_MS)});
 }else if(command.type==='renew'||command.type==='close'){
  if(!validId(command.owner)||!validInt(command.generation))throw Error('invalid owner');
  const l=next.leases.find(x=>x.owner===command.owner&&x.generation===command.generation);
  if(!l)throw Error('stale or expired lease');
  if(command.type==='renew')l.until=add(now,CLOCK_LEASE_MS);else next.leases=next.leases.filter(x=>x!==l);
 }else throw Error('invalid command');
 return next;
}
