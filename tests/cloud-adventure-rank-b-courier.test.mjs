import test from 'node:test';
import assert from 'node:assert/strict';
import {rollRankBCourier,rollRoyaleCourier,validRoyaleCourierPending,royaleCourierName} from '../lib/cloud-adventure/adventure-royale-courier.mjs';

test('rank B and earlier delivery rewards retain their own versions',()=>{
 for(const [r,item,quantity] of [[0,'ultraball',5],[0.25,'moomoomilk',5],[0.5,'revive',3],[0.75,'za-exp-candy-m',3]]){
  const pending=rollRankBCourier(r);assert.deepEqual(pending,{v:2,item,quantity});assert.equal(validRoyaleCourierPending(pending),true);assert.ok(royaleCourierName(pending));
 }
 assert.equal(validRoyaleCourierPending(rollRoyaleCourier(0)),true);
 assert.equal(validRoyaleCourierPending({v:3,item:'ultraball',quantity:5}),false);
 assert.equal(validRoyaleCourierPending({v:2,item:'ultraball',quantity:5,extra:true}),false);
});
