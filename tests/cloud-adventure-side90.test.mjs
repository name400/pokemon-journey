import test from 'node:test';
import assert from 'node:assert/strict';
import {side90Available,side90Point,side90Spot} from '../lib/cloud-adventure/adventure-side90.mjs';
import {fieldMap,fieldDialogue,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {pendingAdventureQuests,trackedAdventureLocalTarget} from '../lib/cloud-adventure/adventure-pending-quests.mjs';

test('Froslass quest uses the old lift and ice bridge and preserves unknown saves',()=>{
 const street={area:3,district:'lumiose-bleu-sector3',interior:null,x:5,y:6,facing:'up',teamIds:['kept'],zaMission61Won:true,zaMission27Complete:true,zaMission30Complete:true};
 assert.equal(side90Available({...street,zaMission30Complete:false}),false);
 assert.equal(fieldDialogue(street).action,'side90Start');
 assert.equal(side90Available({...street,zaSide90Stage:99}),false);
 assert.equal(side90Spot({...street,zaSide90Stage:99},{x:5,y:5,tile:'#'}),false);
 const roof={...street,district:'lumiose-mission27-roof',x:10,y:4,zaSide90Stage:1,zaTrackedQuestId:'90'};
 assert.equal(fieldDialogue(roof).action,'side90Follow');
 assert.equal(fieldPath(fieldMap(roof),roof,{x:18,y:4}).length,0);
 const opened={...roof,zaSide90Stage:2,zaMission27Bridges:['east']};
 assert.ok(fieldPath(fieldMap(opened),opened,{x:18,y:4}).length);
 assert.deepEqual(trackedAdventureLocalTarget({...opened,map:fieldMap(opened)}),{x:18,y:3});
 assert.ok(pendingAdventureQuests(opened).some(q=>q.id==='90'));
 const restored=restoreAdventurePosition(storeAdventurePosition(opened,91),91);
 assert.equal(restored.zaSide90Stage,2);assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.zaMission27Bridges,['east']);
 assert.equal(side90Point({...opened,zaSide90Stage:999}),null);
});
