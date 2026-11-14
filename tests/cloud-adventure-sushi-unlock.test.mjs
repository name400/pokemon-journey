import test from 'node:test';
import assert from 'node:assert/strict';
import {sushiAvailable} from '../lib/cloud-adventure/adventure-sushi.mjs';
import {fieldMap,fieldDialogue} from '../lib/cloud-adventure/adventure-world.mjs';

test('sushi accepts later legacy milestones without unlocking early saves',()=>{
 for(const world of [{},{zaRoyaleRank:'D'},{zaMission20Stage:14}])assert.equal(sushiAvailable(world),false);
 for(const world of [{zaMission24Started:true},{zaMission20Complete:true},{zaMission24Complete:true},{zaMission25Started:true},{zaMission30Complete:true},{zaMission37Complete:true},...['C','B','A','S'].map(zaRoyaleRank=>({zaRoyaleRank}))])assert.equal(sushiAvailable(world),true);
 const save={area:3,district:'lumiose-rouge-north',interior:'sushi',x:16,y:6,facing:'up',zaRoyaleRank:'B'},before=structuredClone(save);
 assert.equal(fieldDialogue(save,fieldMap(save)).action,'sushiStart');assert.deepEqual(save,before);
 assert.equal(fieldDialogue({...save,zaSushiCompleted:true},fieldMap(save)).action,'sushiRepeat');
 assert.equal(fieldDialogue({...save,zaSushiRewardPending:'repeat'},fieldMap(save)).action,'claimSushiReward');
});
