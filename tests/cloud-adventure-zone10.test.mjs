import test from 'node:test';
import assert from 'node:assert/strict';
import {zone10Map,zone10Encounter,zone10Visible,zone10Item} from '../lib/cloud-adventure/adventure-zone10.mjs';
import {stepField,fieldPath,fieldMap,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('zone ten canal, rooftop, gate and saved positions',()=>{
 const base={area:3,district:'lumiose-south-boulevard',interior:null,x:11,y:1,facing:'up',zaRoyaleRank:'V'};assert.equal(stepField(base,'up').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'F'},'up');assert.equal(entered.district,'lumiose-zone10');const s={...base,...entered,zaRoyaleRank:'F'},map=zone10Map(s);assert.ok(fieldPath(map,s,{x:17,y:5}).length);assert.equal(zone10Visible(s,'c').species,318);assert.equal(zone10Visible(s,'e').alpha,true);assert.equal(zone10Item(s,'i').kind,'quickball');assert.equal(zone10Item({...s,zaZone10Items:['canal-quick']},'i'),null);assert.equal(stepField({...s,x:11,y:7},'down').blocked,true);
 const roof={...s,zaZone10Upper:true,x:17,y:5};assert.equal(zone10Visible(roof,'a').species,24);assert.equal(zone10Visible(roof,'f').alpha,true);assert.equal(zone10Item(roof,'i').kind,'hyper_potions');assert.equal(zone10Encounter(roof,()=>0).speciesId,24);const restored=restoreAdventurePosition(storeAdventurePosition(roof,42),42);assert.deepEqual([restored.district,restored.zaZone10Upper,restored.x,restored.y],['lumiose-zone10',true,17,5]);assert.equal(stepField(s,'left').district,'lumiose-south-boulevard');
});

test('Centrico route reaches Zone 10 via South Boulevard while preserving the gate',()=>{
 const c={area:3,district:'lumiose-centrico-route',interior:null,x:20,y:15,zaRoyaleRank:'V',teamIds:['kept']};
 const road=stepField(c,'down');assert.deepEqual([road.district,road.x,road.y],['lumiose-south-boulevard',14,1]);
 assert.equal(stepField({...c,...road},'up').district,'lumiose-centrico-route');
 assert.ok(fieldPath(fieldMap({...c,...road}),road,{x:11,y:1}).length);
 assert.equal(stepField({...c,...road,x:11,y:1},'up').blocked,true);
 const saved=restoreAdventurePosition(storeAdventurePosition({...c,...road},30),30);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-south-boulevard',14,1,['kept']]);
});
