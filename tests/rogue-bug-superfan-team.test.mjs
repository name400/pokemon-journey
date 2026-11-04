import assert from 'node:assert/strict';
import {classicBugSuperfanTeam} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {classicBugSuperfanOptions,classicBugSuperfanTutorMoves} from '../lib/rogue-bug-superfan.mjs';

const pool1=new Set([47,49,166,168,193,267,269,284,291,313,314,347,402,413,414,451,595,636,666,737,743,917,920]);
const pool2=new Set([123,127,214,205,212,213,292,348,416,452,469,542,545,558,589,617,596,738,752,826,851,873,900]);
for(const [wave,size] of [[30,3],[49,3],[50,4],[69,4],[70,5],[99,5]])for(let seed=1;seed<=10;seed++){
 const hero=makeReferenceMon(151,100,{boxId:'hero',moves:['Splash']}),run={seed:'bug-test',rng:seed,wave,biome:1,party:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},participants:[],awardedFoes:[],expNotices:[]};
 const team=classicBugSuperfanTeam(run);assert.equal(team.length,size);assert.deepEqual(team.slice(0,2).map(p=>p.rogueSourceId),[15,12]);assert.ok(pool1.has(team[2].rogueSourceId));for(const p of team.slice(3))assert.ok(pool2.has(p.rogueSourceId));
 run.combat=createClassicCombat(run,team,{trainer:true});run.party=run.combat.teams[0];run.combat=playClassicCombat(run,{type:'move',move:'splash'});assert.equal(run.combat.teams[1].length,size);
}
const pool3=new Set([127,212,214,826,851,632,637,768]),pool4=new Set([649,988,794,795]);
for(const wave of [100,119,120,139,140,159,160,190])for(let seed=1;seed<=20;seed++){
 const hero=makeReferenceMon(151,100,{boxId:'hero',moves:['Splash']}),run={seed:'bug-late',rng:Math.imul(seed,0x9e3779b9)>>>0,wave,biome:1,party:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},participants:[],awardedFoes:[],expNotices:[]};
 const team=classicBugSuperfanTeam(run);assert.equal(team.length,5);assert.deepEqual(team.slice(0,2).map(p=>[p.rogueSourceId,p.rogueFormIndex]),[[15,1],[12,1]]);
 if(wave<120){assert.ok(pool2.has(team[2].rogueSourceId));assert.ok(pool2.has(team[3].rogueSourceId));assert.ok(pool3.has(team[4].rogueSourceId));}
 else if(wave<140){assert.ok(pool2.has(team[2].rogueSourceId));assert.ok(pool3.has(team[3].rogueSourceId));assert.ok(pool3.has(team[4].rogueSourceId));assert.notEqual(team[3].rogueSourceId,team[4].rogueSourceId);}
 else if(wave<160){assert.ok(pool2.has(team[2].rogueSourceId));assert.ok(pool3.has(team[3].rogueSourceId));assert.ok(pool4.has(team[4].rogueSourceId));}
 else {assert.ok(pool3.has(team[2].rogueSourceId));assert.ok(pool3.has(team[3].rogueSourceId));assert.notEqual(team[2].rogueSourceId,team[3].rogueSourceId);assert.ok(pool4.has(team[4].rogueSourceId));assert.ok(team.slice(0,2).every(p=>p.rogueBossSegments===2));}
 run.combat=createClassicCombat(run,team,{trainer:true});run.party=run.combat.teams[0];run.combat=playClassicCombat(run,{type:'move',move:'splash'});assert.equal(run.combat.teams[1].length,5);
}
for(const wave of [29,201])assert.throws(()=>classicBugSuperfanTeam({wave}));
{const bug=makeReferenceMon(10,30,{boxId:'bug'}),a=makeReferenceMon(7,30,{boxId:'a'}),b=makeReferenceMon(4,30,{boxId:'b'}),run={wave:30,party:[bug,a,b],modifiers:[]};assert.deepEqual(classicBugSuperfanOptions(run),{eligible:true,bugCount:1,canShow:true,tradeItems:[]});bug.hp=0;assert.equal(classicBugSuperfanOptions(run).eligible,false);run.party.push(makeReferenceMon(1,30,{boxId:'c'}));assert.equal(classicBugSuperfanOptions(run).eligible,true);run.wave=29;assert.equal(classicBugSuperfanOptions(run).eligible,false);run.wave=30;run.party=[a,b];assert.equal(classicBugSuperfanOptions(run).eligible,false);run.party.push(makeReferenceMon(1,30,{boxId:'c'}));run.modifiers=[{id:'typebooster',boxId:'a',typeBoost:'Bug',count:1,transferable:false},{id:'quickclaw',boxId:'b',count:2},{id:'gripclaw',boxId:'gone',count:1}];const result=classicBugSuperfanOptions(run);assert.equal(result.eligible,true);assert.equal(result.canShow,false);assert.deepEqual(result.tradeItems,[{id:'quickclaw',boxId:'b',typeBoost:null,count:2}]);run.modifiers=run.modifiers.filter(m=>m.id!=='quickclaw');assert.equal(classicBugSuperfanOptions(run).eligible,false);}
{const run={seed:'tutor',rng:342918},moves=classicBugSuperfanTutorMoves(run);assert.equal(moves.length,4);assert.equal(new Set(moves.map(m=>m.id)).size,4);assert.ok(moves.every(m=>m.name));const saved=JSON.parse(JSON.stringify(run));assert.deepEqual(classicBugSuperfanTutorMoves(run),classicBugSuperfanTutorMoves(saved));}
console.log('Bug-Type Superfan early-wave team boundaries and engine initialization passed');
