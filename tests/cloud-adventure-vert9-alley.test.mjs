import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,walkable,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Vert 9 alley items keep the original walkway and old saved positions',()=>{
 const s={area:3,district:'lumiose-vert-sector9',interior:null,x:10,y:4,facing:'up',teamIds:['kept']},before=fieldMap({...s,zaVert9AlleyItems:['alley-repeat','alley-super']}),after=fieldMap(s);
 for(let y=0;y<17;y++)for(let x=0;x<23;x++)assert.equal(walkable(after[y][x]),walkable(before[y][x]),`${x},${y}`);
 assert.equal(after[3][10],'i');assert.equal(after[5][12],'j');assert.equal(fieldDialogue(s).action,'vert9AlleyItem-alley-repeat');
 const old={...s,x:10,y:3,zaVert9AlleyItems:['future']},restored=restoreAdventurePosition(storeAdventurePosition(old,7),7);assert.deepEqual([restored.x,restored.y,restored.teamIds,restored.zaVert9AlleyItems],[10,3,['kept'],['future']]);
});
