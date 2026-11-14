import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {side98Available,side98Eligible,side98Spot} from '../lib/cloud-adventure/adventure-side98.mjs';
import {fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {pendingAdventureQuests,trackedAdventureLocalTarget} from '../lib/cloud-adventure/adventure-pending-quests.mjs';

test('Taille accepts the Jumbo form, not an alpha or a merely XL-sized Pokemon',()=>{
 assert.equal(side98Eligible(makeMon(10029,42)),true);
 for(const id of [710,10027,10028,10032])assert.equal(side98Eligible({...makeMon(id,42),adventureAlpha:true}),false);
 assert.equal(side98Eligible({...makeMon(10029,42),adventureAlpha:true}),false);
 assert.equal(side98Eligible({...makeMon(10029,42),adventureAlpha:'future'}),false);
 assert.equal(side98Eligible({...makeMon(10029,42),formId:710}),false);
 const base={area:3,district:'lumiose-north-boulevard',interior:null,x:20,y:6,facing:'right',teamIds:['kept']};assert.equal(side98Available(base),false);
 const begun={...base,zaSide98Stage:1,zaTrackedQuestId:'98'};assert.equal(fieldDialogue(begun).side98,true);assert.ok(pendingAdventureQuests(begun).some(q=>q.id==='98'));
 assert.deepEqual(trackedAdventureLocalTarget({...begun,map:fieldMap(begun)}),{x:21,y:6});assert.equal(side98Spot(begun,{x:21,y:6,tile:'.'}),true);
 const restored=restoreAdventurePosition(storeAdventurePosition(begun,12),12);assert.equal(restored.zaSide98Stage,1);assert.deepEqual(restored.teamIds,['kept']);
 assert.equal(side98Available({...base,zaSide98Stage:99,zaMission35Started:true}),false);
});
