import test from 'node:test';
import assert from 'node:assert/strict';
import {rogueRetryPercent,saveRogueRetry,clearRogueRetry,rogueRetryActions} from '../lib/cloud-adventure/adventure-rogue-retry.mjs';

test('rogue boss checkpoints use validated quarter thresholds and retain the best result',()=>{
 const s={};assert.equal(saveRogueRetry(s,'slowbro',76,100),100);assert.equal(saveRogueRetry(s,'slowbro',75,100),75);assert.equal(saveRogueRetry(s,'slowbro',49,100),50);assert.equal(saveRogueRetry(s,'slowbro',60,100),50);assert.equal(saveRogueRetry(s,'slowbro',1,100),25);assert.equal(saveRogueRetry(s,'camerupt',74,100),75);assert.equal(rogueRetryPercent(s,'slowbro'),25);assert.equal(rogueRetryActions(s,'slowbro','fight','배틀').actions[0].label,'배틀 · HP 25%부터');assert.equal(saveRogueRetry(s,'unknown',1,100),100);assert.equal(saveRogueRetry(s,'slowbro',NaN,100),100);clearRogueRetry(s,'slowbro');assert.equal(rogueRetryPercent(s,'slowbro'),100);assert.equal(rogueRetryPercent(s,'camerupt'),75);assert.deepEqual(rogueRetryActions(s,'slowbro','fight','배틀'),{action:'fight',label:'배틀'});assert.equal(rogueRetryPercent({zaRogueMegaCheckpoints:{slowbro:12}},'slowbro'),100);
});
