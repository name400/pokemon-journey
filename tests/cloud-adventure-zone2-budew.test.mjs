import test from 'node:test';
import assert from 'node:assert/strict';
import {zone2BudewPosition,zone2BudewTarget,stepZone2Budew} from '../lib/cloud-adventure/adventure-world.mjs';
import {predictCloudStep} from '../lib/cloud-adventure/adventure-prediction.mjs';

test('visible Budew reacts to nearby movement and can escape',()=>{
 const s={district:'lumiose-zone2',x:10,y:15};assert.deepEqual(zone2BudewPosition(s),{x:9,y:14,alert:0});assert.ok(zone2BudewTarget(s));assert.equal(predictCloudStep(s,'left'),null);
 s.y=14;assert.equal(stepZone2Budew(s),true);assert.deepEqual(s.zaZone2Budew,{x:8,y:14,alert:1});assert.ok(zone2BudewTarget(s));
 s.x=9;assert.equal(stepZone2Budew(s),true);s.x=8;assert.equal(stepZone2Budew(s),true);assert.equal(zone2BudewPosition(s),null);assert.equal(zone2BudewTarget(s),null);
 assert.equal(zone2BudewPosition({district:'lumiose-zone3'}),null);assert.equal(zone2BudewPosition({district:'lumiose-zone2',zaZone2Budew:{x:999,y:1}}),null);
});
