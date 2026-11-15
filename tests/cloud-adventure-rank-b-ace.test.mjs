import test from 'node:test';
import assert from 'node:assert/strict';
import {grantRankBAceBonus} from '../lib/cloud-adventure/adventure-royale-bonus.mjs';
import {royaleNightIndex} from '../lib/cloud-adventure/adventure-royale-zones.mjs';

test('ace bonus preserves unknown active cards and malformed future records',()=>{
 const now=1700000000000,night=royaleNightIndex({},now),future={night,rank:'B',progress:0,completed:false};
 const state={zaRoyaleRank:'B',zaRoyaleBonusExtraCards:{'future-card':future}};
 const before=structuredClone(state);assert.equal(grantRankBAceBonus(state,now),null);assert.deepEqual(state,before);
 state.zaRoyaleBonusExtraCards={version:2,data:{}};const next=structuredClone(state);assert.equal(grantRankBAceBonus(state,now),null);assert.deepEqual(state,next);
});
