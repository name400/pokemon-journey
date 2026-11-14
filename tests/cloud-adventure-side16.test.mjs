import test from 'node:test';
import assert from 'node:assert/strict';
import {side16Available,side16Spot} from '../lib/cloud-adventure/adventure-side16.mjs';
import {fieldMap,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
import {pendingAdventureQuests,trackedAdventureLocalTarget} from '../lib/cloud-adventure/adventure-pending-quests.mjs';

test('Budew show uses old blocked walls and tracks only explicit active progress',()=>{
 assert.equal(side16Available({zaRoyaleRank:'X'}),false);assert.equal(side16Available({zaMission07Started:true}),true);assert.deepEqual(pendingAdventureQuests({zaSide16Stage:3}),[]);
 const center={area:3,district:'lumiose-aymlis-park',interior:null,zaMission07Started:true},show={area:3,district:'lumiose-bleu-sector8',interior:null,zaSide16Stage:1,zaTrackedQuestId:'16'},cm=fieldMap(center),sm=fieldMap(show);
 assert.equal(side16Spot(center,{x:16,y:3,tile:cm[3][16]}),'center');assert.equal(side16Spot(show,{x:5,y:5,tile:sm[5][5]}),'show');assert.equal(walkable(cm[3][16]),false);assert.equal(walkable(sm[5][5]),false);assert.deepEqual(trackedAdventureLocalTarget({...show,map:sm}),{x:5,y:5});assert.equal(side16Spot({...center,zaMission11ParkLower:true},{x:16,y:3,tile:'^'}),null);
});
