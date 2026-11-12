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
