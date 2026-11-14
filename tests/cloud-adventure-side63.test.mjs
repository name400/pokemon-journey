import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {side63Available,side63Eligible,side63Spot} from '../lib/cloud-adventure/adventure-side63.mjs';
import {fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {pendingAdventureQuests,trackedAdventureLocalTarget} from '../lib/cloud-adventure/adventure-pending-quests.mjs';

test('Lugo accepts verified alpha Gogoat without inferring ordinary XL sizes',()=>{
 const alpha={...makeMon(673,44),adventureAlpha:true};
 assert.equal(side63Eligible(alpha),true);
 for(const mon of [makeMon(673,44),{...makeMon(672,44),adventureAlpha:true},{...alpha,adventureAlpha:'future'},{...alpha,speciesId:672}])assert.equal(side63Eligible(mon),false);
 const base={area:3,district:'lumiose-magenta-sector8-route',interior:null,x:4,y:6,facing:'up',teamIds:['kept']};
 assert.equal(side63Available(base),false);
 assert.equal(side63Available({...base,zaMission20Stage:5}),true);
 assert.equal(side63Available({...base,zaMission20Stage:5,zaSide63Stage:99}),false);
 const begun={...base,zaSide63Stage:1,zaTrackedQuestId:'63'};
 assert.equal(fieldDialogue(begun).side63,true);
 assert.ok(pendingAdventureQuests(begun).some(q=>q.id==='63'));
 assert.deepEqual(trackedAdventureLocalTarget({...begun,map:fieldMap(begun)}),{x:4,y:5});
 assert.equal(side63Spot(begun,{x:4,y:5,tile:'#'}),true);
 const restored=restoreAdventurePosition(storeAdventurePosition(begun,12),12);
 assert.equal(restored.zaSide63Stage,1);assert.deepEqual(restored.teamIds,['kept']);
});

test('deferred rewards track only a valid explicitly saved remainder',()=>{
 const s={area:3,district:'lumiose-magenta-sector8-route',interior:null,x:4,y:6,facing:'up',zaSide63Stage:2,zaTrackedQuestId:'63-reward',zaSide63RewardPendingV1:{carbos:7}};
 assert.equal(fieldDialogue(s).action,'side63Claim');assert.ok(pendingAdventureQuests(s).some(q=>q.id==='63-reward'));
 assert.deepEqual(trackedAdventureLocalTarget({...s,map:fieldMap(s)}),{x:4,y:5});
 for(const value of [undefined,{carbos:11},{carbos:1,future:true}]){const old={...s,zaSide63RewardPendingV1:value};assert.equal(pendingAdventureQuests(old).some(q=>q.id==='63-reward'),false);assert.equal(trackedAdventureLocalTarget({...old,map:fieldMap(old)}),null);}
});
