import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureFriendshipGain} from '../lib/cloud-adventure/adventure-friendship.mjs';
import {friendshipGain} from '../lib/capture.mjs';
import {gainExperience,expToNext} from '../lib/growth.mjs';
import {makeMon} from '../lib/game.mjs';
import {useAdventureVitamin} from '../lib/cloud-adventure/adventure-vitamins.mjs';
import {useAdventureEvBerry} from '../lib/cloud-adventure/adventure-ev-berries.mjs';
test('soothe bell boosts adventure friendship while shared growth stays compatible',()=>{
 const base={...makeMon(447,20),friendship:70,item:'soothebell'},plain={...base,item:''};assert.equal(adventureFriendshipGain(base,10),85);assert.equal(adventureFriendshipGain(plain,10),80);assert.equal(adventureFriendshipGain({...base,friendship:250},10),255);assert.equal(adventureFriendshipGain(base,0),70);assert.equal(adventureFriendshipGain({...base,friendship:300},10),255);assert.equal(adventureFriendshipGain({...base,originBall:'luxuryball'},10),86);assert.equal(friendshipGain(base,10),80);
 assert.equal(gainExperience(base,expToNext(base)).mon.friendship,75);assert.equal(gainExperience(base,expToNext(base),adventureFriendshipGain).mon.friendship,77);assert.equal(useAdventureVitamin(base,'protein').mon.friendship,76);assert.equal(useAdventureEvBerry({...base,evs:{hp:20,atk:0,def:0,spa:0,spd:0,spe:0}},'pomegberry').mon.friendship,85);
});
