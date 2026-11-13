import test from 'node:test';
import assert from 'node:assert/strict';
import {zone14Map,zone14Encounter,zone14Visible,zone14Item,ZONE14_EQUIPMENT,ZONE14_CENTRAL_CONVERTERS} from '../lib/cloud-adventure/adventure-zone14.mjs';
import {stepField,fieldPath,fieldMap,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone fourteen substation gate and saved position',()=>{
 const base={area:3,district:'lumiose-magenta-canal-route',interior:null,x:10,y:1,facing:'up',zaRoyaleRank:'E'};assert.equal(stepField(base,'up').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'D'},'up');assert.deepEqual([entered.district,entered.x,entered.y],['lumiose-zone14',11,1]);const s={...base,...entered,zaRoyaleRank:'D'},map=zone14Map(s);assert.ok(fieldPath(map,s,{x:12,y:10}).length);assert.equal(zone14Visible(s,'a').species,304);assert.equal(zone14Visible(s,'e').species,530);assert.equal(zone14Visible({...s,zaZone14Spent:{aron:true}},'a'),null);assert.equal(zone14Visible({...s,zaZone14Period:'day',weather:''},'v').species,694);assert.equal(zone14Visible({...s,zaZone14Period:'night',weather:''},'v'),null);assert.equal(zone14Visible({...s,zaZone14Period:'day',weather:'rain'},'v'),null);assert.equal(zone14Visible(s,'h').alpha,true);assert.equal(zone14Item(s,'k').kind,'seedofmasteryza');assert.equal(stepField({...s,x:15,y:10},'right').blocked,true);assert.equal(stepField({...s,x:15,y:10,zaZone14RockCleared:true},'right').x,16);
 const legacy=storeAdventurePosition({...s,x:18,y:9},41);delete legacy.districtPosition.zone14Layout;const moved=restoreAdventurePosition(legacy,41);assert.deepEqual([moved.district,moved.x,moved.y],['lumiose-zone14',15,12]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:12,y:10},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone14',12,10]);assert.equal(stepField({...s,x:11,y:15},'down').district,'lumiose-magenta-canal-route');assert.equal(stepField({...s,x:11,y:1},'up').district,'lumiose-magenta-canal-route');assert.equal(zone14Encounter(s,()=>0).speciesId,304);
});

test('North Boulevard leads to the canal route and respects the Zone 14 gate',()=>{
 const road={area:3,district:'lumiose-north-boulevard',interior:null,x:12,y:1,zaRoyaleRank:'E',teamIds:['kept']};
 const canal=stepField(road,'up');assert.deepEqual([canal.district,canal.x,canal.y],['lumiose-magenta-canal-route',10,15]);
 assert.equal(stepField({...road,...canal},'down').district,'lumiose-north-boulevard');
 assert.ok(fieldPath(fieldMap({...road,...canal}),canal,{x:10,y:1}).length);
 assert.equal(stepField({...road,...canal,x:10,y:1},'up').blocked,true);
});
test('Magenta Sector 6 reaches the southern substation approach after rank D',()=>{
 const sector={area:3,district:'lumiose-magenta-sector6',interior:null,x:4,y:1,zaRoyaleRank:'E',teamIds:['kept']};
 assert.equal(stepField(sector,'up').blocked,true);
 const zone=stepField({...sector,zaRoyaleRank:'D'},'up');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone14',17,15]);
 const state={...sector,...zone,zaRoyaleRank:'D'};assert.ok(fieldPath(fieldMap(state),state,{x:12,y:10}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(state,43),43);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone14',17,15,['kept']]);
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-magenta-sector6',4,1]);
});
test('South Boulevard connects to the western substation approach without bypassing its gate',()=>{
 const road={area:3,district:'lumiose-south-boulevard',interior:null,x:21,y:14,zaRoyaleRank:'E',teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(road),road,{x:20,y:8}).length);
 assert.equal(stepField(road,'right').blocked,true);
 const zone=stepField({...road,zaRoyaleRank:'D'},'right');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone14',1,8]);
 const state={...road,...zone,zaRoyaleRank:'D'};assert.ok(fieldPath(fieldMap(state),state,{x:12,y:10}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(state,44),44);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone14',1,8,['kept']]);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-south-boulevard',21,14]);
});

test('Discharge TM is behind the breakable rock and stays collected after save',()=>{
 const s={area:3,district:'lumiose-zone14',interior:null,x:15,y:10,teamIds:['kept'],zaZone14Items:['rock-mastery']};
 assert.equal(zone14Item(s,'l').kind,'za-tm039');
 assert.equal(fieldPath(zone14Map(s),s,{x:17,y:11}).length,0);
 const opened={...s,zaZone14RockCleared:true};assert.ok(fieldPath(zone14Map(opened),opened,{x:17,y:11}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...opened,zaZone14Items:['rock-mastery','rock-tm039']},55),55);
 assert.deepEqual(saved.zaZone14Items,['rock-mastery','rock-tm039']);assert.equal(zone14Item(saved,'l'),null);
 assert.deepEqual(saved.teamIds,['kept']);
});

test('three rocks keep independent progress while legacy cleared saves stay open',()=>{
 const state={area:3,district:'lumiose-zone14',interior:null,x:15,y:10,teamIds:['kept']};
 for(const y of [9,10,11])assert.equal(zone14Map(state)[y][16],'r');
 const partial={...state,zaZone14RockCleared:true,zaZone14RocksCleared:['16,10']};
 assert.deepEqual([9,10,11].map(y=>zone14Map(partial)[y][16]),['r','.','r']);
 assert.equal(stepField({...partial,y:9},'right').blocked,true);
 const saved=restoreAdventurePosition(storeAdventurePosition(partial,57),57);
 assert.deepEqual(saved.zaZone14RocksCleared,['16,10']);assert.deepEqual(saved.teamIds,['kept']);
 const legacy={...state,zaZone14RockCleared:true};
 assert.deepEqual([9,10,11].map(y=>zone14Map(legacy)[y][16]),['.','.','.']);
 assert.ok(fieldPath(zone14Map(legacy),legacy,{x:17,y:11}).length);
});

test('draft substation equipment preserves routes and migrates old occupied positions',()=>{
 const state={area:3,district:'lumiose-zone14',interior:null,x:4,y:10,teamIds:['kept'],zaRoyaleRank:'D',zaZone14RocksCleared:['16,10'],zaZone14Items:['south-ultra']};
 const map=zone14Map(state);
 for(const [x,y] of ZONE14_EQUIPMENT)assert.equal(map[y][x],'^');
 for(const point of [{x:11,y:1},{x:1,y:8},{x:11,y:15},{x:17,y:15},{x:15,y:10}])assert.ok(fieldPath(map,{x:12,y:10},point).length);
 for(const version of [undefined,1]){
  const old=storeAdventurePosition(state,63);if(version===undefined)delete old.districtPosition.zone14Layout;else old.districtPosition.zone14Layout=version;
  const restored=restoreAdventurePosition(old,63);
  assert.equal(restored.district,'lumiose-zone14');assert.notEqual(map[restored.y][restored.x],'^');
  assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.zaZone14RocksCleared,['16,10']);assert.deepEqual(restored.zaZone14Items,['south-ultra']);
 }
 const current=storeAdventurePosition({...state,x:6,y:10},64);assert.equal(current.districtPosition.zone14Layout,2);
 const restored=restoreAdventurePosition(current,64);assert.deepEqual([restored.x,restored.y],[6,10]);
});


test('central converters preserve gate access and migrate old positions',()=>{
 const s={area:3,district:'lumiose-zone14',interior:null,zaRoyaleRank:'D',teamIds:['kept'],money:731,zaZone14Items:['south-ultra'],zaZone14RocksCleared:['16,10']};
 const map=zone14Map(s);
 for(const [x,y] of ZONE14_CENTRAL_CONVERTERS){
  assert.equal(map[y][x],'^');
  const old=storeAdventurePosition({...s,x,y},81);delete old.districtPosition.zone14ConvertersLayout;
  const restored=restoreAdventurePosition(old,81);
  assert.notDeepEqual([restored.x,restored.y],[x,y]);
  assert.deepEqual([restored.district,restored.teamIds,restored.money,restored.zaZone14Items,restored.zaZone14RocksCleared],['lumiose-zone14',['kept'],731,['south-ultra'],['16,10']]);
  assert.ok(fieldPath(map,restored,{x:12,y:10}).length);
  assert.equal(restoreAdventurePosition(old,82).district,null);
 }
 for(const [x,y] of [[11,1],[1,8],[11,15],[17,15]]){
  assert.ok(fieldPath(map,{x,y},{x:12,y:10}).length,`yard from ${x},${y}`);
  assert.ok(fieldPath(map,{x,y},{x:15,y:10}).length,`rocks from ${x},${y}`);
 }
 const current=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:5},83),83);
 assert.deepEqual([current.x,current.y,current.zaZone14Items],[11,5,['south-ultra']]);
});
