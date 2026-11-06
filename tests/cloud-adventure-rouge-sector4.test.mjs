import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,restoreAdventurePosition,storeAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Rouge Sector 4 links the boutique and bureau approaches with safe saves',()=>{
 const old={area:3,district:'lumiose-rouge-sector3',interior:null,x:16,y:15,facing:'down',teamIds:['kept'],zaEmmaMet:true};
 const gate=stepField(old,'down');assert.deepEqual([gate.district,gate.x,gate.y],['lumiose-rouge-sector4',1,8]);
 const sector={...old,...gate};assert.ok(fieldPath(fieldMap(sector),sector,{x:21,y:8}).length);
 assert.match(fieldDialogue({...sector,x:11,y:6,facing:'up'}).name,/옹브라제/);
 const s5=stepField({...sector,x:21,y:8},'right');assert.deepEqual([s5.district,s5.x,s5.y],['lumiose-rouge-sector5',1,8]);
 assert.equal(stepField({...sector,...s5},'left').district,'lumiose-rouge-sector4');
 assert.equal(stepField(sector,'left').district,'lumiose-rouge-sector3');
 const saved=restoreAdventurePosition(storeAdventurePosition({...sector,x:11,y:6},67),67);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaEmmaMet,saved.teamIds],['lumiose-rouge-sector4',11,6,true,['kept']]);
 const old5=restoreAdventurePosition(storeAdventurePosition({...old,district:'lumiose-rouge-sector5',x:1,y:8},68),68);assert.deepEqual([old5.x,old5.y],[1,8]);
});
