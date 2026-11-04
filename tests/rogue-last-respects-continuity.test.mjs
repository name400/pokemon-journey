import assert from 'node:assert/strict';
import {applyClassicAction,activeClassicRun,classicGameView} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
const mon=(id,boxId,moves=['Splash'])=>makeReferenceMon(id,20,{boxId,moves});
const hero=mon(151,'hero',['Last Respects']),friend=mon(7,'friend'),enemy=mon(19,'enemy');
function fixture(doubles=false){let doc={coins:123,collection:[],adventure:{preserve:true}};let state=ensureClassicState(doc,{initialStarterId:1});let run={id:'faint-counter',seed:'counter',wave:21,biome:1,biomeStep:1,rng:1,screen:'advance',party:[hero,friend],modifiers:[],tools:{},balls:{},encounter:{kind:'wild'},participants:[],awardedFoes:[],expNotices:[]};run.combat=createClassicCombat(run,doubles?[enemy,mon(19,'enemy2')]:[enemy],{doubles});run.party=run.combat.teams[0];run.combat.snapshot.sides[0].totalFainted=3;state.slots[0]=run;return doc;}
// Both transitions rebuild the simulator; the saved counter must survive.
for(const oldDouble of [false,true]){let matched=false;for(let seed=1;seed<=300&&!matched;seed++){let doc=JSON.parse(JSON.stringify(fixture(oldDouble)));let run=activeClassicRun(doc);run.rng=seed;try{applyClassicAction(doc,{action:'next'});}catch{continue;}run=activeClassicRun(doc);if(run.encounter.kind!=='wild'||run.combat.doubles===oldDouble)continue;matched=true;assert.equal(run.combat.snapshot.sides[0].totalFainted,3);assert.equal(run.combat.snapshot.sides[1].totalFainted,0);const saved=JSON.parse(JSON.stringify(doc));const restored=activeClassicRun(saved),battle=restoreClassicNativeBattle(restored.combat,restored),p=battle.p1.pokemon.find(p=>p.set.trainerToken==='hero');const move=battle.dex.moves.get('lastrespects');assert.equal(move.basePowerCallback.call(battle,p),200);assert.deepEqual(saved.adventure,{preserve:true});}assert.ok(matched,`found ${oldDouble?'double to single':'single to double'} transition`);}
// New arenas and malformed or absent old counters are not imported.
for(const count of [undefined,-1,1.5,'3']){const doc=fixture();const run=activeClassicRun(doc);const combat=createClassicCombat(run,[enemy],{carryPlayerFaints:count});assert.equal(combat.snapshot.sides[0].totalFainted,0);}
const doc=fixture();const run=activeClassicRun(doc);const fresh=createClassicCombat(run,[enemy],{trainer:true});assert.equal(fresh.snapshot.sides[0].totalFainted,0);
console.log('Last Respects: both format transitions, saved restore, opposing counter and new battle isolation passed');
