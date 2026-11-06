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
