import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {classicServices} from '../lib/rogue-classic-services.mjs';
import {classicRewardView} from '../lib/rogue-classic-rewards.mjs';
import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,classicCombatView} from '../lib/rogue-battle-engine.mjs';

test('move replacement targets include descriptions without changing moves or PP',()=>{
 const mon={...makeMon(7,20),boxId:'a',moves:['물대포','몸통박치기'],pp:{watergun:3,tackle:7}};
 const run={screen:'reward',wave:81,money:1000,party:[mon],modifiers:[],balls:{},rewards:[{rewardId:'tm',id:'test',effect:'test',name:'TM',description:'',image:'',tier:0,requiresReplace:true}]};
 const original=JSON.stringify(run);
 const reward=classicRewardView(run)[0].targets[0].moves;
 const service=classicServices(run).find(item=>item.id==='memorymushroom').targets[0].moves;
 for(const slots of [reward,service]){
  assert.deepEqual(slots.map(move=>move.name),mon.moves);
  assert.ok(slots.every(move=>typeof move.description==='string'&&move.description.length>0));
  assert.deepEqual(slots.map(move=>move.pp),[3,7]);
 }
 assert.equal(JSON.stringify(run),original);
});

test('source milk drink description follows the active rule',()=>{
 const mon={...makeMon(241,20),boxId:'a',moves:['우유마시기'],pp:{}};
 const run={screen:'reward',wave:81,money:1000,party:[mon],modifiers:[],milkDrinkTargetRule:'source-v1'};
 const move=classicServices(run).find(item=>item.id==='memorymushroom').targets[0].moves[0];
 assert.match(move.description,/아군/);
});

test('existing Tera move descriptions distinguish normal and terastallized behavior',()=>{
 const mon={...makeMon(7,20),boxId:'a',moves:['테라버스트','테라클러스터'],pp:{terablast:3,terastarstorm:2}};
 const run={screen:'reward',wave:81,money:1000,party:[mon],modifiers:[],balls:{},rewards:[{rewardId:'tm',id:'test',effect:'test',name:'TM',description:'',image:'',tier:0,requiresReplace:true}]};
 const before=structuredClone(run),reward=classicRewardView(run)[0].targets[0].moves,service=classicServices(run).find(item=>item.id==='memorymushroom').targets[0].moves;
 for(const slots of [reward,service]){
  assert.match(slots[0].description,/기본적으로 노말 타입 특수 공격/);assert.match(slots[0].description,/테라스탈 중에는/);assert.match(slots[0].description,/스텔라 타입일 때/);
  assert.match(slots[1].description,/스텔라 타입으로 바뀌고 모든 상대/);assert.deepEqual(slots.map(m=>m.pp),[3,2]);
 }
 const tera=Dex.moves.get('terablast'),pokemon={terastallized:null,getStat:stat=>stat==='atk'?200:100};
 const normal={category:'Special'};tera.onModifyMove(normal,pokemon);assert.equal(normal.category,'Special');
 pokemon.terastallized='Fire';const transformed={category:'Special'};tera.onModifyMove(transformed,pokemon);assert.equal(transformed.category,'Physical');
 pokemon.terastallized='Stellar';const stellar={category:'Special'};tera.onModifyMove(stellar,pokemon);assert.deepEqual(stellar.self,{boosts:{atk:-1,spa:-1}});
 const hero=makeReferenceMon(151,50,{boxId:'hero',moves:['Tera Blast','Tera Starstorm']}),foe=makeReferenceMon(143,80,{boxId:'foe',moves:['Splash']});
 const battleRun={party:[hero],modifiers:[],tools:{},rng:42,wave:20,screen:'battle',encounter:{kind:'wild'}};
 const displayed=classicCombatView(createClassicCombat(battleRun,[foe])).requests[0].displayMoves;
 assert.equal(displayed[0].description,reward[0].description);assert.equal(displayed[1].description,reward[1].description);
 assert.deepEqual(run,before);
});
