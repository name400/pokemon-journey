import assert from 'node:assert/strict';
import {classicEncounter,classicTrainerEncounter} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {grantClassicLure} from '../lib/rogue-lure.mjs';
import {createClassicCombat,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {awardClassicTrainerVoucher} from '../lib/rogue-egg-gacha-rules.mjs';
function runAt(wave,id=222){return {id:'twin-gym',randomTrainerRule:'source-v1',trainerDoubleRule:'source-v1',encounterDoubleRule:'source-v2',capturePolicy:'source-v1',wave,biome:22,rng:12345+id,seed:'twin-gym',gymStart:20,party:[makeReferenceMon(151,100,{boxId:'hero',moves:['Surf']})],modifiers:[],tools:{},participants:[],awardedFoes:[],pendingMoves:[],screen:'battle',money:1000,balls:{masterball:1},rerolls:0};}
// Both orders must lead with their own signature and then their partner's.
for(const id of [222,223])for(const wave of [20,50,80,110,140]){
 const run=runAt(wave,id),gym=classicTrainerEncounter(run,id,{kind:'gym'},{doubles:true});assert.equal(gym.doubles,true);assert.equal(gym.trainer.partnerId,id===222?223:222);assert.deepEqual(gym.team.slice(0,2).map(mon=>mon.rogueSourceId),id===222?[338,337]:[337,338]);assert.match(gym.trainer.name,/풍/);assert.match(gym.trainer.name,/란/);
 const primary=id===222?[338,177,433,475]:[337,343,325,282],partner=id===222?[337,343,325,282]:[338,177,433,475];for(let i=2;i<gym.team.length;i++){const choices=i%2?partner:primary,root=rogueSpecies.get(gym.team[i].rogueSourceId).starterId;assert.ok(choices.some(s=>rogueSpecies.get(s).starterId===root),`${wave} slot ${i}`);}
 const system={voucherCounts:{}};const voucher=awardClassicTrainerVoucher(system,gym);assert.equal(voucher.trainerId,id);assert.equal(system.voucherCounts.plus,1);assert.equal(system.voucherUnlocks[String(id===222?223:222)],undefined);
 run.encounter=gym;run.combat=createClassicCombat(run,gym.team,{trainer:true,doubles:true});assert.equal(run.combat.requests[0].actors.filter(a=>a.kind==='move').length,1);assert.equal(run.combat.requests[1].actors.filter(a=>a.kind==='move').length,2);const saved=JSON.parse(JSON.stringify(run));saved.combat=playClassicCombat(saved,{type:'turn',actions:[{actor:0,type:'move',move:'surf'}]});assert.ok(saved.combat.turn>=1);
}
// Actual gym generation can pick either twin; stacked lures guarantee the
// source double branch at a boss wave. Old saves retain single gym battles.
let seen=new Set();for(let i=1;i<500&&seen.size<2;i++){const run=runAt(20);run.rng=Math.imul(i,0x9e3779b1)>>>0;for(const id of ['lure','superlure','maxlure'])grantClassicLure(run,id);const encounter=classicEncounter(run);if([222,223].includes(encounter.trainer.id)){assert.equal(encounter.doubles,true);seen.add(encounter.trainer.id);const old=runAt(20);old.randomTrainerRule=undefined;old.rng=Math.imul(i,0x9e3779b1)>>>0;for(const id of ['lure','superlure','maxlure'])grantClassicLure(old,id);const prior=classicEncounter(old);assert.equal(prior.doubles,false);}}assert.deepEqual(seen,new Set([222,223]));
console.log('Tate/Liza double parties, weighted generation, voucher scope and native combat passed.');
