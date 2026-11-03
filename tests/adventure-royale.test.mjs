import test from 'node:test';
import assert from 'node:assert/strict';
import {royaleZPoints,royaleZWins,royaleZReady,royaleYPoints,royaleYReady,royaleYWins,royaleXPoints,royaleXReady,royaleXWins,royaleDialogue} from '../lib/adventure-royale.mjs';

test('Royale ticket progress derives legacy Z victories and caps confirmed points',()=>{
 const z={zaRoyaleRank:'Z',zaRoyaleZWins:['royale-z-erica','royale-z-daniel','royale-z-jean','royale-z-erica','unexpected']};
 assert.equal(royaleZWins(z).length,3);assert.equal(royaleZPoints(z),1000);assert.equal(royaleZReady(z),true);
 assert.equal(royaleZPoints({...z,zaRoyaleZWins:['royale-z-jean']}),350);
 const y={zaRoyaleRank:'Y',zaRoyaleYPoints:3000,zaRoyaleYSessionWins:['royale-y-hugo','royale-y-hugo','unexpected']};
 assert.equal(royaleYReady(y),true);assert.deepEqual(royaleYWins(y),['royale-y-hugo']);assert.equal(royaleDialogue(y).action,'royaleYvon');
 assert.equal(royaleYPoints({zaRoyaleRank:'Y'}),0);assert.equal(royaleYReady({zaRoyaleRank:'Y'}),false);
 assert.equal(royaleYPoints({zaRoyaleYPoints:9999}),3000);
 const x={zaRoyaleRank:'X',zaRoyaleXPoints:4000,zaRoyaleXSessionWins:['royale-x-lenny','royale-x-lenny','unexpected']};
 assert.equal(royaleXReady(x),true);assert.deepEqual(royaleXWins(x),['royale-x-lenny']);assert.equal(royaleDialogue(x).action,'royaleXavi');
 assert.equal(royaleXPoints({zaRoyaleRank:'X'}),0);assert.equal(royaleXPoints({zaRoyaleXPoints:9999}),4000);
});
