import test from 'node:test';
import assert from 'node:assert/strict';
import {classicPartnerSpeciesPool} from '../lib/rogue-partner-trainers.mjs';
import {classicTrainerEncounter} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,playClassicCombat,classicCombatView} from '../lib/rogue-battle-engine.mjs';
test('partner pools exclude an entire nested choice when one member is already used',()=>{
 assert.deepEqual(classicPartnerSpeciesPool(1,2,2,[[1,2],3],[4,5],[2]),[3]);
 assert.deepEqual(classicPartnerSpeciesPool(1,2,3,[1,2],[[4,5],6],[4]),[6]);
});
test('Tate and Liza gym doubles lead with their own Solrock/Lunatone and alternate signature families',()=>{
 const families={222:[338,177,433,475],223:[337,343,325,282]};
 for(const id of [222,223])for(const wave of [20,50,100,180]){
  const run={id:'paired-gym',wave,biome:1,rng:42,party:[makeReferenceMon(151,30,{boxId:'hero'})],modifiers:['lure','superlure','maxlure'].map(id=>({id,count:1,remaining:10})),tools:{}};
  const encounter=classicTrainerEncounter(run,id,{kind:'gym'}),partner=id===222?223:222;
  assert.equal(encounter.doubles,true);assert.equal(encounter.trainer.partnerId,partner);
  assert.equal(encounter.team[0].rogueSourceId,id===222?338:337);assert.equal(encounter.team[1].rogueSourceId,id===222?337:338);
  for(const [index,mon]of encounter.team.entries()){
   assert.equal(mon.rogueTrainerSlot,index%2);
   const allowed=families[index%2?partner:id].map(id=>rogueSpecies.get(id).starterId);
   assert.ok(allowed.includes(rogueSpecies.get(mon.rogueSourceId).starterId));
  }
 }
});
function fixture({reserveA=false,spread=false,pivot=false}={}){
 const enemy=(boxId,owner)=>({...makeReferenceMon(151,10,{boxId,ability:'runaway',moves:[pivot&&boxId==='a'?'U-turn':'Splash']}),rogueTrainerSlot:owner});
 const team=[enemy('a',0),enemy('b',1),...(reserveA?[enemy('reserve-a',0)]:[]),enemy('reserve-b',1)];
 const run={id:'partner-battle',wave:50,biome:1,rng:42,party:[makeReferenceMon(151,100,{boxId:'hero',ability:'runaway',moves:[pivot?'Splash':spread?'Earthquake':'Seismic Toss']})],modifiers:[],tools:{},balls:{},encounter:{kind:'trainer',trainer:{name:'pair'}}};
 run.combat=createClassicCombat(run,team,{doubles:true,trainer:true});run.party=run.combat.teams[0];return run;
}
test('trainer switch choices and Roar stay within each partner’s reserves after JSON restore',()=>{
 const run=fixture({reserveA:true}),view=run.combat;
 for(const actor of view.requests[1].actors)assert.ok(actor.switches.every(choice=>run.combat.teams[1][choice.index].rogueTrainerSlot===actor.slot));
 const b=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run);
 assert.equal(b.actions.dragIn(b.p2,0),true);assert.equal(b.p2.active[0].set.trainerToken,'reserve-a');
 assert.equal(b.actions.dragIn(b.p2,1),true);assert.equal(b.p2.active[1].set.trainerToken,'reserve-b');
 const noReserve=fixture(),native=restoreClassicNativeBattle(noReserve.combat,noReserve);
 assert.equal(native.actions.dragIn(native.p2,0),false);assert.equal(native.p2.active[0].set.trainerToken,'a');
});
test('a defeated partner stays absent instead of borrowing the other trainer’s reserve or stalling',()=>{
 let run=fixture();
 for(const target of [1,2,2]){
  run.combat=playClassicCombat(run,{type:'move',move:'seismictoss',target});run.party=run.combat.teams[0];run=JSON.parse(JSON.stringify(run));
  if(run.combat.ended)break;
  const b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p2.active[0].hp,0);assert.equal(run.combat.requests[1].actors[0].kind,'wait');
 }
 assert.equal(run.combat.ended,true);assert.equal(run.combat.winner,0);
});
test('simultaneous double knockout replaces only the partner with a legal reserve',()=>{
 const run=fixture({spread:true});run.combat=playClassicCombat(run,{type:'move',move:'earthquake'});run.party=run.combat.teams[0];
 const b=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run);
 assert.equal(b.p2.active[0].hp,0);assert.equal(b.p2.active[1].set.trainerToken,'reserve-b');assert.equal(run.combat.ended,false);
 run.combat=playClassicCombat(run,{type:'move',move:'earthquake'});assert.equal(run.combat.winner,0);
});
test('U-turn cannot open an empty replacement request or borrow the partner’s reserve',()=>{
 const run=fixture({pivot:true}),b=restoreClassicNativeBattle(run.combat,run);
 b.makeChoices('move splash','move uturn 1, move splash');
 assert.equal(b.requestState,'move');assert.equal(b.p2.active[0].set.trainerToken,'a');assert.ok(b.turn>=2);
});
test('U-turn still requests the correct trainer’s available reserve',()=>{
 const run=fixture({reserveA:true,pivot:true}),b=restoreClassicNativeBattle(run.combat,run);
 b.makeChoices('move splash','move uturn 1, move splash');
 assert.equal(b.requestState,'switch');assert.equal(b.p2.activeRequest.forceSwitch[0],true);assert.equal(b.p2.activeRequest.forceSwitch[1],false);
 assert.equal(b.choose('p2','switch 3, pass'),true);assert.equal(b.p2.active[0].set.trainerToken,'reserve-a');
});
