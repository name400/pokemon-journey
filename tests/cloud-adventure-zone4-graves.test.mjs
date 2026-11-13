import test from 'node:test';
import assert from 'node:assert/strict';
import {ZONE4_GRAVES,fieldMap,fieldPath,storeAdventurePosition,restoreAdventurePosition,walkable} from '../lib/cloud-adventure/adventure-world.mjs';

test('cemetery graves keep entrances reachable and old saved positions recover',()=>{
 const base={area:3,district:'lumiose-zone4',interior:null,x:11,y:1,zaBunnelbyQuest:3,teamIds:['kept']},map=fieldMap(base);
 for(const [x,y] of ZONE4_GRAVES){assert.equal(map[y][x],'%');const old=storeAdventurePosition({...base,x,y},126);old.districtPosition.zone4Layout=1;const saved=restoreAdventurePosition(old,126);assert.equal(saved.district,base.district);assert.ok(walkable(map[saved.y][saved.x]));assert.deepEqual(saved.teamIds,['kept']);assert.equal(saved.zaBunnelbyQuest,3);assert.equal(restoreAdventurePosition(old,127).district,null);}
 for(const target of [{x:11,y:15},{x:1,y:10},{x:21,y:8},{x:15,y:1}])assert.ok(fieldPath(map,base,target).length);
 for(const [x,y] of [[6,10],[10,8],[11,8],[13,9]])assert.equal(map[y][x],'g');
});

test('A.Z. memorial appears after story without changing cemetery collisions or saves',async()=>{
 const {fieldDialogue,fieldPath,storeAdventurePosition,restoreAdventurePosition}=await import('../lib/cloud-adventure/adventure-world.mjs');
 const base={area:3,district:'lumiose-zone4',interior:null,x:10,y:4,facing:'left',teamIds:['kept'],coins:321};
 const before=fieldMap(base),after=fieldMap({...base,zaMission38Complete:true});assert.deepEqual(after,before);assert.notEqual(fieldDialogue(base,before)?.name,'A.Z.의 묘 (위치 초안)');
 const world={...base,zaMission38Complete:true,zaZone4RearTmClaimed:true,zaZone4AlphaSpent:true};assert.equal(fieldDialogue(world,after)?.name,'A.Z.의 묘 (위치 초안)');
 const restored=restoreAdventurePosition(storeAdventurePosition(world,19),19);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds,restored.coins,restored.zaZone4RearTmClaimed,restored.zaZone4AlphaSpent],['lumiose-zone4',10,4,['kept'],321,true,true]);assert.equal(fieldDialogue(restored,fieldMap(restored))?.name,'A.Z.의 묘 (위치 초안)');
 for(const start of [{x:11,y:1},{x:1,y:10},{x:5,y:15}])assert.ok(fieldPath(after,start,{x:10,y:4}).length);
});
