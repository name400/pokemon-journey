import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {sewerOverview} from '../lib/cloud-adventure/adventure-sewer-map.mjs';

test('sewer overview follows the current saved branch and actual ice bridge state without mutation',()=>{
 for(const [flags,label] of [[{},'하수도 본 통로'],[{zaMission19Inner:true},'문 안쪽 통로'],[{zaSewerIceBranch:true},'서쪽 얼음 분기']]){
  const pos=flags.zaSewerIceBranch?[3,8]:[11,13];const world={area:3,district:'lumiose-sewer',interior:null,x:pos[0],y:pos[1],...flags,teamIds:['kept'],zaMission19Stage:11};world.map=fieldMap(world);const before=structuredClone(world),view=sewerOverview(world);assert.equal(view.layer,label);assert.deepEqual([view.x,view.y],pos);assert.equal(view.width,23);assert.equal(view.height,17);assert.ok(view.cells.some(c=>c.kind==='exit'));assert.deepEqual(world,before);
  const restored=restoreAdventurePosition(storeAdventurePosition(world,12),12);assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual([restored.x,restored.y],pos);
 }
 const w={district:'lumiose-sewer',zaSewerIceBranch:true,x:3,y:8};const before=sewerOverview({...w,map:fieldMap(w)});const after=sewerOverview({...w,zaSewerIceBridge:true,map:fieldMap({...w,zaSewerIceBridge:true})});assert.equal(before.cells.find(c=>c.x===10&&c.y===8).kind,'water');assert.equal(after.cells.find(c=>c.x===10&&c.y===8).kind,'floor');
 assert.equal(sewerOverview({district:'lumiose',map:['.'],x:0,y:0}),null);assert.equal(sewerOverview({district:'lumiose-sewer',interior:'hotel',map:['.'],x:0,y:0}),null);assert.equal(sewerOverview({district:'lumiose-sewer',map:['..','.'],x:0,y:0}),null);
});
