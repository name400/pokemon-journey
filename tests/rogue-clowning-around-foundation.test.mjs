import test from 'node:test';
import assert from 'node:assert/strict';
import {planClowningAroundTypes} from '../lib/rogue-clowning-around.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
test('clown type plan prioritizes unique off-type damaging moves without touching the party',()=>{
 const mon=makeReferenceMon(133,50,{boxId:'hero',moves:['Tackle','Water Gun','Surf','Flamethrower']}),party=[mon],before=structuredClone(party);let draws=0;const plan=planClowningAroundTypes(party,()=>{draws++;return 0;});assert.deepEqual(plan,[{boxId:'hero',primary:'노말',second:'물'}]);assert.equal(draws,1);assert.deepEqual(party,before);
});
test('clown fallback rejects original types and validates unsupported fusion',()=>{
 const mon=makeReferenceMon(133,50,{boxId:'hero',moves:['Tackle','Splash']}),rolls=[0,.6];const plan=planClowningAroundTypes([mon],()=>rolls.shift());assert.equal(plan[0].second,'물');assert.equal(rolls.length,0);assert.throws(()=>planClowningAroundTypes([{...mon,fusionSpecies:25}],()=>0));
});
