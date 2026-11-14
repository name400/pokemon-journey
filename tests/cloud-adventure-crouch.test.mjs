import test from 'node:test';
import assert from 'node:assert/strict';
import {stepZone2Budew,stepZone3Field,wildAlphaSees} from '../lib/cloud-adventure/adventure-world.mjs';
import {adventureMovementInterval} from '../lib/cloud-adventure/adventure-prediction.mjs';
test('crouch reduces the draft detection range without erasing alerts or changing old saves',()=>{
 const budew={district:'lumiose-zone2',x:8,y:14,zaFieldCrouched:true};assert.equal(stepZone2Budew(budew),false);assert.equal(budew.zaZone2Budew,undefined);assert.equal(stepZone2Budew({...budew,zaFieldCrouched:false}),true);assert.equal(stepZone2Budew({...budew,x:9}),true);
 const espurr={district:'lumiose-zone3',x:14,y:6,zaFieldCrouched:true};assert.equal(stepZone3Field(espurr,'day'),false);assert.equal(stepZone3Field({...espurr,zaFieldCrouched:undefined},'day'),true);assert.equal(stepZone3Field({...espurr,x:15},'day'),true);
 const alpha={district:'lumiose-wild',x:3,y:6,zaFieldCrouched:true};assert.equal(wildAlphaSees(alpha),false);assert.equal(wildAlphaSees({...alpha,zaFieldCrouched:undefined}),true);assert.equal(wildAlphaSees({...alpha,x:3,y:5}),true);
 assert.equal(adventureMovementInterval({}),100);assert.equal(adventureMovementInterval({zaMission19Sneakers:true}),75);assert.equal(adventureMovementInterval({zaFieldCrouched:true}),150);
});
