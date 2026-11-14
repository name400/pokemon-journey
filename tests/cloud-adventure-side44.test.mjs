import test from 'node:test';
import assert from 'node:assert/strict';
import {side44Available} from '../lib/cloud-adventure/adventure-side10.mjs';
import {fieldMap,fieldDialogue} from '../lib/cloud-adventure/adventure-world.mjs';
test('Odette keeps the earlier request and exposes the follow-up only after its prerequisites',()=>{
 const s={area:3,district:'lumiose-vernal',interior:null,x:3,y:1,facing:'up',zaMission07Started:true};const old=fieldMap(s);assert.equal(fieldDialogue(s,old).action,'side10ShowSkiddo');assert.equal(side44Available({...s,zaMission15Complete:true}),false);assert.equal(side44Available({...s,zaSide10Complete:true,zaMission15Stage:3}),false);
 const ready={...s,zaSide10Complete:true,zaMission15Complete:true};assert.deepEqual(fieldMap(ready),old);assert.equal(fieldDialogue(ready,old).action,'side44Start');assert.equal(fieldDialogue({...ready,zaSide44Stage:1},old).action,'side44Show');assert.equal(fieldDialogue({...ready,zaSide44Stage:2},old).action,'side44Reward');assert.equal(fieldDialogue({...ready,zaSide44Stage:3},old).action,undefined);assert.equal(side44Available({zaSide44Stage:2}),true);
});
