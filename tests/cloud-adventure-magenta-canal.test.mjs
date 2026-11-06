import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {magentaCanalRouteMap} from '../lib/cloud-adventure/adventure-magenta-canal-route.mjs';
test('Zone 7 to canal and Zone 14 keeps gates, water and save',()=>{
 const start={area:3,district:'lumiose-zone7',interior:null,x:1,y:8,facing:'left',zaRoyaleRank:'F'};
 const route=stepField(start,'left');assert.equal(route.district,'lumiose-magenta-canal-route');assert.ok(fieldPath(magentaCanalRouteMap(),route,{x:10,y:1}).length);assert.equal(magentaCanalRouteMap()[3][18],'~');
 const restored=restoreAdventurePosition(storeAdventurePosition({...start,...route},4),4);assert.equal(restored.district,'lumiose-magenta-canal-route');assert.equal(stepField({...start,...route},'right').district,'lumiose-zone7');
 const gate={...start,...route,x:10,y:1,facing:'up'};assert.equal(stepField(gate,'up').blocked,true);
 const zone=stepField({...gate,zaRoyaleRank:'D'},'up');assert.equal(zone.district,'lumiose-zone14');assert.equal(stepField({...gate,...zone},'down').district,'lumiose-magenta-canal-route');
});

test('Magenta crystal sewer exit returns to the selected entrance and preserves legacy exit',()=>{
 const z={area:3,district:'lumiose-crystal-sewer',interior:null,x:11,y:15,zaMission20Stage:9,zaMission20Crystals:['3,4'],zaMission20CrystalReturn:'magenta',teamIds:['kept']};
 const saved=restoreAdventurePosition(storeAdventurePosition(z,68),68);assert.deepEqual(saved.zaMission20Crystals,['3,4']);
 const exit=stepField(saved,'down');assert.deepEqual([exit.district,exit.x,exit.y,exit.zaMission20CrystalReturn],['lumiose-magenta-canal-route',10,13,null]);
 assert.equal(stepField({...saved,zaMission20CrystalReturn:undefined},'down').district,'lumiose-vernal');
});

test('Magenta sewer entrance shows the appropriate mission action',()=>{
 const p={area:3,district:'lumiose-magenta-canal-route',interior:null,x:10,y:13,facing:'up'};
 assert.equal(fieldDialogue(p).name,'미르 지하 수도 입구 (위치 초안)');
 for(const [stage,action] of [[8,'mission20CrystalStart'],[9,'mission20CrystalEnter'],[10,'mission20CrystalReport']])assert.ok(fieldDialogue({...p,zaMission20Stage:stage}).actions.some(x=>x.action===action));
});

test('South Boulevard connects Magenta Street without bypassing Zone 14',()=>{
 const road={area:3,district:'lumiose-south-boulevard',interior:null,x:1,y:8,zaRoyaleRank:'E',teamIds:['kept']};
 const street=stepField(road,'left');assert.deepEqual([street.district,street.x,street.y],['lumiose-magenta-canal-route',1,12]);
 const state={...road,...street};assert.ok(fieldPath(fieldMap(state),state,{x:10,y:1}).length);
 assert.equal(stepField({...state,x:10,y:1},'up').blocked,true);
 const saved=restoreAdventurePosition(storeAdventurePosition(state,69),69);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-magenta-canal-route',1,12,['kept']]);
 assert.equal(stepField(saved,'left').district,'lumiose-south-boulevard');
});
