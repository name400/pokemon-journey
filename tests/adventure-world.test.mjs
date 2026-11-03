import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureMap,labMap,lumioseMap,normalizeField,fieldPath,stepField,walkable,findTile,validateAdventurePath,interactionAt,leagueIndex,storeAdventurePosition,restoreAdventurePosition} from '../lib/adventure-world.mjs';
import {TRAINERS} from '../lib/campaign.mjs';
import {habitatLabAction,habitatGuideDialogue,habitatSummary} from '../lib/adventure-story.mjs';

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
test('interior storage keeps a safe legacy position and detects an older client write',()=>{
 const inside={area:0,interior:'lab',x:11,y:6,facing:'up',custom:'preserve'};
 const stored=storeAdventurePosition(inside,7);assert.deepEqual([stored.x,stored.y,stored.facing],[18,5,'down']);assert.deepEqual([inside.x,inside.y],[11,6]);
 const restored=restoreAdventurePosition(structuredClone(stored),7);assert.deepEqual([restored.x,restored.y,restored.facing],[11,6,'up']);
 const oldWrite=restoreAdventurePosition({...stored,x:19,y:5},8);assert.equal(oldWrite.interior,null);assert.deepEqual([oldWrite.x,oldWrite.y],[19,5]);assert.equal(oldWrite.custom,'preserve');
 const samePlaceOldWrite=restoreAdventurePosition(structuredClone(stored),8);assert.equal(samePlaceOldWrite.interior,null);assert.deepEqual([samePlaceOldWrite.x,samePlaceOldWrite.y],[18,5]);
});
test('habitat incident follows the completed survey, badges and designated field',()=>{
 assert.equal(habitatLabAction({badges:['a','b','c']}),null);
 assert.equal(habitatLabAction({citySurvey:{stage:3},badges:['a','b']}),null);
 assert.equal(habitatLabAction({citySurvey:{stage:3},badges:['a','b','c']}).action,'habitatStart');
 assert.equal(habitatGuideDialogue({habitatIncident:{stage:1},area:3,expedition:{id:1}}),null);
 assert.equal(habitatGuideDialogue({habitatIncident:{stage:1},area:3}).action,'habitatClue');
 assert.equal(habitatLabAction({habitatIncident:{stage:3}}).action,'habitatReport');
 assert.match(habitatSummary({habitatIncident:{stage:4}}),/전달/);
});
test('city district has reachable services and stores a compatible port position',()=>{
 const map=lumioseMap(),start={x:11,y:13};
 for(const tile of ['H','M','J','T','Q','X'])assert.ok(fieldPath(map,start,findTile(map,tile)).length,`${tile} reachable`);
 const inside={area:3,district:'lumiose',x:11,y:9,facing:'up',badges:['a']};const saved=storeAdventurePosition(inside,9);
 assert.deepEqual([saved.area,saved.x,saved.y],[3,5,9]);const restored=restoreAdventurePosition(structuredClone(saved),9);assert.deepEqual([restored.x,restored.y,restored.district],[11,9,'lumiose']);
 const oldWrite=restoreAdventurePosition({...saved,x:5,y:8},10);assert.equal(oldWrite.district,null);assert.deepEqual([oldWrite.x,oldWrite.y],[5,8]);assert.deepEqual(oldWrite.badges,['a']);
 const back=stepField({area:3,district:'lumiose',x:11,y:14},'down');assert.deepEqual([back.area,back.x,back.y,back.district,back.transitioned],[3,5,9,null,true]);
});
