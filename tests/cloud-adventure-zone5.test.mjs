import test from 'node:test';
import {moves} from '../lib/game.mjs';
import assert from 'node:assert/strict';
import {zone5Map,zone5Encounter,canClearZone5Sludge} from '../lib/cloud-adventure/adventure-zone5.mjs';
import {stepField,storeAdventurePosition,restoreAdventurePosition,fieldPath,fieldMap,fieldDialogue} from '../lib/cloud-adventure/adventure-world.mjs';

test('Zone 5 and Bleu Sector 3 southern approaches retain movement and stored positions',()=>{
 const s={area:3,district:'lumiose-zone5',interior:null,regionId:6,districtReturnRegion:1,teamIds:['kept']},map=zone5Map(s);
 for(let y=14;y<=15;y++)for(let x=5;x<=17;x++)assert.equal(map[y][x],',');
 assert.equal(map[10][5],'g');assert.ok(fieldPath(map,{x:5,y:15},{x:17,y:15}).length);
 for(const [x,dest] of [[5,'lumiose-bleu-sector3'],[17,'lumiose-bleu-plaza-route']]){
  const old=restoreAdventurePosition(storeAdventurePosition({...s,x,y:15},102),102);
  assert.deepEqual([old.district,old.x,old.y,old.teamIds],[s.district,x,15,['kept']]);
  assert.equal(stepField(old,'down').district,dest);
 }
 const sector={...s,district:'lumiose-bleu-sector3'},street=fieldMap(sector);
 for(let y=1;y<=6;y++)for(let x=10;x<=12;x++)assert.equal(street[y][x],',');
 assert.equal(street[8][10],'j');assert.ok(fieldPath(street,{x:11,y:1},{x:11,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...sector,x:11,y:1},103),103);
 assert.equal(stepField(saved,'up').district,'lumiose-zone5');assert.deepEqual(saved.teamIds,['kept']);
});

test('zone five preserves separate ground and rooftop, entrances and saved locations',()=>{
 const state={area:3,district:'lumiose-centrico-route',interior:null,x:18,y:15,facing:'down'};
 const south=stepField(state,'down');assert.equal(south.district,'lumiose-zone5');assert.deepEqual([south.x,south.y],[11,15]);
 const z={...state,...south};assert.equal(zone5Map(z)[16][11],'X');assert.ok(fieldPath(zone5Map(z),z,{x:4,y:5}).length);
 const back=stepField(z,'down');assert.equal(back.district,'lumiose-centrico-route');assert.deepEqual([back.x,back.y],[18,15]);
 const west=stepField({...state,x:16,y:15},'down');assert.deepEqual([west.district,west.x,west.y],['lumiose-zone5',1,8]);
 const w={...state,...west};assert.equal(stepField(w,'left').district,'lumiose-centrico-route');
 const upper={...z,x:4,y:5,zaZone5Upper:true};assert.equal(zone5Map(upper)[4][4],'l');assert.ok(fieldPath(zone5Map(upper),upper,{x:19,y:4}).length);
 const saved=storeAdventurePosition(upper,44),restored=restoreAdventurePosition(saved,44);assert.deepEqual([restored.district,restored.x,restored.y,restored.zaZone5Upper],['lumiose-zone5',4,5,true]);
 assert.equal(restoreAdventurePosition(saved,45).district,null);
 assert.equal(zone5Encounter(()=>0).speciesId,16);assert.equal(zone5Encounter(()=>.999).speciesId,661);
});
test('Zone 5 underground route has two barriers and connects back to the sewer approach',()=>{
 const ground={area:3,district:'lumiose-zone5',interior:null,x:6,y:3,zaZone5Upper:false};
 assert.equal(zone5Map(ground)[2][6],'r');
 assert.equal(zone5Map({...ground,zaZone5DrainFirstCleared:true})[2][6],'s');
 const drain={...ground,district:'lumiose-zone5-drain',x:11,y:5};
 assert.equal(stepField(drain,'right').blocked,true);
 const open={...drain,zaZone5DrainSecondCleared:true};
 assert.ok(fieldPath(fieldMap(open),open,{x:21,y:4}).length);
 const approach=stepField({...open,x:21,y:4},'right');assert.equal(approach.district,'lumiose-bleu3-sewer-approach');
 const back=stepField({...open,...approach},'down');assert.equal(back.district,'lumiose-zone5-drain');
 const saved=restoreAdventurePosition(storeAdventurePosition({...open,x:8,y:11,teamIds:['kept']},8),8);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone5-drain',8,11,['kept']]);
 assert.equal(stepField({...open,x:1,y:12},'left').district,'lumiose-zone5');
});
test('northern Zone 5 exit reaches Centrico while keeping existing routes',()=>{
 const z={area:3,district:'lumiose-zone5',interior:null,x:11,y:1,zaZone5Upper:false,teamIds:['kept']};
 const road=stepField(z,'up');assert.deepEqual([road.district,road.x,road.y],['lumiose-centrico-route',12,15]);
 const back=stepField({...z,...road},'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-zone5',11,1]);
 assert.equal(stepField({...z,x:17,y:15},'down').district,'lumiose-bleu-plaza-route');
 assert.equal(stepField({...z,x:11,y:15},'down').district,'lumiose-centrico-route');
 const saved=restoreAdventurePosition(storeAdventurePosition(z,8),8);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone5',11,1,['kept']]);
});
test('Whirlipede occupies the clearing past the second sludge and keeps its spent flag',()=>{
 const ground={area:3,district:'lumiose-zone5',zaZone5Upper:false};
 assert.notEqual(zone5Map(ground)[13][16],'v');
 const drain={...ground,district:'lumiose-zone5-drain'};
 assert.equal(fieldMap(drain)[5][18],'v');
 assert.equal(stepField({...drain,x:11,y:5},'right').blocked,true);
 const saved=restoreAdventurePosition(storeAdventurePosition({...drain,x:18,y:6,zaZone5DrainSecondCleared:true,zaZone5Spent:{'whirlipede-alpha':true}},10),10);
 assert.equal(saved.zaZone5Spent['whirlipede-alpha'],true);
 assert.notEqual(fieldMap(saved)[5][18],'v');
});

test('Vernal Avenue connects the eastern ground entrance of Zone 5',()=>{
 const road={area:3,district:'lumiose-vernal',interior:null,x:1,y:13,teamIds:['kept']};
 const zone=stepField(road,'left');assert.deepEqual([zone.district,zone.x,zone.y,zone.zaZone5Upper],['lumiose-zone5',21,13,false]);
 const state={...road,...zone};assert.ok(fieldPath(fieldMap(state),state,{x:11,y:15}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(state,52),52);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone5',21,13,['kept']]);
 const back=stepField(saved,'right');assert.deepEqual([back.district,back.x,back.y],['lumiose-vernal',1,13]);
});

test('Bleu Street reaches the western ground edge of Zone 5',()=>{
 const road={area:3,district:'lumiose-bleu-street',interior:null,x:21,y:4,teamIds:['kept']};
 const zone=stepField(road,'right');assert.deepEqual([zone.district,zone.x,zone.y,zone.zaZone5Upper],['lumiose-zone5',1,12,false]);
 const state={...road,...zone};assert.ok(fieldPath(fieldMap(state),state,{x:11,y:15}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(state,53),53);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone5',1,12,['kept']]);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-bleu-street',21,4]);
});


test('Café Gallant is reachable from the Zone 5 approach without moving saved positions',()=>{
 const zone={area:3,district:'lumiose-zone5',interior:null,x:1,y:12,facing:'left',zaMission14Stage:6,teamIds:['kept']};
 const road=stepField(zone,'left');assert.deepEqual([road.district,road.x,road.y],['lumiose-bleu-street',21,4]);
 const state={...zone,...road};assert.ok(fieldPath(fieldMap(state),state,{x:18,y:10}).length);
 const cafe={...state,x:18,y:10,facing:'down'};assert.equal(fieldDialogue(cafe).action,'rankEGalette');
 const saved=restoreAdventurePosition(storeAdventurePosition(cafe,54),54);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-bleu-street',18,10,['kept']]);
 assert.equal(fieldDialogue({...cafe,district:'lumiose-centrico-route',x:18,y:6,facing:'up'}).action,'rankEGalette');
 assert.equal(stepField({...state,x:21,y:4},'right').district,'lumiose-zone5');
});


test('sludge accepts water attacks and Confusion but not Psybeam or fainted Pokémon',()=>{
 assert.equal(canClearZone5Sludge({hp:1,moves:['물대포']},moves),true);
 assert.equal(canClearZone5Sludge({hp:1,moves:['염동력']},moves),true);
 assert.equal(canClearZone5Sludge({hp:1,moves:['환상빔']},moves),false);
 assert.equal(canClearZone5Sludge({hp:0,moves:['염동력']},moves),false);
});


test('Zone 5 draft web reaches a second rooftop and retains older rooftop saves',()=>{
 const roof={area:3,district:'lumiose-zone5',interior:null,zaZone5Upper:true,x:11,y:5,facing:'down',teamIds:['kept']};
 assert.equal(fieldDialogue(roof).action,'zone5OpenWeb');
 assert.equal(fieldPath(fieldMap(roof),roof,{x:12,y:8}).length,0);
 const open={...roof,zaZone5WebOpen:true};assert.ok(fieldPath(fieldMap(open),open,{x:12,y:8}).length);
 assert.equal(fieldDialogue({...open,x:12,y:8,facing:'down'}).action,'zone5WebFullHeal');
 const saved=restoreAdventurePosition(storeAdventurePosition({...open,x:12,y:8,zaZone5WebFullHeal:true},64),64);
 assert.deepEqual([saved.x,saved.y,saved.zaZone5WebOpen,saved.zaZone5WebFullHeal,saved.teamIds],[12,8,true,true,['kept']]);
 assert.notEqual(fieldMap(saved)[9][12],'k');
 for(const [x,y] of [[4,5],[11,4],[18,5]]){const old=restoreAdventurePosition(storeAdventurePosition({...roof,x,y},65),65);assert.deepEqual([old.x,old.y],[x,y]);}
});

test('Zone 5 west gate connects Bleu Sector 4 while preserving older routes',()=>{
 const zone={area:3,district:'lumiose-zone5',interior:null,x:1,y:10,zaZone5Upper:false,teamIds:['kept']};
 const road=stepField(zone,'left');assert.deepEqual([road.district,road.x,road.y],['lumiose-bleu-sector4',11,1]);
 assert.equal(stepField({...zone,...road},'up').district,'lumiose-zone5');
 assert.ok(fieldPath(fieldMap({...zone,...road}),road,{x:1,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...zone,...road},79),79);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-bleu-sector4',11,1,['kept']]);
 assert.equal(stepField({...zone,y:8},'left').district,'lumiose-centrico-route');
 assert.equal(stepField({...zone,y:12},'left').district,'lumiose-bleu-street');
});

test('Zone 5 building drafts preserve ladder and safely migrate old ground positions',()=>{
 const base={area:3,district:'lumiose-zone5',interior:null,x:3,y:2,zaZone5Upper:false,regionId:6,districtReturnRegion:1,teamIds:['kept']};
 const map=zone5Map(base);assert.equal(map[2][3],'#');assert.ok(fieldPath(map,{x:11,y:1},{x:4,y:5}).length);assert.equal(map[4][4],'l');
 const saved=storeAdventurePosition(base,7);delete saved.districtPosition.groundBuildingsLayout;
 const restored=restoreAdventurePosition(structuredClone(saved),7);assert.equal(restored.district,base.district);assert.notEqual(map[restored.y][restored.x],'#');assert.deepEqual(restored.teamIds,['kept']);
 assert.equal(restoreAdventurePosition(structuredClone(saved),8).district,null);assert.equal(storeAdventurePosition(restored,8).districtPosition.groundBuildingsLayout,1);
});

test('Zone 5 south gate connects Bleu Sector 3 independently of the sewer',()=>{
 const zone={area:3,district:'lumiose-zone5',interior:null,x:5,y:15,facing:'down',zaZone5Upper:false,teamIds:['kept']};
 const sector=stepField(zone,'down');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-bleu-sector3',11,1]);
 const state={...zone,...sector};assert.ok(fieldPath(fieldMap(state),state,{x:11,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(state,82),82);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-bleu-sector3',11,1,['kept']]);
 const back=stepField(saved,'up');assert.deepEqual([back.district,back.x,back.y,back.zaZone5Upper],['lumiose-zone5',5,15,false]);
 assert.equal(stepField({...zone,x:17},'down').district,'lumiose-bleu-plaza-route');
 assert.equal(stepField({...zone,zaZone5Upper:true},'down').blocked,true);
});

test('Zone 5 underground shallow canal remains traversable and preserves saves',()=>{
 const s={area:3,district:'lumiose-zone5-drain',interior:null,x:1,y:12,zaZone5DrainSecondCleared:true,teamIds:['kept']},map=fieldMap(s);
 for(let x=1;x<=9;x++)assert.equal(map[12][x],'w');for(let y=7;y<=12;y++)for(let x=7;x<=9;x++)assert.equal(map[y][x],'w');
 assert.ok(fieldPath(map,s,{x:21,y:4}).length);const old=restoreAdventurePosition(storeAdventurePosition({...s,x:8,y:11},138),138);assert.deepEqual([old.district,old.x,old.y,old.teamIds,old.zaZone5DrainSecondCleared],[s.district,8,11,['kept'],true]);
 assert.equal(stepField({...s,x:0,y:12},'right').tile,'w');assert.equal(stepField({...s,x:21,y:4},'right').district,'lumiose-bleu3-sewer-approach');
 const blocked=fieldMap({...s,zaZone5DrainSecondCleared:false});assert.equal(blocked[5][12],'r');assert.equal(fieldPath(blocked,s,{x:21,y:4}).length,0);
});

test('Zone 5 drain ladder connects the alpha clearing to the rooftop without opening the barrier',()=>{
 const drain={area:3,district:'lumiose-zone5-drain',interior:null,x:18,y:7,facing:'right',zaZone5DrainSecondCleared:true,teamIds:['kept']};
 const roof={...drain,district:'lumiose-zone5',zaZone5Upper:true,x:17,y:5,facing:'down'};
 assert.equal(fieldMap(drain)[7][19],'h');assert.equal(fieldMap(roof)[6][17],'h');
 assert.equal(fieldDialogue(drain).action,'zone5DrainRoofLadder');assert.equal(fieldDialogue(roof).action,'zone5DrainRoofLadder');
 assert.equal(fieldDialogue({...roof,zaZone5DrainSecondCleared:false}).action,undefined);
 assert.ok(fieldPath(fieldMap(drain),{x:15,y:5},{x:18,y:7}).length);
 assert.ok(fieldPath(fieldMap(roof),{x:18,y:5},{x:7,y:4}).length);
 for(const old of [drain,roof]){const restored=restoreAdventurePosition(storeAdventurePosition(old,120),120);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],[old.district,old.x,old.y,['kept']]);}
});

test('Zone 5 western stall preserves investigation paths and older saved positions',()=>{
 const base={area:3,district:'lumiose-zone5',interior:null,zaZone5Upper:false,zaRoyaleRank:'A',zaMission40Stage:1,teamIds:['kept'],coins:300},map=fieldMap(base);
 for(const [x,y] of [[2,6],[3,6]]){
  assert.equal(map[y][x],'#');const stored=storeAdventurePosition({...base,x,y},101);delete stored.districtPosition.zone5MarketLayout;
  const restored=restoreAdventurePosition(structuredClone(stored),101);assert.equal(restored.district,base.district);assert.notEqual(map[restored.y][restored.x],'#');assert.deepEqual(restored.teamIds,['kept']);assert.equal(restored.coins,300);
  assert.equal(restoreAdventurePosition(structuredClone(stored),102).district,null);
 }
 assert.ok(fieldPath(map,{x:1,y:10},{x:5,y:7}).length);assert.ok(fieldPath(map,{x:11,y:1},{x:5,y:7}).length);assert.equal(fieldDialogue({...base,x:5,y:7,facing:'up'}).action,'mission40OtherAlpha');
 assert.equal(storeAdventurePosition({...base,x:1,y:10},101).districtPosition.zone5MarketLayout,1);assert.equal(stepField({...base,x:1,y:6},'right').blocked,true);
});
