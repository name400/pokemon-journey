import assert from 'node:assert/strict';
import {classicEncounter,classicGoldenBugNetBaseSpecies} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {CLASSIC_REWARD_REGISTRY} from '../lib/rogue-classic-rewards.mjs';
const allowed=new Set([123,212,900,127,214,193,469,213,347,348,589,617,595,596,632,636,637,751,752,767,768,850,851,919,920,794,795]);
const seen=new Set();for(let i=1;i<=20000;i++){const run={wave:30,rng:Math.imul(i,0x9e3779b9)>>>0};const id=classicGoldenBugNetBaseSpecies(run);assert.ok(allowed.has(id));seen.add(id);}assert.equal(seen.size,27);
assert.equal(CLASSIC_REWARD_REGISTRY.find(x=>x.id==='goldenbugnet').weight,0);
function run(wave,modifiers=[]){return {id:'net-test',seed:'net-test',rng:98523456,wave,biome:1,party:[makeReferenceMon(7,20,{boxId:'hero'})],modifiers,tools:{},trainerTemplates:{}};}
for(const wave of [10,22]){const a=run(wave),b=run(wave,[{id:'goldenbugnet',boxId:null,count:0}]);const x=classicEncounter(a),y=classicEncounter(b);assert.equal(x.kind,y.kind);assert.deepEqual(x.team.map(p=>p.rogueSourceId),y.team.map(p=>p.rogueSourceId));assert.equal(a.rng,b.rng);}
{const a=run(10),b=run(10,[{id:'goldenbugnet',boxId:null,count:1}]);const x=classicEncounter(a),y=classicEncounter(b);assert.deepEqual(x.team.map(p=>p.rogueSourceId),y.team.map(p=>p.rogueSourceId));assert.equal(a.rng,b.rng);}
{let replaced=0;for(let i=1;i<=80;i++){const a=run(22),b=run(22,[{id:'goldenbugnet',boxId:null,count:1}]);a.rng=b.rng=Math.imul(i,0x9e3779b9)>>>0;const x=classicEncounter(a),y=classicEncounter(b);if(x.kind==='wild'&&y.kind==='wild'&&x.team[0].rogueSourceId!==y.team[0].rogueSourceId)replaced++;}assert.ok(replaced>0,'net must replace at least one wild species across sampled seeds');}
console.log('Golden Bug Net weighted species and no-net/boss compatibility passed');
