import test from 'node:test';
import assert from 'node:assert/strict';
import {INFINITE_FOLLOWUPS,INFINITE_RANDOM_EXTRAS,infiniteNextReward,infiniteRewardTeam,selectInfiniteRandom} from '../lib/cloud-adventure/adventure-infinite-royale.mjs';

test('post-20 rematches require tournament for new saves while old saves keep access',()=>{
 const s={zaInfiniteRewardWins:20,zaInfiniteRandomGateV2:true};assert.equal(infiniteNextReward(s),null);assert.equal(infiniteNextReward({...s,zaSide119Complete:true}).id,'infinite-random-pending');assert.equal(infiniteNextReward({...s,zaInfiniteRandomGateV2:undefined}).id,'infinite-random-pending');
 assert.equal(infiniteNextReward({...s,zaInfiniteRewardWins:19}).id,'infinite-vinnie');
});
test('new random opponents and post-Zygarde teams are selected without mutating fixed rewards',()=>{
 const pre={zaInfiniteRewardWins:20,zaInfiniteRandomGateV2:true,zaSide119Complete:true};const post={...pre,zaMission42Complete:true};
 const josee=INFINITE_RANDOM_EXTRAS[0],asami=INFINITE_RANDOM_EXTRAS[1],andi=INFINITE_RANDOM_EXTRAS[2];
 assert.equal(selectInfiniteRandom(pre,()=>.999999).id,asami.id);assert.equal(selectInfiniteRandom(post,()=>.999999).id,andi.id);
 assert.deepEqual(infiniteRewardTeam(pre,josee).team,[[68,69],[560,69],[701,69],[675,69],[308,69]]);assert.ok(infiniteRewardTeam(post,josee).team.every(([,level])=>level===73));
 const zach=selectInfiniteRandom(post,()=>0);assert.deepEqual(infiniteRewardTeam(post,zach).team,[[79,10],[16,11],[25,11]]);assert.deepEqual(zach.team,[[79,9],[16,10],[25,10]]);
 const rival=INFINITE_FOLLOWUPS.find(t=>t.id==='infinite-rival');assert.deepEqual(infiniteRewardTeam({...post,zaMission10Starter:'grass'},rival).team,[[678,74],[706,74],[713,75],[160,75],[310,76],[500,76]]);assert.equal(infiniteRewardTeam(post,rival),null);
 assert.equal(infiniteNextReward({...post,zaInfiniteRandomTrainer:'infinite-andi'}).id,'infinite-andi');
});
