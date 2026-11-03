// Fixed-wave fixtures from the pinned upstream trainer configuration; not a full run.
import assert from 'node:assert/strict';
import {classicEncounter,classicWorldReference as world} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat} from '../lib/rogue-battle-engine.mjs';

const stages={
 66:[['PETREL'],['TABITHA','COURTNEY'],['MATT','SHELLY'],['JUPITER','MARS','SATURN'],['COLRESS'],['BRYONY','ALIANA','CELOSIA','MABLE'],['FABA'],['PLUMERIA'],['OLEANA'],['GIACOMO','MELA','ATTICUS','ORTEGA','ERI']],
 114:[['PROTON'],['TABITHA','COURTNEY'],['MATT','SHELLY'],['JUPITER','MARS','SATURN'],['ZINZOLIN'],['BRYONY','ALIANA','CELOSIA','MABLE'],['FABA'],['PLUMERIA'],['OLEANA'],['GIACOMO','MELA','ATTICUS','ORTEGA','ERI']],
 164:[['ARCHER','ARIANA'],['TABITHA','COURTNEY'],['MATT','SHELLY'],['JUPITER','MARS','SATURN'],['COLRESS'],['XEROSIC'],['FABA'],['PLUMERIA'],['OLEANA'],['GIACOMO','MELA','ATTICUS','ORTEGA','ERI']],
};
for(let group=0;group<10;group++){
 let run={id:'evil-fixture',wave:35,biome:0,rng:42+group,party:[makeReferenceMon(151,100,{boxId:'player',moves:['Protect']})],modifiers:[],tools:{},seed:'fixture',evilGroup:group};
 for(const wave of [35,66,114,115,164,165]){
  run.wave=wave;
  const encounter=classicEncounter(run);
  assert.equal(encounter.kind,'evil');
  if(stages[wave]){
   const allowed=stages[wave][group].map(name=>world.enums.TrainerType[name]);
   assert.ok(allowed.includes(encounter.trainer.id),`group ${group}, wave ${wave}, trainer ${encounter.trainer.id}`);
   assert.equal(encounter.trainer.title,'악의 조직 간부');
   const previous=encounter.trainer.id;
   run=JSON.parse(JSON.stringify(run));
   assert.equal(classicEncounter(run).trainer.id,previous,`group ${group}, wave ${wave}: choice changed`);
  }else assert.equal(encounter.trainer.title,wave===35?'악의 조직 조무래기':'악의 조직 보스');
  assert.ok(encounter.team.length);
  run.encounter=encounter;
  run.combat=createClassicCombat(run,encounter.team,{trainer:true});
  assert.ok(playClassicCombat(run,{type:'move',move:'protect'}).turn>=1);
 }
}
console.log('Ten evil teams use the fixed grunt, admin and leader stages; each fixture plays one turn and admin choices survive serialization.');
