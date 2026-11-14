import test from 'node:test';
import assert from 'node:assert/strict';
import {side89Available,side89Point,side89Spot,recordSide89Victory} from '../lib/cloud-adventure/adventure-side89.mjs';
import {fieldMap,fieldPath,fieldDialogue,rotoGlideLanding,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {pendingAdventureQuests,trackedAdventureLocalTarget} from '../lib/cloud-adventure/adventure-pending-quests.mjs';

test('Emolga chase preserves old ground positions and uses a reversible glide',()=>{
 const ground={area:3,district:'lumiose-jaune-sector7',interior:null,x:9,y:3,facing:'down',teamIds:['kept'],zaMission15Stage:2,zaMission30Started:true};
 const old=restoreAdventurePosition(storeAdventurePosition(ground,31),31);assert.deepEqual([old.x,old.y,old.district],[9,3,ground.district]);
 const roof={...ground,district:'lumiose-screw-jaune7',x:10,y:6,zaSide89Stage:1,zaTrackedQuestId:'89'};
 assert.equal(fieldPath(fieldMap(roof),roof,{x:17,y:4}).length,0);
 assert.deepEqual(rotoGlideLanding(roof),{x:14,y:6,facing:'right'});
 assert.deepEqual(rotoGlideLanding({...roof,x:14}),{x:10,y:6,facing:'left'});
 assert.equal(rotoGlideLanding({...roof,zaMission15Stage:1}),null);
 assert.deepEqual(trackedAdventureLocalTarget({...roof,map:fieldMap(roof)}),{x:17,y:3});assert.ok(pendingAdventureQuests(roof).some(q=>q.id==='89'));
 const saved=restoreAdventurePosition(storeAdventurePosition({...roof,x:17,y:4},32),32);assert.equal(saved.zaSide89Stage,1);assert.deepEqual(saved.teamIds,['kept']);assert.equal(fieldDialogue({...saved,facing:'up'}).action,'side89Follow');
 assert.equal(side89Available({...roof,zaSide89Stage:99}),false);assert.equal(side89Point({...roof,zaSide89Stage:99}),null);assert.equal(side89Spot({...roof,zaSide89Stage:99},{x:17,y:3,tile:'#'}),null);
 const active={zaSide89Stage:6};assert.equal(recordSide89Victory(active,{adventureMissionId:'other'}),false);assert.equal(recordSide89Victory(active,{adventureMissionId:'side89-emolga'}),true);assert.equal(recordSide89Victory(active,{adventureMissionId:'side89-emolga'}),false);
});
