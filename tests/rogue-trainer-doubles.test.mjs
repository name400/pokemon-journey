import assert from 'node:assert/strict';
import {ensureClassicState,classicRandom} from '../lib/rogue-classic-state.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicEncounter} from '../lib/rogue-classic-world.mjs';
import {createClassicCombat,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {classicCaptureBlockReason} from '../lib/rogue-capture-eligibility.mjs';

function fixture(wave,group,seed,modern=true){return {id:'grunt-double',trainerDoubleRule:modern?'source-v1':undefined,encounterDoubleRule:'source-v2',capturePolicy:'source-v1',wave,biome:1,rng:seed,seed:'fixed',evilGroup:group,party:[makeReferenceMon(151,100,{boxId:'hero',moves:['Surf']})],modifiers:[],tools:{},teraCharged:false,participants:[],awardedFoes:[],pendingMoves:[],screen:'battle',money:1000,balls:{masterball:1},rerolls:0};}
// Check all ten grunts and all four fixed waves against the first seeded roll.
// Upstream uses an unseeded random source; this game intentionally uses its
// saved run RNG for reproducibility, so the same seed is not source-identical.
let example;for(const wave of [35,62,64,112])for(let group=0;group<10;group++)for(const wanted of [0,1,2]){
 let seed=1;for(;seed<100000;seed++){const roll={rng:seed};if(Math.floor(classicRandom(roll)*3)===wanted)break;}assert.ok(seed<100000);
 const run=fixture(wave,group,seed),encounter=classicEncounter(run);assert.equal(encounter.kind,'evil');assert.equal(encounter.doubles,wanted===0);if(encounter.doubles){assert.ok(encounter.team.length>=2);example||={run,encounter};}
 const old=fixture(wave,group,seed,false);assert.equal(classicEncounter(old).doubles,false,'pre-existing run retains single trainer battle');
}
const {run,encounter}=example;run.encounter=encounter;run.combat=createClassicCombat(run,encounter.team,{trainer:true,doubles:true});assert.equal(run.combat.requests[0].actors.filter(actor=>actor.kind==='move').length,1);assert.equal(run.combat.requests[1].actors.filter(actor=>actor.kind==='move').length,2);assert.match(classicCaptureBlockReason(run,{},encounter.team),/트레이너/);
const doc={coins:8,collection:[{id:'keep'}]},state=ensureClassicState(doc);state.slots[0]=run;assert.throws(()=>applyClassicAction(doc,{action:'flee'}),/도망/);const copy=JSON.parse(JSON.stringify(run));copy.combat=playClassicCombat(copy,{type:'turn',actions:[{actor:0,type:'move',move:'surf'}]});assert.ok(copy.combat.turn>=1);assert.equal(doc.coins,8);assert.deepEqual(doc.collection,[{id:'keep'}]);
console.log('Fixed grunt double variants use source 1/3 branch, actual doubles and old run compatibility passed.');
