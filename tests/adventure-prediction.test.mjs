import test from 'node:test';
import assert from 'node:assert/strict';
import {predictSafeStep,predictBufferedStep,plannedMoveBatch,canContinueBufferedMove} from '../lib/adventure-prediction.mjs';
import {adventureMap,fieldMap} from '../lib/adventure-world.mjs';

test('only ordinary walkable steps are predicted; collision, grass and region exits wait for the server',()=>{
 const w={x:3,y:8,area:0,badges:[],league:0,map:adventureMap(0)};
 assert.deepEqual(predictSafeStep(w,'right'),{x:4,y:8,facing:'right'});
 assert.equal(predictSafeStep({...w,x:6,y:3},'right'),null);
 assert.equal(predictSafeStep({...w,x:3,y:5},'up'),null);
 assert.equal(predictSafeStep({...w,x:21,y:8},'right'),null);
 assert.equal(predictSafeStep(w,'constructor'),null);
 assert.deepEqual(w,{x:3,y:8,area:0,badges:[],league:0,map:adventureMap(0)});
});
test('a buffered held step is only predicted when both consecutive steps are safe',()=>{
 const map=adventureMap(0),w={x:3,y:8,area:0,badges:[],league:0,map},first=predictSafeStep(w,'right');
 assert.deepEqual(predictBufferedStep(w,first,'right'),{x:5,y:8,facing:'right'});
 assert.equal(predictBufferedStep({...w,x:5,y:3},predictSafeStep({...w,x:5,y:3},'right'),'right'),null);
 assert.equal(predictBufferedStep(w,null,'right'),null);
});
test('server warnings stop a buffered held step even when the position matches',()=>{
 const before={world:{area:0,cityVisit:true,interior:'citywild',locationId:0}},projected={x:14,y:3},after={world:{...before.world,...projected},battle:null};
 assert.equal(canContinueBufferedMove(before,after,projected),true);
 assert.equal(canContinueBufferedMove(before,{...after,world:{...after.world,pcAlphaAlert:true}},projected),false);
 assert.equal(canContinueBufferedMove(before,{...after,world:{...after.world,pcGardenSpooked:{a:12345}}},projected),false);
 assert.equal(canContinueBufferedMove(before,{...after,battle:{}},projected),false);
 assert.equal(canContinueBufferedMove(before,null,projected),false);
});
test('planned walking batches only a few steps and stops at encounters, gates, or obstacles',()=>{
 const map=adventureMap(0),w={x:3,y:8,area:0,badges:[],league:0,map};
 assert.deepEqual(plannedMoveBatch(w,['right','right','right','right']),['right','right','right']);
 assert.deepEqual(plannedMoveBatch({...w,x:6,y:3},['right','right','right']),['right']);
 assert.deepEqual(plannedMoveBatch({...w,x:20,y:8},['right','right','right']),['right','right']);
 assert.deepEqual(plannedMoveBatch({...w,x:3,y:5},['up','up']),[]);
 assert.deepEqual(plannedMoveBatch(w,['right','right'],1),['right']);
});
test('prediction and queued walking stop before people and visible wild Pokémon',()=>{
 const town={x:5,y:7,area:0,badges:[],league:0,map:adventureMap(0)},first=predictSafeStep(town,'down');
 assert.deepEqual(first,{x:5,y:8,facing:'down'});assert.equal(predictBufferedStep(town,first,'down'),null);
 assert.deepEqual(plannedMoveBatch(town,['down','down']),['down']);
 const garden={x:6,y:5,area:0,cityVisit:true,interior:'citywild',badges:[]};garden.map=fieldMap(garden);
 assert.equal(predictSafeStep(garden,'left'),null);assert.deepEqual(plannedMoveBatch(garden,['left']),[]);
});
