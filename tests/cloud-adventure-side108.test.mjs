import test from 'node:test';
import assert from 'node:assert/strict';
import {side108Available,side108Eligible,side108Spot} from '../lib/cloud-adventure/adventure-side108.mjs';
import {fieldMap,fieldPath,fieldDialogue} from '../lib/cloud-adventure/adventure-world.mjs';
test('side 108 preserves normal Raichu identity and accessible draft location',()=>{
 assert.equal(side108Available({}),false);assert.equal(side108Available({zaMission37Complete:true}),true);assert.equal(side108Available({zaSide108Stage:2}),true);
 assert.equal(side108Eligible({id:26,speciesId:26}),true);assert.equal(side108Eligible({id:10100,speciesId:26}),false);assert.equal(side108Eligible({id:26,speciesId:25}),false);assert.equal(side108Eligible({id:26,speciesId:26,formId:10100}),false);
 const s={area:3,district:'lumiose-quasartico',zaMission37Complete:true,x:15,y:6,facing:'right'},map=fieldMap(s);assert.ok(fieldPath(map,{x:11,y:8},{x:15,y:6}).length);assert.equal(side108Spot(s,{x:16,y:6,tile:'.'}),true);assert.equal(fieldDialogue(s,map).action,'side108Start');assert.equal(fieldDialogue({...s,zaSide108Stage:2},map).side108,true);
});
