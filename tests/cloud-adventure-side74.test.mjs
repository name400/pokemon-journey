import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldDialogue,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
import {side74Available,recordSide74Victory} from '../lib/cloud-adventure/adventure-side74.mjs';

test('Side Mission 74 uses an existing walkable tile and preserves older progress',()=>{
 const s={area:3,district:'lumiose-vert-sector9',x:5,y:7,facing:'up'},before=fieldMap(s);assert.equal(side74Available(s),false);assert.equal(before[6][5],'.');
 const unlocked={...s,zaMission26Started:true},after=fieldMap(unlocked);assert.equal(after[6][5],'q');assert.equal(walkable(before[6][5]),walkable(after[6][5]));assert.equal(fieldDialogue(unlocked).action,'side74Battle');
 assert.equal(side74Available({...s,zaMission26Complete:true}),true);assert.equal(side74Available({...s,zaRoyaleRank:'B'}),true);assert.equal(side74Available({...s,zaRoyaleRank:'C'}),false);
 assert.equal(recordSide74Victory(unlocked,{adventureMissionId:'other'}),false);unlocked.zaSide74Stage=1;assert.equal(recordSide74Victory(unlocked,{adventureMissionId:'side74-garbodor'}),true);assert.equal(fieldDialogue(unlocked).action,'side74Reward');assert.equal(recordSide74Victory(unlocked,{adventureMissionId:'side74-garbodor'}),false);
 unlocked.zaSide74Complete=true;assert.equal(fieldMap(unlocked)[6][5],'.');
});
