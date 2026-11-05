import test from 'node:test';
import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import policy from '../data/rogue-called-move-policy.json' with {type:'json'};
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicCalledMoveAllowed} from '../lib/rogue-called-move-policy.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {syncNativeTeams} from '../lib/party-battle.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

const nativeId=name=>name.replace(/__(PHYSICAL|SPECIAL)$/,'').toLowerCase().replaceAll('_','').replace('tenmillionvoltthunderbolt','10000000voltthunderbolt');
function fixture(caller,{called='Dynamax Cannon',modern=true,ability=caller==='sleeptalk'?'comatose':'runaway',enemy=false,weather=''}={}){
 const user=makeReferenceMon(151,100,{boxId:'caller',moves:[caller,called],ability}),target=makeReferenceMon(80,400,{boxId:'target',moves:['Splash'],ability:'runaway'}),party=[user];
 if(caller==='assist')party.push(makeReferenceMon(25,100,{boxId:'ally',moves:[called],ability:'runaway'}));
 const run={id:'source-caller-guards',wave:30,biome:5,rng:42,screen:'battle',party:enemy?[target]:party,modifiers:[],tools:{},balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'},adaptabilityRule:'source-subset-v2',moveBalanceRule:'source-subset-v2',moveFlagRule:'source-subset-v1'};
 if(modern)run.calledMoveRule='source-pool-v1';run.combat=createClassicCombat(run,enemy?party:[target],{trainer:true,weather});return run;
}
function probe(run,{called='dynamaxcannon',enemy=false}={}){
 const b=restoreClassicNativeBattle(run.combat,run),side=enemy?1:0,p=b.sides[side].active[0],sample=b.sample.bind(b),inputs=[],pools=[],hits=[];
 b.sample=values=>{if(values.some(move=>typeof move==='string'||move?.effectType==='Move')){pools.push(values.map(move=>typeof move==='string'?move:move.id));return values.find(move=>move===called||move?.id===called)||sample(values);}return sample(values);};
 const native=b.actions.useMove;Object.defineProperty(b.actions,'useMove',{configurable:true,value(move,user,...args){if(user.side.n===side)inputs.push(typeof move==='string'?move:move.id);return native.call(this,move,user,...args);}});
 b.onEvent('Accuracy',b.format,{priority:-100},()=>true);b.onEvent('DamagingHit',b.format,{priority:-100},function(damage,target,source,move){if(source.side.n===side)hits.push({id:move.id,damage});});
 return {b,p,inputs,pools,hits,turn(command,other='move splash'){b.makeChoices(...(enemy?[other,command]:[command,other]));}};
}
async function recover(run,b){run.combat.teams=syncNativeTeams(b,run.combat.teams);run.party=run.combat.teams[0];run.combat.snapshot=snapshotClassicNativeBattle(b);const doc={coins:59,adventure:{safe:true}},state=ensureClassicState(doc);state.slots[0]=run;state.slots[1]={id:'other',safe:true};const restored=await decodeGameData(await encodeGameData(doc));assert.equal(restored.coins,59);assert.deepEqual(restored.adventure,{safe:true});assert.deepEqual(restored.classic.slots[1],{id:'other',safe:true});return restored.classic.slots[0];}

test('each source caller rejects every unimplemented/banned/unknown/Z/Max candidate and keeps explicit exception lists bounded',()=>{
 assert.deepEqual(Object.fromEntries(['copycat','sleeptalk','assist'].map(id=>[id,policy.callers[id].banned.length])),{copycat:40,sleeptalk:32,assist:48});
 for(const caller of Object.keys(policy.callers)){
  for(const name of [...policy.unimplemented,...policy.callers[caller].banned])assert.equal(classicCalledMoveAllowed(caller,Dex.moves.get(nativeId(name))),false,`${caller}:${name}`);
  for(const id of policy.callers[caller].nativeFlagExceptions)assert.equal(classicCalledMoveAllowed(caller,Dex.moves.get(id)),true,`${caller}:${id}`);
  for(const move of [Dex.moves.get('gmaxwildfire'),Dex.moves.get('breakneckblitz'),{exists:true,id:'unknown-source-move',flags:{}}])assert.equal(classicCalledMoveAllowed(caller,move),false);
  assert.equal(classicCalledMoveAllowed(caller,Dex.moves.get('revivalblessing'),{challengeRestrictions:[{id:9,value:1}]}),false);
 }
 assert.deepEqual(policy.callers.sleeptalk.chargeExceptions,['meteorbeam','electroshot']);
});

test('actual Copycat copies an allowed Thief used by the foe while legacy retains native refusal',async()=>{
 for(const modern of [true,false]){
  let run=fixture('copycat',{called:'Splash',modern});run.combat=createClassicCombat(run,[makeReferenceMon(80,100,{boxId:'target',moves:['Thief'],ability:'runaway'})],{trainer:true});let p=probe(run,{called:'thief'});p.b.onEvent('ModifySpe',p.b.format,{priority:100},(speed,user)=>user.side===p.b.p2?10000:speed);p.turn('move copycat','move thief');assert.equal(p.inputs.filter(id=>id==='thief').length,modern?1:0);assert.equal(p.hits.filter(hit=>hit.id==='thief').length,modern?1:0);assert.equal(p.p.moveSlots[0].pp,19);
  run=await recover(run,p.b);p=probe(run,{called:'thief'});p.b.onEvent('ModifySpe',p.b.format,{priority:100},(speed,user)=>user.side===p.b.p2?10000:speed);p.turn('move copycat','move thief');assert.equal(p.inputs.filter(id=>id==='thief').length,modern?1:0);assert.equal(p.p.moveSlots[0].pp,18);
 }
});

test('Copycat refuses source-banned Mirror Coat and source-unimplemented moves even if native can call them',()=>{
 for(const id of ['mirrorcoat','recycle','fling','allyswitch'])for(const modern of [true,false]){
  const p=probe(fixture('copycat',{modern}));p.b.onEvent('ModifySpe',p.b.format,{priority:100},(speed,user)=>user.side===p.b.p1?10000:speed);p.b.lastMove=p.b.dex.getActiveMove(id);p.turn('move copycat');assert.equal(p.inputs.includes(id),!modern,`${id}:${modern}`);assert.equal(p.p.moveSlots[0].pp,19);
 }
});

test('Sleep Talk permits source-specific Chatter but keeps the actual sleep/Comatose condition',()=>{
 for(const modern of [true,false]){const p=probe(fixture('sleeptalk',{called:'Chatter',modern}),{called:'chatter'});p.turn('move sleeptalk');assert.equal(p.inputs.includes('chatter'),modern);assert.equal(p.hits.some(hit=>hit.id==='chatter'),modern);assert.equal(p.p.moveSlots[0].pp,9);assert.equal(p.p.moveSlots[1].pp,20);}
 const awake=probe(fixture('sleeptalk',{called:'Chatter',ability:'runaway'}),{called:'chatter'});awake.turn('move sleeptalk');assert.equal(awake.inputs.includes('chatter'),false);assert.equal(awake.pools.length,0);
 const asleep=probe(fixture('sleeptalk',{called:'Chatter',ability:'runaway'}),{called:'chatter'});asleep.p.setStatus('slp');asleep.p.statusState.time=4;asleep.turn('move sleeptalk');assert.ok(asleep.inputs.includes('chatter'));assert.equal(asleep.p.statusState.time,3);
});

test('Sleep Talk rejects source-unimplemented candidates and empty pools without consuming their PP',()=>{
 for(const id of ['recycle','fling','trick','corrosivegas']){const p=probe(fixture('sleeptalk',{called:id}),{called:id}),before=p.p.moveSlots[1].pp;p.turn('move sleeptalk');assert.deepEqual(p.inputs,['sleeptalk']);assert.equal(p.pools.length,0);assert.equal(p.p.moveSlots[0].pp,9);assert.equal(p.p.moveSlots[1].pp,before);}
});

test('both allowed Sleep Talk charge moves keep FOLLOW_UP sleep/PP semantics through codec recovery',async()=>{
 for(const called of ['meteorbeam','electroshot']){
  let run=fixture('sleeptalk',{called,ability:'runaway'}),p=probe(run,{called});p.p.setStatus('slp');p.p.statusState.time=5;p.p.statusState.startTime=5;const calledPP=p.p.moveSlots[1].pp;p.turn('move sleeptalk');assert.equal(p.p.volatiles.twoturnmove.move,called);assert.equal(p.p.volatiles.twoturnmove.sourceEffect.sourceEffect,'sleeptalk');assert.equal(p.p.statusState.time,4);assert.equal(p.p.boosts.spa,1);assert.equal(p.hits.length,0);
  run=await recover(run,p.b);p=probe(run,{called});assert.equal(p.p.statusState.time,4);p.turn('move 1');assert.ok(p.hits.some(hit=>hit.id===called));assert.equal(p.p.status,'slp');assert.equal(p.p.statusState.time,4);assert.equal(p.p.moveSlots[0].pp,9);assert.equal(p.p.moveSlots[1].pp,calledPP);assert.equal(p.p.volatiles.twoturnmove,undefined);
 }
});

test('ordinary charge turns and unrelated sleeping actions retain native sleep counters and failure',()=>{
 for(const modern of [true,false]){const p=probe(fixture('sleeptalk',{called:'Meteor Beam',ability:'runaway',modern}),{called:'meteorbeam'});p.turn('move meteorbeam');assert.ok(!p.p.volatiles.twoturnmove.sourceEffect.sourceEffect);p.p.setStatus('slp');p.p.statusState.time=5;p.turn('move 1');assert.equal(p.p.statusState.time,4);assert.equal(p.hits.length,0);assert.equal(p.p.moveSlots[1].pp,9);}
});

test('Assist uses source-allowed Thief from allies without copying their PP or the caller moveset',async()=>{
 for(const modern of [true,false]){let run=fixture('assist',{called:'Thief',modern}),p=probe(run,{called:'thief'}),ally=p.b.p1.pokemon[1],allyPP=ally.moveSlots[0].pp;p.turn('move assist');assert.equal(p.inputs.includes('thief'),modern);assert.equal(p.hits.some(hit=>hit.id==='thief'),modern);assert.equal(ally.moveSlots[0].pp,allyPP);assert.equal(p.p.moveSlots[0].pp,19);run=await recover(run,p.b);p=probe(run,{called:'thief'});p.turn('move assist');assert.equal(p.inputs.includes('thief'),modern);assert.equal(p.p.moveSlots[0].pp,18);}
});

test('Assist retains duplicate/fainted ally weighting and excludes removed allies and source-invalid pools',()=>{
 const run=fixture('assist',{called:'Splash'});run.party.push(makeReferenceMon(7,100,{boxId:'ally2',moves:['Splash'],ability:'runaway'}));run.combat=createClassicCombat(run,run.combat.teams[1],{trainer:true});const p=probe(run,{called:'splash'});p.b.p1.pokemon[1].hp=0;p.b.p1.pokemon[1].fainted=true;p.b.p1.pokemon[1].moveSlots[0].pp=0;p.turn('move assist');assert.deepEqual(p.pools[0],['splash','splash']);assert.equal(p.b.p1.pokemon[1].moveSlots[0].pp,0);
 for(const marker of ['released','captured']){const removed=probe(fixture('assist',{called:'Thief'}),{called:'thief'});removed.b.p1.pokemon[1].m[marker]=true;removed.turn('move assist');assert.deepEqual(removed.inputs,['assist']);assert.equal(removed.pools.length,0);}
 const invalid=probe(fixture('assist',{called:'Recycle'}),{called:'recycle'});invalid.turn('move assist');assert.deepEqual(invalid.inputs,['assist']);assert.equal(invalid.pools.length,0);
});

test('called slots with zero PP remain eligible without being consumed by Sleep Talk',()=>{
 const p=probe(fixture('sleeptalk',{called:'Chatter'}),{called:'chatter'});p.p.moveSlots[1].pp=0;p.turn('move sleeptalk');assert.ok(p.inputs.includes('chatter'));assert.ok(p.hits.some(hit=>hit.id==='chatter'));assert.equal(p.p.moveSlots[1].pp,0);assert.equal(p.p.moveSlots[0].pp,9);
});

test('every bounded native-flag exception actually reaches its called move and remains snapshot-restorable',()=>{
 for(const caller of ['copycat','sleeptalk','assist'])for(const called of policy.callers[caller].nativeFlagExceptions){
  try{const run=fixture(caller,{called}),p=probe(run,{called});if(caller==='copycat'){p.b.onEvent('ModifySpe',p.b.format,{priority:100},(speed,user)=>user.side===p.b.p1?10000:speed);p.b.lastMove=p.b.dex.getActiveMove(called);}p.turn(`move ${caller}`);assert.ok(p.inputs.includes(called));run.combat.snapshot=snapshotClassicNativeBattle(p.b);assert.doesNotThrow(()=>restoreClassicNativeBattle(run.combat,run));}catch(cause){throw new Error(`${caller} source-allowed exception ${called}`,{cause});}
 }
});

test('enemy callers apply source eligibility and local sleep overrides never patch the shared native condition',()=>{
 const native=Dex.conditions.get('slp').onBeforeMove;for(const caller of ['sleeptalk','assist']){const p=probe(fixture(caller,{called:caller==='assist'?'Thief':'Chatter',enemy:true}),{called:caller==='assist'?'thief':'chatter',enemy:true});p.turn(`move ${caller}`);assert.ok(p.inputs.includes(caller==='assist'?'thief':'chatter'));assert.ok(p.hits.length);}
 assert.equal(Dex.conditions.get('slp').onBeforeMove,native);const legacy=probe(fixture('sleeptalk',{modern:false}));assert.equal(legacy.b.dex.conditions.get('slp').onBeforeMove,native);
});
