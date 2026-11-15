import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Jaune Sector 2 joins the outer plaza street without opening Wild Zone 8',()=>{
 const sector={area:3,district:'lumiose-jaune-sector2',interior:null,x:15,y:1,zaRoyaleRank:'Z',teamIds:['kept'],money:731};
 assert.ok(fieldPath(fieldMap(sector),{x:11,y:8},sector).length);
 const street=stepField(sector,'up');assert.deepEqual([street.district,street.x,street.y],['lumiose-jaune-street-north',1,12]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...sector,...street},171),171);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.money],['lumiose-jaune-street-north',1,12,['kept'],731]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:11,y:15}).length);
 assert.equal(stepField({...saved,x:11,y:15},'down').district,'lumiose-jaune-preplaza');
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-jaune-sector2',15,1]);
 assert.equal(stepField({...sector,x:11,y:15},'down').district,'lumiose-saison-canalside');
});

test('Jaune Sector 3 joins the outer plaza street without opening Wild Zone 8',()=>{
 const sector={area:3,district:'lumiose-mission12-jaune3',interior:null,x:21,y:9,zaRoyaleRank:'Z',teamIds:['kept'],money:731};
 assert.ok(fieldPath(fieldMap(sector),{x:11,y:15},sector).length);
 const street=stepField(sector,'right');assert.deepEqual([street.district,street.x,street.y],['lumiose-jaune-street-north',1,5]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...sector,...street},168),168);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.money],['lumiose-jaune-street-north',1,5,['kept'],731]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:11,y:15}).length);
 assert.equal(stepField({...saved,x:11,y:15},'down').district,'lumiose-jaune-preplaza');
 assert.equal(stepField({...saved,zaMission12Layer:{version:2}},'left').blocked,true);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y,back.zaMission12Layer],['lumiose-mission12-jaune3',21,9,'ground']);
 assert.notEqual(stepField({...sector,zaMission12Layer:'roof'},'right').transitioned,true);
 assert.equal(stepField({...sector,x:21,y:12},'right').district,'lumiose-jaune-sector5');
});

test('Jaune Plaza north street connects Sector 8 and keeps historic exits',()=>{
 const base={area:3,district:'lumiose-zone8',interior:null,x:11,y:1,zaRoyaleRank:'F',teamIds:['kept'],regionId:6,districtReturnRegion:1};
 const entered=stepField(base,'up');assert.deepEqual([entered.district,entered.x,entered.y],['lumiose-jaune-street-north',11,15]);
 const north={...base,...entered},map=fieldMap(north);assert.ok(fieldPath(map,north,{x:11,y:1}).length);
 assert.equal(stepField(north,'down').district,'lumiose-zone8');
 const garden=stepField({...north,x:11,y:1},'up');assert.deepEqual([garden.district,garden.x,garden.y],['lumiose-jaune-garden-route',8,15]);
 assert.equal(stepField({...base,...garden},'down').district,'lumiose-jaune-street-north');
 const saved=restoreAdventurePosition(storeAdventurePosition({...north,x:11,y:8},18),18);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-jaune-street-north',11,8,['kept']]);
 assert.equal(stepField({...north,zaRoyaleRank:'Z'},'down').district,'lumiose-jaune-preplaza');
 assert.equal(stepField({...base,x:19,y:1},'up').district,'lumiose-jaune-garden-route');
 assert.equal(stepField({...base,x:9,y:15},'down').district,'lumiose-jaune-street');
});
