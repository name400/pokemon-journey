import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {SIDE13_WAVES,side13Bramble} from '../lib/cloud-adventure/adventure-side13.mjs';

test('Jaune 7 fountain courtyard remains reachable through every quest wave',()=>{
 const base={area:3,district:'lumiose-jaune-sector7',interior:null,x:4,y:1,teamIds:['kept'],steps:42,zaRoyaleRank:'W'};
 for(const stage of [undefined,1,2,3,4]){
  const s={...base,...(stage===undefined?{}:{zaSide13Stage:stage})},map=fieldMap(s);
  assert.equal(map[4][4],'#','fountain remains in place');assert.equal(map[5][5],'#','artist remains in place');
  assert.ok(fieldPath(map,s,{x:5,y:3}).length,`courtyard access at stage ${stage}`);
  if(SIDE13_WAVES[stage])for(const [x,y] of SIDE13_WAVES[stage]){assert.equal(map[y][x],'r');assert.ok(side13Bramble(s,{x,y,tile:'r'})>=0);}
  assert.match(fieldDialogue({...s,x:5,y:6,facing:'up'},map)?.name||'',/^Croquis/);
 }
 const s={...base,x:5,y:3,zaSide13Stage:2,zaSide13ClearedV1:[0]},restored=restoreAdventurePosition(storeAdventurePosition(s,53),53);
 assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds,restored.zaSide13Stage,restored.zaSide13ClearedV1],[s.district,5,3,['kept'],2,[0]]);
});
