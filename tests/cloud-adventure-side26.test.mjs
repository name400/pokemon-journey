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

test('TM057 supports reviewed base species and distinct regional, appliance and size forms',()=>{
 const bag={'za-tm057':1},can=(id,speciesId=id,moves=[])=>canLearnStoryTm(bag,{id,speciesId,moves},'za-tm057');
 for(const id of [150,280,302,353,475,479,498,513,562,661,710,711,778,827,935])assert.equal(can(id),true,`species ${id}`);
 for(const [id,speciesId] of [[10115,105],[10179,562],[10008,479],[10012,479],[10027,710],[10032,711],[10143,778],[10057,359],[10034,6],[10038,94],[10285,478],[10295,668],[10320,952]])assert.equal(can(id,speciesId),true,`form ${id}`);
 for(const [id,speciesId] of [[105,105],[10149,105],[10196,6],[10008,710],[99999,479],[25,25]])assert.equal(can(id,speciesId),false,`unsupported ${id}`);
 assert.equal(can(280,280,['도깨비불']),false);assert.equal(canLearnStoryTm({}, {id:280,speciesId:280,moves:[]},'za-tm057'),false);
});
