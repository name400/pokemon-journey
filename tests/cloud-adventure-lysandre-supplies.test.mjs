import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
import {LYSANDRE_SUPPLIES} from '../lib/cloud-adventure/adventure-lysandre-maze.mjs';

test('lab supplies occupy reachable existing floor in their separate wings',()=>{
 const base={area:3,district:'lumiose-lysandre-lab',interior:null,zaLysandreMazeV2:true,zaMission35Stage:4,zaLysandreFloor:1,zaLysandreGreenRouteV4:true,zaLysandreKeyRoomV3:true,zaLysandreAegislashWon:true};
 for(const p of LYSANDRE_SUPPLIES){
  const [x,y]=p.wing==='b-mid'?[3,8]:p.wing==='e'?[4,12]:[11,12],s={...base,zaLysandreWing:p.wing,x,y};
  const map=fieldMap(s),after=fieldMap({...s,zaLysandreB1Supplies:[p.id]});
  assert.equal(map[p.y][p.x],'o');assert.equal(walkable(after[p.y][p.x]),true);assert.ok(fieldPath(map,s,{x:p.x,y:p.y}).length>0);
 }
});
