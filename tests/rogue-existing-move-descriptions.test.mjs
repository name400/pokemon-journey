import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {classicServices} from '../lib/rogue-classic-services.mjs';
import {classicRewardView} from '../lib/rogue-classic-rewards.mjs';

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
