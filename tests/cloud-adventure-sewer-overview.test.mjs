import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,storeAdventurePosition,restoreAdventurePosition,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
import {sewerOverview} from '../lib/cloud-adventure/adventure-sewer-map.mjs';

test('sewer overview follows the current saved branch and actual ice bridge state without mutation',()=>{
 for(const [flags,label] of [[{},'하수도 본 통로'],[{zaMission19Inner:true},'문 안쪽 통로'],[{zaSewerIceBranch:true},'서쪽 얼음 분기']]){
  const pos=flags.zaSewerIceBranch?[3,8]:[11,13];const world={area:3,district:'lumiose-sewer',interior:null,x:pos[0],y:pos[1],...flags,teamIds:['kept'],zaMission19Stage:11};world.map=fieldMap(world);const before=structuredClone(world),view=sewerOverview(world);assert.equal(view.layer,label);assert.deepEqual([view.x,view.y],pos);assert.equal(view.width,23);assert.equal(view.height,17);assert.ok(view.cells.some(c=>c.kind==='exit'));assert.deepEqual(world,before);
  const restored=restoreAdventurePosition(storeAdventurePosition(world,12),12);assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual([restored.x,restored.y],pos);
 }
 const w={district:'lumiose-sewer',zaSewerIceBranch:true,x:3,y:8};const before=sewerOverview({...w,map:fieldMap(w)});const after=sewerOverview({...w,zaSewerIceBridge:true,map:fieldMap({...w,zaSewerIceBridge:true})});assert.equal(before.cells.find(c=>c.x===10&&c.y===8).kind,'water');assert.equal(after.cells.find(c=>c.x===10&&c.y===8).kind,'floor');
 assert.equal(sewerOverview({district:'lumiose',map:['.'],x:0,y:0}),null);assert.equal(sewerOverview({district:'lumiose-sewer',interior:'hotel',map:['.'],x:0,y:0}),null);assert.equal(sewerOverview({district:'lumiose-sewer',map:['..','.'],x:0,y:0}),null);
});


test('new mission 19 investigation groups four fixtures without changing walking or old saves',()=>{
 const base={area:3,district:'lumiose-sewer',zaMission19Stage:11,zaMission19ChandelureStep:2,x:11,y:4,teamIds:['existing']};
 const legacy=fieldMap(base),fresh=fieldMap({...base,zaMission19InspectRoomV1:true});
 for(const [tile,x,y] of [['a',9,1],['b',13,1],['e',9,3],['d',13,3]])assert.equal(fresh[y][x],tile);
 for(const [tile,x,y] of [['a',6,5],['b',16,5],['e',6,9],['d',16,9]])assert.equal(legacy[y][x],tile);
 for(let y=0;y<legacy.length;y++)for(let x=0;x<legacy[y].length;x++)assert.equal(walkable(fresh[y][x]),walkable(legacy[y][x]),`collision ${x},${y}`);
 const saved=storeAdventurePosition(base,17),restored=restoreAdventurePosition(saved,17);assert.deepEqual(restored.teamIds,['existing']);assert.equal(restored.zaMission19InspectRoomV1,undefined);assert.deepEqual([restored.x,restored.y],[11,4]);
});
