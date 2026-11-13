import test from 'node:test';
import assert from 'node:assert/strict';
import {zone8Map,zone8Encounter,zone8Visible,zone8Item} from '../lib/cloud-adventure/adventure-zone8.mjs';
import {stepField,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone eight gate, central area and saved location',()=>{
 const base={area:3,district:'lumiose-centrico-route',interior:null,x:19,y:1,facing:'up',zaRoyaleRank:'V'};
 assert.equal(stepField(base,'up').blocked,true);const entered=stepField({...base,zaRoyaleRank:'F'},'up');assert.equal(entered.district,'lumiose-zone8');
 const s={...base,...entered,zaRoyaleRank:'F'},map=zone8Map(s);assert.ok(fieldPath(map,s,{x:11,y:8}).length);assert.equal(zone8Visible(s,'b').species,66);assert.equal(zone8Visible(s,'d').alpha,true);assert.equal(zone8Item(s,'i').kind,'greatball');assert.equal(zone8Item({...s,zaZone8Items:['north-great']},'i'),null);assert.equal(zone8Visible({...s,zaZone8Spent:{machop:true}},'b'),null);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:8},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone8',11,8]);assert.equal(stepField(s,'down').district,'lumiose-centrico-route');
 assert.equal(zone8Encounter({x:11,y:8},()=>0).speciesId,66);assert.equal(zone8Encounter({x:3,y:8},()=>0).speciesId,322);
});
test('Jaune Street entrance honors Zone 8 access and reconnects on exit',()=>{
 const street={area:3,district:'lumiose-jaune-street',interior:null,x:11,y:1,zaRoyaleRank:'V',teamIds:['kept']};
 assert.equal(stepField(street,'up').blocked,true);
 const open={...street,zaRoyaleRank:'F'},zone=stepField(open,'up');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone8',9,15]);
 assert.equal(stepField({...open,...zone},'down').district,'lumiose-jaune-street');
 const saved=restoreAdventurePosition(storeAdventurePosition({...open,...zone},22),22);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone8',9,15,['kept']]);
 assert.ok(fieldPath(zone8Map(open),zone,{x:11,y:8}).length);
});

test('garden entrance respects unlock while legacy saves can leave',()=>{
 const garden={area:3,district:'lumiose-jaune-garden-route',interior:null,x:4,y:15,facing:'down',zaRoyaleRank:'V',teamIds:['kept']};
 assert.equal(stepField(garden,'down').blocked,true);
 const open={...garden,zaRoyaleRank:'F'},entered=stepField(open,'down');
 assert.deepEqual([entered.district,entered.x,entered.y],['lumiose-zone8',19,1]);
 const restored=restoreAdventurePosition(storeAdventurePosition({...open,...entered},23),23);
 assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],['lumiose-zone8',19,1,['kept']]);
 const old={...restored,zaRoyaleRank:'V',facing:'up'};
 assert.equal(stepField(old,'up').district,'lumiose-jaune-garden-route');
});

test('Jaune Plaza stall footprints keep paths, grass and old saves',()=>{
 const base={area:3,district:'lumiose-zone8',interior:null,x:21,y:8,zaRoyaleRank:'F',teamIds:['kept']},map=zone8Map(base);
 for(const [x,y] of [[21,8],[15,15]]){
  assert.equal(map[y][x],'^');const old=storeAdventurePosition({...base,x,y},31);delete old.districtPosition.zone8Layout;
  const loaded=restoreAdventurePosition(structuredClone(old),31);assert.equal(loaded.district,base.district);assert.notEqual(map[loaded.y][loaded.x],'^');assert.deepEqual(loaded.teamIds,['kept']);assert.equal(restoreAdventurePosition(structuredClone(old),32).district,null);
 }
 assert.ok(fieldPath(map,{x:9,y:15},{x:21,y:10}).length);assert.equal(map[6][10],'g');assert.equal(storeAdventurePosition(base,32).districtPosition.zone8Layout,1);
});
test('central burrows preserve paths and old player positions',()=>{
 const s={area:3,district:'lumiose-zone8',interior:null,x:11,y:9,zaRoyaleRank:'F',teamIds:['kept']};const map=zone8Map(s);
 assert.equal(map[9][11],'f');assert.equal(zone8Visible(s,'f').species,529);assert.equal(zone8Visible(s,'c').burrow,true);
 assert.equal(zone8Visible({...s,zaZone8Spent:{drilbur:true}},'f'),null);
 const old=storeAdventurePosition(s,23),loaded=restoreAdventurePosition(old,23);assert.deepEqual([loaded.district,loaded.x,loaded.y,loaded.teamIds],['lumiose-zone8',11,9,['kept']]);
 for(const random of [0,.25,.5,.75,.999]){assert.ok(![443,529].includes(zone8Encounter({x:11,y:8},()=>random).speciesId));assert.ok(![443,529].includes(zone8Encounter({x:3,y:8},()=>random).speciesId));}
});
test('burrow species is generated once, with legacy and shiny preservation',async()=>{
 const {initializeZone8Burrows,resetZone8Burrows}=await import('../lib/cloud-adventure/adventure-zone8.mjs');const s={district:'lumiose-zone8'};let draws=0;
 assert.equal(initializeZone8Burrows(s,()=>{draws++;return draws===1?.01:.5;}),true);assert.deepEqual(s.zaZone8Burrows,{gible:443,drilbur:529});assert.equal(initializeZone8Burrows(s,()=>{throw Error('must not reroll');}),false);assert.equal(zone8Visible(s,'c').species,443);assert.equal(zone8Visible(s,'f').species,529);
 s.zaWildShinyRolls={'zone8:gible:443':true,'zone8:drilbur:529':false};resetZone8Burrows(s);assert.deepEqual(s.zaZone8Burrows,{gible:443});assert.equal(s.zaWildShinyRolls['zone8:gible:443'],true);assert.equal(s.zaWildShinyRolls['zone8:drilbur:529'],undefined);
 assert.equal(initializeZone8Burrows(s,()=>.01),true);assert.equal(zone8Visible(s,'f').species,443);assert.equal(zone8Visible(s,'c').species,443);
 s.zaZone8Spent={gible:true};resetZone8Burrows(s);assert.equal(s.zaWildShinyRolls['zone8:gible:443'],undefined);
 const legacy={district:'lumiose-zone8',zaWildShinyRolls:{'zone8:gible:443':false,'zone8:drilbur:529':true}};assert.equal(initializeZone8Burrows(legacy,()=>{throw Error('legacy identity must be kept');}),true);assert.deepEqual(legacy.zaZone8Burrows,{gible:443,drilbur:529});
});
test('time refresh and fast travel reroll ordinary burrows but keep unspent shiny ones',async()=>{
 const {refreshOrdinaryWildSpawns}=await import('../lib/cloud-adventure/adventure-wild-refresh.mjs'),{clearMapTravelTransient}=await import('../lib/cloud-adventure/adventure-fast-travel.mjs');
 for(const reset of [s=>refreshOrdinaryWildSpawns(s,'night',2),s=>clearMapTravelTransient(s)]){
  const s={district:'lumiose-zone8',zaWildSpawnCycles:{8:{period:'day',interval:1}},zaZone8Burrows:{gible:443,drilbur:529},zaZone8Spent:{machop:true},zaWildShinyRolls:{'zone8:gible:443':true,'zone8:drilbur:529':false}};
  reset(s);assert.deepEqual(s.zaZone8Burrows,{gible:443});assert.equal(s.zaWildShinyRolls['zone8:gible:443'],true);assert.equal(s.zaWildShinyRolls['zone8:drilbur:529'],undefined);assert.equal(s.zaZone8Spent,undefined);
 }
});

test('central Jaune market connects both stalls to the plaza and restores older saves',()=>{
 const s={area:3,district:'lumiose-zone8',interior:null,zaRoyaleRank:'F',teamIds:['kept'],zaMission40Stage:2,coins:300},map=zone8Map(s);
 for(const [x,y] of [[7,5],[15,11]]){assert.equal(map[y][x],'^');const old=storeAdventurePosition({...s,x,y},81);delete old.districtPosition.zone8MarketLayout;assert.equal(old.districtPosition.zone8Layout,1);const restored=restoreAdventurePosition(structuredClone(old),81);assert.equal(restored.district,s.district);assert.notEqual(map[restored.y][restored.x],'^');assert.deepEqual(restored.teamIds,['kept']);assert.equal(restored.zaMission40Stage,2);assert.equal(restored.coins,300);assert.equal(restoreAdventurePosition(structuredClone(old),82).district,null);}
 for(const start of [{x:9,y:15},{x:19,y:1},{x:21,y:10}])for(const end of [{x:7,y:6},{x:15,y:10}])assert.ok(fieldPath(map,start,end).length);
 assert.equal(map[6][10],'g');assert.equal(map[7][10],'b');assert.equal(map[9][11],'f');assert.equal(storeAdventurePosition({...s,x:9,y:15},81).districtPosition.zone8MarketLayout,1);
});

test('plaza gate approaches retain sand encounters and old positions',()=>{
 const s={area:3,district:'lumiose-zone8',interior:null,zaRoyaleRank:'F',teamIds:['kept'],zaZone8Burrows:{gible:443,drilbur:529}},map=zone8Map(s);
 for(const [x,y] of [[9,15],[11,15],[19,1],[21,10]]){
  assert.equal(map[y][x],',');assert.ok(fieldPath(map,{x,y},{x:11,y:8}).length);
  const old=restoreAdventurePosition(storeAdventurePosition({...s,x,y},87),87);
  assert.deepEqual([old.x,old.y,old.teamIds,old.zaZone8Burrows],[x,y,['kept'],s.zaZone8Burrows]);
 }
 assert.equal(map[6][10],'g');assert.equal(map[9][11],'f');assert.equal(map[8][14],'c');
});
test('opposed Jaune Street entrances preserve legacy gates, routes and saved state',()=>{
 for(const [district,x,y,dir,zx,zy,returnDir] of [['lumiose-jaune-street',1,11,'left',1,11,'left'],['lumiose-jaune-street-north',21,5,'right',21,5,'right']]){
  const base={area:3,district,interior:null,x,y,zaRoyaleRank:'V',teamIds:['kept'],coins:321};
  assert.equal(stepField(base,dir).blocked,true);
  const open={...base,zaRoyaleRank:'F'},entered=stepField(open,dir);
  assert.deepEqual([entered.district,entered.x,entered.y],['lumiose-zone8',zx,zy]);
  const zone={...open,...entered,zaZone8Spent:{machop:true},zaZone8Items:['north-great'],zaZone8Burrows:{gible:443}};
  assert.ok(fieldPath(zone8Map(zone),zone,{x:11,y:8}).length);
  const restored=restoreAdventurePosition(storeAdventurePosition(zone,77),77);
  assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds,restored.coins,restored.zaZone8Spent,restored.zaZone8Items,restored.zaZone8Burrows],['lumiose-zone8',zx,zy,['kept'],321,{machop:true},['north-great'],{gible:443}]);
  const exit=stepField(restored,returnDir);assert.equal(exit.district,district);
 }
 const old={area:3,district:'lumiose-zone8',interior:null,x:9,y:15,zaRoyaleRank:'V'};assert.equal(stepField(old,'down').district,'lumiose-jaune-street');
});
