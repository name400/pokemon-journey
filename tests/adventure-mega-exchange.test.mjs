import test from 'node:test';
import assert from 'node:assert/strict';
import {SHARD_MEGA_STONES,shardExchangeItem,shardExchangeOpen} from '../lib/adventure-mega-exchange.mjs';
import {rules} from '../lib/pokemon-config.mjs';

test('mission 10 exchange stays closed by default and uses the documented initial catalog',()=>{
 assert.equal(shardExchangeOpen({}),false);
 assert.equal(shardExchangeOpen({zaShardExchangeUnlocked:true}),true);
 assert.equal(shardExchangeOpen({zaShardExchangeUnlocked:'true'}),false);
 assert.equal(new Set(SHARD_MEGA_STONES.map(x=>x.id)).size,SHARD_MEGA_STONES.length);
 assert.ok(SHARD_MEGA_STONES.every(x=>Object.hasOwn(rules.items,x.id)&&[180,240,360].includes(x.cost)));
 assert.equal(shardExchangeItem('pidgeotite').cost,180);
 assert.equal(shardExchangeItem('heracronite').cost,240);
 assert.equal(shardExchangeItem('alakazite').cost,360);
 assert.equal(shardExchangeItem('nonexistent'),null);
});
