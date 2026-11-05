import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {applyClassicAction,activeClassicRun} from '../lib/rogue-classic-game.mjs';
import {prepareWeirdDreamEncounter} from '../lib/rogue-weird-dream.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {createClassicCombat,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
const reviewed=['focussash','blacksludge','rockyhelmet','expertbelt','shellbell','safetygoggles','heavydutyboots','muscleband','wiseglasses'];
function dream(item){
 const {doc,run}=fixture([4,1,25].map((id,i)=>makeReferenceMon(id,20,{boxId:'old'+i,item:i===0?item:'',moves:['Splash']})));
 const prepared=prepareWeirdDreamEncounter(run);assert.ok(prepared);run.rng=prepared.rng;run.combat=null;run.screen='mystery';run.encounter={kind:'mystery',key:'weird-dream'};
 // Fixed new species isolate item effects from random type immunity.
 const drafts=run.party.map((mon,i)=>{const fresh=makeReferenceMon([7,10,16][i],20,{boxId:'new'+i,moves:['Splash']});return {oldBoxId:mon.boxId,mon:fresh,dexIvs:fresh.ivs,eggMoveIndex:null};});
 run.mystery={type:'weird-dream',stage:'choose',drafts,alternateTrainer:prepared.alternateTrainer};return {doc,run};
}
test('reviewed native items support actual dream transformation and alternate battles through saved choices',async()=>{
 for(const item of reviewed)for(const job of ['transform','battle']){
  let {doc}=dream(item);const adventure=structuredClone(doc.adventure),other=structuredClone(doc.classic.slots[1]);
  applyClassicAction(doc,{action:'mysterySelect',job});doc=await decodeGameData(await encodeGameData(doc));applyClassicAction(doc,{action:'mysteryConfirm'});doc=await decodeGameData(await encodeGameData(doc));const run=activeClassicRun(doc);
  assert.equal(run.party[0].item,item);
  if(job==='transform'){assert.equal(run.party[0].boxId,'new0');assert.equal(run.screen,'reward');}
  else{assert.equal(run.combat.teams[1][0].item,item);assert.equal(run.combat.teams[1][0].rogueNativeItemNontransferable,true);assert.equal(run.screen,'battle');}
  assert.deepEqual(doc.adventure,adventure);assert.deepEqual(doc.classic.slots[1],other);
 }
});
test('transformed Focus Sash retains native one-use survival after event and codec restore',async()=>{
 let {doc}=dream('focussash');applyClassicAction(doc,{action:'mysterySelect',job:'transform'});applyClassicAction(doc,{action:'mysteryConfirm'});doc=await decodeGameData(await encodeGameData(doc));const run=activeClassicRun(doc);
 run.party=[run.party[0]];run.party[0].hp=run.party[0].maxHp;run.screen='battle';run.encounter={kind:'wild'};run.combat=createClassicCombat(run,[makeReferenceMon(150,100,{boxId:'sash-foe',moves:['Tackle']})]);
 run.combat=playClassicCombat(run,{type:'move',move:'splash'});run.party=run.combat.teams[0];assert.equal(run.party[0].hp,1);assert.equal(run.party[0].item,'');
});
test('unreviewed form and unknown native items remain rejected without consuming source state',()=>{
 for(const item of ['charizarditex','rustedsword','unknown-item']){const {doc,run}=fixture([4,1,25].map((id,i)=>makeReferenceMon(id,20,{boxId:'reject'+i,item:i===0?item:'',moves:['Splash']})));const before=structuredClone(doc);assert.equal(prepareWeirdDreamEncounter(run),null);assert.deepEqual(doc,before);}
});
