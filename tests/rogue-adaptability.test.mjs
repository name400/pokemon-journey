import assert from 'node:assert/strict';
import test from 'node:test';
import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {ensureClassicState,startClassicRun} from '../lib/rogue-classic-state.mjs';
import {starterCatalog} from '../lib/rogue-starter-system.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
function fixture(move,{species=151,ability='adaptability',passive=false,duplicate=false,tera='',rule='source-subset-v1',enemy=false,gas=false,defenderMove='Splash'}={}){
 const attacker=makeReferenceMon(species,100,{boxId:'attacker',moves:[move,'Splash'],ability:passive?'pressure':ability,teraType:tera||undefined});
 if(passive||duplicate)attacker.roguePassiveAbility=ability;
 if(enemy&&tera)attacker.rogueInstantTera=true;
 const defender=makeReferenceMon(151,150,{boxId:'defender',moves:[defenderMove],ability:gas?'neutralizinggas':'pressure'});
 const r={id:'adaptability',wave:30,biome:1,rng:1234,screen:'battle',party:enemy?[defender]:[attacker],modifiers:[],tools:{teraOrb:!!tera},teraCharged:!!tera,balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'}};
 if(rule)r.adaptabilityRule=rule;r.combat=createClassicCombat(r,enemy?[attacker]:[defender],{trainer:true});return r;
}
function hit(r,{enemy=false,tera=false,stab=null,suppress=false,alreadyTera=false}={}){
 const b=restoreClassicNativeBattle(r.combat,r),random=b.random.bind(b),chance=b.randomChance.bind(b),attacker=b.sides[enemy?1:0].active[0];
 b.onEvent('Accuracy',b.format,{priority:-100},()=>true);b.randomChance=(n,d)=>n===1&&d===24?false:chance(n,d);b.random=(...args)=>{const value=random(...args);return args.length===1&&args[0]===16?0:value;};
 if(stab!==null)b.onEvent('ModifySTAB',b.format,{priority:100},()=>stab);
 if(suppress)attacker.addVolatile('gastroacid');
 let damage=0;b.onEvent('DamagingHit',b.format,{priority:-100},function(amount,target){if(target.side.n===(enemy?0:1))damage+=amount;});
 const command='move 1'+(tera&&!alreadyTera?' terastallize':'');b.makeChoices(...(enemy?['move 1',command]:[command,'move 1']));if(tera)assert.ok(attacker.terastallized);
 return {damage,b};
}
const cases=[
 ['Confusion','',151,2],['Water Gun','',151,1],
 ['Confusion','Psychic',151,2.25],['Confusion','Water',151,2],['Tera Blast','Water',151,1.5],['Tera Blast','Psychic',151,2.25],
 ['Water Gun','Water',151,1.5],['Aqua Tail','Water',151,1.5],['Zen Headbutt','Water',151,2],['Tackle','Water',151,1],
 ['Flamethrower','Fire',6,2.25],['Wing Attack','Fire',6,2],
 ['Flamethrower','Water',6,2],['Wing Attack','Water',6,2],
 ['Water Gun','Water',6,1.5],
];

test('Adaptability uses source original-type STAB before adding non-Stellar Tera bonuses',()=>{
 for(const [move,tera,species,stab]of cases)for(const passive of [false,true]){
  const actual=hit(fixture(move,{tera,species,passive}),{tera:!!tera}).damage;
  const expected=hit(fixture(move,{tera,species,ability:'pressure'}),{tera:!!tera,stab}).damage;
  assert.ok(actual>0);assert.equal(actual,expected,`${move} Tera=${tera} species=${species} passive=${passive}`);
 }
});

test('original-type and new-type Tera attacks differ from the preserved native rule',()=>{
 for(const passive of [false,true]){
  const original=hit(fixture('Confusion',{tera:'Water',passive}),{tera:true}).damage,originalLegacy=hit(fixture('Confusion',{tera:'Water',passive,rule:null}),{tera:true}).damage;
  const newType=hit(fixture('Water Gun',{tera:'Water',passive}),{tera:true}).damage,newLegacy=hit(fixture('Water Gun',{tera:'Water',passive,rule:null}),{tera:true}).damage;
  assert.ok(original>originalLegacy,'old type remains boosted');assert.ok(newType<newLegacy,'new type alone gets no Adaptability boost');
 }
});

test('enemy holders use the same original and new Tera type rule for both components',()=>{
 for(const passive of [false,true])for(const [move,stab]of [['Confusion',2],['Zen Headbutt',2],['Water Gun',1.5],['Aqua Tail',1.5]]){
  assert.equal(hit(fixture(move,{tera:'Water',enemy:true,passive}),{enemy:true,tera:true}).damage,hit(fixture(move,{tera:'Water',enemy:true,ability:'pressure'}),{enemy:true,tera:true,stab}).damage);
 }
});

test('Gastro Acid and opposing Gas suppress the source boost; equal components do not stack',()=>{
 for(const passive of [false,true]){
  const options={tera:'Water',passive},baseline=hit(fixture('Confusion',{tera:'Water',ability:'pressure'}),{tera:true}).damage;
  assert.equal(hit(fixture('Confusion',options),{tera:true,suppress:true}).damage,baseline);
  assert.equal(hit(fixture('Confusion',{...options,gas:true}),{tera:true}).damage,baseline);
 }
 assert.equal(hit(fixture('Confusion',{duplicate:true,tera:'Water'}),{tera:true}).damage,hit(fixture('Confusion',{tera:'Water'}),{tera:true}).damage);
});

test('fixed damage and Struggle are unaffected; v1 Stellar behavior is preserved',()=>{
 for(const move of ['Seismic Toss','Struggle'])assert.equal(hit(fixture(move,{tera:'Fighting'}),{tera:true}).damage,hit(fixture(move,{tera:'Fighting',ability:'pressure'}),{tera:true}).damage);
 for(const passive of [false,true])for(const move of ['Confusion','Water Gun'])assert.equal(hit(fixture(move,{tera:'Stellar',passive}),{tera:true}).damage,hit(fixture(move,{tera:'Stellar',passive,rule:null}),{tera:true}).damage);
});

test('the pre-Tera combat type is used after an actual type change',()=>{
 function changed(ability){const r=fixture('Water Gun',{ability,tera:'Water',defenderMove:'Soak'}),b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 2','move 1');assert.deepEqual(b.p1.active[0].getTypes(),['Water']);r.combat.snapshot=snapshotClassicNativeBattle(b);return r;}
 assert.equal(hit(changed('adaptability'),{tera:true}).damage,hit(changed('pressure'),{tera:true,stab:2.25}).damage);
});

test('encoded saves restore the source component after a real Tera action and preserve other slots',async()=>{
 for(const passive of [false,true])for(const [move,stab]of [['Confusion',2],['Water Gun',1.5]]){
  let r=fixture(move,{tera:'Water',passive}),b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 2 terastallize','move 1');r.combat.snapshot=snapshotClassicNativeBattle(b);
  let doc={coins:13},state=ensureClassicState(doc);state.slots[0]=r;state.slots[1]={id:'other',party:[{safe:true}]};doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);r=state.slots[0];assert.equal(r.combat.adaptabilityRule,'source-subset-v1');
  const control=structuredClone(r),saved=control.combat.snapshot.sides[0].pokemon[0];control.party[0].ability='pressure';delete control.party[0].roguePassiveAbility;control.combat.teams[0][0].ability='pressure';delete control.combat.teams[0][0].roguePassiveAbility;saved.ability='pressure';saved.baseAbility='pressure';delete saved.volatiles['roguepassive:adaptability'];
  assert.equal(hit(r,{tera:true,alreadyTera:true}).damage,hit(control,{tera:true,alreadyTera:true,stab}).damage);assert.deepEqual(state.slots[1],{id:'other',party:[{safe:true}]});assert.equal(doc.coins,13);
 }
});

test('new rules do not migrate old runs or modify shared ability callbacks',()=>{
 const original=Dex.abilities.get('adaptability').onModifySTAB;assert.equal(restoreClassicNativeBattle(fixture('Confusion',{rule:null}).combat).dex.abilities.get('adaptability').onModifySTAB,original);assert.notEqual(restoreClassicNativeBattle(fixture('Confusion').combat).dex.abilities.get('adaptability').onModifySTAB,original);assert.equal(Dex.abilities.get('adaptability').onModifySTAB,original);
 const doc={},state=ensureClassicState(doc,{initialStarterId:4}),starter=starterCatalog(state.system).find(p=>p.id===4),r=startClassicRun(doc,[{id:4,ability:starter.abilities[0].key,nature:starter.natures[0].key,gender:starter.genders[0],shiny:false,moves:starter.defaultMoves}]);assert.equal(r.adaptabilityRule,'source-subset-v2');delete r.adaptabilityRule;assert.equal(ensureClassicState(doc).slots[0].adaptabilityRule,undefined);
});
