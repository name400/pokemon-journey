import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Jaune 3 and Jaune Street connect on the ground without changing mission layers or the Zone 8 gate',()=>{
 const city={area:3,district:'lumiose-mission12-jaune3',zaMission12Layer:'ground',interior:null,x:11,y:14,zaMission12WorkerWon:false,zaRoyaleRank:'X',teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(city),city,{x:15,y:15}).length);
 const street=stepField({...city,x:15,y:15},'down');assert.deepEqual([street.district,street.x,street.y],['lumiose-jaune-street',7,1]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...city,...street},124),124);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMission12WorkerWon],['lumiose-jaune-street',7,1,['kept'],false]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:11,y:1}).length);
 assert.equal(stepField({...saved,x:11,y:1},'up').blocked,true);
 const back=stepField(saved,'up');assert.deepEqual([back.district,back.x,back.y,back.zaMission12Layer],['lumiose-mission12-jaune3',15,15,'ground']);
 assert.equal(stepField({...city,x:15,y:15,zaMission12Layer:'roof'},'down').transitioned,undefined);
 assert.equal(fieldDialogue({...city,x:17,y:8,facing:'up'}).action,undefined);
 assert.equal(stepField({...city,x:11,y:15},'down').district,'lumiose-centrico-route');
 const old=restoreAdventurePosition(storeAdventurePosition({...city,x:11,y:15},124),124);assert.deepEqual([old.x,old.y,old.zaMission12Layer],[11,15,'ground']);
});

test('Jaune 3 links Hibernal at ground level while preserving mission and saved positions',()=>{
 const s={area:3,district:'lumiose-mission12-jaune3',zaMission12Layer:'ground',interior:null,x:1,y:8,zaMission12WorkerWon:false,teamIds:['kept'],steps:42};
 assert.ok(fieldPath(fieldMap(s),s,{x:17,y:8}).length);
 assert.equal(fieldDialogue({...s,x:17,y:8,facing:'up'},fieldMap(s)).action,undefined,'the ladder remains locked');
 const next=stepField(s,'left');assert.deepEqual([next.district,next.x,next.y],['lumiose-hibernal-approach',21,14]);
 const avenue={...s,...next};assert.equal(stepField(avenue,'right').district,s.district);
 assert.equal(stepField({...s,zaMission12Layer:'roof'},'left').transitioned,undefined);
 assert.equal(stepField({...s,x:11,y:1},'up').district,'lumiose-jaune-sector4');
 assert.equal(stepField({...s,x:21,y:12},'right').district,'lumiose-jaune-sector5');
 for(const world of [s,avenue]){const restored=restoreAdventurePosition(storeAdventurePosition(world,52),52);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds,restored.steps],[world.district,world.x,world.y,['kept'],42]);}
});
