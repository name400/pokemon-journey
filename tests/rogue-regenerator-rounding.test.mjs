import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture({passive=false,modern=true,status='brn',suppressed=false}={}) {
 const hero=makeReferenceMon(151,50,{boxId:'hero',moves:['Splash'],ability:passive?'pressure':'regenerator'});
 hero.hp=20; hero.status=status;
 if(passive)hero.roguePassiveAbility='regenerator';
 const backup=makeReferenceMon(7,50,{boxId:'backup',moves:['Splash'],ability:'pressure'});
 const foe=makeReferenceMon(143,50,{boxId:'foe',moves:['Splash'],ability:'pressure'});
 const run={id:'regenerator-test',seed:'regenerator-test',rng:42,wave:20,screen:'battle',party:[hero,backup],modifiers:[],tools:{},encounter:{kind:'trainer'},...(modern?{regeneratorRoundingRule:'source-v1'}:{})};
 run.combat=createClassicCombat(run,[foe],{trainer:true});
 if(suppressed){const battle=restoreClassicNativeBattle(run.combat,run);battle.p1.active[0].addVolatile('gastroacid');run.combat.snapshot=snapshotClassicNativeBattle(battle);}
 return run;
}
for(const passive of [false,true])for(const status of ['brn','psn'])test(`${passive?'passive':'ordinary'} Regenerator preserves ${status} and source rounding across save`,async()=>{
 const document={run:fixture({passive,status}),other:{keep:true}},before=document.run.combat.teams[0][0],expected=before.hp+Math.max(1,Math.floor(before.maxHp*.33));
 assert.notEqual(expected,before.hp+Math.floor(before.maxHp/3));
 document.run.combat=playClassicCombat(document.run,{type:'switch',slot:2});
 document.run.party=document.run.combat.teams[0];
 const saved=await decodeGameData(await encodeGameData(document));
 const pokemon=restoreClassicNativeBattle(saved.run.combat,saved.run).p1.pokemon.find(p=>p.set.trainerToken==='hero');
 assert.equal(pokemon.hp,expected);assert.equal(pokemon.status,status);assert.deepEqual(saved.other,{keep:true});
});
test('suppressed Regenerator does not heal on switch',()=>{
 const run=fixture({suppressed:true});run.combat=playClassicCombat(run,{type:'switch',slot:2});
 assert.equal(run.combat.teams[0].find(p=>p.boxId==='hero').hp,20);
});
test('existing saves retain native one-third recovery',()=>{
 const run=fixture({modern:false}),before=run.combat.teams[0][0];run.combat=playClassicCombat(run,{type:'switch',slot:2});
 assert.equal(run.combat.teams[0].find(p=>p.boxId==='hero').hp,20+Math.floor(before.maxHp/3));
});
test('new runs select the source rule and do not change another save',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs');
 const {starterCatalog}=await import('../lib/rogue-starter-system.mjs');
 const document={},state=ensureClassicState(document,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);
 state.slots[1]={keep:true};const run=startClassicRun(document,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'regenerator-start'});
 assert.equal(run.regeneratorRoundingRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});
for(const passive of [false,true])test(`${passive?'passive':'ordinary'} Regenerator respects suppression`,()=>{
 const run=fixture({passive,suppressed:true});run.combat=playClassicCombat(run,{type:'switch',slot:2});
 assert.equal(run.combat.teams[0].find(p=>p.boxId==='hero').hp,20);
});
test('double battle switches only the selected poisoned Pokemon and retains the ally',async()=>{
 const run=fixture({status:'tox'}),ally=makeReferenceMon(4,50,{boxId:'ally',moves:['Splash'],ability:'pressure'}),foe2=makeReferenceMon(7,50,{boxId:'foe2',moves:['Splash'],ability:'pressure'});
 run.party=[run.party[0],ally,run.party[1]];run.combat=createClassicCombat(run,[run.combat.teams[1][0],foe2],{trainer:true,doubles:true});
 const before=run.combat.teams[0][0],battle=restoreClassicNativeBattle(run.combat,run);battle.makeChoices('switch 3, move splash','move splash, move splash');
 assert.equal(battle.p1.pokemon.find(p=>p.set.trainerToken==='hero').hp,20+Math.floor(before.maxHp*.33));
 assert.equal(battle.p1.pokemon.find(p=>p.set.trainerToken==='hero').status,'tox');
 assert.equal(battle.p1.active[1].set.trainerToken,'ally');run.combat.snapshot=snapshotClassicNativeBattle(battle);
 const saved=await decodeGameData(await encodeGameData({run,other:{keep:true}})),restored=restoreClassicNativeBattle(saved.run.combat);
 assert.equal(restored.p1.pokemon.find(p=>p.set.trainerToken==='hero').hp,20+Math.floor(before.maxHp*.33));assert.deepEqual(saved.other,{keep:true});
});
test('recovery is capped at the maximum HP',()=>{
 const run=fixture(),battle=restoreClassicNativeBattle(run.combat,run),hero=battle.p1.active[0];hero.hp=hero.maxhp-1;run.combat.snapshot=snapshotClassicNativeBattle(battle);
 run.combat=playClassicCombat(run,{type:'switch',slot:2});const after=run.combat.teams[0].find(p=>p.boxId==='hero');assert.equal(after.hp,after.maxHp);
});
