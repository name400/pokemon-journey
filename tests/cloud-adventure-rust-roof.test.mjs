import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,rotoGlideLanding,storeAdventurePosition,restoreAdventurePosition,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
import {RUST_NORTH_BUILDING} from '../lib/cloud-adventure/adventure-espace-vide.mjs';

test('Rust north ladder and separate bamboo roof preserve saves and office access',()=>{
 const ground={area:3,district:'lumiose-rust',interior:null,x:21,y:4,facing:'left',zaMission15Stage:2,zaMission20Stage:7,teamIds:['kept']},map=fieldMap(ground);
 assert.equal(map[4][20],'l');assert.equal(fieldDialogue(ground)?.action,'rustRoofLadder');assert.ok(fieldPath(map,ground,{x:11,y:7}).length);
 for(const [x,y] of RUST_NORTH_BUILDING){const old=storeAdventurePosition({...ground,x,y},121);old.districtPosition.rustLayout=1;const saved=restoreAdventurePosition(old,121);assert.equal(saved.district,ground.district);assert.ok(walkable(map[saved.y][saved.x]));assert.deepEqual(saved.teamIds,['kept']);assert.equal(saved.zaMission20Stage,7);assert.equal(restoreAdventurePosition(old,122).district,null);}
 const roof={...ground,district:'lumiose-rust-roof',x:18,y:4,facing:'up'},rm=fieldMap(roof);assert.equal(fieldDialogue(roof)?.action,'rustRoofLadder');assert.equal(rm[10][7],'^');assert.ok(fieldPath(rm,roof,{x:15,y:6}).length);assert.equal(fieldPath(rm,roof,{x:15,y:9}).length,0);
 const takeoff={...roof,x:15,y:6};assert.equal(rotoGlideLanding({...takeoff,zaMission15Stage:1}),null);const landing=rotoGlideLanding(takeoff);assert.deepEqual(landing,{x:15,y:9,facing:'down'});
 const saved=restoreAdventurePosition(storeAdventurePosition({...takeoff,...landing},122),122);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMission20Stage],['lumiose-rust-roof',15,9,['kept'],7]);assert.deepEqual(rotoGlideLanding(saved),{x:15,y:6,facing:'up'});
});
