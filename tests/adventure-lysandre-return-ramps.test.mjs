import test from 'node:test';
import assert from 'node:assert/strict';
import {lysandreMazeMap} from '../lib/cloud-adventure/adventure-lysandre-maze.mjs';
import {fieldPath,walkable} from '../lib/cloud-adventure/adventure-world.mjs';

test('A and B keycards open a return corridor without allowing a puzzle bypass',()=>{
 for(const wing of ['a','b']){
  const base={area:3,district:'lumiose-lysandre-lab',zaMission35Stage:4,zaLysandreMazeV2:true,zaLysandreWing:wing,zaLysandrePowers:['a','b'],zaLysandreCards:wing==='b'?['a','future-card']:['future-card'],x:15,y:11};
  const before=lysandreMazeMap(base);for(let x=10;x<=12;x++)assert.equal(before[11][x],'#');assert.equal(fieldPath(before,base,{x:8,y:11}).length,0);
  const afterState={...base,zaLysandreCards:[...base.zaLysandreCards,wing]},after=lysandreMazeMap(afterState);for(let x=10;x<=12;x++)assert.ok(walkable(after[11][x]));assert.ok(fieldPath(after,afterState,{x:8,y:11}).length);assert.ok(fieldPath(after,{...afterState,x:8,y:11},{x:15,y:11}).length);
  for(let y=0;y<17;y++)for(let x=0;x<23;x++)if(!(y===11&&x>=10&&x<=12))assert.equal(after[y][x],before[y][x]);
 }
 const unknown={zaLysandreWing:'a',zaLysandreCards:{version:2,keep:'a'}};assert.equal(lysandreMazeMap(unknown)[11][11],'#');
});

test('vault power panel stays walkable for pre-existing key-room positions',()=>{
 const state={zaLysandreWing:'e-vault',zaLysandreKeyRoomV3:true,zaLysandreAegislashWon:true,zaLysandreElevatorKey:false,x:8,y:8};const map=lysandreMazeMap(state);assert.equal(map[8][8],'z');assert.ok(walkable(map[8][8]));assert.ok(fieldPath(map,state,{x:9,y:8}).length);
});
