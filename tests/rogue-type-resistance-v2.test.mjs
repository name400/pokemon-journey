import assert from 'node:assert/strict';
import test from 'node:test';
import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {ensureClassicState,startClassicRun} from '../lib/rogue-classic-state.mjs';
import {starterCatalog} from '../lib/rogue-starter-system.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
const specs=[['dryskin','Fire',1.25,['Ember','Fire Punch']],['purifyingsalt','Ghost',.5,['Shadow Ball','Shadow Claw']]];
function fixture(move,ability,{rule='source-subset-v2',passive=false,attackerAbility='pressure',tera='',weather='',low=false,duplicate=false}={}){
 const hero=makeReferenceMon(151,70,{boxId:'hero',moves:[move,'Splash',...(move==='Water Gun'?[]:['Water Gun'])],ability:attackerAbility,teraType:tera||undefined});
 const foe=makeReferenceMon(151,100,{boxId:'foe',moves:['Splash'],ability:passive?'pressure':ability});
 if(passive||duplicate)foe.roguePassiveAbility=ability;
 if(low)foe.hp=Math.floor(foe.stats.hp/2);
 const r={id:'type-resistance-v2',wave:30,biome:1,rng:1234,screen:'battle',party:[hero],modifiers:[],tools:{teraOrb:!!tera},teraCharged:!!tera,balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'}};
 if(rule)r.typeResistRule=rule;
 r.combat=createClassicCombat(r,[foe],{trainer:true,weather});return r;
}
function hit(r,{tera=false,suppress=false,playerTarget=false}={}){
 const b=restoreClassicNativeBattle(r.combat,r),random=b.random.bind(b),chance=b.randomChance.bind(b);
 b.onEvent('Accuracy',b.format,{priority:-100},()=>true);
 b.randomChance=(n,d)=>n===1&&d===24?false:chance(n,d);
 b.random=(...args)=>{const value=random(...args);return args.length===1&&args[0]===16?0:value;};
 if(suppress)b.p2.active[0].addVolatile('gastroacid');
 let damage=0;b.onEvent('DamagingHit',b.format,{priority:-100},function(amount,target){if(target.side.n===(playerTarget?0:1))damage+=amount;});
 b.makeChoices('move 1'+(tera?' terastallize':''),'move 1');if(tera)assert.ok(b.p1.active[0].terastallized);
 return {damage,b};
}

test('Dry Skin and Purifying Salt modify calculated damage for both move categories and passive abilities',()=>{
 let difference=false;
 for(const [ability,,factor,moves]of specs)for(const passive of [false,true])for(const move of moves){
  const baseline=hit(fixture(move,'pressure')).damage,source=hit(fixture(move,ability,{passive})).damage,legacy=hit(fixture(move,ability,{passive,rule:'source-subset-v1'})).damage;
  assert.ok(baseline>0);assert.equal(source,Math.max(1,Math.floor(baseline*factor)),`${ability} ${move} passive=${passive}`);
  if(source!==legacy)difference=true;
 }
 assert.ok(difference,'changing the multiplier stage must produce an observable damage difference');
});

test('the player receives the same type damage adjustment as enemy holders',()=>{
 function reverse(r){const defender=r.combat.teams[1][0],attacker=r.party[0];r.party=[defender];r.combat=createClassicCombat(r,[attacker],{trainer:true});return r;}
 for(const [ability,,factor,moves]of specs)for(const passive of [false,true])for(const move of moves){
  const baseline=hit(reverse(fixture(move,'pressure')),{playerTarget:true}).damage;
  const actual=hit(reverse(fixture(move,ability,{passive})),{playerTarget:true}).damage;
  assert.ok(baseline>0);assert.equal(actual,Math.max(1,Math.floor(baseline*factor)),ability+' player');
 }
});

test('Dry Skin fire vulnerability remains after a low-power Fire Tera minimum',()=>{
 for(const passive of [false,true]){
  const options={passive,tera:'Fire'},baseline=hit(fixture('Ember','pressure',options),{tera:true}).damage;
  const source=hit(fixture('Ember','dryskin',options),{tera:true}).damage,legacy=hit(fixture('Ember','dryskin',{...options,rule:'source-subset-v1'}),{tera:true}).damage;
  assert.equal(source,Math.floor(baseline*1.25));assert.ok(source>legacy);
 }
});

test('other types and fixed damage remain intact, and equal base/passive effects apply once',()=>{
 for(const [ability]of specs)for(const passive of [false,true])for(const move of ['Tackle','Ice Beam','Dragon Rage','Night Shade'])assert.equal(hit(fixture(move,ability,{passive})).damage,hit(fixture(move,'pressure')).damage,`${ability} ${move}`);
 for(const [ability,,,moves]of specs)assert.equal(hit(fixture(moves[0],ability,{duplicate:true})).damage,hit(fixture(moves[0],ability)).damage);
});

test('Mold Breaker, Gastro Acid and Neutralizing Gas bypass the damage callbacks',()=>{
 for(const [ability,,,moves]of specs)for(const passive of [false,true]){
  const baseline=hit(fixture(moves[0],'pressure')).damage;
  assert.equal(hit(fixture(moves[0],ability,{passive,attackerAbility:'moldbreaker'})).damage,baseline);
  assert.equal(hit(fixture(moves[0],ability,{passive,attackerAbility:'neutralizinggas'})).damage,baseline);
  assert.equal(hit(fixture(moves[0],ability,{passive}),{suppress:true}).damage,baseline);
 }
});

test('Dry Skin retains Water absorption and rain healing/sun damage',()=>{
 for(const passive of [false,true]){
  let r=fixture('Water Gun','dryskin',{passive,low:true}),b=restoreClassicNativeBattle(r.combat,r),p=b.p2.active[0],before=p.hp;
  b.makeChoices('move 1','move 1');assert.equal(p.hp-before,Math.floor(p.baseMaxhp/4));
  for(const weather of ['raindance','sunnyday']){
   r=fixture('Splash','dryskin',{passive,low:true,weather});b=restoreClassicNativeBattle(r.combat,r);p=b.p2.active[0];before=p.hp;
   b.makeChoices('move 1','move 1');assert.equal(p.hp-before,(weather==='raindance'?1:-1)*Math.floor(p.baseMaxhp/8));
  }
 }
});

test('Purifying Salt keeps status and Yawn immunity without curing an existing suppressed status',()=>{
 for(const passive of [false,true]){
  const r=fixture('Splash','purifyingsalt',{passive}),b=restoreClassicNativeBattle(r.combat,r),p=b.p2.active[0],source=b.p1.active[0];
  for(const status of ['brn','par','slp','psn','tox','frz'])assert.equal(p.trySetStatus(status,source,b.dex.moves.get('toxic')),false,status);
  assert.equal(p.addVolatile('yawn',source,b.dex.moves.get('yawn')),null);
  p.addVolatile('gastroacid');assert.equal(p.trySetStatus('brn',source,b.dex.moves.get('willowisp')),true);p.removeVolatile('gastroacid');
  b.makeChoices('move 1','move 1');assert.equal(p.status,'brn');
 }
});

test('v1 and absent rules keep their callbacks without modifying the shared ability catalog',()=>{
 for(const [ability,,,moves]of specs)for(const rule of [null,'source-subset-v1']){
  const b=restoreClassicNativeBattle(fixture(moves[0],ability,{rule}).combat),local=b.dex.abilities.get(ability),original=Dex.abilities.get(ability);
  assert.equal(local.onSourceBasePower,original.onSourceBasePower);assert.equal(local.onSourceModifyAtk,original.onSourceModifyAtk);
 }
 assert.equal(typeof Dex.abilities.get('dryskin').onSourceBasePower,'function');assert.equal(typeof Dex.abilities.get('purifyingsalt').onSourceModifyAtk,'function');
 for(const ability of ['thickfat','heatproof'])assert.equal(restoreClassicNativeBattle(fixture('Ember',ability).combat).dex.abilities.get(ability).onSourceModifyAtk,undefined);
});

test('encoded saves restore damage and non-damage effects while preserving other slots and currency',async()=>{
 for(const [ability,,factor,moves]of specs){
  let r=fixture(moves[0],ability,{passive:true,low:true}),b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 2','move 1');r.combat.snapshot=snapshotClassicNativeBattle(b);
  let doc={coins:7},state=ensureClassicState(doc);state.slots[0]=r;state.slots[1]={id:'other',party:[{safe:true}]};doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);r=state.slots[0];assert.equal(r.combat.typeResistRule,'source-subset-v2');
  const control=structuredClone(r);delete control.combat.teams[1][0].roguePassiveAbility;delete control.combat.snapshot.sides[1].pokemon[0].volatiles['roguepassive:'+ability];
  assert.equal(hit(r).damage,Math.max(1,Math.floor(hit(control).damage*factor)),ability+' restored');
  b=restoreClassicNativeBattle(r.combat,r);const target=b.p2.active[0];
  if(ability==='dryskin'){const before=target.hp;b.makeChoices('move 3','move 1');assert.equal(target.hp-before,Math.floor(target.baseMaxhp/4));}
  else assert.equal(target.trySetStatus('par',b.p1.active[0],b.dex.moves.get('thunderwave')),false);
  assert.deepEqual(state.slots[1],{id:'other',party:[{safe:true}]});assert.equal(doc.coins,7);
 }
});

test('only new runs choose v2 and existing runs retain v1',()=>{
 const doc={},state=ensureClassicState(doc,{initialStarterId:4}),starter=starterCatalog(state.system).find(p=>p.id===4),run=startClassicRun(doc,[{id:4,ability:starter.abilities[0].key,nature:starter.natures[0].key,gender:starter.genders[0],shiny:false,moves:starter.defaultMoves}]);
 assert.equal(run.typeResistRule,'source-subset-v2');run.typeResistRule='source-subset-v1';assert.equal(ensureClassicState(doc).slots[0].typeResistRule,'source-subset-v1');
});
