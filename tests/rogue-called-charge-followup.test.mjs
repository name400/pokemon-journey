import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {syncNativeTeams} from '../lib/party-battle.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

const mon=(id,boxId,moves,level=100)=>makeReferenceMon(id,level,{boxId,moves,ability:'runaway'});
function fixture({modern=true,move='Solar Beam',doubles=false,passiveTruant=false}={}){
 const performer=mon(151,'performer',['Metronome',move,'Splash']),party=doubles?[mon(151,'instructor',['Instruct','Splash']),performer]:[performer],foes=doubles?[mon(80,'target',['Splash'],400),mon(80,'target2',['Splash'],400)]:[mon(97,'target',['Hypnosis','Splash'])];
 if(passiveTruant)performer.roguePassiveAbility='truant';
 const run={id:'called-charge-followup',wave:30,biome:5,rng:42,screen:'battle',party,modifiers:[],tools:{},balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'},adaptabilityRule:'source-subset-v2',moveBalanceRule:'source-subset-v2',moveFlagRule:'source-subset-v1'};
 if(modern)run.calledMoveRule='source-pool-v1';run.combat=createClassicCombat(run,foes,{trainer:true,doubles});return run;
}
function probe(run,{called='solarbeam'}={}){
 const b=restoreClassicNativeBattle(run.combat,run),p=b.p1.pokemon.find(p=>p.set.trainerToken==='performer'),sample=b.sample.bind(b),chance=b.randomChance.bind(b),inputs=[],hits=[];
 b.sample=values=>values.find(move=>move===called||move?.id===called)||sample(values);b.randomChance=(n,d)=>n===1&&d===8||n===33&&d===100?true:n===1&&d===4?false:chance(n,d);
 b.onEvent('ModifySpe',b.format,{priority:100},(speed,user)=>user.side.n===0?(user.set.trainerToken==='performer'?10000:9000):speed);b.onEvent('Accuracy',b.format,{priority:-100},()=>true);
 const native=b.actions.useMove;Object.defineProperty(b.actions,'useMove',{configurable:true,value(move,user,...args){inputs.push({token:user.set.trainerToken,id:typeof move==='string'?move:move.id});return native.call(this,move,user,...args);}});
 b.onEvent('DamagingHit',b.format,{priority:-100},(damage,target,source,move)=>{if(source.set.trainerToken==='performer')hits.push({id:move.id,target:target.set.trainerToken,damage});});
 return {b,p,inputs,hits,turn(command='move metronome',opponent='move splash'){b.makeChoices(command,opponent);}};
}
async function recover(run,b){run.combat.teams=syncNativeTeams(b,run.combat.teams);run.party=run.combat.teams[0];run.combat.snapshot=snapshotClassicNativeBattle(b);const doc={coins:23,adventure:{safe:true}},s=ensureClassicState(doc);s.slots[0]=run;s.slots[1]={id:'other',safe:true};const restored=await decodeGameData(await encodeGameData(doc));assert.equal(restored.coins,23);assert.deepEqual(restored.adventure,{safe:true});assert.deepEqual(restored.classic.slots[1],{id:'other',safe:true});return restored.classic.slots[0];}

test('a real Metronome charge followed by enemy Hypnosis releases through codec without a second sleep tick or PP',async()=>{
 for(const modern of [true,false]){let run=fixture({modern}),p=probe(run);p.turn('move metronome','move hypnosis');assert.equal(p.p.status,'slp');const time=p.p.statusState.time;assert.ok(time>=2);assert.equal(p.p.volatiles.twoturnmove.sourceEffect.sourceEffect,'metronome');run=await recover(run,p.b);p=probe(run);p.turn('move 1');assert.equal(p.hits.some(hit=>hit.id==='solarbeam'),modern);assert.equal(p.p.statusState.time,modern?time:time-1);assert.equal(p.p.moveSlots[0].pp,9);assert.equal(p.p.moveSlots[1].pp,10);}
});

test('called releases skip only the confirmed source paralysis/freeze/confusion checks and preserve their counters after codec',async()=>{
 for(const status of ['par','frz','confusion'])for(const modern of [true,false]){
  let run=fixture({modern}),p=probe(run);p.turn();if(status==='confusion'){p.p.addVolatile('confusion');p.p.volatiles.confusion.time=5;}else{p.p.setStatus(status);if(status==='frz')p.p.statusState.rogueFreezeTurns=3;}const hp=p.p.hp;run=await recover(run,p.b);p=probe(run);p.turn('move 1');assert.equal(p.hits.some(hit=>hit.id==='solarbeam'),modern,`${status}:${modern}`);if(status==='frz')assert.equal(p.p.statusState.rogueFreezeTurns,modern?3:2);if(status==='confusion'){assert.equal(p.p.volatiles.confusion.time,modern?5:4);assert.equal(p.p.hp===hp,modern);}else assert.equal(p.p.hp,hp);
 }
});

test('a called Razor Wind release remains FOLLOW_UP for Instruct history, including pre-recorder snapshots',async()=>{
 for(const clearHistory of [false,true]){let run=fixture({move:'Razor Wind',doubles:true}),p=probe(run,{called:'razorwind'});p.turn('move splash,move metronome','move splash,move splash');assert.equal(p.p.m.rogueCalledHistory.normal,'metronome');if(clearHistory)delete p.p.m.rogueCalledHistory;run=await recover(run,p.b);p=probe(run,{called:'razorwind'});p.turn('move instruct -2,move 1','move splash,move splash');assert.equal(p.inputs.filter(move=>move.token==='performer'&&move.id==='razorwind').length,1);assert.equal(p.hits.filter(hit=>hit.id==='razorwind').length,2);assert.deepEqual(p.p.m.rogueCalledHistory,{normal:'metronome',mirror:'razorwind'});assert.equal(p.p.volatiles.twoturnmove,undefined);assert.equal(p.p.moveSlots[0].pp,9);assert.equal(p.p.moveSlots[1].pp,10);}
});

test('Heal Block, Throat Chop and Gravity remain effective on source called moves',async()=>{
 for(const [move,condition]of [['Recover','healblock'],['Hyper Voice','throatchop']]){const called=move.toLowerCase().replaceAll(' ',''),p=probe(fixture({move}),{called});p.p.hp=100;p.p.addVolatile(condition);p.turn();assert.equal(p.p.hp,100);assert.equal(p.hits.length,0);assert.ok(p.inputs.some(input=>input.id===called));assert.equal(p.p.moveSlots[0].pp,9);}
 let run=fixture({move:'Fly'}),p=probe(run,{called:'fly'});p.turn();assert.ok(p.p.volatiles.twoturnmove);run=await recover(run,p.b);p=probe(run,{called:'fly'});p.b.field.addPseudoWeather('gravity',p.b.p2.active[0]);p.turn('move fly');assert.equal(p.hits.length,0);assert.equal(p.p.moveSlots[1].pp,15);
});

test('directly selected charge releases retain ordinary native sleep cancellation through codec',async()=>{
 for(const modern of [true,false]){let run=fixture({modern}),p=probe(run);p.turn('move solarbeam');p.p.setStatus('slp');p.p.statusState.time=4;run=await recover(run,p.b);p=probe(run);p.turn('move 1');assert.equal(p.hits.length,0);assert.equal(p.p.statusState.time,3);assert.equal(p.p.moveSlots[0].pp,10);assert.equal(p.p.moveSlots[1].pp,9);}
});

test('a mismatched or source-unknown pending caller is never treated as a source FOLLOW_UP release',()=>{
 const p=probe(fixture());p.turn();const pending=p.p.volatiles.twoturnmove,move=p.b.dex.moves.get('solarbeam');assert.equal(p.b.rogueCalledMoveRelease(p.p,move),true);assert.equal(p.b.rogueCalledMoveRelease(p.p,p.b.dex.moves.get('slash')),false);pending.sourceEffect.sourceEffect='unknowncaller';assert.equal(p.b.rogueCalledMoveRelease(p.p,move),false);pending.sourceEffect.sourceEffect='sleeptalk';assert.equal(p.b.rogueCalledMoveRelease(p.p,move),false);const legacy=probe(fixture({modern:false}));assert.equal(legacy.b.rogueCalledMoveRelease,undefined);
});

test('called FOLLOW_UP releases bypass flinch, attraction, disable and Truant',async()=>{for(const effect of ['flinch','attract','disable','truant'])for(const modern of [true,false]){let run=fixture({modern}),p=probe(run);p.turn();const foe=p.b.p2.active[0];if(effect==='attract'){p.p.gender='M';foe.gender='F';assert.equal(p.p.addVolatile('attract',foe),true);}else if(effect==='disable'){p.p.addVolatile('disable',foe);if(!p.p.volatiles.disable)p.p.volatiles.disable=p.b.initEffectState({id:'disable',target:p.p,duration:4});p.p.volatiles.disable.move='solarbeam';}else if(effect==='truant'){p.p.setAbility('truant');p.p.addVolatile('truant');}else p.p.addVolatile('flinch');run=await recover(run,p.b);p=probe(run);if(effect==='attract'){const original=p.b.randomChance.bind(p.b);p.b.randomChance=(n,d)=>n===1&&d===2?true:original(n,d);}p.turn('move 1');assert.equal(p.hits.some(hit=>hit.id==='solarbeam'),modern,`${effect}:${modern}`);}});
test('called Geomancy FOLLOW_UP skips a later Taunt',async()=>{for(const modern of [true,false]){let run=fixture({modern:true,move:'Geomancy'}),p=probe(run,{called:'geomancy'});p.turn();assert.ok(p.p.volatiles.twoturnmove);p.p.addVolatile('taunt',p.b.p2.active[0]);if(!modern){delete run.calledMoveRule;run.combat.calledMoveRule=null;}run=await recover(run,p.b);p=probe(run,{called:'geomancy'});p.turn('move 1');assert.equal(p.p.boosts.spa,modern?2:0);}});
test('called FOLLOW_UP skips a later opposing Imprison',async()=>{for(const modern of [true,false]){let run=fixture({modern}),p=probe(run);p.turn();const foe=p.b.p2.active[0],move=p.b.dex.moves.get('solarbeam');foe.moveSlots.push({move:move.name,id:move.id,pp:10,maxpp:10,target:move.target,disabled:false,used:false});foe.addVolatile('imprison');run=await recover(run,p.b);p=probe(run);p.turn('move 1');assert.equal(p.hits.some(hit=>hit.id==='solarbeam'),modern);}});

test('passive Truant cannot cancel a called FOLLOW_UP release',async()=>{for(const modern of [true,false]){let run=fixture({modern,passiveTruant:true}),p=probe(run);p.turn();assert.ok(p.p.volatiles.twoturnmove);run=await recover(run,p.b);p=probe(run);p.turn('move 1');assert.equal(p.hits.some(hit=>hit.id==='solarbeam'),modern);}});
test('direct charge releases still obey flinch and Truant',async()=>{for(const effect of ['flinch','truant'])for(const modern of [true,false]){let run=fixture({modern}),p=probe(run);p.turn('move solarbeam');assert.ok(p.p.volatiles.twoturnmove);if(effect==='flinch')p.p.addVolatile('flinch');else{p.p.setAbility('truant');p.p.addVolatile('truant');}run=await recover(run,p.b);p=probe(run);p.turn('move 1');assert.equal(p.hits.length,0,`${effect}:${modern}`);assert.equal(p.p.moveSlots[1].pp,9);}});
