import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureMap,labMap,lumioseMap,lumioseGardenMap,lumioseSiteMap,lumioseWildMap,lumioseObservationMap,lumioseRoyaleMap,hotelMap,normalizeField,fieldPath,stepField,walkable,findTile,validateAdventurePath,interactionAt,wildAlphaAim,leagueIndex,storeAdventurePosition,restoreAdventurePosition} from '../lib/adventure-world.mjs';
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
test('garden and hotel connect to the plaza and preserve compatible positions',()=>{
 const garden=lumioseGardenMap(),hotel=hotelMap();
 for(const tile of ['Q','K','Y','W'])assert.ok(fieldPath(garden,{x:1,y:8},findTile(garden,tile)).length,`${tile} reachable`);
 for(const tile of ['F','X'])assert.ok(fieldPath(hotel,{x:11,y:13},findTile(hotel,tile)).length,`${tile} reachable`);
 const east=stepField({area:3,district:'lumiose',x:21,y:8},'right');assert.deepEqual([east.district,east.x,east.y],['lumiose-garden',1,8]);
 const west=stepField({area:3,district:'lumiose-garden',x:1,y:8},'left');assert.deepEqual([west.district,west.x,west.y],['lumiose',21,8]);
 const saved=storeAdventurePosition({area:3,district:'lumiose',interior:'hotel',x:11,y:6,facing:'up',regionId:6,districtReturnRegion:1},17);
 assert.deepEqual([saved.x,saved.y,saved.regionId,saved.interior],[5,9,1,null]);const loaded=restoreAdventurePosition(structuredClone(saved),17);assert.deepEqual([loaded.district,loaded.interior,loaded.x,loaded.y,loaded.regionId],['lumiose','hotel',11,6,6]);
 const old=restoreAdventurePosition({...saved,x:5,y:8},18);assert.equal(old.district,null);assert.equal(old.interior,null);assert.deepEqual([old.x,old.y,old.regionId],[5,8,1]);
 const discarded=restoreAdventurePosition({area:3,district:'lumiose-garden',x:5,y:8,regionId:1},18);assert.equal(discarded.district,null);assert.deepEqual([discarded.x,discarded.y],[5,8]);
});
test('construction site is reachable from the garden and returns there safely',()=>{
 const map=lumioseSiteMap();for(const tile of ['D','Z','W'])assert.ok(fieldPath(map,{x:1,y:8},findTile(map,tile)).length,`${tile} reachable`);
 const east=stepField({area:3,district:'lumiose-garden',x:21,y:8},'right');assert.deepEqual([east.district,east.x,east.y],['lumiose-site',1,8]);
 const west=stepField({area:3,district:'lumiose-site',x:1,y:8},'left');assert.deepEqual([west.district,west.x,west.y],['lumiose-garden',21,8]);
 const saved=storeAdventurePosition({area:3,district:'lumiose-site',x:15,y:9,regionId:6,districtReturnRegion:1},12);
 assert.deepEqual([saved.x,saved.y,saved.regionId],[5,9,1]);assert.equal(restoreAdventurePosition(structuredClone(saved),12).district,'lumiose-site');
 const old=restoreAdventurePosition({area:3,district:'lumiose-site',x:5,y:8,regionId:1},13);assert.equal(old.district,null);assert.deepEqual([old.x,old.y],[5,8]);
});
test('wild district opens only after the city investigation and preserves legacy fallback',()=>{
 const map=lumioseWildMap();for(const tile of ['A','g','W'])assert.ok(fieldPath(map,{x:1,y:8},findTile(map,tile)).length,`${tile} reachable`);
 const source={area:3,district:'lumiose-site',x:21,y:8};assert.equal(stepField(source,'right').blocked,true);
 const opened=stepField({...source,cityProject:{stage:5}},'right');assert.deepEqual([opened.district,opened.x,opened.y],['lumiose-wild',1,8]);
 const back=stepField({area:3,district:'lumiose-wild',x:1,y:8},'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-site',21,8]);
 const saved=storeAdventurePosition({area:3,district:'lumiose-wild',x:6,y:8,regionId:6,districtReturnRegion:1},12);assert.deepEqual([saved.x,saved.y,saved.regionId],[5,9,1]);assert.equal(restoreAdventurePosition(structuredClone(saved),12).district,'lumiose-wild');
 const old=restoreAdventurePosition({area:3,district:'lumiose-wild',x:5,y:8,regionId:1},13);assert.equal(old.district,null);assert.deepEqual([old.x,old.y],[5,8]);
});
test('observation garden opens after reporting and returns to the wild district',()=>{
 const map=lumioseObservationMap();for(const tile of ['B','g','W'])assert.ok(fieldPath(map,{x:1,y:8},findTile(map,tile)).length,`${tile} reachable`);
 const gate={area:3,district:'lumiose-wild',x:21,y:8};assert.equal(stepField(gate,'right').blocked,true);
 const next=stepField({...gate,wildStudy:{stage:3}},'right');assert.deepEqual([next.district,next.x,next.y],['lumiose-observation',1,8]);
 const back=stepField({area:3,district:'lumiose-observation',x:1,y:8},'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-wild',21,8]);
 const saved=storeAdventurePosition({area:3,district:'lumiose-observation',x:12,y:8,regionId:6,districtReturnRegion:1},10);assert.deepEqual([saved.x,saved.y,saved.regionId],[5,9,1]);assert.equal(restoreAdventurePosition(structuredClone(saved),10).district,'lumiose-observation');
});

test('provisional Royale zone connects to plaza and keeps the legacy safe position',()=>{
 const map=lumioseRoyaleMap();for(const tile of ['O','U','V','X'])assert.ok(fieldPath(map,{x:11,y:14},findTile(map,tile)).length,`${tile} reachable`);
 const state={area:3,district:'lumiose-royale',x:5,y:11,regionId:6,districtReturnRegion:1,zaRoyaleRank:'Z',zaRoyaleZWins:['royale-z-erica']};
 const saved=storeAdventurePosition(state,19);assert.deepEqual([saved.x,saved.y,saved.regionId],[5,9,1]);const loaded=restoreAdventurePosition(structuredClone(saved),19);assert.deepEqual([loaded.district,loaded.x,loaded.y],['lumiose-royale',5,11]);
 const old=restoreAdventurePosition({...saved,x:5,y:8},20);assert.equal(old.district,null);assert.deepEqual(old.zaRoyaleZWins,['royale-z-erica']);
 const exit=stepField({area:3,district:'lumiose-royale',x:11,y:14},'down');assert.deepEqual([exit.district,exit.x,exit.y],['lumiose',11,10]);
});

test('provisional alpha aiming requires a clear aligned ray within three tiles',()=>{
 const s={area:3,district:'lumiose-wild',x:3,y:2,facing:'down'};
 assert.deepEqual(wildAlphaAim(s),{x:3,y:5,distance:3,back:true});
 assert.equal(wildAlphaAim({...s,y:1}),null);assert.equal(wildAlphaAim({...s,facing:'up'}),null);
 assert.equal(wildAlphaAim({...s,zaWildAlphaSpent:true}),null);assert.equal(wildAlphaAim({...s,facing:'__proto__'}),null);
 assert.deepEqual(wildAlphaAim({...s,x:6,y:5,facing:'left'}),{x:3,y:5,distance:3,back:false});
 const blocked=lumioseWildMap().map(row=>row.split(''));blocked[3][3]='#';assert.equal(wildAlphaAim(s,blocked),null);
 assert.equal(wildAlphaAim({...s,interior:'hotel'}),null);
});
