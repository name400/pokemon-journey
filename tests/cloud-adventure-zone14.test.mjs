import test from 'node:test';
import assert from 'node:assert/strict';
import {zone14Map,zone14Encounter,zone14Visible,zone14Item} from '../lib/cloud-adventure/adventure-zone14.mjs';
import {stepField,fieldPath,fieldMap,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone fourteen substation gate and saved position',()=>{
 const base={area:3,district:'lumiose-magenta-canal-route',interior:null,x:10,y:1,facing:'up',zaRoyaleRank:'E'};assert.equal(stepField(base,'up').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'D'},'up');assert.equal(entered.district,'lumiose-zone14');const s={...base,...entered,zaRoyaleRank:'D'},map=zone14Map(s);assert.ok(fieldPath(map,s,{x:12,y:10}).length);assert.equal(zone14Visible(s,'a').species,304);assert.equal(zone14Visible(s,'e').species,530);assert.equal(zone14Visible({...s,zaZone14Spent:{aron:true}},'a'),null);assert.equal(zone14Visible({...s,zaZone14Period:'day',weather:''},'v').species,694);assert.equal(zone14Visible({...s,zaZone14Period:'night',weather:''},'v'),null);assert.equal(zone14Visible({...s,zaZone14Period:'day',weather:'rain'},'v'),null);assert.equal(zone14Visible(s,'h').alpha,true);assert.equal(zone14Item(s,'k').kind,'seedofmasteryza');assert.equal(stepField({...s,x:15,y:10},'right').blocked,true);assert.equal(stepField({...s,x:15,y:10,zaZone14RockCleared:true},'right').x,16);
 const legacy=storeAdventurePosition({...s,x:18,y:9},41);delete legacy.districtPosition.zone14Layout;const moved=restoreAdventurePosition(legacy,41);assert.deepEqual([moved.district,moved.x,moved.y],['lumiose-zone14',15,12]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:12,y:10},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone14',12,10]);assert.equal(stepField({...s,x:11,y:15},'down').district,'lumiose-magenta-canal-route');assert.equal(stepField({...s,x:11,y:1},'up').district,'lumiose-north-boulevard');assert.equal(zone14Encounter(s,()=>0).speciesId,304);
});

test('North Boulevard leads to the canal route before the single Zone 14 entrance',()=>{
 const road={area:3,district:'lumiose-north-boulevard',interior:null,x:12,y:1,zaRoyaleRank:'E',teamIds:['kept']};
 const canal=stepField(road,'up');assert.deepEqual([canal.district,canal.x,canal.y],['lumiose-magenta-canal-route',10,15]);
 assert.equal(stepField({...road,...canal},'down').district,'lumiose-north-boulevard');
 assert.ok(fieldPath(fieldMap({...road,...canal}),canal,{x:10,y:1}).length);
 assert.equal(stepField({...road,...canal,x:10,y:1},'up').blocked,true);
});
