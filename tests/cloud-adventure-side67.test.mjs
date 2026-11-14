import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldDialogue,fieldPath,walkable,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {SIDE67_SPOTS,side67Available,side67Found} from '../lib/cloud-adventure/adventure-side67.mjs';

test('Coulant conversations preserve all collision cells, old saves and bank access',()=>{
 assert.equal(side67Available({zaMission21Complete:true,zaMission22Complete:true}),false);
 assert.equal(side67Available({zaMission21Complete:true,zaMission22Complete:true,zaMission23Complete:true}),true);
 assert.deepEqual(side67Found({zaSide67Found:['family','family','invalid']}),['family']);
 for(const lower of [false,true]){
  const old={area:3,district:'lumiose-coulant-route',zaCoulantLower:lower,x:3,y:lower?6:4,facing:'right',teamIds:['old'],zaMission21Complete:true,zaMission22Complete:true,zaMission23Complete:true};
  const before=fieldMap({...old,zaMission21Complete:false,zaMission22Complete:false,zaMission23Complete:false});
  const active={...old,zaSide67Started:true},after=fieldMap(active);
  for(let y=0;y<before.length;y++)for(let x=0;x<before[y].length;x++)assert.equal(walkable(before[y][x]),walkable(after[y][x]),`collision ${lower}:${x},${y}`);
  const restored=restoreAdventurePosition(storeAdventurePosition(active,5),5);assert.deepEqual([restored.x,restored.y,restored.zaCoulantLower,restored.teamIds],[3,lower?6:4,lower,['old']]);
  for(const p of SIDE67_SPOTS.filter(p=>p.lower===lower)){
   const player={...active,x:p.x,y:p.y===0?1:p.y===16?15:p.y===4?5:11,facing:p.y===0||p.y===4?'up':'down'};
   assert.equal(after[p.y][p.x],'^');assert.ok(fieldPath(after,lower&&p.y===12?{...old,x:4,y:11}:old,{x:player.x,y:player.y}).length,`${p.id} is reachable`);assert.ok(fieldDialogue(player));
  }
 }
});
