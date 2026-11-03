import test from 'node:test';
import assert from 'node:assert/strict';
import {royaleWPoints,royaleWWins,royaleWReady,royaleZPoints,royaleZWins,royaleZReady,royaleYPoints,royaleYReady,royaleYWins,royaleXPoints,royaleXReady,royaleXWins,naveenRequired,naveenAction,joseeRequired,joseeAction,lidaStage,lidaRequired,lidaBagAction,lidaBattleAction,royaleDialogue} from '../lib/adventure-royale.mjs';

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
 assert.equal(lidaRequired({zaRoyaleRank:'W'}),false);assert.equal(lidaRequired({zaRoyaleRank:'W',zaLidaRequired:true}),true);assert.equal(lidaBagAction({zaRoyaleRank:'W'}).action,'takeLidaBag');assert.equal(lidaStage({zaLidaStage:1}),1);assert.equal(lidaBattleAction({zaRoyaleRank:'W',zaLidaStage:1}).action,'battleLida');
 assert.equal(joseeRequired({zaRoyaleRank:'Y'}),false);assert.equal(joseeRequired({zaRoyaleRank:'Y',zaJoseeRequired:true}),true);assert.equal(joseeRequired({zaRoyaleRank:'Y',zaJoseeRequired:true,zaJoseeComplete:true}),false);assert.equal(joseeAction({zaRoyaleRank:'Y'}).action,'battleJosee');
 assert.equal(naveenRequired({zaRoyaleRank:'X'}),false);assert.equal(naveenRequired({zaRoyaleRank:'X',zaNaveenRequired:true}),true);assert.equal(naveenAction({zaRoyaleRank:'W'}).action,'battleNaveen');
 assert.equal(royaleXPoints({zaRoyaleRank:'X'}),0);assert.equal(royaleXPoints({zaRoyaleXPoints:9999}),4000);
});

test('W rank preserves old saves and caps session points',()=>{
 const w={zaRoyaleRank:'W',zaRoyaleWPoints:5000,zaRoyaleWSessionWins:['royale-w-mathis','royale-w-mathis','unexpected']};
 assert.equal(royaleWReady(w),true);assert.deepEqual(royaleWWins(w),['royale-w-mathis']);assert.equal(royaleWPoints({zaRoyaleWPoints:9000}),5000);
 assert.equal(royaleWPoints({zaRoyaleRank:'W'}),0);assert.equal(royaleDialogue({zaRoyaleRank:'W'}).action,'enterRoyaleZone');assert.equal(royaleDialogue(w).action,undefined);
});
