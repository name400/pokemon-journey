import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Rouge Sector 5 connects plaza, Sector 7 and Rouge Street with safe saves',()=>{
 const plaza={area:3,district:'lumiose-zone3',interior:null,x:17,y:1,zaEmmaMet:true,teamIds:['kept']};
 const sector=stepField(plaza,'up');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-rouge-sector5',11,15]);
 const s={...plaza,...sector};assert.ok(fieldPath(fieldMap(s),s,{x:11,y:1}).length);assert.ok(fieldPath(fieldMap(s),s,{x:21,y:8}).length);
 assert.equal(stepField(s,'down').district,'lumiose-zone3');
 const north=stepField({...s,x:11,y:1},'up');assert.deepEqual([north.district,north.x,north.y],['lumiose-rouge-sector7',11,15]);
 assert.equal(stepField({...s,...north},'down').district,'lumiose-rouge-sector5');
 const east=stepField({...s,x:21,y:8},'right');assert.deepEqual([east.district,east.x,east.y],['lumiose-rouge-north',1,12]);
 assert.equal(stepField({...s,...east},'left').district,'lumiose-rouge-sector5');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:8},83),83);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaEmmaMet],['lumiose-rouge-sector5',11,8,['kept'],true]);
});
test('Bureau entrance has a safe return for both new and legacy saves',()=>{
 const exterior={area:3,district:'lumiose-rouge-sector5',interior:null,x:5,y:7,facing:'up',teamIds:['kept']};
 assert.equal(fieldDialogue(exterior).action,'enterBureau');
 const interior={...exterior,district:'lumiose-bureau',x:11,y:14,facing:'down',zaBureauReturn:'rouge5'};
 const saved=restoreAdventurePosition(storeAdventurePosition(interior,84),84);
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y,back.zaBureauReturn],['lumiose-rouge-sector5',5,7,null]);
 const legacy=stepField({...saved,zaBureauReturn:undefined},'down');assert.deepEqual([legacy.district,legacy.x,legacy.y],['lumiose-zone3',19,7]);
});
