import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Jaune Plaza north street connects Sector 8 and keeps historic exits',()=>{
 const base={area:3,district:'lumiose-zone8',interior:null,x:11,y:1,zaRoyaleRank:'F',teamIds:['kept'],regionId:6,districtReturnRegion:1};
 const entered=stepField(base,'up');assert.deepEqual([entered.district,entered.x,entered.y],['lumiose-jaune-street-north',11,15]);
 const north={...base,...entered},map=fieldMap(north);assert.ok(fieldPath(map,north,{x:11,y:1}).length);
 assert.equal(stepField(north,'down').district,'lumiose-zone8');
 const garden=stepField({...north,x:11,y:1},'up');assert.deepEqual([garden.district,garden.x,garden.y],['lumiose-jaune-garden-route',8,15]);
 assert.equal(stepField({...base,...garden},'down').district,'lumiose-jaune-street-north');
 const saved=restoreAdventurePosition(storeAdventurePosition({...north,x:11,y:8},18),18);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-jaune-street-north',11,8,['kept']]);
 assert.equal(stepField({...north,zaRoyaleRank:'Z'},'down').blocked,true);
 assert.equal(stepField({...base,x:19,y:1},'up').district,'lumiose-jaune-garden-route');
 assert.equal(stepField({...base,x:9,y:15},'down').district,'lumiose-jaune-street');
});
