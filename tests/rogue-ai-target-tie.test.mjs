import test from 'node:test';import assert from 'node:assert/strict';
import {chooseClassicTiedTarget} from '../lib/rogue-ai-selection.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

const candidate=(target,score=10,{slot=1,side=0,knocksOut=false}={})=>({m:{id:'confuseray',slot},t:{target,side},score,knocksOut});
test('only equally scored targets of the same move, side and KO class are sampled',()=>{
 const a=candidate(1),b=candidate(2),others=[candidate(3,9),candidate(4,10,{slot:2}),candidate(-1,10,{side:1}),candidate(5,10,{knocksOut:true})],list=[a,b,...others];
 let draws=0;assert.equal(chooseClassicTiedTarget(a,list,n=>{draws++;assert.equal(n,2);return 1;}),b);assert.equal(draws,1);
 assert.equal(chooseClassicTiedTarget(a,[a,...others],()=>{throw Error('unnecessary draw');}),a);
 const self={...a,t:{side:1}};assert.equal(chooseClassicTiedTarget(self,[self],()=>{throw Error('unnecessary draw');}),self);
});
function fixture(seed,modern=true){
 const ivs={hp:10,atk:10,def:10,spa:10,spd:10,spe:10},mon=(id,boxId,moves)=>makeReferenceMon(id,50,{boxId,moves,ivs,nature:'hardy'});
 const run={id:'ai-tie',seed:'ai-tie',rng:seed,wave:20,screen:'battle',party:[mon(143,'hero1',['Splash']),mon(143,'hero2',['Splash'])],modifiers:[],tools:{},encounter:{kind:'trainer'},enemyAiRule:'source-ranked-v1',...(modern?{enemyAiTargetRule:'source-tie-v1'}:{})};
 run.combat=createClassicCombat(run,[mon(151,'foe',['Confuse Ray']),mon(4,'foe2',['Splash'])],{trainer:true,doubles:true});return run;
}
function act(run){run.combat=playClassicCombat(run,{type:'turn',actions:[{actor:0,type:'move',move:'splash'},{actor:1,type:'move',move:'splash'}]});const b=restoreClassicNativeBattle(run.combat,run),index=b.p1.pokemon.findIndex(p=>p.volatiles.confusion);assert.ok(index>=0);return {index,prng:run.combat.snapshot.prng};}
test('actual doubles sample both tied targets while legacy keeps the previous selection',()=>{
 const modern=new Set(),old=new Set();for(let seed=1;seed<=12;seed++){modern.add(act(fixture(seed)).index);old.add(act(fixture(seed,false)).index);}assert.deepEqual([...modern].sort(),[0,1]);assert.deepEqual([...old],[0]);
});
test('saved battle reproduces the same draw and preserves other data',async()=>{
 const run=fixture(8),encoded=await encodeGameData({run,other:{keep:true}}),one=await decodeGameData(encoded),two=await decodeGameData(encoded);assert.deepEqual(act(one.run),act(two.run));assert.deepEqual(one.other,{keep:true});assert.equal(one.run.combat.enemyAiTargetRule,'source-tie-v1');
});
test('new games select the tie rule without modifying another slot',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'ai-tie',seed:'ai-tie'});assert.equal(run.enemyAiTargetRule,'source-tie-v1');assert.deepEqual(state.slots[1],{keep:true});
});
