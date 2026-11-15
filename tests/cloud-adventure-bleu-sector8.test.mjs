import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,restoreAdventurePosition,storeAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

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
