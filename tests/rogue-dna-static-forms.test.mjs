import test from 'node:test';import assert from 'node:assert/strict';
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {configure,calculateStats} from '../lib/pokemon-config.mjs';
import {classicNativeForm,classicPersistentFormKind} from '../lib/rogue-native-form.mjs';
import {CLASSIC_REVIEWED_STATIC_FORM_SPECIES,previewClassicDnaFusion,previewClassicDnaUnsplice,validatedClassicDnaFusion,reviewedClassicDnaDonorForm} from '../lib/rogue-dna-fusion.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
function formMon(s,f){const n=classicNativeForm(s,f),ability=f.abilities[0].key;return configure({...makeReferenceMon(s.sourceId,50,{boxId:'form',moves:['Splash']}),id:f.pokemonId||s.pokemonId,rogueFormIndex:f.formIndex,rogueFormKey:f.formKey,rogueBattleSpecies:n.id,rogueBaseStats:{...f.baseStats},rogueTypes:[...f.types],types:[...f.types],ability,rogueAbilitySlot:f.abilities[0].slot});}
test('every added permanent cosmetic, sex, size and species variant fuses in either role, plays, reloads and unsplices',async()=>{
 let checked=0;
 for(const id of CLASSIC_REVIEWED_STATIC_FORM_SPECIES){const s=rogueSpecies.get(id);for(const f of s.formList.filter(f=>f.formIndex>0)){
  if(!classicNativeForm(s,f)?.exists||classicPersistentFormKind(s,f))continue;
  assert.equal(reviewedClassicDnaDonorForm(id,f.formIndex,f.formKey,f.pokemonId||s.pokemonId),true);
  for(const secondary of [false,true]){const part=formMon(s,f),other=makeReferenceMon(151,50,{boxId:'other',moves:['Splash']}),fused=previewClassicDnaFusion(secondary?other:part,secondary?part:other,{allowDonorForm:true}).fused;assert.ok(validatedClassicDnaFusion(fused),`${id}:${f.formKey} ${secondary}`);
   let r={id:'static',wave:21,rng:42,party:[fused],modifiers:[],tools:{},encounter:{kind:'wild'}};r.combat=createClassicCombat(r,[makeReferenceMon(143,50,{boxId:'foe',moves:['Splash']})]);r.party=r.combat.teams[0];r.combat=playClassicCombat(r,{type:'move',move:'splash'});r.party=r.combat.teams[0];const restored=await decodeGameData(await encodeGameData({r,otherSlot:{retained:true}}));assert.deepEqual(restored.otherSlot,{retained:true});r=restored.r;const native=restoreClassicNativeBattle(r.combat,r).p1.active[0];assert.equal(native.maxhp,calculateStats(r.party[0]).hp);assert.ok(validatedClassicDnaFusion(r.party[0]));const actual=secondary?r.party[0].rogueFusion.donor:r.party[0];assert.equal(actual.rogueFormIndex,f.formIndex);assert.equal(actual.rogueFormKey,f.formKey);assert.deepEqual(actual.rogueBaseStats,f.baseStats);const split=previewClassicDnaUnsplice(r.party[0]);assert.equal(split.donorRestored,false);assert.equal(split.primary.rogueFormKey,secondary?other.rogueFormKey:f.formKey);checked++;
  }
 }}assert.equal(checked,190);
});
test('unreviewed special battle forms and corrupted static identities remain rejected',()=>{
 for(const [id,index]of [[966,1],[802,1]]){const s=rogueSpecies.get(id),f=s.formList[index];assert.equal(reviewedClassicDnaDonorForm(id,index,f.formKey,f.pokemonId||s.pokemonId),false);}
 const s=rogueSpecies.get(423),p=formMon(s,s.formList[1]),other=makeReferenceMon(151,50,{boxId:'other',moves:['Splash']});assert.throws(()=>previewClassicDnaFusion({...p,rogueFormKey:'forged'},other,{allowDonorForm:true}),/Unsupported/);assert.throws(()=>previewClassicDnaFusion({...p,rogueBaseStats:{...p.rogueBaseStats,atk:999}},other,{allowDonorForm:true}),/Unsupported/);
});
