import test from 'node:test';
import assert from 'node:assert/strict';
import {zone10Map,zone10Encounter,zone10Visible,zone10Item} from '../lib/cloud-adventure/adventure-zone10.mjs';
import {stepField,fieldPath,fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition,walkable} from '../lib/cloud-adventure/adventure-world.mjs';

test('Zone 10 canal path reaches both entrances and preserves floor saves',()=>{
 const s={area:3,district:'lumiose-zone10',interior:null,regionId:6,districtReturnRegion:1,teamIds:['kept']},map=zone10Map(s);
 for(const [x,y] of [[1,6],[1,7],[21,6],[21,7]]){
  assert.equal(map[y][x],',');const saved=restoreAdventurePosition(storeAdventurePosition({...s,x,y},69),69);
  assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[s.district,x,y,['kept']]);
 }
 assert.ok(fieldPath(map,{x:1,y:6},{x:21,y:6}).length);
 assert.equal(stepField({...s,x:1,y:6},'left').district,'lumiose-south-boulevard');
 assert.equal(stepField({...s,x:21,y:6},'right').district,'lumiose-espace-vide');
 assert.equal(map[8][11],'c');assert.equal(map[4][17],'l');
});
test('zone ten canal, rooftop, gate and saved positions',()=>{
 const base={area:3,district:'lumiose-south-boulevard',interior:null,x:11,y:1,facing:'up',zaRoyaleRank:'V'};assert.equal(stepField(base,'up').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'F'},'up');assert.equal(entered.district,'lumiose-zone10');const s={...base,...entered,zaRoyaleRank:'F'},map=zone10Map(s);assert.ok(fieldPath(map,s,{x:17,y:5}).length);assert.equal(zone10Visible(s,'c').species,318);assert.equal(zone10Visible(s,'e').alpha,true);assert.equal(zone10Item(s,'i').kind,'quickball');assert.equal(zone10Item({...s,zaZone10Items:['canal-quick']},'i'),null);assert.equal(stepField({...s,x:11,y:7},'down').blocked,true);
 const roof={...s,zaZone10Upper:true,x:17,y:5};assert.equal(zone10Visible(roof,'a').species,24);assert.equal(zone10Visible(roof,'f').alpha,true);assert.equal(zone10Item(roof,'i').kind,'hyper_potions');assert.equal(zone10Encounter(roof,()=>0).speciesId,24);const restored=restoreAdventurePosition(storeAdventurePosition(roof,42),42);assert.deepEqual([restored.district,restored.zaZone10Upper,restored.x,restored.y],['lumiose-zone10',true,17,5]);assert.equal(stepField(s,'left').district,'lumiose-south-boulevard');
});

test('Centrico route reaches Zone 10 via South Boulevard while preserving the gate',()=>{
 const c={area:3,district:'lumiose-centrico-route',interior:null,x:20,y:15,zaRoyaleRank:'V',teamIds:['kept']};
 const road=stepField(c,'down');assert.deepEqual([road.district,road.x,road.y],['lumiose-south-boulevard',14,1]);
 assert.equal(stepField({...c,...road},'up').district,'lumiose-centrico-route');
 assert.ok(fieldPath(fieldMap({...c,...road}),road,{x:11,y:1}).length);
 assert.equal(stepField({...c,...road,x:11,y:1},'up').blocked,true);
 const saved=restoreAdventurePosition(storeAdventurePosition({...c,...road},30),30);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-south-boulevard',14,1,['kept']]);
});

test('Estival Avenue links opposite Zones 9 and 10 without bypassing rank',()=>{
 const road={area:3,district:'lumiose-estival-approach',interior:null,x:1,y:8,zaRoyaleRank:'V',teamIds:['kept']};
 assert.equal(stepField(road,'left').blocked,true);
 assert.equal(stepField({...road,x:21},'right').blocked,true);
 const opened={...road,zaRoyaleRank:'F'};
 const ten=stepField(opened,'left');assert.deepEqual([ten.district,ten.x,ten.y],['lumiose-zone10',11,1]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...opened,...ten},88),88);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone10',11,1,['kept']]);
 const back=stepField(saved,'up');assert.deepEqual([back.district,back.x,back.y],['lumiose-estival-approach',1,8]);
 assert.ok(fieldPath(fieldMap({...saved,...back}),back,{x:21,y:8}).length);
 assert.equal(stepField({...saved,...back,x:21,y:8},'right').district,'lumiose-zone9');
 assert.equal(stepField({...saved,zaZone10Upper:true,x:11,y:1},'up').blocked,true);
});

test('roof benches preserve old saved positions and access to the ladder and potion',()=>{
 const roof={area:3,district:'lumiose-zone10',interior:null,zaZone10Upper:true,teamIds:['kept'],zaZone10Items:[]};
 const map=zone10Map(roof);assert.equal(map[3][17],'^');assert.equal(map[3][19],'^');
 for(const x of [17,19]){
  const saved=storeAdventurePosition({...roof,x,y:3},81);
  const restored=restoreAdventurePosition(saved,81);
  assert.equal(restored.district,'lumiose-zone10');assert.ok(walkable(map[restored.y][restored.x]));
  assert.deepEqual([restored.zaZone10Upper,restored.teamIds],[true,['kept']]);
  assert.ok(fieldPath(map,restored,{x:17,y:5}).length);
  assert.ok(fieldPath(map,restored,{x:18,y:4}).length);
  assert.equal(restoreAdventurePosition(saved,82).district,null);
 }
});

test('western rooftop sludge gates the TM and survives a saved return',()=>{
 const s={area:3,district:'lumiose-zone10',interior:null,zaZone10Upper:true,x:3,y:5,facing:'left',teamIds:['kept']};
 assert.equal(zone10Map(s)[5][2],'r');assert.equal(fieldDialogue(s).action,'zone10ClearSludge');
 assert.equal(fieldPath(zone10Map(s),s,{x:1,y:5}).length,0);
 const opened={...s,zaZone10SludgeCleared:true};assert.ok(fieldPath(zone10Map(opened),opened,{x:1,y:5}).length);
 assert.equal(zone10Item(opened,'t').kind,'za-tm034');
 const saved=restoreAdventurePosition(storeAdventurePosition({...opened,x:2,zaZone10Items:['roof-tm034']},89),89);
 assert.equal(saved.district,'lumiose-zone10');assert.equal(saved.zaZone10SludgeCleared,true);
 assert.equal(zone10Item(saved,'t'),null);assert.deepEqual(saved.teamIds,['kept']);
 assert.equal(restoreAdventurePosition(storeAdventurePosition(opened,89),90).district,null);
});

test('canal-side path retains west-east access and old saved tiles',()=>{
 const state={area:3,district:'lumiose-zone10',interior:null,zaZone10Upper:false,x:11,y:7,zaRoyaleRank:'F',teamIds:['kept']};
 const map=zone10Map(state);assert.equal(map[7][11],',');assert.equal(map[6][0],'W');assert.equal(map[6][22],'E');
 assert.ok(fieldPath(map,{x:2,y:7},{x:20,y:7}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(state,79),79);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone10',11,7,['kept']]);
 assert.equal(stepField({...state,x:10,y:7},'right').tile,',');
});

test('canal reaches both map edges and older ground-edge saves move safely',()=>{
 const base={area:3,district:'lumiose-zone10',interior:null,x:1,y:8,zaRoyaleRank:'F',teamIds:['kept']},map=zone10Map(base);
 for(const y of [8,10,12]){assert.equal(map[y][0],'~');assert.equal(map[y][22],'~');}
 assert.ok(fieldPath(map,{x:1,y:6},{x:21,y:6}).length);
 for(const [x,y] of [[1,8],[2,12],[20,8],[21,12]]){
  const old=storeAdventurePosition({...base,x,y},88);delete old.districtPosition.zone10CanalLayout;
  const restored=restoreAdventurePosition(structuredClone(old),88);assert.equal(restored.district,base.district);assert.ok(walkable(map[restored.y][restored.x]));assert.deepEqual(restored.teamIds,['kept']);
  assert.equal(restoreAdventurePosition(structuredClone(old),89).district,null);
 }
 const roof={...base,x:19,y:6,zaZone10Upper:true};const saved=restoreAdventurePosition(storeAdventurePosition(roof,90),90);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaZone10Upper],[base.district,19,6,true]);
});

test('draft roof sections sit over the canal while both floors remain distinct',()=>{
 const base={area:3,district:'lumiose-zone10',interior:null,zaRoyaleRank:'F',teamIds:['kept'],zaZone10Items:['canal-quick']};
 const ground=zone10Map(base),roof=zone10Map({...base,zaZone10Upper:true});
 for(const [x,y] of [[5,9],[7,10],[15,9],[17,10]]){
  assert.equal(ground[y][x],'~');assert.equal(roof[y][x],'.');
  const state={...base,zaZone10Upper:true,x,y};const saved=restoreAdventurePosition(storeAdventurePosition(state,91),91);
  assert.deepEqual([saved.district,saved.x,saved.y,saved.zaZone10Upper],[base.district,x,y,true]);assert.deepEqual(saved.teamIds,['kept']);assert.deepEqual(saved.zaZone10Items,['canal-quick']);
  assert.ok(fieldPath(roof,saved,{x:17,y:5}).length);
 }
 assert.ok(fieldPath(ground,{x:1,y:6},{x:21,y:6}).length);
});

test('east entrance shallow water reaches Tynamo and preserves its water tile after encounter',()=>{
 const s={area:3,district:'lumiose-zone10',interior:null,zaZone10Upper:false,x:20,y:7,facing:'down',teamIds:['kept']},map=zone10Map(s);
 assert.equal(map[8][20],'v');assert.equal(zone10Visible(s,'v').species,602);assert.equal(fieldDialogue(s).action,'zone10Wild-tynamo');assert.equal(map[9][20],'w');assert.ok(fieldPath(map,s,{x:21,y:10}).length);assert.equal(walkable(map[10][18]),false);
 const spent={...s,x:20,y:8,zaZone10Spent:{tynamo:true}},cleared=zone10Map(spent);assert.equal(cleared[8][20],'w');const restored=restoreAdventurePosition(storeAdventurePosition(spent,88),88);assert.deepEqual([restored.x,restored.y,restored.teamIds],[20,8,['kept']]);assert.equal(zone10Visible(spent,'v'),null);
});
