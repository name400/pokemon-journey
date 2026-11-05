import assert from 'node:assert/strict';
import test from 'node:test';
import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {ensureClassicState,startClassicRun} from '../lib/rogue-classic-state.mjs';
import {starterCatalog} from '../lib/rogue-starter-system.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

const specs=[
 ['steelworker','Steel',['Metal Claw','Mirror Shot'],false],
 ['rockypayload','Rock',['Rock Throw','Ancient Power'],false],
 ['overgrow','Grass',['Leafage','Absorb'],true],
 ['blaze','Fire',['Ember','Fire Fang'],true],
 ['torrent','Water',['Water Gun','Aqua Jet'],true],
 ['swarm','Bug',['Struggle Bug','Bug Bite'],true],
];
function fixture(ability,move,{rule='source-subset-v2',passive=false,tera='',low=false,gas=false,enemy=false}={}){
 const hero=makeReferenceMon(151,100,{boxId:'hero',moves:[move,'Splash'],ability:passive?'pressure':ability,teraType:tera||undefined});
 if(passive)hero.roguePassiveAbility=ability;
 if(low)hero.hp=Math.floor(hero.stats.hp*.3);
 const foe=makeReferenceMon(151,150,{boxId:'foe',moves:['Splash'],ability:gas?'neutralizinggas':'pressure'});
 const r={id:'typed-power-v2',wave:30,biome:1,rng:1234,screen:'battle',party:enemy?[foe]:[hero],modifiers:[],tools:{teraOrb:!!tera},teraCharged:!!tera,balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'}};
 if(rule)r.typedPowerRule=rule;
 r.combat=createClassicCombat(r,enemy?[hero]:[foe],{trainer:true});return r;
}
function hit(r,{type='',boost=false,tera=false,suppress=false,hp=null,enemy=false}={}){
 const b=restoreClassicNativeBattle(r.combat,r),chance=b.randomChance.bind(b),random=b.random.bind(b);
 // Fix accuracy, critical hits and damage rolls for paired damage comparisons.
 b.randomChance=(n,d)=>n===1&&d===24?false:chance(n,d);
 b.random=(...args)=>{const value=random(...args);return args.length===1&&args[0]===16?0:value;};
 b.onEvent('Accuracy',b.format,{priority:-100},()=>true);
 const attacker=enemy?b.p2.active[0]:b.p1.active[0];
 if(hp!==null)attacker.hp=hp;
 if(boost)b.onEvent('BasePower',b.format,{priority:100},function(power,user,target,move){if(move.type===type)return power*1.5;});
 if(suppress)attacker.addVolatile('gastroacid');
 let damage=0;b.onEvent('DamagingHit',b.format,{priority:-100},function(amount,target){if(target.side.n===(enemy?0:1))damage+=amount;});
 b.makeChoices('move 1'+(!enemy&&tera?' terastallize':''),'move 1'+(enemy&&tera?' terastallize':''));
 if(tera)assert.ok(attacker.terastallized);
 return {damage,b};
}

test('six source type boosts use power for both categories and passive components',()=>{
 for(const [ability,type,moves,low]of specs)for(const passive of [false,true])for(const move of moves){
  const actual=hit(fixture(ability,move,{passive,low})).damage,expected=hit(fixture('pressure',move,{low}),{type,boost:true}).damage;
  assert.ok(actual>0,`${ability} ${move}`);assert.equal(actual,expected,`${ability} ${move} passive=${passive}`);
 }
});

test('enemy trainers use the same source boosts with ordinary and passive abilities',()=>{
 for(const [ability,type,moves,low]of specs)for(const passive of [false,true]){
  const options={passive,low,enemy:true},actual=hit(fixture(ability,moves[0],options),{enemy:true}).damage;
  const expected=hit(fixture('pressure',moves[0],{low,enemy:true}),{enemy:true,type,boost:true}).damage;
  assert.ok(actual>0);assert.equal(actual,expected,ability+' enemy');
 }
});

test('low-power Tera boosts apply before the source minimum and leave priority moves intact',()=>{
 for(const [ability,type,moves,low]of specs)for(const passive of [false,true]){
  const options={passive,low,tera:type},actual=hit(fixture(ability,moves[0],options),{tera:true}).damage;
  assert.equal(actual,hit(fixture('pressure',moves[0],{low,tera:type}),{type,boost:true,tera:true}).damage,ability);
  assert.ok(actual<hit(fixture(ability,moves[0],{...options,rule:'source-subset-v1'}),{tera:true}).damage,`${ability} preserves old Tera behavior`);
 }
 const options={low:true,tera:'Water'};
 assert.equal(hit(fixture('torrent','Aqua Jet',options),{tera:true}).damage,hit(fixture('pressure','Aqua Jet',options),{type:'Water',boost:true,tera:true}).damage);
});

test('starter low-HP threshold rounds to a whole percent and changes with current HP',()=>{
 for(const [ability,type,moves,low]of specs.filter(s=>s[3]))for(const passive of [false,true]){
  const r=fixture(ability,moves[0],{low,passive}),max=r.party[0].stats.hp;
  const lastBoosted=Math.ceil(max*.335)-1,firstUnboosted=lastBoosted+1;
  assert.ok(lastBoosted/max>1/3,'fixture must exercise the source/native threshold difference');
  for(const hp of [Math.floor(max/3),lastBoosted,firstUnboosted,max]){
   const boost=Math.round(hp/max*100)<=33;
   assert.equal(hit(r,{hp}).damage,hit(fixture('pressure',moves[0]),{hp,type,boost}).damage,`${ability} HP ${hp}/${max}`);
  }
  assert.ok(hit(r,{hp:lastBoosted}).damage>hit(fixture(ability,moves[0],{passive,low,rule:'source-subset-v1'}),{hp:lastBoosted}).damage);
 }
});

test('unrelated types, suppression, full HP, and duplicate base/passive boosts are safe',()=>{
 for(const [ability,,moves,low]of specs)for(const passive of [false,true]){
  assert.equal(hit(fixture(ability,'Tackle',{passive,low})).damage,hit(fixture('pressure','Tackle',{low})).damage);
  const baseline=hit(fixture('pressure',moves[0],{low})).damage;
  assert.equal(hit(fixture(ability,moves[0],{passive,low}),{suppress:true}).damage,baseline,ability+' Gastro Acid');
  assert.equal(hit(fixture(ability,moves[0],{passive,low,gas:true})).damage,baseline,ability+' Gas');
  if(low)assert.equal(hit(fixture(ability,moves[0],{passive})).damage,hit(fixture('pressure',moves[0])).damage);
 }
 for(const [ability,,moves,low]of specs){
  const single=fixture(ability,moves[0],{low}),double=structuredClone(single);double.party[0].roguePassiveAbility=ability;double.combat=createClassicCombat(double,single.combat.teams[1],{trainer:true});
  assert.equal(hit(double).damage,hit(single).damage,ability+' duplicate');
 }
});

test('old rule snapshots and shared Dex keep native callbacks for the six new abilities',()=>{
 for(const [ability,,moves,low]of specs)for(const rule of [null,'source-subset-v1']){
  const r=fixture(ability,moves[0],{rule,low}),b=restoreClassicNativeBattle(r.combat,r);
  assert.equal(b.dex.abilities.get(ability).onModifyAtk,Dex.abilities.get(ability).onModifyAtk);
  assert.equal(typeof Dex.abilities.get(ability).onModifyAtk,'function');
 }
 for(const ability of ['transistor','dragonsmaw'])assert.equal(restoreClassicNativeBattle(fixture(ability,'Tackle').combat).dex.abilities.get(ability).onModifyAtk,undefined);
});

test('real encoded saves restore v2 boosts, low HP, a Tera action and other slots',async()=>{
 for(const [ability,type,moves,low]of specs){
  let r=fixture(ability,moves[0],{passive:true,low,tera:type});
  if(low){r.party[0].hp=Math.ceil(r.party[0].stats.hp*.335)-1;r.combat=createClassicCombat(r,r.combat.teams[1],{trainer:true});}
  const savedHp=r.party[0].hp,b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 2','move 1');r.combat.snapshot=snapshotClassicNativeBattle(b);
  let doc={coins:5},state=ensureClassicState(doc);state.slots[0]=r;state.slots[1]={id:'other',party:[{safe:true}]};
  doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);r=state.slots[0];assert.equal(r.combat.typedPowerRule,'source-subset-v2');assert.equal(restoreClassicNativeBattle(r.combat,r).p1.active[0].hp,savedHp);
  const control=structuredClone(r);delete control.party[0].roguePassiveAbility;delete control.combat.teams[0][0].roguePassiveAbility;delete control.combat.snapshot.sides[0].pokemon[0].volatiles['roguepassive:'+ability];
  assert.equal(hit(r,{tera:true}).damage,hit(control,{type,boost:true,tera:true}).damage,ability+' restored');assert.deepEqual(state.slots[1],{id:'other',party:[{safe:true}]});assert.equal(doc.coins,5);
 }
});

test('new runs select v2 without upgrading existing runs',()=>{
 const doc={},state=ensureClassicState(doc,{initialStarterId:4}),starter=starterCatalog(state.system).find(p=>p.id===4);
 const run=startClassicRun(doc,[{id:4,ability:starter.abilities[0].key,nature:starter.natures[0].key,gender:starter.genders[0],shiny:false,moves:starter.defaultMoves}]);
 assert.equal(run.typedPowerRule,'source-subset-v2');
 run.typedPowerRule='source-subset-v1';assert.equal(ensureClassicState(doc).slots[0].typedPowerRule,'source-subset-v1');
});
