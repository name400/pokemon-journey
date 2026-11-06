import {Dex} from '@pkmn/sim';
import {moves} from '../../lib/game.mjs';
import {fixture,forms,member} from './dna-persistent.mjs';
import {makeReferenceMon,rogueSpecies} from '../../lib/rogue-reference.mjs';
import {classicNativeForm,classicPersistentFormKind} from '../../lib/rogue-native-form.mjs';
import {CLASSIC_REVIEWED_STATIC_FORM_SPECIES,previewClassicDnaFusion} from '../../lib/rogue-dna-fusion.mjs';
import {applyClassicPokemonChallenges} from '../../lib/rogue-challenge-pokemon.mjs';
import {createClassicCombat,playClassicCombat} from '../../lib/rogue-battle-engine.mjs';
export const reviewedRandomizedForms=[...forms,...CLASSIC_REVIEWED_STATIC_FORM_SPECIES.flatMap(id=>{const s=rogueSpecies.get(id);return s.formList.filter(f=>f.formIndex>0&&classicNativeForm(s,f)?.exists&&!classicPersistentFormKind(s,f)).map(f=>({s,f,kind:null}));})];
export function randomizedFormAliasFixture({entry,formAsDonor=false,value=1,abilityRandom=true,boxId='one',ended=false,active=false,sketch=false}={}){
 const {doc,run}=fixture([]);run.seed='audit-0';run.challenges=[{id:11,value},...(abilityRandom?[{id:12,value:2}]:[])];run.challengeEligibilityRule='source-subset-v1';
 const form=member(entry,formAsDonor?'donor':boxId),ordinary=makeReferenceMon(151,50,{boxId:formAsDonor?boxId:'donor'}),primary=applyClassicPokemonChallenges(formAsDonor?ordinary:form,run),donor=applyClassicPokemonChallenges(formAsDonor?form:ordinary,run),first=primary.moves.find(name=>{const m=Dex.moves.get(moves[name]?.key||name);return m.exists&&m.name!==name&&m.id!=='sketch'&&m.pp>=1;});if(!first)throw Error('no reviewable seeded move');const native=Dex.moves.get(moves[first]?.key||first),next=sketch?'Sketch':primary.moves.find(name=>{const id=Dex.moves.get(moves[name]?.key||name).id;return id!==native.id&&id!=='sketch';})||'Splash';primary.moves=sketch?[first,next,native.name]:[first,native.name,next];if(sketch){primary.rogueSketchRule='source-v1';primary.rogueSketchPP=[Math.min(2,native.pp),1,Math.min(7,native.pp)];}primary.pp={[native.id]:Math.min(3,native.pp)};primary.roguePPUps={[native.id]:2};const mon=previewClassicDnaFusion(primary,donor,{allowDonorForm:true,random:()=>0}).fused;
 if(ended||active){const lead=applyClassicPokemonChallenges(makeReferenceMon(151,80,{boxId:'lead'}),run),foe=makeReferenceMon(143,5,{boxId:'foe',moves:['Splash']});lead.moves=['Tackle'];lead.pp={};if(ended)foe.hp=1;run.party=[lead,mon];run.screen='battle';run.encounter={kind:'wild'};run.combat=createClassicCombat(run,[foe]);if(ended)run.combat=playClassicCombat(run,{type:'move',move:'tackle'});run.party=run.combat.teams[0];if(ended)run.screen='reward';}else run.party=[mon];return {doc,first,next,key:native.id};
}
