import test from 'node:test';
import assert from 'node:assert/strict';
import {zone9Map,zone9Encounter,zone9Visible,zone9Item} from '../lib/cloud-adventure/adventure-zone9.mjs';
import {stepField,fieldMap,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition,walkable} from '../lib/cloud-adventure/adventure-world.mjs';

test('Zone 9 southern exits join the central road while retaining stored positions',()=>{
 const s={area:3,district:'lumiose-zone9',interior:null,zaRoyaleRank:'F',regionId:6,districtReturnRegion:1,teamIds:['kept']},map=zone9Map(s);
 for(let y=11;y<=15;y++)for(let x=10;x<=12;x++)assert.equal(map[y][x],',');
 for(const x of [12,13,14,15])assert.equal(map[14][x],',');
 for(const x of [11,15]){
  assert.ok(fieldPath(map,{x:11,y:10},{x,y:15}).length);
  const saved=restoreAdventurePosition(storeAdventurePosition({...s,x,y:15},67),67);
  assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone9',x,15,['kept']]);
  assert.equal(stepField(saved,'down').district,'lumiose-estival-approach');
 }
 assert.equal(map[9][11],'a');assert.equal(map[13][15],'h');
});

test('Zone 9 north and east approaches join the central road and retain saves',()=>{
 const s={area:3,district:'lumiose-zone9',interior:null,zaRoyaleRank:'F',regionId:6,districtReturnRegion:1,teamIds:['kept']},map=zone9Map(s);
 for(let y=1;y<=5;y++)for(let x=10;x<=12;x++)assert.equal(map[y][x],',');
 for(let y=7;y<=9;y++)for(let x=15;x<=21;x++)assert.equal(map[y][x],',');
 for(const [x,y] of [[11,1],[21,8],[15,7]]){
  assert.ok(fieldPath(map,{x:11,y:10},{x,y}).length);
  const saved=restoreAdventurePosition(storeAdventurePosition({...s,x,y},68),68);
  assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[s.district,x,y,['kept']]);
 }
 assert.equal(map[9][11],'a');assert.equal(map[13][15],'h');assert.equal(map[10][18],'i');
});
test('zone nine entry and rooftop keep saved positions',()=>{
 const base={area:3,district:'lumiose-estival-approach',interior:null,x:21,y:12,facing:'right',zaRoyaleRank:'V'};
 assert.equal(stepField(base,'right').blocked,true);const entered=stepField({...base,zaRoyaleRank:'F'},'right');assert.equal(entered.district,'lumiose-zone9');
 const s={...base,...entered,zaRoyaleRank:'F'},ground=zone9Map(s);assert.ok(fieldPath(ground,s,{x:5,y:6}).length);assert.equal(zone9Visible(s,'a').species,302);
 const roof={...s,zaZone9Upper:true,x:5,y:6},map=zone9Map(roof);assert.ok(fieldPath(map,roof,{x:17,y:12}).length);assert.equal(zone9Visible(roof,'b').species,303);assert.equal(zone9Visible(roof,'d').species,703);assert.equal(zone9Visible(roof,'v').alpha,true);assert.equal(zone9Item(roof,'j').kind,'healball');assert.equal(zone9Item({...roof,zaZone9Items:['north-heal']},'j'),null);
 const restored=restoreAdventurePosition(storeAdventurePosition(roof,42),42);assert.deepEqual([restored.district,restored.zaZone9Upper,restored.x,restored.y],['lumiose-zone9',true,5,6]);assert.equal(stepField(s,'down').district,'lumiose-estival-approach');assert.equal(zone9Encounter(roof,()=>0).speciesId,703);
});
test('Zone 9 connects Estival Avenue while retaining rank and rooftop boundaries',()=>{
 const road={area:3,district:'lumiose-estival-approach',interior:null,x:21,y:8,zaRoyaleRank:'V',teamIds:['kept']};
 assert.equal(stepField(road,'right').blocked,true);
 const zone=stepField({...road,zaRoyaleRank:'F'},'right');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone9',15,15]);
 assert.equal(stepField({...road,...zone,zaRoyaleRank:'F'},'down').district,'lumiose-estival-approach');
 const saved=restoreAdventurePosition(storeAdventurePosition({...road,...zone,zaRoyaleRank:'F'},31),31);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone9',15,15,['kept']]);
});
test('Zone 9 north gate links Magenta Sector 6 and the canal route',()=>{
 const z={area:3,district:'lumiose-zone9',interior:null,x:11,y:1,zaRoyaleRank:'F',teamIds:['kept']};
 const sector=stepField(z,'up');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-magenta-sector6',11,15]);
 assert.equal(stepField({...z,...sector},'down').district,'lumiose-zone9');
 assert.equal(stepField({...z,...sector,zaRoyaleRank:'V'},'down').blocked,true);
 const canal=stepField({...z,...sector,x:11,y:1},'up');assert.equal(canal.district,'lumiose-magenta-canal-route');
 assert.equal(stepField({...z,...canal},'left').district,'lumiose-magenta-sector6');
 const saved=restoreAdventurePosition(storeAdventurePosition({...z,...sector,x:11,y:7},32),32);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-magenta-sector6',11,7,['kept']]);
});
test('Zone 9 east gate and Magenta Sector 6 both connect Sector 3',()=>{
 const z={area:3,district:'lumiose-zone9',interior:null,x:21,y:8,zaRoyaleRank:'F',teamIds:['kept']};
 const sector=stepField(z,'right');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-magenta-sector3',1,12]);
 assert.equal(stepField({...z,...sector,zaRoyaleRank:'V'},'left').blocked,true);
 assert.equal(stepField({...z,...sector},'left').district,'lumiose-zone9');
 const six=stepField({...z,...sector,x:1,y:8},'left');assert.equal(six.district,'lumiose-magenta-sector6');
 assert.equal(stepField({...z,...six},'right').district,'lumiose-magenta-sector3');
 const saved=restoreAdventurePosition(storeAdventurePosition({...z,...sector},33),33);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-magenta-sector3',1,12,['kept']]);
});

test('Centrico access routes through Estival before reaching the second south gate',()=>{
 const s={area:3,district:'lumiose-centrico-route',interior:null,x:2,y:1,zaRoyaleRank:'V',teamIds:['kept']};
 const road=stepField(s,'up');assert.deepEqual([road.district,road.x,road.y],['lumiose-estival-approach',21,12]);
 assert.equal(stepField({...s,...road},'right').blocked,true);
 const zone=stepField({...s,...road,zaRoyaleRank:'F'},'right');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone9',11,15]);
 assert.equal(stepField({...s,...zone,zaRoyaleRank:'F'},'down').district,'lumiose-estival-approach');
});

test('Magenta Sector 3 and Autumnal Avenue connect in both directions',()=>{
 const sector={area:3,district:'lumiose-magenta-sector3',interior:null,x:21,y:8,zaRoyaleRank:'V',teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(sector),{x:4,y:1},sector).length);
 const avenue=stepField(sector,'right');assert.deepEqual([avenue.district,avenue.x,avenue.y],['lumiose-autumnal-approach',1,6]);
 assert.ok(fieldPath(fieldMap({...sector,...avenue}),avenue,{x:11,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...sector,...avenue},34),34);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-autumnal-approach',1,6,['kept']]);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-magenta-sector3',21,8]);
});
test('Magenta Sector 6 connects west to South Boulevard without bypassing Zone 9',()=>{
 const sector={area:3,district:'lumiose-magenta-sector6',interior:null,x:1,y:8,zaRoyaleRank:'V',zaMission10Stage:3,teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(sector),sector,{x:11,y:15}).length);
 assert.equal(stepField({...sector,x:11,y:15},'down').blocked,true);
 const road=stepField(sector,'left');assert.deepEqual([road.district,road.x,road.y],['lumiose-south-boulevard',21,12]);
 assert.ok(fieldPath(fieldMap({...sector,...road}),road,{x:15,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...sector,...road},35),35);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaMission10Stage,saved.teamIds],['lumiose-south-boulevard',21,12,3,['kept']]);
 const back=stepField(saved,'right');assert.deepEqual([back.district,back.x,back.y],['lumiose-magenta-sector6',1,8]);
});

test('south entrance ladder connects both layers and preserves earlier rooftop positions',()=>{
 const ground={area:3,district:'lumiose-zone9',interior:null,x:15,y:14,facing:'up',zaRoyaleRank:'F',zaZone9Upper:false,teamIds:['kept']};
 assert.equal(zone9Map(ground)[13][15],'h');assert.equal(fieldDialogue(ground).action,'zone9Ladder-h');
 assert.equal(stepField({...ground,x:15,y:15},'down').district,'lumiose-estival-approach');
 const upper={...ground,zaZone9Upper:true};assert.equal(fieldDialogue(upper).action,'zone9Ladder-h');
 assert.ok(fieldPath(zone9Map(upper),upper,{x:17,y:12}).length);
 for(const old of [{...ground,x:17,y:12},{...upper,x:17,y:12}]){
  const restored=restoreAdventurePosition(storeAdventurePosition(old,78),78);
  assert.deepEqual([restored.district,restored.zaZone9Upper,restored.x,restored.y,restored.teamIds],['lumiose-zone9',old.zaZone9Upper,17,12,['kept']]);
 }
});

test('Zone 9 building drafts preserve ladders and migrate only older ground saves',()=>{
 const base={area:3,district:'lumiose-zone9',interior:null,x:18,y:3,zaZone9Upper:false,regionId:6,districtReturnRegion:1,teamIds:['kept']};
 const map=zone9Map(base);assert.equal(map[3][18],'#');assert.ok(fieldPath(map,{x:11,y:1},{x:5,y:6}).length);assert.ok(fieldPath(map,{x:11,y:1},{x:15,y:14}).length);
 const saved=storeAdventurePosition(base,7);delete saved.districtPosition.groundBuildingsLayout;
 const restored=restoreAdventurePosition(structuredClone(saved),7);assert.equal(restored.district,base.district);assert.notEqual(map[restored.y][restored.x],'#');assert.deepEqual(restored.teamIds,['kept']);assert.equal(restoreAdventurePosition(structuredClone(saved),8).district,null);
 const upper={...base,zaZone9Upper:true};const roof=restoreAdventurePosition(storeAdventurePosition(upper,9),9);assert.deepEqual([roof.x,roof.y,roof.zaZone9Upper],[18,3,true]);
});

test('Zone 9 elevated scaffold connects roofs without blocking the street below',()=>{
 const base={area:3,district:'lumiose-zone9',interior:null,zaRoyaleRank:'F',teamIds:['kept']},ground=zone9Map(base),roof=zone9Map({...base,zaZone9Upper:true});
 for(let x=8;x<=14;x++){assert.equal(roof[11][x],',');assert.ok(walkable(ground[11][x]));}
 assert.ok(fieldPath(roof,{x:7,y:11},{x:15,y:11}).length);assert.ok(fieldPath(ground,{x:8,y:11},{x:14,y:11}).length);
 for(const [x,y,upper] of [[8,11,true],[14,11,true],[11,11,false]]){const saved=restoreAdventurePosition(storeAdventurePosition({...base,x,y,zaZone9Upper:upper},137),137);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaZone9Upper,saved.teamIds],[base.district,x,y,upper,['kept']]);}
});

test('Mission 40 Pangoro appears only on the southwest roof while unresolved',()=>{
 const base={area:3,district:'lumiose-zone9',interior:null,zaRoyaleRank:'A',zaMission40Stage:1,zaZone9Upper:true,teamIds:['kept']};
 const map=zone9Map(base);assert.equal(map[9][5],'0');assert.equal(zone9Map({...base,zaZone9Upper:false})[9][5],'.');
 assert.notEqual(zone9Map({...base,zaMission40Stage:0})[9][5],'0');assert.notEqual(zone9Map({...base,zaMission40Anomalies:['pangoro']})[9][5],'0');
 assert.ok(fieldPath(map,{x:5,y:6},{x:5,y:9}).length);
 const restored=restoreAdventurePosition(storeAdventurePosition({...base,x:5,y:9},177),177);assert.deepEqual([restored.district,restored.x,restored.y,restored.zaZone9Upper,restored.teamIds],['lumiose-zone9',5,9,true,['kept']]);
});

test('south scaffold connects both rooftops on its own saved level',()=>{
 const roof={area:3,district:'lumiose-zone9',interior:null,zaZone9Upper:true,zaRoyaleRank:'F',teamIds:['kept']},map=fieldMap(roof);
 for(const x of [7,15]){assert.equal(map[11][x],'o');assert.equal(fieldDialogue({...roof,x,y:10,facing:'down'}).action,'zone9SouthScaffold');assert.ok(walkable(map[11][x]));}
 const scaffold={...roof,district:'lumiose-zone9-scaffold',x:4,y:7,facing:'left'},platform=fieldMap(scaffold);assert.equal(fieldDialogue(scaffold).action,'zone9SouthScaffold');assert.ok(fieldPath(platform,scaffold,{x:18,y:7}).length);assert.equal(fieldDialogue({...scaffold,x:18,facing:'right'}).action,'zone9SouthScaffold');
 const restored=restoreAdventurePosition(storeAdventurePosition({...scaffold,zaZone9Spent:{'manectric-alpha':true},zaZone9Items:['north-heal']},140),140);assert.deepEqual([restored.district,restored.x,restored.y,restored.zaZone9Upper,restored.teamIds],['lumiose-zone9-scaffold',4,7,true,['kept']]);assert.deepEqual(restored.zaZone9Items,['north-heal']);assert.equal(restored.zaZone9Spent['manectric-alpha'],true);
});

test('Zone 9 southern scaffold decks retain crossing and saved items',async()=>{
 const {ZONE9_SOUTH_ITEMS,zone9SouthScaffoldMap,zone9SouthScaffoldItem}=await import('../lib/cloud-adventure/adventure-zone9.mjs');
 const s={area:3,district:'lumiose-zone9-scaffold',interior:null,x:4,y:7,zaRoyaleRank:'F',zaZone9Upper:true,zaZone9Items:['north-heal'],teamIds:['kept']},map=zone9SouthScaffoldMap(s);
 for(const p of ZONE9_SOUTH_ITEMS){assert.equal(map[p.y][p.x],p.tile);assert.ok(fieldPath(map,s,{x:p.x,y:p.y}).length);assert.equal(zone9SouthScaffoldItem(s,p.tile).id,p.id);}
 assert.ok(fieldPath(map,s,{x:18,y:7}).length);
 for(const [x,y] of [[4,7],[11,6],[11,7],[11,8],[18,7]]){const saved=restoreAdventurePosition(storeAdventurePosition({...s,x,y},61),61);assert.deepEqual([saved.x,saved.y,saved.zaZone9Items,saved.teamIds],[x,y,['north-heal'],['kept']]);}
 assert.equal(zone9SouthScaffoldItem({...s,zaZone9Items:['south-scaffold-carbos']},'i'),null);assert.equal(zone9SouthScaffoldMap({...s,zaZone9Items:['south-scaffold-carbos']})[4][8],',');
});
