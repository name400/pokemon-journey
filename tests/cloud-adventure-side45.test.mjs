import test from 'node:test';
import assert from 'node:assert/strict';
import {side45Available} from '../lib/cloud-adventure/adventure-side45.mjs';
import {fieldMap,fieldPath,fieldDialogue,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
test('Durstin and the lift preserve the former paths and roof ladder',()=>{
 const s={area:3,district:'lumiose-bleu-sector7',interior:null,x:13,y:14,facing:'right'},old=fieldMap(s),ready={...s,zaMission19Stage:1},map=fieldMap(ready);assert.equal(side45Available(s),false);assert.equal(old[14][14],'#');assert.equal(map[14][14],'j');assert.ok(fieldPath(map,{x:11,y:15},{x:13,y:14}).length);assert.equal(fieldDialogue(ready,map).action,'side45Start');
 const done={...ready,zaSide45Stage:2};assert.ok(fieldDialogue(done,fieldMap(done)).actions.some(x=>x.action==='side45Lift'));const roof={...done,zaBleu7Upper:true,x:18,y:11,facing:'down'};assert.equal(fieldDialogue(roof,fieldMap(roof)).action,'side45Lift');assert.equal(fieldMap(roof)[10][5],'l');assert.equal(walkable(fieldMap(roof)[9][5]),true);assert.equal(fieldMap({...s,zaBleu7Upper:true})[10][5],'l');assert.equal(side45Available({zaSide45Stage:2}),true);
});
