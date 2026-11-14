import test from 'node:test';
import assert from 'node:assert/strict';
import {side26Available,side26Spot,side26ValidRewards} from '../lib/cloud-adventure/adventure-side26.mjs';
import {canLearnStoryTm} from '../lib/cloud-adventure/adventure-story-tm.mjs';
import {fieldMap,walkable} from '../lib/cloud-adventure/adventure-world.mjs';

test('Armie uses a formerly blocked restaurant wall and leaves old paths intact',()=>{
 const s={area:3,district:'lumiose-rouge-sector3',interior:null,zaMission10Stage:2};const map=fieldMap(s);assert.equal(side26Available(s),true);assert.equal(side26Available({...s,zaMission10Stage:1}),false);assert.equal(side26Spot(s,{x:14,y:11,tile:map[11][14]}),true);assert.equal(walkable(map[11][14]),false);assert.equal(walkable(map[11][13]),true);assert.equal(side26Spot({...s,interior:'leYeah'},{x:14,y:11,tile:'^'}),false);
 assert.equal(side26ValidRewards({burnheal:1,firestone:1,'za-tm057':1,coins:900}),true);assert.equal(side26ValidRewards({version:2}),false);
});

test('TM057 admits reviewed species but not an unreviewed form or unrelated species',()=>{
 const bag={'za-tm057':1};for(const id of [4,92,229,322,667])assert.equal(canLearnStoryTm(bag,{id,speciesId:id,moves:[]},'za-tm057'),true);
 for(const mon of [{id:1,speciesId:1},{id:10100,speciesId:26},{id:99999,speciesId:667}])assert.equal(canLearnStoryTm(bag,{...mon,moves:[]},'za-tm057'),false);
 assert.equal(canLearnStoryTm(bag,{id:4,speciesId:4,moves:['도깨비불']},'za-tm057'),false);assert.equal(canLearnStoryTm({}, {id:4,speciesId:4,moves:[]},'za-tm057'),false);
});
