import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Zone 11 north bank connects Jaune Sectors 10 and 12 and Zone 6',()=>{
 const n={area:3,district:'lumiose-zone11',interior:null,x:1,y:4,zaRoyaleRank:'E',teamIds:['kept']};
 const west=stepField(n,'left');assert.equal(west.district,'lumiose-jaune-sector10');assert.equal(stepField({...n,...west},'right').district,'lumiose-zone11');
 assert.equal(stepField({...n,...west,zaRoyaleRank:'F'},'right').blocked,true);
 const east=stepField({...n,x:21},'right');assert.equal(east.district,'lumiose-jaune-sector12');assert.equal(stepField({...n,...east},'left').district,'lumiose-zone11');
 assert.ok(fieldPath(fieldMap({...n,...east}),east,{x:11,y:1}).length);
 const z6=stepField({...n,...east,x:11,y:1},'up');assert.equal(z6.district,'lumiose-zone6');assert.equal(stepField({...n,...z6},'down').district,'lumiose-jaune-sector12');
 assert.equal(fieldPath(fieldMap(n),n,{x:11,y:15}).length,0);
 const saved=restoreAdventurePosition(storeAdventurePosition({...n,...east},9),9);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-jaune-sector12',1,8,['kept']]);
});
