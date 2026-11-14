import test from 'node:test';
import assert from 'node:assert/strict';
import {missingPartyRestaurantCourse} from '../lib/cloud-adventure/adventure-restaurant-recovery.mjs';

test('missing-party course recovery recognises known runs and preserves unknown formats',()=>{
 const courses=[['zaLeNahRun','lumiose-vert-sector6','leNah',2],['zaLeYeahRun','lumiose-rouge-sector3','leYeah',4],['zaLeWowRun','lumiose-rouge-sector2','leWow',9],['zaSushiRun','lumiose-rouge-north','sushi',4]];
 for(const [field,district,interior,course] of courses){const world={area:3,district,interior,[field]:{course,repeat:true}};assert.deepEqual(missingPartyRestaurantCourse(world),{kind:'ready',field});assert.deepEqual(missingPartyRestaurantCourse({...world,[field]:{...world[field],version:2}}),{kind:'unknown'});assert.deepEqual(missingPartyRestaurantCourse({...world,interior:null}),{kind:'unknown'});assert.deepEqual(missingPartyRestaurantCourse({...world,zaUnrelated:'kept',[field]:{...world[field],future:true}}),{kind:'unknown'});}
 assert.equal(missingPartyRestaurantCourse({area:3}),null);assert.deepEqual(missingPartyRestaurantCourse({area:3,zaLeNahRun:{},zaSushiRun:{}}),{kind:'unknown'});
});
