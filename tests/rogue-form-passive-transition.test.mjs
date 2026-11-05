import test from 'node:test';import assert from 'node:assert/strict';
import {makeReferenceMon,rogueSpecies,sourceAbility} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {previewClassicDnaFusion,validatedClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {replaceAbilityPassive,bindAbilityComponents,saveAbilityCombat,restoreAbilityCombat} from '../lib/rogue-ability-components.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
const mon=(id,boxId,patch={})=>makeReferenceMon(id,50,{boxId,moves:['Splash'],...patch});
const passive=(id,index)=>sourceAbility(rogueSpecies.get(id).formList[index]?.passiveAbilityId);
function setup(id,patch={}){return {id:'form-passive',wave:21,rng:42,party:[mon(id,'hero',{roguePassiveAbility:passive(id,0),...patch})],modifiers:[],tools:{},encounter:{kind:'wild'}};}
function begin(r,foes=[mon(143,'foe')],opts={}){r.combat=createClassicCombat(r,foes,opts);r.party=r.combat.teams[0];return restoreClassicNativeBattle(r.combat,r);}
function assertPassive(b,p,id){assert.ok(p.volatiles['roguepassive:'+id]);assert.deepEqual(Object.keys(p.volatiles).filter(k=>k.startsWith('roguepassive:')),['roguepassive:'+id]);assert.equal(p.hasAbility(id),!p.volatiles.gastroacid&&!b.getAllActive().some(x=>x!==p&&x.ability==='neutralizinggas'));}
async function reload(r){const saved=await decodeGameData(await encodeGameData({r,otherSlot:{hp:0,form:'keep'},adventure:{legacy:true}}));assert.deepEqual(saved.otherSlot,{hp:0,form:'keep'});assert.deepEqual(saved.adventure,{legacy:true});return saved.r;}
test('every differing automatic passive changes with its form and restores after real turns',async()=>{
 for(const id of [421,555,681,774,964]){let r=setup(id,{moves:['Tackle',"King's Shield"],...(id===555?{ability:'zenmode',rogueAbilitySlot:'hidden'}:{})});if([555,774].includes(id))r.party[0].hp=Math.floor(r.party[0].maxHp*.4);if(id===964)r.party.push(mon(151,'reserve'));begin(r,undefined,id===421?{weather:'sunnyday',weatherDuration:5}:{});
  if(id===681)r.combat=playClassicCombat(r,{type:'move',move:'tackle'});else if(id===964)r.combat=playClassicCombat(r,{type:'switch',slot:2});else r.combat=playClassicCombat(r,{type:'move',move:'tackle'});r.party=r.combat.teams[0];const target=r.party.find(p=>p.boxId==='hero'),expected=passive(id,target.rogueFormIndex);assert.equal(target.roguePassiveAbility,expected);
  r=await reload(r);const b=restoreClassicNativeBattle(r.combat,r),p=b.p1.pokemon.find(p=>p.set.trainerToken==='hero');if(p.isActive)assertPassive(b,p,expected);else assert.equal(p.volatiles['roguepassive:'+passive(id,0)],undefined);
  if(id===555)assert.equal(b.field.terrain,'psychicterrain');if(id===681){r.combat=playClassicCombat(r,{type:'move',move:'kingsshield'});r.party=r.combat.teams[0];const back=restoreClassicNativeBattle(r.combat,r);assertPassive(back,back.p1.active[0],passive(id,0));}
 }
});
test('entry form replacement starts the new terrain passive immediately and reload does not refresh its duration',async()=>{
 let r=setup(555,{ability:'zenmode',rogueAbilitySlot:'hidden'});r.party[0].hp=Math.floor(r.party[0].maxHp*.4);let b=begin(r);assert.equal(b.field.terrain,'psychicterrain');assertPassive(b,b.p1.active[0],passive(555,1));r.combat=playClassicCombat(r,{type:'move',move:'splash'});r.party=r.combat.teams[0];const duration=restoreClassicNativeBattle(r.combat,r).field.terrainState.duration;for(let i=0;i<3;i++){r=await reload(r);b=restoreClassicNativeBattle(r.combat,r);assert.equal(b.field.terrainState.duration,duration);}
});
test('Gas suppresses the new passive through form replacement and its departure starts it in the same doubles turn',()=>{
 const r=setup(555,{ability:'zenmode',rogueAbilitySlot:'hidden'});r.party[0].hp=Math.floor(r.party[0].maxHp*.4);r.party.push(mon(151,'ally',{moves:['Night Shade']}));const gas=mon(151,'gas',{ability:'neutralizinggas'});gas.hp=1;const b=begin(r,[gas,mon(143,'other')],{doubles:true});assert.equal(b.field.terrain,'');assert.equal(b.p1.active[0].hasAbility(passive(555,1)),false);
 b.makeChoices('move splash, move nightshade 1','move splash, move splash');assert.equal(b.p2.pokemon.find(p=>p.set.trainerToken==='gas').hp,0);assert.equal(b.p1.active[0].hasAbility(passive(555,1)),true);assert.equal(b.field.terrain,'psychicterrain');r.combat.snapshot=snapshotClassicNativeBattle(b);assert.equal(restoreClassicNativeBattle(r.combat,r).field.terrain,'psychicterrain');
});
test('changing away from passive Gas ends suppression and starts opposing Intimidate before the next action',()=>{
 const r=setup(681,{roguePassiveAbility:'neutralizinggas',moves:['Shadow Sneak']});r.party.push(mon(151,'ally'));const b=begin(r,[mon(143,'intimidate',{ability:'intimidate'}),mon(143,'foe2')],{doubles:true});assert.equal(b.p1.active[1].boosts.atk,0);b.makeChoices('move shadowsneak 1, move splash','move splash, move splash');assert.equal(b.p1.active[0].hasAbility('neutralizinggas'),false);assert.equal(b.p1.active[0].hasAbility(passive(681,1)),true);assert.equal(b.p1.active[1].boosts.atk,-1);
});
test('Gastro Acid remains effective after a source passive replacement and reload',()=>{
 const r=setup(681,{moves:['Splash','Tackle']});begin(r,[mon(143,'foe',{moves:['Gastro Acid']})]);r.combat=playClassicCombat(r,{type:'move',move:'splash'});r.party=r.combat.teams[0];r.combat=playClassicCombat(r,{type:'move',move:'tackle'});r.party=r.combat.teams[0];const b=restoreClassicNativeBattle(r.combat,r);assert.ok(b.p1.active[0].volatiles.gastroacid);assert.equal(b.p1.active[0].hasAbility(passive(681,1)),false);assert.ok(b.p1.active[0].volatiles['roguepassive:'+passive(681,1)]);
});
test('faint and NoFusion boundaries do not manufacture a new living passive component',()=>{
 const r=setup(778);r.party[0].hp=1;r.party.push(mon(151,'reserve'));begin(r,[mon(143,'foe',{moves:['Shadow Sneak']})]);r.combat=playClassicCombat(r,{type:'move',move:'splash'});r.party=r.combat.teams[0];assert.equal(r.party[0].hp,0);assert.equal(r.party[0].rogueFormIndex||0,0);assert.equal(restoreClassicNativeBattle(r.combat,r).p1.active[0].hp,0);
 const fused=previewClassicDnaFusion(mon(681,'hero',{roguePassiveAbility:passive(681,0),moves:['Tackle']}),mon(151,'donor'),{allowDonorForm:true}).fused;const rr=setup(681);rr.party=[fused];begin(rr);rr.combat=playClassicCombat(rr,{type:'move',move:'tackle'});rr.party=rr.combat.teams[0];assert.equal(rr.party[0].rogueFormIndex||0,0);assert.ok(validatedClassicDnaFusion(rr.party[0]));const b=restoreClassicNativeBattle(rr.combat,rr);assert.equal(b.p1.active[0].hasAbility(passive(681,0)),true);
});
test('explicit component replacement updates the generic save descriptor while untouched legacy bindings remain unchanged',()=>{
 const r=setup(151,{roguePassiveAbility:'levitate'}),b=begin(r),p=b.p1.active[0];const binding=bindAbilityComponents(b,{version:2,pokemon:[{side:0,token:'hero',passive:'levitate'}]});const before=binding.descriptor;assert.equal(replaceAbilityPassive(b,p,'levitate'),false);assert.deepEqual(binding.descriptor,before);assert.equal(replaceAbilityPassive(b,p,'waterabsorb'),true);assert.equal(p.hasAbility('waterabsorb'),true);assert.equal(p.hasAbility('levitate'),false);const saved=saveAbilityCombat(b,binding),restored=restoreAbilityCombat(saved);assert.equal(restored.battle.p1.active[0].hasAbility('waterabsorb'),true);assert.equal(saved.components.pokemon[0].passive,'waterabsorb');
});
test('the new Sharpness passive changes the very attack that triggers Blade form',()=>{
 const damage=enabled=>{const r=setup(681,{roguePassiveAbility:enabled?passive(681,0):null,moves:['Slash']});begin(r);const hp=r.combat.teams[1][0].hp;r.combat=playClassicCombat(r,{type:'move',move:'slash'});return hp-r.combat.teams[1][0].hp;};const plain=damage(false),boosted=damage(true);assert.ok(boosted>=plain*1.45&&boosted<=plain*1.55,`${plain} -> ${boosted}`);
});
test('fainting after a passive-changing core transition keeps zero HP and the correct source passive on reload',async()=>{
 let r=setup(774);r.party[0].hp=1;r.party.push(mon(151,'reserve'));begin(r,[mon(143,'foe',{moves:['Night Shade']})]);r.combat=playClassicCombat(r,{type:'move',move:'splash'});r.party=r.combat.teams[0];assert.equal(r.party[0].hp,0);assert.equal(r.party[0].rogueFormIndex,7);assert.equal(r.party[0].roguePassiveAbility,passive(774,7));r=await reload(r);const b=restoreClassicNativeBattle(r.combat,r);assert.equal(b.p1.active[0].hp,0);assert.equal(b.p1.active[0].fainted,true);
});
