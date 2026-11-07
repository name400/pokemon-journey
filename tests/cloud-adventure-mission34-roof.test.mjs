import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,restoreAdventurePosition,storeAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Sector 9 scaffolding and bridge enforce Philippe before the Starmie arena',()=>{
 const street={area:3,district:'lumiose-bleu6-approach',interior:null,x:8,y:8,facing:'up',zaMission31Stage:3,teamIds:['kept']};
 assert.equal(fieldDialogue(street).action,'mission34RoofLadder');
 assert.equal(fieldDialogue({...street,zaMission31Stage:2}).action,undefined);
 const roof={...street,district:'lumiose-mission34-roof',x:3,y:7,facing:'down'};
 assert.equal(fieldDialogue(roof).action,'mission34RoofLadder');
 assert.equal(fieldDialogue({...roof,x:7,y:5,facing:'up'}).action,'mission34Philippe');
 assert.equal(fieldPath(fieldMap(roof),roof,{x:18,y:11}).length,0);
 const after={...roof,zaMission34PhilippeWon:true};assert.ok(fieldPath(fieldMap(after),after,{x:18,y:11}).length);
 assert.equal(fieldDialogue({...after,x:18,y:11,facing:'up'}).action,'mission31CaseBattle');
 assert.equal(fieldDialogue({...after,x:18,y:11,facing:'up',zaMission34Complete:true,zaMission34RewardPending:true}).action,'mission31ClaimStone');
 const saved=restoreAdventurePosition(storeAdventurePosition({...after,x:18,y:11},76),76);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaMission34PhilippeWon,saved.teamIds],['lumiose-mission34-roof',18,11,true,['kept']]);
 const old={...street,district:'lumiose-site',x:8,y:13,facing:'up'};assert.equal(fieldDialogue(old).action,'mission34Philippe');
});

test('South Boulevard lift remains blocked until Beldum defeat and preserves reward state',()=>{
 const street={area:3,district:'lumiose-south-boulevard',interior:null,x:4,y:7,facing:'up',teamIds:['kept']};
 assert.equal(fieldDialogue(street).action,undefined);
 assert.equal(fieldDialogue({...street,zaRoyaleRank:'B'}).action,'side92Battle');
 const unlocked={...street,zaSide92Won:true,zaSide92RewardPending:true};
 assert.deepEqual(fieldDialogue(unlocked).actions.map(a=>a.action),['side92Holovator','side92Reward']);
 const saved=restoreAdventurePosition(storeAdventurePosition(unlocked,77),77);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaSide92Won,saved.zaSide92RewardPending,saved.teamIds],['lumiose-south-boulevard',4,7,true,true,['kept']]);
 assert.equal(fieldDialogue({...unlocked,district:'lumiose-mission34-roof',x:3,y:4,facing:'left'}).action,'side92Holovator');
});
