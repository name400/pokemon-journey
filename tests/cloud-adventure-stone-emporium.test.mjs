import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition,stepField} from '../lib/cloud-adventure/adventure-world.mjs';

test('Stone Emporium interior restores, opens its counter and returns to the street',()=>{
 const state={area:3,district:'lumiose-vernal',interior:'stoneEmporium',x:11,y:6,facing:'up',zaMission10Stage:10,teamIds:['kept'],zaSide27Started:true};
 assert.equal(fieldMap(state)[5][11],'n');assert.ok(fieldDialogue(state).actions.some(a=>a.action==='side27Buy-jaw'));
 const saved=storeAdventurePosition(state,42),restored=restoreAdventurePosition(saved,42);assert.deepEqual([restored.district,restored.interior,restored.x,restored.y,restored.teamIds,restored.zaSide27Started],['lumiose-vernal','stoneEmporium',11,6,['kept'],true]);
 const exit=stepField({...state,x:11,y:15,facing:'down'},'down');assert.deepEqual([exit.x,exit.y,exit.interior,exit.transitioned],[9,4,null,true]);
});
