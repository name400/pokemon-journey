import test from 'node:test';
import assert from 'node:assert/strict';
import {forms,member,fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {stageClassicDnaFusion} from '../lib/rogue-dna-fusion-stage.mjs';
import {validatedClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {prepareWeirdDreamEncounter} from '../lib/rogue-weird-dream.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';

const cases=[[65,'mega'],[382,'primal'],[800,'ultra'],[849,'gigantamax'],[892,'gigantamax-rapid']];
function dreamFixture(id,key,role){
 const row=forms.find(r=>r.s.sourceId===id&&r.f.formKey===key),changed=member(row,role),plain=makeReferenceMon(151,50,{boxId:role==='primary'?'donor':'primary',moves:['Splash']});
 const f=fixture(role==='primary'?[changed,plain]:[plain,changed]);f.run.formItems={donor:['charizarditex']};f.run=stageClassicDnaFusion(f.run,{primaryBoxId:'primary',donorBoxId:'donor'}).run;f.state.slots[0]=f.run;
 f.run.party.push(makeReferenceMon(1,50,{boxId:'bench1',moves:['Splash']}),makeReferenceMon(7,50,{boxId:'bench2',moves:['Splash']}));f.run.wave=82;
 return f;
}
test('persistent forms in both fusion roles keep Dream battle/leave data and replace safely on transform',async()=>{
 for(const [id,key]of cases)for(const role of ['primary','donor'])for(const job of ['transform','battle','leave']){try{
  let {doc,state,run}=dreamFixture(id,key,role);const before=structuredClone(run),prepared=prepareWeirdDreamEncounter(run);assert.ok(prepared);assert.deepEqual(run,before);
  run.rng=prepared.rng;run.screen='mystery';run.encounter={kind:'mystery',key:'weird-dream'};run.mystery={type:'weird-dream',stage:'choose',drafts:prepared.drafts,alternateTrainer:prepared.alternateTrainer};
  applyClassicAction(doc,{action:'mysterySelect',job});applyClassicAction(doc,{action:'mysteryCancel'});applyClassicAction(doc,{action:'mysterySelect',job});doc=await decodeGameData(await encodeGameData(doc));applyClassicAction(doc,{action:'mysteryConfirm'});state=ensureClassicState(doc);run=state.slots[0];
  if(job==='transform'){assert.ok(run.party.every(p=>!p.fusionSpecies&&!p.mega&&!p.primal&&!p.ultra&&!p.gigantamax));assert.ok(run.party.every(p=>!before.party.some(old=>old.boxId===p.boxId)));assert.equal(run.formItems.primary,undefined);}
  else{assert.ok(validatedClassicDnaFusion(run.party[0]));assert.deepEqual(run.party[0].rogueFusion,before.party[0].rogueFusion);assert.deepEqual(run.formItems.primary,['charizarditex']);if(job==='battle'){assert.ok(restoreClassicNativeBattle(run.combat,run).p1.active[0].maxhp>0);applyClassicAction(doc,{action:'turn',command:{type:'move',move:'splash'}});assert.ok(run.combat.turn>=2||run.combat.ended);assert.ok(validatedClassicDnaFusion(run.party[0]));}else assert.equal(run.party[0].level,45);}
  assert.equal(run.party.length,3);assert.deepEqual(state.slots[1],{id:'other'});assert.deepEqual(doc.adventure,{safe:true});assert.equal(doc.coins,37);
 }catch(cause){throw new Error(`${id}:${key}:${role}:${job}`,{cause});}}
});
test('unmarked, damaged and temporary Dynamax fused Dream inputs remain rejected without mutation',()=>{
 for(const change of [r=>delete r.weirdDreamFusionRule,r=>r.party[0].rogueFusion.baseStats.hp++,r=>r.party[0].rogueBattleSpecies='charizardgmax',r=>r.party[0].rogueFormKey='wrong',r=>r.party[0].maxHp++]){
  const {run}=dreamFixture(892,'gigantamax-rapid','primary');change(run);const before=structuredClone(run);assert.equal(prepareWeirdDreamEncounter(run),null);assert.deepEqual(run,before);
 }
 const {run}=dreamFixture(65,'mega','donor');run.party[0].dynamaxed=true;const before=structuredClone(run);assert.equal(prepareWeirdDreamEncounter(run),null);assert.deepEqual(run,before);
});
