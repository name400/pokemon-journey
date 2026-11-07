import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,rotoGlideLanding,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Vernal east roof keeps the street and Cafe ladder separate',()=>{
 const street={area:3,district:'lumiose-vernal',interior:null,x:17,y:4,facing:'right',teamIds:['kept']};
 assert.equal(fieldMap(street)[4][18],'l');assert.equal(fieldMap(street)[4][12],'l');assert.equal(fieldDialogue(street).action,'vernalEastRoofLadder');
 const previous=restoreAdventurePosition(storeAdventurePosition({...street,x:18},31),31);assert.deepEqual([previous.x,previous.y,previous.zaVernalEastRoof],[18,4,undefined]);
 const roof={...street,x:5,y:6,zaVernalEastRoof:true,zaMission15Stage:1},map=fieldMap(roof);assert.equal(fieldPath(map,roof,{x:5,y:9}).length,0);assert.equal(rotoGlideLanding(roof),null);
 const unlocked={...roof,zaMission15Stage:2};assert.deepEqual(rotoGlideLanding(unlocked),{x:5,y:9,facing:'down'});assert.deepEqual(rotoGlideLanding({...unlocked,y:9}),{x:5,y:6,facing:'up'});assert.equal(rotoGlideLanding({...unlocked,x:6}),null);
 const saved=restoreAdventurePosition(storeAdventurePosition({...unlocked,y:9},32),32);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaVernalEastRoof,saved.teamIds],[street.district,5,9,true,['kept']]);
});
