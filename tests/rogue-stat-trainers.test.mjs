import assert from 'node:assert/strict';
import {classicStatTrainerEncounter} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
const leadIds=[344,242,59,65,448];
for(let id=120;id<=124;id++)for(const seed of [12345,938749,1282939]){
 const run={id:'stat',wave:120,biome:4,seed:'stat',rng:seed,screen:'battle',party:[makeReferenceMon(151,100,{boxId:'hero',moves:['Tackle']})],modifiers:[],tools:{},balls:{},participants:[],awardedFoes:[],expNotices:[],trainerTraitsRule:'source-v1',trainerItemsRule:'source-v1',trainerFieldItemsRule:'source-v1'};
 const encounter=classicStatTrainerEncounter(run,id);assert.equal(encounter.team.length,6);assert.equal(encounter.team[0].rogueSourceId,leadIds[id-120]);assert.equal(encounter.trainer.moneyMultiplier,2);assert.ok(encounter.team.every(mon=>mon.level>=1&&Number.isInteger(mon.level)));run.encounter=encounter;run.combat=createClassicCombat(run,encounter.team,{trainer:true});run.party=run.combat.teams[0];const restored=JSON.parse(JSON.stringify(run));if(!restored.combat.ended){const move=restored.combat.requests[0].actors[0].moves.find(m=>!m.disabled);restored.combat=playClassicCombat(restored,{type:'move',move:move.id});assert.ok(restored.combat.snapshot);}
}
assert.throws(()=>classicStatTrainerEncounter({},119));
