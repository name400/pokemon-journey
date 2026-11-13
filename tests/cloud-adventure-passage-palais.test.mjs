import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Palais arcade connects both roads and preserves saved position',()=>{
 const street={area:3,district:'lumiose-rouge-north',interior:null,x:1,y:10,teamIds:['kept']};
 const entered=stepField(street,'left');assert.deepEqual([entered.district,entered.x,entered.y],['lumiose-passage-palais',11,15]);
 const s={...street,...entered};assert.ok(fieldPath(fieldMap(s),s,{x:11,y:1}).length);
 assert.equal(stepField(s,'down').district,'lumiose-rouge-north');
 const north=stepField({...s,x:11,y:1},'up');assert.equal(north.district,'lumiose-north-boulevard');
 assert.equal(stepField({...s,...north},'up').district,'lumiose-passage-palais');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:8},63),63);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-passage-palais',11,8,['kept']]);
 assert.equal(fieldDialogue({...s,x:15,y:10,facing:'right'}).name,'The Usual');
 assert.equal(fieldDialogue({...s,x:7,y:13,facing:'left'}).name,'Marquage');
});

test('Palais Tracie uses a previously blocked tile and retains the legacy endpoint',async()=>{
 const {tracieAt}=await import('../lib/cloud-adventure/adventure-passage-palais.mjs');
 const s={area:3,district:'lumiose-passage-palais',interior:null,x:7,y:8,facing:'left',zaEmmaMet:true};
 assert.equal(fieldMap(s)[8][6],'v');assert.equal(fieldDialogue(s).action,'startPikachuTrade');assert.equal(fieldDialogue({...s,zaTradeQuest:1}).tracie,true);
 assert.ok(fieldPath(fieldMap(s),{...s,x:11,y:15},{x:7,y:8}).length);
 assert.equal(tracieAt(s,{x:6,y:8,tile:'v'}),true);assert.equal(tracieAt(s,{x:6,y:9,tile:'v'}),false);
 assert.equal(tracieAt({...s,interior:'hotel'},{x:6,y:8,tile:'v'}),false);
 assert.equal(tracieAt({...s,district:'lumiose-zone3'},{x:11,y:4,tile:'v'}),true);
});
