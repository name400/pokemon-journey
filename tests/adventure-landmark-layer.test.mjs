import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {recordLandmarks,registeredLandmarks,mapTravelDestinations} from '../lib/cloud-adventure/adventure-fast-travel.mjs';

test('ground landmarks are not discovered from the Vernal roof or waterside layer',()=>{
 const base={area:3,district:'lumiose-vernal',interior:null,x:12,y:5,facing:'down',zaMission04Complete:true,teamIds:['kept'],zaFastTravelLandmarks:['legacy-other']};
 for(const patch of [{zaVernalEastRoof:true},{zaVernalSlowbroBank:true,x:12,y:7}]){
  const s={...base,...patch},before=structuredClone(s);assert.notEqual(fieldMap(s)[s.y][s.x],'#');assert.equal(recordLandmarks(s),false);assert.deepEqual(s,before);assert.ok(!mapTravelDestinations(s).some(p=>p.id==='cafe-woof'));
 }
 const ground={...base};assert.equal(recordLandmarks(ground),true);assert.equal(recordLandmarks(ground),false);assert.deepEqual(ground.zaFastTravelLandmarks,['legacy-other','cafe-woof']);assert.ok(registeredLandmarks(ground).some(p=>p.id==='cafe-woof'));assert.ok(mapTravelDestinations(ground).some(p=>p.id==='cafe-woof'));
 const saved=restoreAdventurePosition(storeAdventurePosition(ground,77),77);assert.ok(mapTravelDestinations(saved).some(p=>p.id==='cafe-woof'));assert.deepEqual(saved.teamIds,['kept']);
});

test('old registered landmarks remain available and other districts use their own layer flags',()=>{
 const old={area:3,district:'lumiose-vernal',interior:null,x:12,y:5,zaVernalEastRoof:true,zaFastTravelLandmarks:['cafe-woof','unknown-future'],zaMission04Complete:true};assert.equal(recordLandmarks(old),false);assert.deepEqual(old.zaFastTravelLandmarks,['cafe-woof','unknown-future']);assert.ok(mapTravelDestinations(old).some(p=>p.id==='cafe-woof'));
 const plaza={area:3,district:'lumiose-centrico-route',interior:null,x:11,y:8,zaVernalEastRoof:true,zaMission04Complete:true};assert.equal(recordLandmarks(plaza),true);assert.ok(plaza.zaFastTravelLandmarks.includes('plaza-centrico'));
 const tower={area:3,district:'lumiose-zone3',interior:null,x:11,y:2,zaZone3TowerUpper:true,zaRoyaleRank:'C'};assert.equal(recordLandmarks(tower),false);assert.equal(tower.zaFastTravelLandmarks,undefined);
});
