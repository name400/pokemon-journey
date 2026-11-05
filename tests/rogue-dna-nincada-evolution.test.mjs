import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {calculateStats,configure} from '../lib/pokemon-config.mjs';
import {classicEvolutionOptions,evolveClassicPokemon} from '../lib/rogue-evolution.mjs';
import {previewClassicDnaFusion,previewClassicDnaUnsplice,validatedClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {ensureClassicState,startClassicRun} from '../lib/rogue-classic-state.mjs';
import {starterCatalog} from '../lib/rogue-starter-system.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {createClassicCombat,restoreClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
const mon=(id,boxId,patch={})=>makeReferenceMon(id,30,{boxId,moves:['Splash'],...patch});
function fixture(secondary=false){
 const first=mon(secondary?151:290,'a',{shiny:true,variant:1}),donor=mon(secondary?290:7,'d'),fused=previewClassicDnaFusion(first,donor,{random:()=>0}).fused;
 return {id:'nincada',seed:'nincada',rng:42,screen:'reward',wave:21,biome:1,party:[fused],modifiers:[{id:'quickclaw',boxId:'a',count:2,typeBoost:null}],formItems:{a:['safe-unrelated-record']},tools:{},evolutionItems:{},balls:{pokeball:2},pendingMoves:[],pendingGrowth:[],encounter:{kind:'wild'}};
}
function evolve(run){const option=classicEvolutionOptions(run.party[0],run,{}).find(e=>e.sourceId===291&&e.ready);assert.ok(option);return evolveClassicPokemon(run,{}, {boxId:'a',evolutionKey:option.key});}
test('both Nincada fusion roles produce the matching independent Shedinja fusion without consuming a ball',()=>{
 for(const secondary of [false,true]){
  const run=fixture(secondary),before=structuredClone(run),result=evolve(run),extra=result.extra;
  assert.equal(run.party.length,2);assert.equal(result.after.rogueSourceId,secondary?151:291);assert.equal(result.after.fusionSpecies,secondary?291:7);
  assert.equal(extra.rogueSourceId,secondary?151:292);assert.equal(extra.fusionSpecies,secondary?292:7);assert.ok(validatedClassicDnaFusion(extra));
  assert.notEqual(extra.boxId,'a');assert.equal(extra.gender,'N');assert.equal(extra.shiny,true);assert.equal(extra.variant,1);assert.deepEqual(extra.ivs,before.party[0].ivs);assert.equal(extra.moves[0],'Splash');assert.equal(run.balls.pokeball,2);
  assert.deepEqual(run.modifiers.filter(m=>m.boxId===extra.boxId),before.modifiers.map(m=>({...m,boxId:extra.boxId})));assert.deepEqual(run.formItems[extra.boxId],before.formItems.a);
  assert.equal(extra.ability,secondary?'wonderguard':'torrent');assert.equal(extra.maxHp===1,secondary);assert.equal(extra.hp,extra.maxHp);
  const split=previewClassicDnaUnsplice(extra);assert.equal(split.primary.rogueSourceId,secondary?151:292);assert.equal(split.primary.ability,secondary?'synchronize':'wonderguard');assert.equal(split.donorRestored,false);if(!secondary)assert.equal(split.primary.maxHp,1);
  extra.rogueFusion.donor.ivs.hp=0;assert.notEqual(result.after.rogueFusion.donor.ivs.hp,0);
 }
});
test('full parties and missing normal balls still evolve Nincada but never create or directly select Shedinja',()=>{
 for(const secondary of [false,true])for(const blocked of ['full','no-ball']){
  const run=fixture(secondary);if(blocked==='full')run.party.push(...Array.from({length:5},(_,i)=>mon(25,'bench'+i)));else run.balls={greatball:9};
  const options=classicEvolutionOptions(run.party[0],run,{}),shed=options.find(e=>e.sourceId===292),before=structuredClone(run);assert.equal(shed.ready,false);assert.throws(()=>evolveClassicPokemon(run,{}, {boxId:'a',evolutionKey:shed.key}));assert.deepEqual(run,before);
  const result=evolve(run);assert.equal(result.extra,null);assert.equal(run.party.length,before.party.length);assert.deepEqual(run.balls,before.balls);
 }
});
test('fused Nincada evolution and new reserve survive real controller, battle action, codec and unsplice',async()=>{
 for(const secondary of [false,true]){
  let doc={coins:77,adventure:{untouched:true}},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(e=>e.id===1);
  let run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'controller-nincada',seed:'controller-nincada'});
  Object.assign(run,fixture(secondary),{formItems:{}});state.slots[1]={id:'other',party:[{keep:true}]};run.combat=createClassicCombat(run,[mon(143,'foe')]);
  const option=classicEvolutionOptions(run.party[0],run,state.system).find(e=>e.sourceId===291&&e.ready);applyClassicAction(doc,{action:'evolve',boxId:'a',evolutionKey:option.key});run=ensureClassicState(doc).slots[0];
  const extra=run.party.find(p=>p.boxId!=='a');assert.ok(extra);let b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p1.pokemon.length,2);assert.equal(b.p1.pokemon.find(p=>p.set.rogueToken===extra.boxId)?.maxhp??b.p1.pokemon[1].maxhp,extra.maxHp);
  run.combat=playClassicCombat(run,{type:'switch',slot:2});run.party=run.combat.teams[0];run.combat=playClassicCombat(run,{type:'move',move:'splash'});run.party=run.combat.teams[0];
  doc=await decodeGameData(await encodeGameData(doc));run=ensureClassicState(doc).slots[0];b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p1.active[0].ability,secondary?'wonderguard':'torrent');assert.equal(b.p1.active[0].maxhp,extra.maxHp);
  // Evolution move choices are independent of this party transaction fixture.
  run.screen='reward';run.pendingMoves=[];run.pendingGrowth=[];delete run.pendingEvolution;applyClassicAction(doc,{action:'unsplice',boxId:extra.boxId,confirm:true});run=ensureClassicState(doc).slots[0];const split=run.party.find(p=>p.boxId===extra.boxId);assert.equal(split.fusionSpecies,undefined);assert.equal(split.ability,secondary?'synchronize':'wonderguard');assert.equal(run.party.length,2);assert.deepEqual(ensureClassicState(doc).slots[1],{id:'other',party:[{keep:true}]});assert.deepEqual(doc.adventure,{untouched:true});assert.equal(doc.coins,77);
 }
});
test('new source ability HP rule preserves legacy and Adventure while counting ordinary and passive Wonder Guard',()=>{
 const source=mon(292,'shed',{ability:'torrent'});assert.equal(calculateStats(source).hp,1);const current={...source,rogueShedinjaHpRule:'source-ability-v1'};assert.ok(calculateStats(current).hp>1);
 for(const patch of [{ability:'wonderguard'},{roguePassiveAbility:'wonderguard'}])assert.equal(calculateStats({...current,...patch}).hp,1);
 const adventure={...current};delete adventure.rogueSourceId;assert.equal(calculateStats(adventure).hp,1);
});
test('new clones preserve challenge flags, fainted original and copied modifiers without sharing nested metadata',()=>{
 for(const secondary of [false,true]){const run=fixture(secondary);run.challenges=[{id:6,value:1},{id:11,value:2},{id:12,value:2}];run.party[0]=configure({...run.party[0],rogueFlipStats:true,rogueMovesetSeed:run.seed,rogueMovesetRandomizer:2,rogueNoEggRelearn:true},{hp:0});run.party[0].boosts={atk:3};run.party[0].terastallized='Water';run.party[0].battleAppearance='nincada';run.modifiers[0].metadata={active:false};const result=evolve(run);assert.equal(result.after.hp,0);assert.equal(result.extra.terastallized,null);assert.deepEqual(result.extra.boosts,{});assert.equal(result.extra.battleAppearance,null);assert.equal(result.extra.rogueFlipStats,true);assert.equal(result.extra.rogueMovesetSeed,run.seed);assert.ok(result.extra.hp>0);assert.ok(validatedClassicDnaFusion(result.extra));const copied=run.modifiers.find(m=>m.boxId===result.extra.boxId);assert.deepEqual(copied.metadata,{active:false});copied.metadata.active=true;assert.equal(run.modifiers[0].metadata.active,false);}
});
test('Wonder Guard suppression leaves the source HP rule intact through a real turn and restore',()=>{
 const run=fixture(true),extra=evolve(run).extra;run.party=[extra];run.combat=createClassicCombat(run,[mon(143,'acid',{moves:['Gastro Acid']})]);run.combat=playClassicCombat(run,{type:'move',move:'splash'});run.party=run.combat.teams[0];const b=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run);assert.ok(b.p1.active[0].volatiles.gastroacid);assert.equal(b.p1.active[0].hasAbility('wonderguard'),false);assert.equal(b.p1.active[0].maxhp,1);assert.equal(run.party[0].maxHp,1);
});
test('transient Dynamax is normalized on new evolution transactions and malformed HP is atomic',()=>{
 for(const secondary of [false,true]){
  const run=fixture(secondary),base=run.party[0];run.party[0]={...base,dynamaxed:true,maxHp:base.maxHp*2,hp:base.hp*2};const result=evolve(run);assert.equal(result.after.dynamaxed,false);assert.equal(result.extra.dynamaxed,false);assert.equal(result.after.maxHp,calculateStats(result.after).hp);assert.equal(result.extra.maxHp,calculateStats(result.extra).hp);
  const broken=fixture(secondary);broken.party[0].dynamaxed=true;const before=structuredClone(broken);assert.throws(()=>evolve(broken));assert.deepEqual(broken,before);
 }
});
