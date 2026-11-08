import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath,storeAdventurePosition,restoreAdventurePosition,stepField} from '../lib/cloud-adventure/adventure-world.mjs';
import {zone20Map,zone20Visible,zone20Encounter} from '../lib/cloud-adventure/adventure-mission42.mjs';
test('zone twenty retains Zygarde site and supports saved field position',()=>{
 const s={area:3,district:'lumiose-zone20',interior:null,x:11,y:14,facing:'up',zaMission42Stage:1};const map=zone20Map(s);
 assert.equal(map[6][11],'n');assert.ok(fieldPath(map,s,{x:11,y:7}).length);assert.equal(zone20Visible(s,'a').species,1);assert.equal(zone20Encounter(s,()=>0).speciesId,1);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:10},2),2);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone20',11,10]);assert.equal(stepField(s,'down').district,'lumiose-centrico-route');const old=storeAdventurePosition({...s,x:19,y:6},3);delete old.districtPosition.zone20Layout;const recovered=restoreAdventurePosition(old,3);assert.equal(recovered.district,'lumiose-zone20');assert.notEqual(zone20Map(recovered)[recovered.y][recovered.x],'~');
});

test('southeastern pond has a crossing and preserves older saves',()=>{
 const s={area:3,district:'lumiose-zone20',interior:null,x:17,y:11,teamIds:['kept'],zaMission42Stage:3,zaZone20Items:['south-seed']};const map=zone20Map(s);
 for(const y of [10,12,13])for(const x of [18,19,20])assert.equal(map[y][x],'~');
 for(const x of [18,19,20])assert.equal(map[11][x],',');
 let crossing=s;for(let i=0;i<4;i++){crossing={...crossing,...stepField(crossing,'right')};}assert.deepEqual([crossing.x,crossing.y],[21,11]);assert.ok(fieldPath(map,s,{x:11,y:7}).length);assert.ok(fieldPath(map,s,{x:11,y:7}).length);
 const old=storeAdventurePosition({...s,x:19,y:12},8);old.districtPosition.zone20Layout=1;
 const restored=restoreAdventurePosition(old,8);assert.equal(restored.district,'lumiose-zone20');assert.notEqual(map[restored.y][restored.x],'~');assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.zaZone20Items,['south-seed']);assert.equal(restored.zaMission42Stage,3);
 const fresh=storeAdventurePosition(s,9);assert.equal(fresh.districtPosition.zone20Layout,2);const again=restoreAdventurePosition(fresh,9);assert.deepEqual([again.x,again.y],[17,11]);
});
