import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {side88Available,side88Team} from '../lib/cloud-adventure/adventure-side88.mjs';
import {storyTm} from '../lib/cloud-adventure/adventure-story-tm.mjs';
import {itemName} from '../lib/item-display.mjs';

test('Tesse first ride and destination persist without blocking old positions',()=>{
 const old={area:3,district:'lumiose-magenta-sector8-route',interior:null,x:13,y:14,facing:'up',teamIds:['kept']};assert.equal(fieldMap(old)[14][13],'.');const pending={...old,zaSide88Stage:1,x:13,y:13,facing:'down'};assert.equal(fieldMap(pending)[14][13],'n');assert.equal(fieldDialogue(pending).action,'side88Battle');const saved=restoreAdventurePosition(storeAdventurePosition(pending,12),12);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaSide88Stage,saved.teamIds],[pending.district,13,13,1,['kept']]);assert.equal(fieldDialogue({...pending,zaSide88Stage:2}).action,'side88Reward');assert.equal(restoreAdventurePosition(storeAdventurePosition(old,13),13).x,13);
 const source={area:3,district:'lumiose-zone3',interior:null,x:1,y:5,facing:'left',zaMission30Started:true,zaRoyaleRank:'C'};assert.ok(fieldDialogue(source).actions.some(a=>a.action==='side88Ride'));assert.ok(!fieldDialogue({...source,zaSide88Stage:1}).actions.some(a=>a.action==='side88Ride'));assert.equal(side88Available({zaRoyaleRank:'Y'}),false);
 const team=side88Team();assert.deepEqual(team.map(m=>[m.speciesId,m.level]),[[587,53],[530,53],[428,54]]);assert.equal(storyTm('za-tm047').move,'고속이동');assert.ok(storyTm('za-tm047').learners.includes(25));assert.equal(itemName('za-tm047'),'기술머신 047 · 고속이동');assert.equal(itemName('swiftwing'),'순발력깃털');
});
