import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Mission 22 ice bridge leads to a shared encounter and retains saves',()=>{
 const street={area:3,district:'lumiose-bleu-sector5',interior:null,x:10,y:5,facing:'up',zaMission20Stage:5,teamIds:['kept']};
 assert.equal(fieldDialogue(street).action,'mission22TunnelEnter');
 const tunnel={...street,district:'lumiose-mission22-tunnel',x:11,y:8};assert.equal(stepField(tunnel,'up').blocked,true);assert.equal(fieldDialogue(tunnel).action,'mission22IceBridge');
 const open={...tunnel,zaMission22IceBridge:true};assert.ok(fieldPath(fieldMap(open),open,{x:17,y:5}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...open,x:17,y:5},91),91);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaMission22IceBridge,saved.teamIds],['lumiose-mission22-tunnel',17,5,true,['kept']]);assert.equal(fieldDialogue(saved).action,'mission20CaseBattle');
 assert.equal(stepField({...open,x:11,y:14},'down').district,'lumiose-bleu-sector5');
});
test('Legacy sewer offers both side mission and Mission 22 when they overlap',()=>{
 const s={area:3,district:'lumiose-sewer',interior:null,x:17,y:5,facing:'up',zaBleuSewerOpened:true,zaMission20Stage:5};
 assert.deepEqual(fieldDialogue(s).actions.map(a=>a.action),['mission57Battle','mission20CaseBattle']);
 assert.deepEqual(fieldDialogue({...s,zaMission22Complete:true,zaMission22RewardPending:true}).actions.map(a=>a.action),['mission57Battle','mission20ClaimStone']);
 assert.equal(fieldDialogue({...s,zaMission20Stage:4}).action,'mission57Battle');
});
