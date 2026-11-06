import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Rouge Sector 3 connects Autumnal Avenue to North Boulevard and restores saves',()=>{
 const road={area:3,district:'lumiose-autumnal-approach',interior:null,x:21,y:8,teamIds:['kept']};
 const sector=stepField(road,'right');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-rouge-sector3',1,8]);
 const s={...road,...sector};assert.ok(fieldPath(fieldMap(s),s,{x:11,y:1}).length);
 assert.equal(stepField(s,'left').district,'lumiose-autumnal-approach');
 const north=stepField({...s,x:11,y:1},'up');assert.equal(north.district,'lumiose-north-boulevard');
 const back=stepField({...s,...north},'up');assert.equal(back.district,'lumiose-rouge-sector3');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:1},55),55);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-rouge-sector3',11,1,['kept']]);
});
