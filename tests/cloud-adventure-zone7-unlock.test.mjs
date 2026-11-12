import test from 'node:test';
import assert from 'node:assert/strict';
import {stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {zone7Unlocked} from '../lib/cloud-adventure/adventure-zone7.mjs';

test('Zones 7–10 open after Mission 9 while earlier and later saves remain compatible',()=>{
 const entrances=[['lumiose-centrico-route',5,1,'up','lumiose-zone7'],['lumiose-jaune-street',11,1,'up','lumiose-zone8'],['lumiose-estival-approach',21,8,'right','lumiose-zone9'],['lumiose-south-boulevard',11,1,'up','lumiose-zone10']];
 for(const [district,x,y,direction,target] of entrances){const base={area:3,district,interior:null,x,y,facing:direction,zaRoyaleRank:'V',zaMysteryTrail:4};assert.equal(stepField(base,direction).blocked,true);for(const unlocked of [{zaMysteryTrail:5},{zaMission09Complete:true},{zaRoyaleRank:'F',zaMysteryTrail:undefined}]){const state={...base,...unlocked},step=stepField(state,direction);assert.equal(step.district,target);const position={...state,...step},saved=storeAdventurePosition(position,3),restored=restoreAdventurePosition(saved,3);assert.equal(restored.district,target);assert.deepEqual([restored.x,restored.y],[step.x,step.y]);}}
 assert.equal(zone7Unlocked({zaRoyaleRank:'V',zaMysteryTrail:4}),false);assert.equal(zone7Unlocked({zaRoyaleRank:'V',zaMysteryTrail:5}),true);assert.equal(zone7Unlocked({zaRoyaleRank:'F'}),true);
});
