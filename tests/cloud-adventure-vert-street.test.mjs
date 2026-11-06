import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath,stepField,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {vertStreetRouteMap} from '../lib/cloud-adventure/adventure-vert-street-route.mjs';
import {southBoulevardMap} from '../lib/cloud-adventure/adventure-south-boulevard.mjs';
test('hotel to Vert Street and Zone 17 keeps gate and save',()=>{
 const hotel={area:3,district:'lumiose',interior:null,x:19,y:1,facing:'up',zaRoyaleRank:'D'};
 const street=stepField(hotel,'up');assert.equal(street.district,'lumiose-vert-street-route');assert.ok(fieldPath(vertStreetRouteMap(),street,{x:18,y:1}).length);
 const restored=restoreAdventurePosition(storeAdventurePosition({...hotel,...street},4),4);assert.equal(restored.district,'lumiose-vert-street-route');assert.equal(stepField({...hotel,...street},'left').district,'lumiose');
 const gate={...hotel,...street,x:18,y:1,facing:'up'};assert.equal(stepField(gate,'up').blocked,true);
 const zone=stepField({...gate,zaRoyaleRank:'C'},'up');assert.equal(zone.district,'lumiose-zone17');assert.equal(stepField({...gate,...zone},'left').district,'lumiose-vert-street-route');
});

test('Vert Street and South Boulevard intersection works both ways after restore',()=>{
 const road={area:3,district:'lumiose-vert-street-route',interior:null,x:10,y:15,teamIds:['kept']};
 assert.ok(fieldPath(vertStreetRouteMap(),{x:1,y:8},{x:10,y:15}).length);
 const south=stepField(road,'down');assert.deepEqual([south.district,south.x,south.y],['lumiose-south-boulevard',16,1]);
 assert.ok(fieldPath(southBoulevardMap(),south,{x:11,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...road,...south},47),47);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-south-boulevard',16,1,['kept']]);
 const back=stepField(saved,'up');assert.deepEqual([back.district,back.x,back.y],['lumiose-vert-street-route',10,15]);
});

test('Vert Pokémon Center uses the existing healing action near the road junction',()=>{
 const s={area:3,district:'lumiose-vert-street-route',interior:null,x:10,y:13,facing:'up',teamIds:['kept']};
 assert.ok(fieldPath(vertStreetRouteMap(),{x:10,y:15},{x:10,y:13}).length);
 assert.equal(fieldDialogue(s).action,'heal');
 const saved=restoreAdventurePosition(storeAdventurePosition(s,48),48);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-vert-street-route',10,13,['kept']]);
 assert.equal(fieldDialogue(saved).action,'heal');
});
