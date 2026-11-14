import test from 'node:test';
import assert from 'node:assert/strict';
import {side46Available} from '../lib/cloud-adventure/adventure-side46.mjs';
import {fieldMap,fieldDialogue,fieldPath,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
import {canLearnStoryTm,storyTm} from '../lib/cloud-adventure/adventure-story-tm.mjs';
import {itemName} from '../lib/item-display.mjs';
test('courier uses a blocked canal tile and preserves the path and progress',()=>{
 const s={area:3,district:'lumiose-saison-canalside',interior:null,x:13,y:10,facing:'down'},old=fieldMap(s),ready={...s,zaMission19Stage:1},map=fieldMap(ready);assert.equal(side46Available(s),false);assert.equal(old[11][13],'~');assert.equal(map[11][13],'^');assert.equal(walkable(map[11][13]),false);assert.ok(fieldPath(map,{x:11,y:8},{x:13,y:10}).length);assert.equal(fieldDialogue(ready,map).action,'side46Start');assert.equal(fieldDialogue({...ready,zaSide46Stage:1},map).action,'side46Battle');assert.equal(fieldDialogue({...ready,zaSide46Stage:2},map).action,'side46Reward');assert.equal(side46Available({zaSide46Stage:2}),true);
});
test('Fly TM checks specific base forms and the explicitly documented regional form',()=>{
 const bag={'za-tm043':1};for(const id of [6,16,17,18,41,83,149,661,663,701])assert.equal(canLearnStoryTm(bag,{id,speciesId:id,moves:[]},'za-tm043'),true,`${id}`);assert.equal(canLearnStoryTm(bag,{id:10166,speciesId:83,moves:[]},'za-tm043'),true);assert.equal(canLearnStoryTm(bag,{id:10166,speciesId:25,moves:[]},'za-tm043'),false);assert.equal(canLearnStoryTm(bag,{id:25,speciesId:25,moves:[]},'za-tm043'),false);assert.equal(canLearnStoryTm({}, {id:16,speciesId:16,moves:[]},'za-tm043'),false);assert.equal(storyTm('za-tm043').move,'공중날기');assert.equal(itemName('za-tm043'),'기술머신 043 · 공중날기');
});
