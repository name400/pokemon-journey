import test from 'node:test';
import assert from 'node:assert/strict';
import {zone7Map,zone7Unlocked,zone7Encounter} from '../lib/cloud-adventure/adventure-zone7.mjs';
import {stepField,fieldPath,fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
test('Zone 7 missing research species can be found by day and night',()=>{
 const map=zone7Map({}),pos={x:16,y:9};assert.equal(map[pos.y][pos.x],'g');assert.ok(fieldPath(map,{x:17,y:15},pos).length);
 for(const period of ['day','night'])for(const [index,id] of [[4,315],[5,14],[6,670]])assert.equal(zone7Encounter(period,()=>((index+.5)/7)).speciesId,id);
 const saved=restoreAdventurePosition(storeAdventurePosition({area:3,district:'lumiose-zone7',interior:null,...pos,teamIds:['kept']},62),62);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone7',16,9,['kept']]);
});
test('zone seven gate, plaza and stored location',()=>{
 const base={area:3,district:'lumiose-centrico-route',interior:null,x:5,y:1,facing:'up',zaRoyaleRank:'V'};
 assert.equal(stepField(base,'up').blocked,true);const entered=stepField({...base,zaRoyaleRank:'F'},'up');assert.equal(entered.district,'lumiose-zone7');
 const s={...base,...entered,zaRoyaleRank:'F'},map=zone7Map();assert.ok(fieldPath(map,s,{x:10,y:10}).length);assert.equal(map[8][11],'a');assert.equal(zone7Map({zaZone7AlphaSpent:true})[8][11],'#');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:10,y:10},42),42);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone7',10,10]);
 assert.equal(stepField(s,'down').district,'lumiose-centrico-route');assert.equal(zone7Encounter('day',()=>0).speciesId,449);assert.equal(zone7Encounter('night',()=>0).speciesId,353);
});

test('Magenta Sector 3 reaches Zone 7 without bypassing its rank gate',()=>{
 const city={area:3,district:'lumiose-magenta-sector3',interior:null,x:4,y:1,zaRoyaleRank:'V',teamIds:['kept']};
 assert.equal(stepField(city,'up').blocked,true);
 const zone=stepField({...city,zaRoyaleRank:'F'},'up');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone7',17,15]);
 const state={...city,...zone,zaRoyaleRank:'F'};assert.ok(fieldPath(zone7Map(state),state,{x:10,y:10}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(state,71),71);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone7',17,15,['kept']]);
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-magenta-sector3',4,1]);
 for(const [district,x,y,safeY] of [['lumiose-zone7',17,0,1],['lumiose-magenta-sector3',12,16,15]]){
  const old=restoreAdventurePosition(storeAdventurePosition({...city,district,x,y},72),72);assert.deepEqual([old.district,old.x,old.y,old.teamIds],[district,x,safeY,['kept']]);
 }
});

test('the provisional plaza fountain preserves an older save and access between gates',()=>{
 const map=zone7Map();assert.equal(map[5][19],'~');
 const old={area:3,district:'lumiose-zone7',interior:null,x:19,y:5,steps:18,teamIds:['kept'],zaZone7AlphaSpent:true};
 const stored=storeAdventurePosition(old,73),restored=restoreAdventurePosition(stored,73);
 assert.equal(restored.district,old.district);assert.ok(walkable(map[restored.y][restored.x]));
 assert.deepEqual([restored.steps,restored.teamIds,restored.zaZone7AlphaSpent],[18,['kept'],true]);
 assert.ok(fieldPath(zone7Map(restored),restored,{x:1,y:8}).length);
 assert.ok(fieldPath(zone7Map(restored),restored,{x:17,y:15}).length);
 assert.equal(restoreAdventurePosition(stored,74).district,null);
});

test('defeating the central alpha while on its tile restores to the plaza',()=>{
 const before={area:3,district:'lumiose-zone7',interior:null,x:10,y:8,zaZone7AlphaSpent:false};
 assert.deepEqual([stepField(before,'right').x,stepField(before,'right').y],[11,8]);
 const s={area:3,district:'lumiose-zone7',interior:null,x:11,y:8,zaZone7AlphaSpent:true,teamIds:['kept'],steps:64};
 const stored=storeAdventurePosition(s,75),restored=restoreAdventurePosition(stored,75);
 assert.equal(restored.district,'lumiose-zone7');
 assert.ok(walkable(zone7Map(restored)[restored.y][restored.x]));
 assert.deepEqual([restored.zaZone7AlphaSpent,restored.teamIds,restored.steps],[true,['kept'],64]);
 assert.ok(fieldPath(zone7Map(restored),restored,{x:1,y:8}).length);
 assert.equal(restoreAdventurePosition(stored,76).district,null);
});

test('plaza canal edges keep routes and migrate only matching legacy saves',()=>{
 const map=zone7Map();for(const [x,y] of [[1,5],[2,6],[20,10],[21,11]])assert.equal(map[y][x],'~');
 assert.ok(fieldPath(map,{x:1,y:8},{x:11,y:15}).length);
 const state={area:3,district:'lumiose-zone7',x:1,y:5,regionId:6,districtReturnRegion:1,teamIds:['kept'],zaRoyaleRank:'F'};
 const saved=storeAdventurePosition(state,9);delete saved.districtPosition.zone7Layout;
 const restored=restoreAdventurePosition(structuredClone(saved),9);assert.equal(restored.district,'lumiose-zone7');assert.ok(walkable(map[restored.y][restored.x]));assert.deepEqual(restored.teamIds,['kept']);
 assert.equal(restoreAdventurePosition(structuredClone(saved),10).district,null);assert.equal(storeAdventurePosition(restored,10).districtPosition.zone7Layout,1);
});


test('Zone 7 west Holovator and rooftop preserve plaza paths and saved positions',()=>{
 const plaza={area:3,district:'lumiose-zone7',interior:null,x:4,y:8,facing:'left',zaRoyaleRank:'F',teamIds:['kept']},map=zone7Map(plaza);
 assert.equal(map[8][3],'j');assert.equal(fieldDialogue(plaza).action,'zone7WestRoofLift');assert.ok(fieldPath(map,{x:1,y:8},plaza).length);
 const roof={...plaza,district:'lumiose-zone7-west-roof',x:4,y:9,facing:'down'};assert.equal(fieldMap(roof)[10][4],'j');assert.equal(fieldDialogue(roof).action,'zone7WestRoofLift');assert.ok(fieldPath(fieldMap(roof),roof,{x:17,y:5}).length);
 for(const old of [roof,{...plaza,x:3,y:8}]){const saved=restoreAdventurePosition(storeAdventurePosition(old,133),133);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[old.district,old.x,old.y,['kept']]);}
});


test('Zone 7 neighbouring roof is separated by a gap and keeps saved locations',()=>{
 const roof={area:3,district:'lumiose-zone7-west-roof',interior:null,x:11,y:9,facing:'down',zaRoyaleRank:'F',teamIds:['kept']},map=fieldMap(roof);
 assert.equal(map[10][11],'v');assert.equal(map[11][11],'#');assert.equal(map[12][11],'v');assert.equal(fieldPath(map,roof,{x:11,y:13}).length,0);
 assert.equal(fieldDialogue(roof).action,'zone7RoofRoll');const other={...roof,x:11,y:13,facing:'up'};assert.equal(fieldDialogue(other).action,'zone7RoofRoll');
 for(const state of [roof,other,{...roof,x:11,y:10}]){const saved=restoreAdventurePosition(storeAdventurePosition(state,134),134);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[state.district,state.x,state.y,['kept']]);}
});

test('monument brambles preserve legacy saves and expose the candy after clearing',()=>{
 const old={area:3,district:'lumiose-zone7',interior:null,x:11,y:6,facing:'right',teamIds:['kept'],zaRoyaleRank:'F'};
 const saved=storeAdventurePosition(old,81);delete saved.districtPosition.zone7BrambleLayout;
 const restored=restoreAdventurePosition(saved,81);assert.deepEqual([restored.x,restored.y],[10,6]);assert.deepEqual(restored.teamIds,['kept']);
 assert.equal(fieldDialogue(restored).action,'zone7NorthBrambles');assert.equal(stepField(restored,'right').blocked,true);
 const cleared={...restored,zaZone7NorthBramblesCleared:true};assert.equal(fieldDialogue(cleared).action,'zone7NorthCandy');
 assert.equal(zone7Map({...cleared,zaZone7NorthCandyClaimed:true})[6][11],',');
 assert.ok(fieldPath(zone7Map(cleared),{x:1,y:8},{x:17,y:15}).length);
});

test('Zone 7 eastern trees and southern brambles keep old saves and approaches safe',()=>{
 const base={area:3,district:'lumiose-zone7',interior:null,zaRoyaleRank:'F',teamIds:['kept']};
 for(const [x,y] of [[18,3],[19,4],[19,6],[19,10],[19,12],[18,13],[11,10]]){
  const old=storeAdventurePosition({...base,x,y},91);delete old.districtPosition.zone7PlazaLayout;
  const restored=restoreAdventurePosition(old,91);assert.ok(walkable(zone7Map(restored)[restored.y][restored.x]));assert.deepEqual(restored.teamIds,['kept']);
 }
 const map=zone7Map(base);for(const target of [{x:5,y:1},{x:1,y:8},{x:21,y:8},{x:11,y:15},{x:17,y:15},{x:10,y:10},{x:10,y:6}])assert.ok(fieldPath(map,{x:6,y:8},target).length,JSON.stringify(target));
 assert.equal(fieldDialogue({...base,x:10,y:10,facing:'right'}).action,'zone7SouthBrambles');
 assert.equal(fieldDialogue({...base,x:10,y:10,facing:'right',zaZone7SouthBramblesCleared:true}).action,'zone7SouthTm');
 assert.equal(zone7Map({...base,zaZone7SouthBramblesCleared:true,zaZone7SouthTmClaimed:true})[10][11],',');
});

test('TM092 learns only verified base species and reviewed forms',async()=>{
 const {canLearnStoryTm}=await import('../lib/cloud-adventure/adventure-story-tm.mjs');const bag={'za-tm092':1};
 assert.equal(canLearnStoryTm(bag,{id:152,speciesId:152,moves:[]},'za-tm092'),true);
 assert.equal(canLearnStoryTm(bag,{id:10100,speciesId:26,moves:[]},'za-tm092'),true);
 assert.equal(canLearnStoryTm(bag,{id:4,speciesId:4,moves:[]},'za-tm092'),false);
 assert.equal(canLearnStoryTm(bag,{id:99999,speciesId:26,moves:[]},'za-tm092'),false);
 assert.equal(canLearnStoryTm(bag,{id:152,speciesId:152,moves:['매지컬샤인']},'za-tm092'),false);
});

test('Zone 7 visible encounters keep former walking positions and preserve collected state',async()=>{
 const {ZONE7_VISIBLE,zone7Visible}=await import('../lib/cloud-adventure/adventure-zone7.mjs');const s={area:3,district:'lumiose-zone7',interior:null,x:8,y:8,facing:'right',teamIds:['kept']},map=zone7Map(s);
 assert.deepEqual(ZONE7_VISIBLE.map(p=>[p.id,p.species]),[['audino',531],['vanillite',582]]);for(const p of ZONE7_VISIBLE){assert.equal(map[p.y][p.x],p.tile);assert.equal(walkable(map[p.y][p.x]),true);assert.ok(fieldPath(map,{x:11,y:15},{x:p.x,y:p.y}).length);const old=storeAdventurePosition({...s,x:p.x,y:p.y},33);assert.deepEqual([restoreAdventurePosition(old,33).x,restoreAdventurePosition(old,33).y],[p.x,p.y]);}
 assert.equal(fieldDialogue(s,map).actions[0].action,'zone7Wild-audino');assert.ok(fieldDialogue(s,map).actions.some(a=>a.action==='throwZoneVisible'));assert.equal(zone7Visible({...s,zaZone7Spent:{audino:true}},'b'),null);assert.equal(zone7Map({...s,zaZone7Spent:{audino:true}})[8][9],',');
});
