import test from 'node:test';
import assert from 'node:assert/strict';
import {zone3FieldMonsters,zone3FieldTarget,zone3FieldContact,stepZone3Field} from '../lib/cloud-adventure/adventure-world.mjs';
test('visible Rouge garden species respect their habitats, time and mission gate',()=>{
 const s={district:'lumiose-zone3',x:11,y:7};const mons=zone3FieldMonsters(s,'day');
 assert.deepEqual(mons.map(m=>m.id),['litleo','pancham','espurr','skiddo','pikachu','flabebe']);assert.equal(zone3FieldTarget(s,'day','flabebe').distance,1);
 assert.equal(zone3FieldTarget(s,'day','__proto__'),null);assert.equal(zone3FieldMonsters(s,'night').some(m=>m.id==='flabebe'),false);
 assert.deepEqual(zone3FieldMonsters({...s,zaZone3TowerUpper:true},'day'),[]);assert.deepEqual(zone3FieldMonsters({...s,zaRoyaleRank:'Y',zaJoseeRequired:true},'day'),[]);
 assert.equal(zone3FieldContact({...s,x:15,y:10},'day').id,'pikachu');assert.equal(zone3FieldContact({...s,x:11,y:8},'day'),null);
});
test('Espurr reaction and saved target state remain bounded by the garden',()=>{
 const s={district:'lumiose-zone3',x:14,y:6};assert.equal(stepZone3Field(s,'day'),true);const moved=zone3FieldMonsters(s,'day').find(m=>m.id==='espurr');assert.equal(moved.alert,1);assert.notDeepEqual([moved.x,moved.y],[15,6]);assert.ok(zone3FieldTarget(s,'day','espurr'));
 s.x=moved.x;s.y=moved.y;assert.equal(stepZone3Field(s,'day'),true);assert.equal(zone3FieldMonsters(s,'day').some(m=>m.id==='espurr'),false);assert.equal(zone3FieldTarget(s,'day','espurr'),null);
});
