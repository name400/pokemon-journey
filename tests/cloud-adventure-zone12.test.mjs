import test from 'node:test';
import assert from 'node:assert/strict';
import {zone12Map,zone12Encounter,zone12Visible,zone12Item} from '../lib/cloud-adventure/adventure-zone12.mjs';
import {stepField,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone twelve snow park gate and saved position',()=>{
 const base={area:3,district:'lumiose-centrico-route',interior:null,x:14,y:15,facing:'down',zaRoyaleRank:'F'};assert.equal(stepField(base,'down').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'E'},'down');assert.equal(entered.district,'lumiose-zone12');const s={...base,...entered,zaRoyaleRank:'E'},map=zone12Map(s);assert.ok(fieldPath(map,s,{x:6,y:5}).length);assert.equal(zone12Visible(s,'b').species,67);assert.equal(zone12Visible(s,'d').species,712);assert.equal(stepField({...s,x:7,y:11},'down').blocked,true);assert.equal(zone12Visible(s,'v').level,55);assert.equal(zone12Item(s,'i').kind,'super_potions');assert.equal(zone12Item({...s,zaZone12Items:['south-super']},'i'),null);
 const legacy=storeAdventurePosition({...s,x:5,y:12},41);delete legacy.districtPosition.zone12Layout;const moved=restoreAdventurePosition(legacy,41);assert.deepEqual([moved.district,moved.x,moved.y],['lumiose-zone12',8,13]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:6,y:5},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone12',6,5]);assert.equal(stepField(s,'left').district,'lumiose-centrico-route');assert.equal(zone12Encounter(s,()=>0).speciesId,225);
});

test('the court Machop remains reachable and its encounter state survives saves',()=>{
 const s={area:3,district:'lumiose-zone12',interior:null,x:7,y:6,facing:'up',teamIds:['kept']};
 assert.equal(zone12Map(s)[5][7],'m');assert.equal(zone12Visible(s,'m').species,66);
 assert.equal(fieldDialogue(s).action,'zone12Wild-machop');
 assert.ok(fieldPath(zone12Map(s),s,{x:1,y:5}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,zaZone12Spent:{machop:true}},91),91);
 assert.equal(zone12Visible(saved,'m'),null);assert.equal(zone12Map(saved)[5][7],',');
 assert.deepEqual(saved.teamIds,['kept']);
});
