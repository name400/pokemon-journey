import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureBall,adventureUltraBallUnlocked} from '../lib/cloud-adventure/adventure-balls.mjs';

test('Ultra Ball shop requires a late rank or a preserved postgame flag',()=>{
 assert.equal(adventureBall('ultraball').price,600);
 assert.equal(adventureBall('ultraball').sale,true);
 for(const rank of ['Z','V','F',undefined])assert.equal(adventureUltraBallUnlocked({zaRoyaleRank:rank}),false);
 for(const rank of ['E','D','C','B','A'])assert.equal(adventureUltraBallUnlocked({zaRoyaleRank:rank}),true);
 assert.equal(adventureUltraBallUnlocked({zaMission38Complete:true}),true);
 assert.equal(adventureUltraBallUnlocked({zaMission39Started:true}),true);
 assert.equal(adventureUltraBallUnlocked({zaMission42Complete:true}),true);
 assert.equal(adventureUltraBallUnlocked({}),false);
});
