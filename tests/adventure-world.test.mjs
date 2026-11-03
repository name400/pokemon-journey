import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureMap,labMap,normalizeField,fieldPath,stepField,walkable,findTile,validateAdventurePath,interactionAt,leagueIndex} from '../lib/adventure-world.mjs';
import {TRAINERS} from '../lib/campaign.mjs';

test('all ten fields have reachable services, trainers, pickups and gated exits',()=>{
 for(let area=0;area<10;area++){
  const map=adventureMap(area),start={x:3,y:8};assert.equal(map.length,17);assert.ok(map.every(row=>row.length===23));
  for(const tile of ['H','M','N','Q','S','I',area===0?'P':area===9?'L':'G']){
   const target=findTile(map,tile);assert.ok(target,`${area} ${tile}`);const path=fieldPath(map,start,target);assert.ok(path.length,`${area}: reachable ${tile}`);
   let s={...start,area,badges:[],league:0};for(const d of path){const p=stepField(s,d);assert.ok(!p.blocked);s={...s,...p};}assert.equal(s.x,target.x);assert.equal(s.y,target.y);
  }
  if(area>0&&area<9){assert.equal(stepField({area,x:21,y:8,badges:[]},'right').blocked,true);assert.equal(stepField({area,x:21,y:8,badges:[TRAINERS[area-1].id]},'right').area,area+1);}
 }
});
test('legacy migration preserves progress and identities, is idempotent and recovers valid landmarks',()=>{
 const s={area:4,x:2,y:2,badges:['brock','misty'],league:0,activeId:'owned',teamIds:['owned'],steps:280,championWins:2,custom:{keep:1}};
 normalizeField(s);assert.deepEqual([s.x,s.y],[3,5]);assert.deepEqual(s.teamIds,['owned']);assert.equal(s.steps,280);assert.deepEqual(s.custom,{keep:1});const before=JSON.stringify(s);normalizeField(s);assert.equal(JSON.stringify(s),before);
 for(let area=0;area<10;area++)for(let x=0;x<15;x++)for(let y=0;y<11;y++){const old={area,x,y};normalizeField(old);assert.ok(walkable(adventureMap(area)[old.y]?.[old.x]));}
 const league={area:9,x:10,y:2};normalizeField(league);assert.deepEqual([league.x,league.y],[17,4]);assert.equal(leagueIndex(league),3);
});
test('water and structures block movement; paths stop at exits and batches are bounded',()=>{
 assert.equal(stepField({area:2,x:7,y:3,badges:[]},'right').blocked,true);
 assert.equal(stepField({area:0,x:3,y:5,badges:[]},'up').blocked,true);
 assert.equal(stepField({area:0,x:1,y:8,badges:[]},'left').blocked,true);
 assert.equal(stepField({area:2,x:1,y:8,badges:[],expedition:{id:1}},'left').area,9);
 assert.equal(interactionAt({area:1,x:18,y:5,facing:'up'}).tile,'G');
 for(const path of [[],['constructor'],['__proto__'],Array(9).fill('up'),[null]])assert.throws(()=>validateAdventurePath(path));
 assert.deepEqual(validateAdventurePath(['up','down']),['up','down']);
});
test('lab has reachable researcher and exit, with collision and a return to the field',()=>{
 const map=labMap(),start={x:11,y:13},researcher=findTile(map,'R'),exit=findTile(map,'X');
 assert.ok(fieldPath(map,start,researcher).length);assert.ok(fieldPath(map,start,exit).length);
 assert.equal(stepField({area:0,interior:'lab',x:4,y:6},'up').blocked,true);
 const back=stepField({area:0,interior:'lab',x:11,y:14},'down');assert.deepEqual([back.area,back.x,back.y,back.interior,back.transitioned],[0,18,5,null,true]);
});
