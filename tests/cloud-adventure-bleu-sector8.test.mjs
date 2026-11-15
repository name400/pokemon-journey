import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,restoreAdventurePosition,storeAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Bleu Sector 9 courtyard preserves the Old Building interaction and saved progress',()=>{
 const base={area:3,district:'lumiose-bleu-sector9',interior:null,x:10,y:6,zaMission20Stage:7,teamIds:['kept']};
 const map=fieldMap(base);assert.ok(fieldPath(map,base,{x:11,y:3}).length);
 assert.equal(map[5][11],'b');
 assert.equal(fieldDialogue({...base,x:11,y:6,facing:'up'},map).action,'mission20EnterHouse');
 const saved=restoreAdventurePosition(storeAdventurePosition({...base,x:11,y:3},118),118);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaMission20Stage,saved.teamIds],['lumiose-bleu-sector9',11,3,7,['kept']]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:11,y:15}).length);
 const old=restoreAdventurePosition(storeAdventurePosition({...base,x:11,y:6},118),118);
 assert.deepEqual([old.x,old.y],[11,6]);assert.equal(fieldDialogue({...old,facing:'up'}).action,'mission20EnterHouse');
});

test('the provisional courtyard keeps show registration and restores old and new positions',()=>{
 const base={area:3,district:'lumiose-bleu-sector8',interior:null,x:4,y:6,zaSide16Stage:1,teamIds:['kept']};
 const map=fieldMap(base);assert.ok(fieldPath(map,base,{x:5,y:3}).length);
 assert.equal(map[5][5],'^');assert.equal(map[14][16],'s');
 const saved=restoreAdventurePosition(storeAdventurePosition({...base,x:5,y:3},117),117);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaSide16Stage,saved.teamIds],['lumiose-bleu-sector8',5,3,1,['kept']]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:11,y:15}).length);
 const old=restoreAdventurePosition(storeAdventurePosition({...base,x:16,y:15},117),117);
 assert.deepEqual([old.x,old.y],[16,15]);assert.equal(fieldDialogue({...old,facing:'up'}).hairSalon,true);
});

test('Bleu Sector 8 links passage, South Boulevard, salon and Sector 9',()=>{
 const base={area:3,district:'lumiose-bleu-sector8',interior:null,x:21,y:8,facing:'up',teamIds:['kept'],zaMission20Stage:7};
 const map=fieldMap(base);assert.ok(fieldPath(map,base,{x:11,y:15}).length);assert.ok(fieldPath(map,base,{x:1,y:8}).length);
 const salon=fieldDialogue({...base,x:16,y:15,facing:'up'});assert.equal(salon.name,'미용실');assert.equal(salon.hairSalon,true);
 const south=stepField({...base,x:11,y:15},'down');assert.equal(south.district,'lumiose-south-boulevard');assert.equal(stepField({...base,...south},'up').district,'lumiose-bleu-sector8');
 const nine=stepField({...base,x:1,y:8},'left');assert.equal(nine.district,'lumiose-bleu-sector9');assert.equal(stepField({...base,...nine},'right').district,'lumiose-bleu-sector8');
 const n={...base,...nine};assert.ok(fieldPath(fieldMap(n),n,{x:11,y:6}).length);assert.equal(fieldDialogue({...n,x:11,y:6,facing:'up'}).action,'mission20EnterHouse');
 const saved=restoreAdventurePosition(storeAdventurePosition({...n,x:11,y:6},75),75);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-bleu-sector9',11,6,['kept']]);
 const house={...base,district:'lumiose-ghost-house',x:11,y:15,zaMission20HouseReturn:'bleu9'};
 assert.equal(stepField(house,'down').district,'lumiose-bleu-sector9');assert.equal(stepField({...house,zaMission20HouseReturn:undefined},'down').district,'lumiose-vernal');
});

test('Bleu 8 courtyard pickups preserve old saves and the show marker',()=>{
 const s={area:3,district:'lumiose-bleu-sector8',interior:null,x:5,y:3,facing:'down',zaSide16Stage:1,teamIds:['kept']};
 let saved=restoreAdventurePosition(storeAdventurePosition(s,200),200),map=fieldMap(saved);
 assert.deepEqual([saved.x,saved.y,saved.teamIds],[5,3,['kept']]);assert.deepEqual([map[3][4],map[3][5],map[3][6],map[4][4]],['k','l','i','j']);assert.equal(map[5][5],'^');assert.ok(fieldPath(map,saved,{x:11,y:15}).length);
 saved=restoreAdventurePosition(storeAdventurePosition({...saved,zaBleu8Items:['northwest-super']},201),201);map=fieldMap(saved);assert.equal(map[3][4],';');assert.equal(map[3][5],'l');assert.equal(map[5][5],'^');
});

test('Bleu 9 courtyard and ground items preserve the Old Building and saved positions',()=>{
 const s={area:3,district:'lumiose-bleu-sector9',interior:null,x:12,y:3,facing:'down',zaMission20Stage:7,teamIds:['kept']};
 let saved=restoreAdventurePosition(storeAdventurePosition(s,207),207),map=fieldMap(saved);assert.deepEqual([saved.x,saved.y,saved.teamIds],[12,3,['kept']]);
 assert.equal(map[3][12],'i');assert.equal(map[4][20],'j');assert.equal(map[6][19],'k');assert.equal(map[5][11],'b');assert.ok(fieldPath(map,saved,{x:11,y:15}).length);
 assert.equal(fieldDialogue({...saved,x:11,y:6,facing:'up'}).action,'mission20EnterHouse');saved=restoreAdventurePosition(storeAdventurePosition({...saved,zaBleu9Items:['court-protein']},208),208);map=fieldMap(saved);assert.equal(map[3][12],';');assert.equal(map[5][11],'b');assert.equal(saved.zaMission20Stage,7);
});
