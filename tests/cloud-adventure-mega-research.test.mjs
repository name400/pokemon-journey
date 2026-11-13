import test from 'node:test';
import assert from 'node:assert/strict';
import {megaResearchProgress,recordResearchMegaStones,RESEARCH_MEGA_STONES} from '../lib/cloud-adventure/adventure-mega-research.mjs';
import {SHARD_MEGA_STONES,shardItemUnlocked} from '../lib/cloud-adventure/adventure-mega-exchange.mjs';
import {researchSummary} from '../lib/cloud-adventure/adventure-research.mjs';
test('mega research deduplicates verified stones and preserves purchased history',()=>{
 const s={zaEmporiumMegaPurchases:['gengarite','charizarditex','gengarite'],zaResearchMegaStones:['absolite','bad-item']};recordResearchMegaStones(s,['gengarite','charizarditey','pidgeotite','firestone']);assert.deepEqual(megaResearchProgress(s),{count:5,points:500,next:10});assert.equal(researchSummary(s).points,500);recordResearchMegaStones(s,['gengarite']);assert.equal(megaResearchProgress(s).count,5);assert.equal(new Set(RESEARCH_MEGA_STONES).size,RESEARCH_MEGA_STONES.length);
});
test('new exchange stock is gated by rank and does not remove legacy offers',()=>{
 const find=id=>SHARD_MEGA_STONES.find(x=>x.id===id),s={zaShardExchangeUnlocked:true,zaRoyaleRank:'F'};assert.equal(shardItemUnlocked(s,find('pidgeotite')),true);assert.equal(shardItemUnlocked(s,find('excadrite')),false);s.zaRoyaleRank='E';assert.equal(shardItemUnlocked(s,find('excadrite')),true);assert.equal(shardItemUnlocked(s,find('metagrossite')),false);s.zaRoyaleRank='A';assert.equal(shardItemUnlocked(s,find('metagrossite')),true);assert.equal(shardItemUnlocked({...s,zaShardExchangeUnlocked:false},find('metagrossite')),false);
});

test('shard stone prices and rank B stock follow the exchange table',()=>{
 const find=id=>SHARD_MEGA_STONES.find(x=>x.id===id),s={zaShardExchangeUnlocked:true,zaRoyaleRank:'C'};
 assert.equal(find('falinksite').cost,240);assert.equal(shardItemUnlocked(s,find('falinksite')),true);
 for(const id of ['salamencite','metagrossite']){assert.equal(find(id).cost,360);assert.equal(shardItemUnlocked(s,find(id)),false);assert.equal(shardItemUnlocked({...s,zaRoyaleRank:'B'},find(id)),true);assert.equal(shardItemUnlocked({...s,zaRoyaleRank:'A'},find(id)),true);}
});

test('postgame candidate stones include 45 distinct research entries for each starter and legacy saves',async()=>{
 const {megaStoneShopStock}=await import('../lib/cloud-adventure/adventure-side27.mjs'),{rules}=await import('../lib/pokemon-config.mjs');
 for(const starter of [152,158,498,undefined]){
  const world={zaMission37Complete:true,zaShardExchangeUnlocked:true,zaIntroStarterSpecies:starter};
  const shard=SHARD_MEGA_STONES.filter(item=>shardItemUnlocked(world,item)).map(item=>item.id),shop=megaStoneShopStock(world).map(item=>item[0]),story=['absolite','slowbronite','cameruptite','victreebelite'];
  const candidates=[...new Set([...shard,...shop,...story])];assert.equal(candidates.length,starter===undefined?45:47);assert.ok(candidates.every(id=>Object.hasOwn(rules.items,id)&&RESEARCH_MEGA_STONES.includes(id)));
 }
});
