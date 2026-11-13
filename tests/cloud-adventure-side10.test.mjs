import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {evolutionOptions} from '../lib/evolution.mjs';
import {side10Available,side10Spot} from '../lib/cloud-adventure/adventure-side10.mjs';
import {fieldMap,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Odette appears from mission 7 without blocking old Vernal positions; Sachet enables the trade evolution',()=>{
 assert.equal(side10Available({zaRoyaleRank:'Y'}),false);assert.equal(side10Available({zaMission07Started:true}),true);assert.equal(side10Available({zaRoyaleRank:'W'}),true);
 const s={district:'lumiose-vernal',area:3,x:3,y:3,zaMission07Started:true,teamIds:['kept'],zaResearchItemRewards:[10]};const map=fieldMap(s);assert.equal(map[0][3],'^');assert.ok(fieldPath(map,s,{x:3,y:1}).length);assert.equal(side10Spot(s,{tile:'^',x:3,y:0}),true);assert.equal(side10Spot({...s,zaVernalEastRoof:true},{tile:'^',x:3,y:0}),false);
 const old=storeAdventurePosition(s,42),restored=restoreAdventurePosition(old,42);assert.deepEqual([restored.x,restored.y],[3,3]);assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.zaResearchItemRewards,[10]);
 const m={...makeMon(682,10),item:'sachet',tradeCount:1},option=evolutionOptions(m,{adventureEngine:'cloud'},[],{}).find(o=>o.id===683);assert.equal(option.ready,true);assert.equal(option.held,'sachet');assert.equal(evolutionOptions({...m,tradeCount:0},{adventureEngine:'cloud'},[],{}).find(o=>o.id===683).ready,false);
});
