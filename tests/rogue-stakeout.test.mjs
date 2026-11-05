import assert from 'node:assert/strict';
import test from 'node:test';
import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,initialClassicSwitch,playClassicCombat,continueClassicWild} from '../lib/rogue-battle-engine.mjs';
import {ensureClassicState,startClassicRun} from '../lib/rogue-classic-state.mjs';
import {starterCatalog} from '../lib/rogue-starter-system.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
function fixture({side=0,ability='stakeout',passive=false,duplicate=false,move='Water Gun',rule='source-subset-v1',tera=false,pivot=false,trainer=true}={}){
 const attacker=makeReferenceMon(151,100,{boxId:'attacker',moves:[move,'Splash'],ability:passive?'pressure':ability,teraType:tera?'Water':undefined});
 if(passive||duplicate)attacker.roguePassiveAbility=ability;
 const defenders=[0,1].map(i=>makeReferenceMon(151,150,{boxId:'def'+i,moves:[pivot?'U-turn':'Splash','Splash'],ability:'pressure'}));
 const r={id:'stakeout',wave:21,biome:1,rng:1234,screen:'battle',party:side===0?[attacker]:defenders,modifiers:[],tools:{teraOrb:tera},teraCharged:tera,balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:trainer?'trainer':'wild'}};
 if(rule)r.stakeoutRule=rule;
 r.combat=createClassicCombat(r,side===0?defenders:[attacker],{trainer});return r;
}
function probe(r,{side=0,control=false,suppress=false}={}){
 const b=restoreClassicNativeBattle(r.combat,r),random=b.random.bind(b),chance=b.randomChance.bind(b),events=[];
 b.onEvent('Accuracy',b.format,{priority:-100},()=>true);
 b.randomChance=(n,d)=>n===1&&d===24?false:chance(n,d);
 b.random=(...args)=>{const value=random(...args);return args.length===1&&args[0]===16?0:value;};
 if(suppress)b.sides[side].active[0].addVolatile('gastroacid');
 if(control)b.onEvent('BasePower',b.format,{priority:100},function(power,user){if(user.side.n===side)return power*2;});
 b.onEvent('DamagingHit',b.format,{priority:-100},function(amount,target,source){if(source.side.n===side)events.push(amount);});
 return {b,take(attack='move 1',defend='move 1'){const offset=events.length;b.makeChoices(...(side===0?[attack,defend]:[defend,attack]));return events.slice(offset).reduce((sum,n)=>sum+n,0);}};
}
function freeSwitch(r){r.combat=initialClassicSwitch(r,0,'def1');r.party=r.combat.teams[0];return r;}

test('Stakeout boosts real switches through power for physical/special and base/passive on both sides',()=>{
 for(const side of [0,1])for(const passive of [false,true])for(const move of ['Water Gun','Tackle']){
  const source=probe(fixture({side,passive,move}),{side}),control=probe(fixture({side,ability:'pressure',move}),{side,control:true});
  assert.equal(source.take('move 1','switch 2'),control.take('move 1','switch 2'),`${side} ${passive} ${move}`);
 }
});

test('normal entry and the turn after a switch do not receive a boost',()=>{
 for(const side of [0,1])for(const passive of [false,true]){
  const source=probe(fixture({side,passive}),{side}),control=probe(fixture({side,ability:'pressure'}),{side});
  assert.equal(source.take(),control.take(),'initial encounter');
  source.take('move 1','switch 2');control.take('move 1','switch 2');assert.equal(source.take(),control.take(),'next turn');
 }
});

test('doubles checks the selected target rather than another occupied slot',()=>{
 function dual(ability,passive){const r=fixture({ability,passive});r.party.push(makeReferenceMon(151,100,{boxId:'ally',moves:['Splash'],ability:'pressure'}));r.combat=createClassicCombat(r,[...r.combat.teams[1],makeReferenceMon(151,150,{boxId:'def2',moves:['Splash'],ability:'pressure'})],{trainer:true,doubles:true});return r;}
 for(const passive of [false,true])for(const target of [1,2]){
  const source=probe(dual('stakeout',passive)),control=probe(dual('pressure',false),{control:target===1}),attack=`move 1 ${target}, move splash`,defend='switch 3, move splash';
  assert.equal(source.take(attack,defend),control.take(attack,defend),`target ${target}`);
 }
});

test('a low-power Water Tera attack is doubled before the minimum power check',()=>{
 for(const passive of [false,true]){
  const source=probe(fixture({passive,tera:true})),control=probe(fixture({ability:'pressure',tera:true}),{control:true}),legacy=probe(fixture({passive,tera:true,rule:null}));
  const actual=source.take('move 1 terastallize','switch 2');assert.equal(actual,control.take('move 1 terastallize','switch 2'));assert.ok(actual<legacy.take('move 1 terastallize','switch 2'));
 }
});

test('the free initial switch is excluded, including after save recovery',async()=>{
 for(const passive of [false,true]){
  let r=freeSwitch(fixture({side:1,passive})),control=freeSwitch(fixture({side:1,ability:'pressure'}));
  let doc={coins:9},state=ensureClassicState(doc);state.slots[0]=r;state.slots[1]={id:'other',party:[{safe:true}]};doc=await decodeGameData(await encodeGameData(doc));r=ensureClassicState(doc).slots[0];
  assert.equal(probe(r,{side:1}).take(),probe(control,{side:1}).take());assert.deepEqual(doc.classic.slots[1],{id:'other',party:[{safe:true}]});assert.equal(doc.coins,9);
 }
});

test('a real switch clears a prior free-entry exemption, even within the same turn',()=>{
 const r=freeSwitch(fixture({side:1})),source=probe(r,{side:1}),control=probe(freeSwitch(fixture({side:1,ability:'pressure'})),{side:1,control:true});
 for(const p of [source,control])for(const token of ['def0','def1']){
  const b=p.b,incoming=b.p1.pokemon.find(mon=>mon.set.trainerToken===token);assert.equal(b.actions.switchIn(incoming,0),true);
  const queued=b.queue.list.findIndex(a=>a.choice==='runSwitch'&&a.pokemon===incoming);if(queued>=0)b.queue.list.splice(queued,1);b.actions.runSwitch(incoming);
 }
 assert.equal(source.take(),control.take());
});

test('the saved game initialSwitch action excludes the first enemy attack and keeps other mode data',()=>{
 function runTurn(ability){const doc={coins:11,adventure:{keep:true}},state=ensureClassicState(doc),r=fixture({side:1,ability,trainer:false});state.slots[0]=r;r.initialSwitchSlots=[0];applyClassicAction(doc,{action:'initialSwitch',slot:0,boxId:'def1'});const before=r.party.find(p=>p.boxId==='def1').hp;applyClassicAction(doc,{action:'turn',command:{type:'move',move:'splash'}});assert.deepEqual(doc.adventure,{keep:true});assert.equal(doc.coins,11);return before-r.party.find(p=>p.boxId==='def1').hp;}
 const baseline=runTurn('pressure');assert.ok(baseline>0);assert.equal(runTurn('stakeout'),baseline);
});

test('U-turn and a pending pivot saved before choosing its replacement keep the boost',async()=>{
 for(const passive of [false,true]){
  let r=fixture({passive,pivot:true});const pending=probe(r),control=probe(fixture({ability:'pressure',pivot:true}),{control:true});
  assert.equal(pending.take('move 1','move 1'),0);assert.equal(control.take('move 1','move 1'),0);assert.equal(pending.b.requestState,'switch');
  r.combat.snapshot=snapshotClassicNativeBattle(pending.b);let doc={coins:3},state=ensureClassicState(doc);state.slots[0]=r;state.slots[1]={id:'other'};doc=await decodeGameData(await encodeGameData(doc));r=ensureClassicState(doc).slots[0];
  assert.equal(r.combat.stakeoutRule,'source-subset-v1');assert.equal(probe(r).take('','switch 2'),control.take('','switch 2'));assert.deepEqual(doc.classic.slots[1],{id:'other'});
 }
});

test('Gastro Acid suppression and duplicate base/passive preserve switch behavior',()=>{
 for(const passive of [false,true])assert.equal(probe(fixture({passive}),{suppress:true}).take('move 1','switch 2'),probe(fixture({ability:'pressure'})).take('move 1','switch 2'));
 assert.equal(probe(fixture({duplicate:true})).take('move 1','switch 2'),probe(fixture()).take('move 1','switch 2'));
});

test('continuous wild encounters count as initial entry, not a combat switch',()=>{
 function next(ability){const r=fixture({ability,trainer:false}),weak=makeReferenceMon(19,1,{boxId:'weak',moves:['Splash']});weak.hp=1;r.combat=createClassicCombat(r,[weak]);r.combat=playClassicCombat(r,{type:'move',move:'watergun'});assert.ok(r.combat.ended);r.party=r.combat.teams[0];r.wave++;r.participants=[];r.awardedFoes=[];r.expNotices=[];r.combat=continueClassicWild(r,[makeReferenceMon(151,150,{boxId:'next',moves:['Splash'],ability:'pressure'})]);return r;}
 assert.equal(probe(next('stakeout')).take(),probe(next('pressure')).take());
});

test('new rules are isolated from legacy runs and the shared Dex',()=>{
 const original=Dex.abilities.get('stakeout').onModifyAtk;assert.equal(typeof original,'function');assert.equal(probe(fixture({rule:null})).b.dex.abilities.get('stakeout').onModifyAtk,original);assert.equal(probe(fixture()).b.dex.abilities.get('stakeout').onModifyAtk,undefined);assert.equal(Dex.abilities.get('stakeout').onModifyAtk,original);
 const doc={},state=ensureClassicState(doc,{initialStarterId:4}),starter=starterCatalog(state.system).find(p=>p.id===4),r=startClassicRun(doc,[{id:4,ability:starter.abilities[0].key,nature:starter.natures[0].key,gender:starter.genders[0],shiny:false,moves:starter.defaultMoves}]);assert.equal(r.stakeoutRule,'source-subset-v1');delete r.stakeoutRule;assert.equal(ensureClassicState(doc).slots[0].stakeoutRule,undefined);
});
