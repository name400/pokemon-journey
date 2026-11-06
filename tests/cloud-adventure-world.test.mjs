import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureMap,labMap,lumioseMap,lumioseVernalMap,lumioseCentricoRouteMap,lumioseRooftopMap,lumioseZone1Map,lumioseZone2Map,zone2IslandAlphaTarget,lumioseZone3Map,lumioseZone3TowerMap,lumioseRougeNorthMap,fieldMap,lumioseZone4Map,lumioseBureauMap,lumioseGardenMap,lumioseSiteMap,lumioseWildMap,lumioseObservationMap,lumioseRoyaleMap,hotelMap,normalizeField,fieldPath,stepField,walkable,findTile,validateAdventurePath,interactionAt,fieldDialogue,wildAlphaAim,wildAlphaTarget,stepWildAlphaPursuit,wildAlphaPosition,leagueIndex,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {TRAINERS} from '../lib/campaign.mjs';
import {habitatLabAction,habitatGuideDialogue,habitatSummary} from '../lib/cloud-adventure/adventure-story.mjs';

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

test('targeted alpha aiming accepts diagonal positions and rejects blocked rays',()=>{
 const s={area:3,district:'lumiose-wild',x:1,y:3,facing:'up'};
 assert.deepEqual(wildAlphaTarget(s),{x:3,y:5,distance:2,back:true});
 assert.deepEqual(wildAlphaTarget({...s,x:5,y:5}),{x:3,y:5,distance:2,back:false});
 assert.equal(wildAlphaTarget({...s,x:1,y:1}),null);assert.equal(wildAlphaTarget({...s,zaWildAlphaSpent:true}),null);
 const blocked=lumioseWildMap().map(row=>row.split(''));blocked[4][2]='#';assert.equal(wildAlphaTarget(s,blocked),null);
});

test('alert alpha pursues over saved tiles and aiming follows its new direction',()=>{
 const s={area:3,district:'lumiose-wild',x:1,y:5,zaWildAlphaAlert:true};
 assert.equal(stepWildAlphaPursuit(s),true);assert.deepEqual(s.zaWildAlphaPosition,{x:2,y:5,facing:'left'});
 assert.equal(stepWildAlphaPursuit(s),false);assert.deepEqual(wildAlphaPosition({zaWildAlphaPosition:{x:99,y:5,facing:'left'}}),{x:3,y:5,facing:'down'});
 const target=wildAlphaTarget({area:3,district:'lumiose-wild',x:4,y:5,zaWildAlphaPosition:{x:2,y:5,facing:'left'}});
 assert.deepEqual(target,{x:2,y:5,distance:2,back:true});
});

test('provisional Wild Zone 1 connects to plaza and preserves safe stored location',()=>{
 const map=lumioseZone1Map();assert.ok(fieldPath(map,{x:21,y:8},findTile(map,'g')).length);
 const west=stepField({area:3,district:'lumiose',x:1,y:8},'left');assert.equal(west.district,'lumiose-vernal');const enter=stepField({area:3,district:'lumiose',x:8,y:14},'down');assert.deepEqual([enter.district,enter.x,enter.y],['lumiose-zone1',21,8]);
 const leave=stepField({area:3,district:'lumiose-zone1',x:21,y:8},'right');assert.deepEqual([leave.district,leave.x,leave.y],['lumiose',8,14]);
 const state={area:3,district:'lumiose-zone1',x:17,y:8,regionId:6,districtReturnRegion:1,adventureDexSpecies:[13]};
 const saved=storeAdventurePosition(state,8);assert.deepEqual([saved.x,saved.y,saved.regionId],[5,9,1]);const loaded=restoreAdventurePosition(structuredClone(saved),8);assert.deepEqual([loaded.district,loaded.x,loaded.y],['lumiose-zone1',17,8]);assert.deepEqual(loaded.adventureDexSpecies,[13]);
});

test('zone one west links Floral Avenue and zone two preserves its location',()=>{
 const source={area:3,district:'lumiose-zone1',x:1,y:8};const street=stepField(source,'left');assert.deepEqual([street.district,street.x,street.y],['lumiose-floral',21,8]);assert.equal(stepField({...source,zaRoyaleRank:'Y'},'left').district,'lumiose-floral');const returnZone=stepField({area:3,district:'lumiose-floral',x:21,y:8},'right');assert.deepEqual([returnZone.district,returnZone.x,returnZone.y],['lumiose-zone1',1,8]);
 assert.ok(fieldPath(lumioseZone2Map(),{x:21,y:8},findTile(lumioseZone2Map(),'g')).length);
 const back=stepField({area:3,district:'lumiose-zone2',x:11,y:15},'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-vert-plaza',21,8]);const gate={area:3,district:'lumiose-vert-plaza',x:21,y:8};assert.deepEqual([stepField(gate,'right').district,stepField(gate,'right').x,stepField(gate,'right').y],['lumiose-zone2',11,15]);assert.equal(lumioseZone2Map()[10][14],'~');
 const saved=storeAdventurePosition({area:3,district:'lumiose-zone2',x:17,y:8,regionId:6,districtReturnRegion:1},9),loaded=restoreAdventurePosition(structuredClone(saved),9);assert.deepEqual([loaded.district,loaded.x,loaded.y],['lumiose-zone2',17,8]);
 const previous=storeAdventurePosition({area:3,district:'lumiose-zone2',x:15,y:8,regionId:6,districtReturnRegion:1,custom:'keep'},9);delete previous.districtPosition.zone2Layout;const migrated=restoreAdventurePosition(previous,9);assert.equal(migrated.district,'lumiose-zone2');assert.equal(migrated.custom,'keep');assert.ok(walkable(lumioseZone2Map()[migrated.y][migrated.x]));assert.notDeepEqual([migrated.x,migrated.y],[15,8]);
 const oldBridge=storeAdventurePosition({area:3,district:'lumiose-zone2',x:11,y:10,regionId:6,districtReturnRegion:1,teamIds:['kept'],steps:42},9);oldBridge.districtPosition.zone2Layout=2;const bridgeRestored=restoreAdventurePosition(structuredClone(oldBridge),9);assert.equal(bridgeRestored.district,'lumiose-zone2');assert.ok(walkable(lumioseZone2Map()[bridgeRestored.y][bridgeRestored.x]));assert.deepEqual(bridgeRestored.teamIds,['kept']);assert.equal(bridgeRestored.steps,42);
 const conflict=restoreAdventurePosition(structuredClone(oldBridge),10);assert.equal(conflict.district,null);
 for(const [oldX,newX] of [[0,1],[22,21]]){const old=storeAdventurePosition({area:3,district:'lumiose-zone2',x:oldX,y:8,regionId:6,districtReturnRegion:1},9),restored=restoreAdventurePosition(old,9);assert.deepEqual([restored.district,restored.x,restored.y],['lumiose-zone2',newX,8]);}
});

test('zone two northwest stairs preserve movement and saved positions',()=>{
 const map=lumioseZone2Map();for(let y=1;y<=3;y++)assert.equal(map[y][4],':');
 const initial={area:3,district:'lumiose-zone2',x:4,y:1,regionId:6,districtReturnRegion:1,teamIds:['kept'],steps:12};
 assert.deepEqual([stepField(initial,'down').x,stepField(initial,'down').y],[4,2]);
 assert.equal(stepField(initial,'up').district,'lumiose-vert2');
 const restored=restoreAdventurePosition(storeAdventurePosition(initial,14),14);
 assert.deepEqual([restored.district,restored.x,restored.y],['lumiose-zone2',4,1]);assert.deepEqual(restored.teamIds,['kept']);assert.equal(restored.steps,12);
});

test('Café Woof terrace keeps the existing café and saved routes accessible',()=>{
 const map=lumioseVernalMap();assert.equal(map[5][12],'q');
 for(let y=6;y<=8;y++)for(let x=10;x<=14;x++)assert.equal(map[y][x],',');
 assert.ok(fieldPath(map,{x:1,y:8},{x:12,y:6}).length);
 assert.ok(fieldPath(map,{x:12,y:6},{x:21,y:8}).length);
 const s={area:3,district:'lumiose-vernal',x:12,y:6,facing:'up',teamIds:['keep'],steps:42,regionId:6,districtReturnRegion:1};
 assert.equal(interactionAt(s).tile,'q');
 const restored=restoreAdventurePosition(storeAdventurePosition(s,11),11);
 assert.deepEqual([restored.district,restored.x,restored.y],['lumiose-vernal',12,6]);assert.deepEqual(restored.teamIds,['keep']);assert.equal(restored.steps,42);
});

test('zone two replaces the southeast crossing and safely restores its old saves',()=>{
 for(const y of [9,10,11]){const old=storeAdventurePosition({area:3,district:'lumiose-zone2',x:14,y,regionId:6,districtReturnRegion:1,teamIds:['keep'],steps:42},6);old.districtPosition.zone2Layout=4;const restored=restoreAdventurePosition(old,6);assert.equal(restored.district,'lumiose-zone2');assert.ok(walkable(lumioseZone2Map()[restored.y][restored.x]));assert.deepEqual(restored.teamIds,['keep']);assert.equal(restored.steps,42);}
 const conflict=storeAdventurePosition({area:3,district:'lumiose-zone2',x:14,y:10,regionId:6,districtReturnRegion:1,teamIds:['keep']},6);conflict.districtPosition.zone2Layout=4;assert.equal(restoreAdventurePosition(conflict,7).district,null);
 const map=lumioseZone2Map();assert.equal(map[14][10],'g');assert.ok(fieldPath(map,{x:11,y:15},{x:10,y:14}).length);assert.equal(stepField({area:3,district:'lumiose-zone2',x:11,y:15},'up').blocked,undefined);
 const old=storeAdventurePosition({area:3,district:'lumiose-zone2',x:10,y:14,regionId:6,districtReturnRegion:1,teamIds:['keep']},6);old.districtPosition.zone2Layout=3;const restored=restoreAdventurePosition(old,6);assert.deepEqual([restored.district,restored.x,restored.y],['lumiose-zone2',10,14]);assert.deepEqual(restored.teamIds,['keep']);
});

test('zone two northwest bridge connects its bank and the island',()=>{
 const map=lumioseZone2Map();for(let y=5;y<=7;y++)assert.equal(map[y][8],'=');assert.equal(map[4][8],';');assert.ok(fieldPath(map,{x:4,y:3},{x:8,y:4}).length);
 let s={area:3,district:'lumiose-zone2',x:8,y:4};for(const direction of ['down','down','down','right']){const step=stepField(s,direction);assert.equal(step.blocked,undefined);s={...s,...step};}assert.deepEqual([s.x,s.y],[9,7]);
});

test('zone two south entrance has a western crossing to the central island',()=>{
 const map=lumioseZone2Map();
 for(let y=9;y<=12;y++)assert.equal(map[y][8],'=');
 let s={area:3,district:'lumiose-zone2',x:8,y:13,teamIds:['kept'],steps:42};
 for(const direction of ['up','up','up','up','right','right']){const step=stepField(s,direction);assert.equal(step.blocked,undefined);s={...s,...step};}
 assert.deepEqual([s.x,s.y],[10,9]);
 assert.ok(fieldPath(map,{x:11,y:15},{x:8,y:13}).length);
 const saved=storeAdventurePosition(s,9),restored=restoreAdventurePosition(structuredClone(saved),9);
 assert.deepEqual([restored.x,restored.y],[10,9]);assert.deepEqual(restored.teamIds,['kept']);assert.equal(restored.steps,42);
});

test('zone two northeastern crossing joins the outer bank to the island without invalidating old positions',()=>{
 const map=lumioseZone2Map();assert.equal(map[5][14],'=');assert.equal(map[6][14],'=');let s={area:3,district:'lumiose-zone2',x:14,y:4};
 for(const direction of ['down','down','down','left']){const step=stepField(s,direction);assert.equal(step.blocked,undefined);s={...s,...step};}assert.deepEqual([s.x,s.y],[13,7]);
 const old=storeAdventurePosition({area:3,district:'lumiose-zone2',x:14,y:4,regionId:6,districtReturnRegion:1,teamIds:['keep'],steps:42},7);old.districtPosition.zone2Layout=3;const restored=restoreAdventurePosition(old,7);assert.deepEqual([restored.x,restored.y],[14,4]);assert.deepEqual(restored.teamIds,['keep']);assert.equal(restored.steps,42);
});

test('zone two eastern island is gated by a rock and old locations return to the accessible bank',()=>{
 const base={area:3,district:'lumiose-zone2',x:18,y:12,facing:'right',regionId:6,districtReturnRegion:1,teamIds:['keep'],steps:42};
 assert.equal(stepField(base,'right').blocked,true);assert.equal(interactionAt(base).tile,'r');
 let s={...base,zaZone2RockCleared:true};for(const d of ['right','right','up']){const p=stepField(s,d);assert.equal(p.blocked,undefined);s={...s,...p};}assert.deepEqual([s.x,s.y],[20,11]);
 const before=storeAdventurePosition({...base,x:20,y:11},17);before.districtPosition.zone2Layout=3;const restored=restoreAdventurePosition(structuredClone(before),17);assert.deepEqual([restored.district,restored.x,restored.y],['lumiose-zone2',18,12]);assert.deepEqual(restored.teamIds,['keep']);assert.equal(restored.steps,42);assert.equal(restoreAdventurePosition(structuredClone(before),18).district,null);
 const after=storeAdventurePosition(s,20),loaded=restoreAdventurePosition(after,20);assert.deepEqual([loaded.x,loaded.y],[20,11]);assert.equal(loaded.zaZone2RockCleared,true);
});

test('zone two eastern bank connects through the northeast side and old shore saves remain safe',()=>{
 const map=lumioseZone2Map(),shore=[...[8,9,10,11,12,13].map(y=>[16,y]),[17,13],[17,14],[18,14],[18,15]];for(const [x,y] of shore)assert.equal(map[y][x],'~');
 const route=fieldPath(map,{x:11,y:8},{x:18,y:12});assert.ok(route.length);
 let s={area:3,district:'lumiose-zone2',x:11,y:8};let crossed=false;
 for(const d of route){const step=stepField(s,d);assert.equal(step.blocked,undefined);s={...s,...step};if(s.x===14&&s.y>=5&&s.y<=7)crossed=true;}
 assert.equal(crossed,true);assert.equal(interactionAt({...s,facing:'right'}).tile,'r');assert.equal(stepField(s,'right').blocked,true);
 for(const [x,y] of shore){const old=storeAdventurePosition({area:3,district:'lumiose-zone2',x,y,regionId:6,districtReturnRegion:1,teamIds:['kept'],steps:42},9);old.districtPosition.zone2Layout=5;const restored=restoreAdventurePosition(old,9);assert.equal(restored.district,'lumiose-zone2');assert.ok(walkable(map[restored.y][restored.x]));assert.deepEqual(restored.teamIds,['kept']);assert.equal(restored.steps,42);}
 const stale=storeAdventurePosition({area:3,district:'lumiose-zone2',x:16,y:10,regionId:6,districtReturnRegion:1},9);stale.districtPosition.zone2Layout=5;assert.equal(restoreAdventurePosition(stale,10).district,null);
});

test('zone two island alpha requires the route and Emma requests and preserves existing saves',()=>{
 const base={district:'lumiose-zone2',x:20,y:12,zaZone2RockCleared:true,zaBunnelbyQuest:3,zaTradeQuest:2,zaSableyeQuest:3};assert.equal(zone2IslandAlphaTarget(base).distance,1);assert.equal(zone2IslandAlphaTarget({...base,x:17,y:8}),null);assert.equal(zone2IslandAlphaTarget({...base,zaZone2AlphaSpent:true}),null);assert.equal(lumioseZone2Map(base)[11][20],'p');assert.equal(lumioseZone2Map({...base,zaSableyeQuest:2})[11][20],'g');assert.equal(lumioseZone2Map({...base,zaZone2RockCleared:false})[11][20],'g');assert.equal(lumioseZone2Map({...base,zaZone2AlphaSpent:true})[11][20],'g');
});

test('Vernal waterside retains cafe and plaza access and safely restores old saves',()=>{
 const map=lumioseVernalMap();assert.equal(map[5][18],'~');assert.ok(fieldPath(map,{x:12,y:6},findTile(map,'E')).length);assert.ok(fieldPath(map,{x:1,y:8},findTile(map,'q')).length);
 assert.equal(stepField({area:3,district:'lumiose-vernal',x:18,y:7},'up').blocked,true);
 const old=storeAdventurePosition({area:3,district:'lumiose-vernal',x:18,y:5,regionId:6,districtReturnRegion:1,teamIds:['kept'],steps:42},17);delete old.districtPosition.vernalLayout;
 const restored=restoreAdventurePosition(structuredClone(old),17);assert.equal(restored.district,'lumiose-vernal');assert.ok(walkable(map[restored.y][restored.x]));assert.deepEqual(restored.teamIds,['kept']);assert.equal(restored.steps,42);
 assert.equal(restoreAdventurePosition(structuredClone(old),18).district,null);
 const safe=storeAdventurePosition({area:3,district:'lumiose-vernal',x:12,y:6,regionId:6,districtReturnRegion:1},17);const loaded=restoreAdventurePosition(safe,17);assert.deepEqual([loaded.x,loaded.y],[12,6]);
});


test('Rouge Plaza draft has a round garden and a reachable northern healing stall',()=>{
 const map=lumioseZone3Map();assert.equal(map[2][11],'H');assert.equal(map[8][11],'g');assert.equal(map[7][7],'i');assert.equal(map[4][8],'k');assert.notEqual(map[4][8],'g');assert.ok(fieldPath(map,{x:11,y:15},{x:11,y:2}).length);
 const old=storeAdventurePosition({area:3,district:'lumiose-zone3',x:8,y:4,regionId:6,districtReturnRegion:1,teamIds:['kept'],steps:42},19);const loaded=restoreAdventurePosition(old,19);assert.deepEqual([loaded.x,loaded.y],[8,4]);assert.deepEqual(loaded.teamIds,['kept']);assert.equal(loaded.steps,42);
});

test('Rouge Plaza tower ladder has a saved upper floor and preserves old ground positions',()=>{
 const ground={area:3,district:'lumiose-zone3',x:7,y:6,facing:'down',regionId:6,districtReturnRegion:1,teamIds:['kept'],steps:42};assert.equal(interactionAt(ground).tile,'i');assert.equal(lumioseZone3Map()[7][7],'i');
 const upper={...ground,x:11,y:10,facing:'up',zaZone3TowerUpper:true};assert.equal(fieldMap(upper)[9][11],'i');assert.equal(lumioseZone3TowerMap()[5][8],'.');assert.equal(interactionAt(upper).tile,'i');
 const saved=storeAdventurePosition(upper,21),loaded=restoreAdventurePosition(saved,21);assert.equal(loaded.zaZone3TowerUpper,true);assert.deepEqual([loaded.x,loaded.y],[11,10]);assert.deepEqual(loaded.teamIds,['kept']);assert.equal(loaded.steps,42);const legacyUpper=structuredClone(saved);delete legacyUpper.districtPosition.zone3Layout;const restoredUpper=restoreAdventurePosition(legacyUpper,21);assert.equal(restoredUpper.zaZone3TowerUpper,true);assert.deepEqual([restoredUpper.x,restoredUpper.y],[11,10]);assert.equal(restoreAdventurePosition(structuredClone(saved),22).district,null);
 const old=storeAdventurePosition({...ground,x:11,y:8},20),restored=restoreAdventurePosition(old,20);assert.deepEqual([restored.x,restored.y],[11,8]);
});

test('Rouge gardens have blocked fences, reachable gates and safe legacy-position migration',()=>{
 const map=lumioseZone3Map();assert.equal(map[5][9],'|');assert.equal(stepField({area:3,district:'lumiose-zone3',x:10,y:5},'left').blocked,true);assert.equal(stepField({area:3,district:'lumiose-zone3',x:10,y:6,zaRoyaleRank:'Y',zaJoseeRequired:true},'left').blocked,true);
 for(const target of [{x:7,y:6},{x:15,y:6},{x:7,y:10},{x:15,y:10}])assert.ok(fieldPath(map,{x:11,y:8},target).length);
 const old=storeAdventurePosition({area:3,district:'lumiose-zone3',x:9,y:5,regionId:6,districtReturnRegion:1,teamIds:['kept'],steps:42},17);delete old.districtPosition.zone3Layout;const loaded=restoreAdventurePosition(structuredClone(old),17);assert.equal(loaded.district,'lumiose-zone3');assert.ok(walkable(map[loaded.y][loaded.x]));assert.deepEqual(loaded.teamIds,['kept']);assert.equal(loaded.steps,42);assert.equal(restoreAdventurePosition(structuredClone(old),18).district,null);
});

test('north Rouge Street joins Zone 3 to a provisional boulevard and saves safely',()=>{
 const map=lumioseRougeNorthMap();assert.equal(map[7][16],'H');assert.ok(fieldPath(map,{x:11,y:15},{x:16,y:7}).length);
 const out=stepField({area:3,district:'lumiose-zone3',x:11,y:1},'up');assert.deepEqual([out.district,out.x,out.y],['lumiose-rouge-north',11,15]);const back=stepField({...out,x:11,y:15},'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-zone3',11,1]);
 const old=storeAdventurePosition({area:3,district:'lumiose-zone3',x:11,y:1,regionId:6,districtReturnRegion:1,teamIds:['kept']},21),prior=restoreAdventurePosition(old,21);assert.deepEqual([prior.district,prior.x,prior.y],['lumiose-zone3',11,1]);
 const save=storeAdventurePosition({...out,regionId:6,districtReturnRegion:1,teamIds:['kept'],steps:42},22),loaded=restoreAdventurePosition(structuredClone(save),22);assert.deepEqual([loaded.district,loaded.x,loaded.y],['lumiose-rouge-north',11,15]);assert.deepEqual(loaded.teamIds,['kept']);assert.equal(loaded.steps,42);assert.equal(restoreAdventurePosition(structuredClone(save),23).district,null);
});

test('northern street connects through boulevard to the company and preserves the court save',()=>{
 let s={area:3,district:'lumiose-rouge-north',x:1,y:4,regionId:6,districtReturnRegion:1,teamIds:['keep'],zaMission10Stage:2};
 s={...s,...stepField(s,'left')};assert.deepEqual([s.district,s.x,s.y],['lumiose-north-boulevard',21,8]);
 s={...s,...stepField({...s,x:1,y:8},'left')};assert.deepEqual([s.district,s.x,s.y],['lumiose-quasartico',21,8]);
 const map=fieldMap(s);assert.ok(fieldPath(map,s,{x:11,y:7}).length);assert.equal(map[6][11],'y');
 const saved=storeAdventurePosition({...s,x:11,y:7,steps:42},9),loaded=restoreAdventurePosition(saved,9);assert.deepEqual([loaded.district,loaded.x,loaded.y],['lumiose-quasartico',11,7]);assert.deepEqual(loaded.teamIds,['keep']);assert.equal(loaded.steps,42);
 const back=stepField({...s,x:21,y:8},'right');assert.equal(back.district,'lumiose-north-boulevard');assert.equal(stepField({...back,x:21,y:8},'right').district,'lumiose-rouge-north');
});

test('provisional zone three respects story and older saves, and round-trips its position',()=>{
 const source={area:3,district:'lumiose-zone2',x:4,y:1,zaRoyaleRank:'Y'};
 assert.equal(stepField(source,'up').district,'lumiose-vert2');const road={area:3,district:'lumiose-vert2',x:1,y:8,zaRoyaleRank:'Y'};
 assert.equal(stepField({...road,zaJoseeRequired:true},'left').district,'lumiose-centrico-route');
 assert.equal(stepField({...road,zaRoyaleRank:'Z'},'left').district,'lumiose-centrico-route');
 assert.equal(stepField({...road,zaRoyaleRank:undefined},'left').district,'lumiose-centrico-route');
 for(const oldOrComplete of [road,{...road,zaJoseeRequired:true,zaJoseeComplete:true}])assert.equal(stepField(oldOrComplete,'left').district,'lumiose-centrico-route');
 assert.equal(stepField({area:3,district:'lumiose-zone3',x:21,y:8},'right').district,'lumiose-centrico-route');
 const south=stepField({area:3,district:'lumiose-centrico-route',x:1,y:8},'left');assert.deepEqual([south.district,south.x,south.y],['lumiose-zone3',11,15]);assert.equal(stepField({area:3,district:'lumiose-zone3',x:11,y:15},'down').district,'lumiose-centrico-route');assert.equal(stepField({area:3,district:'lumiose-centrico-route',x:21,y:8},'right').district,'lumiose-vert2');
 const center={area:3,district:'lumiose-centrico-route',x:11,y:6,facing:'up',regionId:6,districtReturnRegion:1,teamIds:['keep'],steps:23};assert.equal(interactionAt(center).tile,'H');const savedCenter=storeAdventurePosition(center,7),loadedCenter=restoreAdventurePosition(savedCenter,7);assert.equal(loadedCenter.district,'lumiose-centrico-route');assert.deepEqual(loadedCenter.teamIds,['keep']);assert.equal(loadedCenter.steps,23);
 const roadMap=lumioseCentricoRouteMap();for(const tile of [',',';','k'])assert.equal(walkable(tile),true);assert.ok(fieldPath(roadMap,{x:1,y:8},{x:21,y:8}).length);assert.ok(fieldPath(roadMap,{x:1,y:8},{x:11,y:6}).length);
 const old=storeAdventurePosition({...center,x:11,y:12},7);delete old.districtPosition.centricoLayout;const restored=restoreAdventurePosition(structuredClone(old),7);assert.equal(restored.district,'lumiose-centrico-route');assert.ok(walkable(lumioseCentricoRouteMap()[restored.y][restored.x]));assert.deepEqual(restored.teamIds,['keep']);assert.equal(restored.steps,23);assert.equal(restoreAdventurePosition(structuredClone(old),8).district,null);
 assert.equal(stepField({area:3,district:'lumiose-vert2',x:21,y:8},'right').district,'lumiose-zone2');
 const grass={area:3,district:'lumiose-zone3',x:17,y:8,zaRoyaleRank:'Y',zaJoseeRequired:true};assert.equal(stepField(grass,'left').blocked,true);assert.equal(stepField({...grass,zaJoseeComplete:true},'left').blocked,undefined);assert.equal(stepField({...grass,x:15,y:6},'left').blocked,undefined);
 assert.ok(fieldPath(lumioseZone3Map(),{x:21,y:8},findTile(lumioseZone3Map(),'g')).length);
 const saved=storeAdventurePosition({area:3,district:'lumiose-zone3',x:17,y:8,regionId:6,districtReturnRegion:1},10),loaded=restoreAdventurePosition(structuredClone(saved),10);
 assert.deepEqual([loaded.district,loaded.x,loaded.y],['lumiose-zone3',17,8]);
});


test('bureau map has reachable Emma and exits to the provisional third zone',()=>{
 const map=lumioseBureauMap();assert.ok(fieldPath(map,{x:11,y:13},findTile(map,'e')).length);
 const entry=findTile(lumioseZone3Map(),'b');assert.deepEqual(entry,{x:19,y:6});
 const back=stepField({area:3,district:'lumiose-bureau',x:11,y:14},'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-zone3',19,7]);
 const state={area:3,district:'lumiose-bureau',x:11,y:6,regionId:6,districtReturnRegion:1,zaEmmaMet:true};
 const saved=storeAdventurePosition(state,10),loaded=restoreAdventurePosition(structuredClone(saved),10);assert.deepEqual([loaded.district,loaded.x,loaded.y,loaded.zaEmmaMet],['lumiose-bureau',11,6,true]);
});


test('cemetery draft connects through the northern street and preserves locations',()=>{
 assert.equal(findTile(lumioseZone4Map(),'p'),null);assert.ok(findTile(lumioseZone4Map({zaBunnelbyQuest:3}),'p'));assert.equal(findTile(lumioseZone4Map({zaBunnelbyQuest:3,zaZone4AlphaSpent:true}),'p'),null);
 const source={area:3,district:'lumiose-zone3',x:1,y:8,zaEmmaMet:true};assert.equal(stepField(source,'left').blocked,true);
 const north=stepField({...source,x:11,y:1},'up');assert.equal(north.district,'lumiose-rouge-north');
 const entered=stepField({...source,district:'lumiose-rouge-north',x:21,y:4},'right');assert.deepEqual([entered.district,entered.x,entered.y],['lumiose-zone4',21,8]);
 assert.ok(fieldPath(lumioseZone4Map(),{x:21,y:8},findTile(lumioseZone4Map(),'z')).length);
 assert.equal(stepField({area:3,district:'lumiose-zone4',x:21,y:8},'right').district,'lumiose-rouge-north');
 const street=fieldMap({area:3,district:'lumiose-rouge-north'});assert.deepEqual(findTile(street,'m'),{x:19,y:6});assert.equal(findTile(lumioseZone3Map(),'m'),null);assert.ok(fieldPath(street,{x:21,y:4},{x:19,y:6}).length);
 const old=storeAdventurePosition({...source,x:0,y:8,teamIds:['keep'],steps:42},8);old.districtPosition.zone3Layout=1;const restored=restoreAdventurePosition(old,8);assert.deepEqual([restored.district,restored.x,restored.y],['lumiose-zone3',1,8]);assert.deepEqual(restored.teamIds,['keep']);assert.equal(restored.steps,42);
 const saved=storeAdventurePosition({area:3,district:'lumiose-zone4',x:18,y:6,regionId:6,districtReturnRegion:1,zaSableyeQuest:1},8),loaded=restoreAdventurePosition(structuredClone(saved),8);
 assert.deepEqual([loaded.district,loaded.x,loaded.y,loaded.zaSableyeQuest],['lumiose-zone4',18,6,1]);
});

test('Rouge Street restaurant remains reachable and restores old positions safely',()=>{
 const base={area:3,district:'lumiose-rouge-north',regionId:6,districtReturnRegion:1,teamIds:['keep'],steps:42};
 const map=fieldMap(base);assert.deepEqual(findTile(map,'l'),{x:19,y:4});
 assert.ok(fieldPath(map,{x:11,y:15},{x:19,y:5}).length);assert.ok(fieldPath(map,{x:19,y:5},{x:21,y:4}).length);
 assert.equal(interactionAt({...base,x:19,y:5,facing:'up'}).tile,'l');
 for(let y=1;y<=3;y++)for(let x=18;x<=20;x++){const saved=storeAdventurePosition({...base,x,y},8);delete saved.districtPosition.rougeNorthLayout;const restored=restoreAdventurePosition(saved,8);assert.equal(restored.district,base.district);assert.ok(walkable(map[restored.y][restored.x]));assert.deepEqual(restored.teamIds,['keep']);assert.equal(restored.steps,42);}
 const stale=storeAdventurePosition({...base,x:19,y:2},8);delete stale.districtPosition.rougeNorthLayout;assert.equal(restoreAdventurePosition(stale,9).district,null);
});

test('restaurant interior keeps its district and returns to the entrance',()=>{
 const s={area:3,district:'lumiose-rouge-north',interior:'sushi',x:11,y:14,facing:'up',regionId:6,districtReturnRegion:1,teamIds:['keep'],steps:42};
 const map=fieldMap(s);assert.equal(map[5][16],'R');assert.ok(fieldPath(map,s,{x:16,y:5}).length);assert.ok(fieldPath(map,s,{x:11,y:15}).length);
 const loaded=restoreAdventurePosition(storeAdventurePosition(s,12),12);assert.deepEqual([loaded.district,loaded.interior,loaded.x,loaded.y],['lumiose-rouge-north','sushi',11,14]);assert.deepEqual(loaded.teamIds,['keep']);assert.equal(loaded.steps,42);
 const exit=stepField({...s,y:15},'down');assert.deepEqual([exit.district,exit.interior,exit.x,exit.y],[undefined,null,19,5]);
 const stale=restoreAdventurePosition(storeAdventurePosition(s,12),13);assert.equal(stale.district,null);
});


test('rooftop crystal blocks the provisional shortcut until cleared',()=>{
 const blocked=lumioseRooftopMap(),cleared=lumioseRooftopMap({zaRooftopCrystalCleared:true});
 assert.equal(walkable(blocked[9][11]),false);assert.equal(walkable(cleared[9][11]),true);
 assert.equal(fieldPath(blocked,{x:11,y:13},{x:1,y:8}).length,0);assert.ok(fieldPath(cleared,{x:11,y:13},{x:1,y:8}).length);
 assert.equal(stepField({area:3,district:'lumiose-rooftop',x:1,y:8,zaRooftopCrystalCleared:true},'left').district,'lumiose-zone2');
 const saved=storeAdventurePosition({area:3,district:'lumiose-rooftop',x:11,y:10,regionId:6,districtReturnRegion:1},8),loaded=restoreAdventurePosition(structuredClone(saved),8);
 assert.deepEqual([loaded.district,loaded.x,loaded.y],['lumiose-rooftop',11,10]);
});

test('legacy completed mission 15 can see L without resetting progress',()=>{
 const s={area:3,district:'lumiose-rooftop',interior:null,x:18,y:6,facing:'up',zaRoyaleRank:'E',zaMission15Stage:3,zaMission15Complete:true,zaMission16Complete:true,zaMission17Complete:true,zaMission18Complete:true};
 assert.equal(fieldDialogue(s).action,'mission15MeetL');
 const lobby={...s,district:'lumiose',interior:'hotel',x:11,y:6,facing:'up',zaMission15SceneSeen:true};
 assert.ok(fieldDialogue(lobby).actions.some(a=>a.action==='mission15Continue19'));
 assert.equal(lobby.zaMission15Complete,true);
});
