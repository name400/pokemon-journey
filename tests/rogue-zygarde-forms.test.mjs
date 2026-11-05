import test from 'node:test';
import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {rogueSpecies,makeReferenceMon} from '../lib/rogue-reference.mjs';
import {calculateStats} from '../lib/pokemon-config.mjs';
import {classicNativeForm} from '../lib/rogue-native-form.mjs';
import {classicFormOptions} from '../lib/rogue-transformations.mjs';
import {validatedClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {stageClassicDnaFusion} from '../lib/rogue-dna-fusion-stage.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,continueClassicWild} from '../lib/rogue-battle-engine.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {fixture,member} from './fixtures/dna-persistent.mjs';
import {repairClassicZygarde} from '../lib/rogue-zygarde.mjs';
import {classicFusionPaletteTarget} from '../components/rogue-fusion-palette-targets.mjs';
const source=rogueSpecies.get(718);
const zygarde=(key,boxId='primary')=>member({s:source,f:source.formList.find(f=>f.formKey===key),kind:key==='mega'?'mega':null},boxId);
const foe=()=>makeReferenceMon(143,50,{boxId:'foe',moves:['Splash']});

test('five Zygarde intermediate forms preserve both fusion roles, codec, turn, and unsplice',async()=>{
 for(const key of ['10','50-pc','10-pc','complete','10-complete'])for(const role of ['primary','donor']){
  const z=zygarde(key,role),plain=makeReferenceMon(151,50,{boxId:role==='primary'?'donor':'primary',moves:['Splash']});
  let {doc,state,run}=fixture(role==='primary'?[z,plain]:[plain,z]);
  run=stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}).run;state.slots[0]=run;
  const donor=structuredClone(run.party[0].rogueFusion.donor);assert.ok(validatedClassicDnaFusion(run.party[0]),key);
  run.combat=createClassicCombat(run,[foe()]);run.party=run.combat.teams[0];run.combat=playClassicCombat(run,{type:'move',move:'splash'});run.party=run.combat.teams[0];
  doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);run=state.slots[0];
  assert.ok(validatedClassicDnaFusion(run.party[0]));assert.deepEqual(run.party[0].rogueFusion.donor,donor);
  assert.equal(restoreClassicNativeBattle(run.combat,run).p1.active[0].maxhp,calculateStats(run.party[0]).hp);
  run.screen='reward';applyClassicAction(doc,{action:'unsplice',boxId:'primary',confirm:true});
  assert.equal(run.party[0].rogueFormKey,role==='primary'?key:undefined);assert.equal(run.party[0].fusionSpecies,undefined);
  assert.deepEqual(state.slots[1],{id:'other'});assert.deepEqual(doc.adventure,{safe:true});assert.equal(doc.coins,37);
 }
});

test('Complete Mega item actions preserve 10% versus 50% origin after codec and while fused',async()=>{
 for(const key of ['complete','10-complete'])for(const fused of [false,true]){
  let {doc,state,run}=fixture([zygarde(key),makeReferenceMon(151,50,{boxId:'donor',moves:['Splash']})]);
  if(fused){run=stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}).run;state.slots[0]=run;}
  run.formItems.primary=['zygardite'];const original=structuredClone(run.party[0]);original.hp=Math.min(23,original.maxHp);run.party[0].hp=original.hp;
  applyClassicAction(doc,{action:'form',boxId:'primary',item:'zygardite'});assert.equal(run.party[0].rogueZygardeMegaOrigin,key);assert.equal(run.party[0].rogueFormKey,'mega');
  doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);run=state.slots[0];
  assert.deepEqual(classicFormOptions(run.party[0],run).filter(o=>o.reverse).map(o=>o.formKey),[key]);
  applyClassicAction(doc,{action:'form',boxId:'primary',item:'reverse:zygardite'});
  assert.equal(run.party[0].rogueFormKey,key);assert.equal(run.party[0].hp,original.hp);assert.deepEqual(run.party[0].rogueBaseStats,original.rogueBaseStats);
  assert.deepEqual(run.formItems.primary,['zygardite']);if(fused)assert.ok(validatedClassicDnaFusion(run.party[0]));
 }
});

test('Power Construct triggers at half HP on entry and preserves increased HP through requests and codec',async()=>{
 for(const key of ['50-pc','10-pc']){
  const p=zygarde(key);p.hp=Math.floor(p.maxHp/2);const old=structuredClone(p);let {doc,state,run}=fixture([p]);
  run.combat=createClassicCombat(run,[foe()]);run.party=run.combat.teams[0];const current=run.party[0];
  assert.equal(current.rogueFormKey,key==='50-pc'?'complete':'10-complete');assert.equal(current.hp,old.hp+current.maxHp-old.maxHp);
  const hp=current.hp;doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);run=state.slots[0];
  for(let i=0;i<2;i++){run.combat=playClassicCombat(run,{type:'move',move:'splash'});run.party=run.combat.teams[0];assert.equal(run.party[0].hp,hp);assert.equal(run.party[0].maxHp,calculateStats(run.party[0]).hp);}
  assert.equal(restoreClassicNativeBattle(run.combat,run).p1.active[0].species.id,'zygardecomplete');
 }
});

test('Power Construct residual uses source HP delta with altered IVs, juice, Flip Stat and Dynamax',()=>{
 for(const options of [{},{rogueJuiceMods:[10],rogueFusionSpecialHeldRule:'source-v1'},{rogueFlipStats:true},{dmax:true}]){
  const p=zygarde('10-pc');Object.assign(p,options);p.ivs={hp:1,atk:2,def:3,spa:4,spd:5,spe:6};const stats=calculateStats(p);p.hp=p.maxHp=stats.hp;
  const {run}=fixture([p]);run.combat=createClassicCombat(run,[foe()]);run.party=run.combat.teams[0];
  const b=restoreClassicNativeBattle(run.combat,run),native=b.p1.active[0];if(options.dmax)native.addVolatile('dynamax');native.hp=Math.floor(native.maxhp/2);
  const oldHp=native.hp,oldMax=native.maxhp;run.party[0].hp=oldHp;run.party[0].maxHp=oldMax;run.combat.snapshot=snapshotClassicNativeBattle(b);
  run.combat=playClassicCombat(run,{type:'move',move:'splash'});run.party=run.combat.teams[0];
  assert.equal(run.party[0].rogueFormKey,'10-complete');assert.equal(run.party[0].hp,Math.min(run.party[0].maxHp,oldHp+Math.max(0,run.party[0].maxHp-oldMax)));
  const restored=restoreClassicNativeBattle(run.combat,run).p1.active[0];assert.equal(restored.hp,run.party[0].hp);assert.equal(restored.maxhp,run.party[0].maxHp);
 }
});

test('Complete resets before new battles, stays fainted, and does not silently change Mega or fusion forms',()=>{
 for(const key of ['complete','10-complete'])for(const hp of ['full',0]){
  const p=zygarde(key);if(hp===0)p.hp=0;const {run}=fixture([p,makeReferenceMon(151,50,{boxId:'bench',moves:['Splash']})]);
  run.combat=createClassicCombat(run,[foe()]);const saved=run.combat.teams[0].find(m=>m.boxId==='primary');assert.equal(saved.rogueFormKey,key==='complete'?'50-pc':'10-pc');assert.equal(saved.hp,hp===0?0:saved.maxHp);
 }
 const p=zygarde('mega'),{run}=fixture([p]);run.combat=createClassicCombat(run,[foe()]);assert.equal(run.combat.teams[0][0].rogueFormKey,'mega');
 assert.equal(Dex.species.get('zygarde10').baseStats.hp,54);assert.equal(classicNativeForm(source,source.formList[5]).id,'zygardecomplete');
});

test('fainting Complete restores the correct base without revival and a continuous wild wave resets it',()=>{
 for(const key of ['50-pc','10-pc']){
  const p=zygarde(key);p.hp=1;const {run}=fixture([p,makeReferenceMon(151,50,{boxId:'bench',moves:['Splash']})]);
  run.combat=createClassicCombat(run,[foe()]);run.party=run.combat.teams[0];const b=restoreClassicNativeBattle(run.combat,run),native=b.p1.active[0];native.faint();b.resolveFaints();run.combat.snapshot=snapshotClassicNativeBattle(b);run.party[0].hp=0;
  const restored=restoreClassicNativeBattle(run.combat,run);assert.equal(restored.p1.pokemon.find(p=>p.set.trainerToken==='primary').hp,0);assert.equal(run.party[0].rogueFormKey,key);
 }
 const p=zygarde('10-pc');p.hp=1;const {run}=fixture([p]);const target=foe();target.hp=1;run.combat=createClassicCombat(run,[target]);run.party=run.combat.teams[0];run.party[0].moves=['Tackle'];
 run.combat=playClassicCombat(run,{type:'move',move:'tackle'});run.party=run.combat.teams[0];assert.equal(run.combat.winner,0);assert.equal(run.party[0].rogueFormKey,'10-complete');
 run.wave++;run.combat=continueClassicWild(run,[{...foe(),boxId:'next'}]);run.party=run.combat.teams[0];assert.equal(run.party[0].rogueFormKey,'10-pc');assert.equal(run.party[0].hp,run.party[0].maxHp);
});

test('damaged form identities and unknown Mega origins reject DNA actions atomically',()=>{
 for(const mutate of [p=>p.rogueBaseStats.hp++,p=>p.rogueFormKey='complete',p=>p.rogueBattleSpecies='mew',p=>p.id=25]){
  const p=zygarde('10-complete');mutate(p);const {run}=fixture([p,makeReferenceMon(151,50,{boxId:'donor',moves:['Splash']})]),before=structuredClone(run);assert.throws(()=>stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}));assert.deepEqual(run,before);
 }
 const p=zygarde('mega');p.rogueZygardeMegaOrigin='unknown';const {run}=fixture([p,makeReferenceMon(151,50,{boxId:'donor',moves:['Splash']})]);assert.throws(()=>stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}));
});

test('verified legacy native Complete repairs its source identity without HP loss or touching another slot',async()=>{
 for(const key of ['50-pc','10-pc']){
  const p=zygarde(key);p.hp=1;let {doc,state,run}=fixture([p]);run.combat=createClassicCombat(run,[foe()]);run.party=run.combat.teams[0];run.screen='battle';
  const current=structuredClone(run.party[0]),old=zygarde(key);for(const field of ['id','rogueFormIndex','rogueFormKey','rogueBattleSpecies','rogueBaseStats'])run.party[0][field]=old[field];
  run.combat.teams[0]=structuredClone(run.party);assert.equal(run.party[0].battleAppearance,'zygardecomplete');
  doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);run=state.slots[0];assert.equal(run.party[0].rogueFormKey,current.rogueFormKey);assert.equal(run.party[0].hp,current.hp);assert.equal(run.party[0].maxHp,current.maxHp);
  run.combat=playClassicCombat(run,{type:'move',move:'splash'});assert.equal(run.combat.teams[0][0].hp,current.hp);assert.equal(run.combat.teams[0][0].rogueFormKey,current.rogueFormKey);assert.deepEqual(state.slots[1],{id:'other'});
  for(const mutate of [p=>p.maxHp++,p=>p.currentAbility='trace',p=>p.battleSprite='mew',p=>p.dynamaxed=true]){const ambiguous={...old,hp:current.hp,maxHp:current.maxHp,currentAbility:'powerconstruct',battleAppearance:'zygardecomplete',battleSprite:'zygarde-complete'};mutate(ambiguous);assert.equal(repairClassicZygarde(ambiguous,run),ambiguous);}
 }
});

test('Dynamaxed Complete resets at a fresh trainer boundary without healing missing HP',()=>{
 const p=zygarde('10-pc');const {run}=fixture([p]);run.combat=createClassicCombat(run,[foe()]);run.party=run.combat.teams[0];const b=restoreClassicNativeBattle(run.combat,run),native=b.p1.active[0];native.addVolatile('dynamax');native.hp=Math.floor(native.maxhp/2);run.party[0].hp=native.hp;run.party[0].maxHp=native.maxhp;run.combat.snapshot=snapshotClassicNativeBattle(b);
 run.combat=playClassicCombat(run,{type:'move',move:'splash'});run.party=run.combat.teams[0];assert.equal(run.party[0].rogueFormKey,'10-complete');const normalHp=Math.ceil(run.party[0].hp/2),pcMax=calculateStats(p).hp;
 run.combat=createClassicCombat(run,[foe()],{trainer:true});run.party=run.combat.teams[0];assert.equal(run.party[0].rogueFormKey,'10-pc');assert.equal(run.party[0].dynamaxed,false);assert.equal(run.party[0].hp,Math.min(pcMax,normalHp));
});

test('both sides and doubles retain source forms, while a fused Power Construct stays inactive',()=>{
 for(const doubles of [false,true]){
  const p=zygarde('10-pc');p.hp=1;const enemy=zygarde('50-pc','foe');enemy.hp=1;const {run}=fixture([p,...(doubles?[makeReferenceMon(151,50,{boxId:'ally',moves:['Splash']})]:[])]);
  run.combat=createClassicCombat(run,[enemy,...(doubles?[{...foe(),boxId:'foe2'}]:[])],{doubles,trainer:true});run.party=run.combat.teams[0];assert.equal(run.party[0].rogueFormKey,'10-complete');assert.equal(run.combat.teams[1][0].rogueFormKey,'complete');assert.equal(restoreClassicNativeBattle(run.combat,run).p2.active[0].maxhp,calculateStats(run.combat.teams[1][0]).hp);
 }
 const p=zygarde('50-pc'),donor=zygarde('10-pc','donor'),{run}=fixture([p,donor]);run.party=stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}).run.party;run.party[0].hp=1;run.combat=createClassicCombat(run,[foe()]);run.party=run.combat.teams[0];run.combat=playClassicCombat(run,{type:'move',move:'splash'});run.party=run.combat.teams[0];assert.equal(run.party[0].rogueFormKey,'50-pc');assert.equal(run.party[0].rogueFusion.donor.rogueFormKey,'10-pc');assert.ok(validatedClassicDnaFusion(run.party[0]));
});

test('Zygarde donor palette metadata retains source atlas aliases and rejects unrelated identities',()=>{
 for(const [key,ids,atlas] of [['10',[718,10181],'718-10'],['50-pc',[718,10119],'718'],['10-pc',[718,10118],'718-10'],['complete',[718,10119,10120],'718-complete'],['10-complete',[718,10118],'718-complete']])for(const id of ids){
  const donor=zygarde(key,'donor');donor.id=id;const {run}=fixture([makeReferenceMon(1,50,{boxId:'primary',moves:['Splash']}),donor]),fused=stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}).run.party[0];
  assert.equal(classicFusionPaletteTarget(fused)?.donor,atlas,`${key}:${id}`);assert.equal(classicFusionPaletteTarget(fused,'back')?.donor,atlas);fused.rogueFusion.donor.id=25;assert.equal(classicFusionPaletteTarget(fused),null);
 }
});
