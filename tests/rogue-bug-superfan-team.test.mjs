import assert from 'node:assert/strict';
import {classicBugSuperfanTeam} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat} from '../lib/rogue-battle-engine.mjs';

const pool1=new Set([47,49,166,168,193,267,269,284,291,313,314,347,402,413,414,451,595,636,666,737,743,917,920]);
const pool2=new Set([123,127,214,205,212,213,292,348,416,452,469,542,545,558,589,617,596,738,752,826,851,873,900]);
for(const [wave,size] of [[30,3],[49,3],[50,4],[69,4],[70,5],[99,5]])for(let seed=1;seed<=10;seed++){
 const hero=makeReferenceMon(151,100,{boxId:'hero',moves:['Splash']}),run={seed:'bug-test',rng:seed,wave,biome:1,party:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},participants:[],awardedFoes:[],expNotices:[]};
 const team=classicBugSuperfanTeam(run);assert.equal(team.length,size);assert.deepEqual(team.slice(0,2).map(p=>p.rogueSourceId),[15,12]);assert.ok(pool1.has(team[2].rogueSourceId));for(const p of team.slice(3))assert.ok(pool2.has(p.rogueSourceId));
 run.combat=createClassicCombat(run,team,{trainer:true});run.party=run.combat.teams[0];run.combat=playClassicCombat(run,{type:'move',move:'splash'});assert.equal(run.combat.teams[1].length,size);
}
for(const wave of [29,100,140,200])assert.throws(()=>classicBugSuperfanTeam({wave}));
console.log('Bug-Type Superfan early-wave team boundaries and engine initialization passed');
