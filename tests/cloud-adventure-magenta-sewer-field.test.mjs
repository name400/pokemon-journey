import test from 'node:test';
import assert from 'node:assert/strict';
import {predictCloudStep} from '../lib/cloud-adventure/adventure-prediction.mjs';
import {magentaSewerMonsters,magentaSewerTarget,stepMagentaSewerMonsters,fieldMap,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Magenta sewer visible creatures roam, respect obstacles and restore positions',()=>{
 const s={area:3,district:'lumiose-crystal-sewer',interior:null,x:11,y:14,steps:3,zaMission20Stage:9,teamIds:['owned'],activeId:'owned'};
 assert.deepEqual(magentaSewerMonsters(s,'day').map(p=>p.id),['ariados','inkay','skrelp']);assert.equal(magentaSewerMonsters(s,'night').length,4);
 const before=magentaSewerMonsters(s,'night');stepMagentaSewerMonsters(s,'night');const after=magentaSewerMonsters(s,'night');assert.ok(after.some((p,i)=>p.x!==before[i].x||p.y!==before[i].y));const map=fieldMap(s);for(const p of after)assert.ok(['.','g'].includes(map[p.y][p.x]));
 const restored=restoreAdventurePosition(storeAdventurePosition(s,3),3);assert.deepEqual(magentaSewerMonsters(restored,'night'),after);assert.equal(restored.zaMission20Stage,9);assert.deepEqual(restored.teamIds,['owned']);
 const p=after[0];assert.equal(magentaSewerTarget({...restored,x:p.x,y:p.y+1},'night',p.id)?.distance,1);assert.equal(magentaSewerTarget({...restored,x:11,y:14},'night',p.id),null);assert.equal(magentaSewerMonsters({...restored,zaMagentaSewerSpent:{ariados:true}},'night').some(m=>m.id==='ariados'),false);
});


test('prediction waits for the server near sewer field Pokémon, including nocturnal ones',()=>{
 const s={area:3,district:'lumiose-crystal-sewer',interior:null,x:18,y:13,zaMission20Stage:9};
 assert.equal(predictCloudStep(s,'up'),null);
 assert.ok(predictCloudStep({...s,zaMagentaSewerSpent:{noibat:true}},'up'));
});
