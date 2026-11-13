import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath,storeAdventurePosition,restoreAdventurePosition,stepField,cloudNpcTile,fieldMap} from '../lib/cloud-adventure/adventure-world.mjs';
import {zone20Map,zone20Visible,zone20Encounter,zone20Habitat,ZONE20_HABITAT_POOLS,ZONE20_ALPHA,ZONE20_NORTHEAST_STREAM,ZONE20_CONTAINERS,ZONE20_ROCKS,ZONE20_RUIN_SUPPORTS} from '../lib/cloud-adventure/adventure-mission42.mjs';
test('zone twenty retains Zygarde site and supports saved field position',()=>{
 const s={area:3,district:'lumiose-zone20',interior:null,x:11,y:14,facing:'up',zaMission42Stage:1};const map=zone20Map(s);
 assert.equal(map[6][11],'n');assert.ok(fieldPath(map,s,{x:11,y:7}).length);assert.equal(zone20Visible(s,'a').species,1);assert.equal(zone20Encounter(s,()=>0).speciesId,1);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:10},2),2);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone20',11,10]);assert.equal(stepField(s,'down').district,'lumiose-centrico-route');const old=storeAdventurePosition({...s,x:19,y:6},3);delete old.districtPosition.zone20Layout;const recovered=restoreAdventurePosition(old,3);assert.equal(recovered.district,'lumiose-zone20');assert.notEqual(zone20Map(recovered)[recovered.y][recovered.x],'~');
});

test('southeastern pond has a crossing and preserves older saves',()=>{
 const s={area:3,district:'lumiose-zone20',interior:null,x:17,y:11,teamIds:['kept'],zaMission42Stage:3,zaZone20Items:['south-seed']};const map=zone20Map(s);
 for(const y of [10,12,13])for(const x of [18,19,20])assert.equal(map[y][x],'~');
 for(const x of [18,19,20])assert.equal(map[11][x],',');
 let crossing=s;for(let i=0;i<4;i++){crossing={...crossing,...stepField(crossing,'right')};}assert.deepEqual([crossing.x,crossing.y],[21,11]);assert.ok(fieldPath(map,s,{x:11,y:7}).length);assert.ok(fieldPath(map,s,{x:11,y:7}).length);
 const old=storeAdventurePosition({...s,x:19,y:12},8);old.districtPosition.zone20Layout=1;
 const restored=restoreAdventurePosition(old,8);assert.equal(restored.district,'lumiose-zone20');assert.notEqual(map[restored.y][restored.x],'~');assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.zaZone20Items,['south-seed']);assert.equal(restored.zaMission42Stage,3);
 const fresh=storeAdventurePosition(s,9);assert.equal(fresh.districtPosition.zone20Layout,5);const again=restoreAdventurePosition(fresh,9);assert.deepEqual([again.x,again.y],[17,11]);
});

test('Zone 20 urban containers and dry rocks preserve routes and older locations',()=>{
 const s={area:3,district:'lumiose-zone20',interior:null,x:11,y:14,zaMission42Stage:3,zaZone20Items:['south-seed'],teamIds:['kept']},map=zone20Map(s);
 for(const [tiles,symbol] of [[ZONE20_CONTAINERS,'%'],[ZONE20_ROCKS,'^']])for(const [x,y] of tiles){assert.equal(map[y][x],symbol);const old=storeAdventurePosition({...s,x,y},128);old.districtPosition.zone20Layout=2;const saved=restoreAdventurePosition(old,128);assert.equal(saved.district,s.district);assert.notEqual(map[saved.y][saved.x],symbol);assert.deepEqual(saved.teamIds,['kept']);assert.deepEqual(saved.zaZone20Items,['south-seed']);assert.equal(saved.zaMission42Stage,3);assert.equal(restoreAdventurePosition(old,129).district,null);}
 assert.ok(fieldPath(map,s,{x:11,y:7}).length);assert.ok(fieldPath(map,s,{x:17,y:11}).length);for(const [x,y] of [[5,3],[5,10],[7,4],[16,12]])assert.equal(map[y][x],'g');
});

test('Zone 20 north and canal-side exits lead to directional plaza gates',()=>{
 const base={area:3,district:'lumiose-zone20',interior:null,zaMission38Complete:true,teamIds:['kept']},map=zone20Map(base);
 for(const [x,y,direction,expected] of [[11,1,'up',[11,4]],[1,8,'left',[3,8]],[21,8,'right',[19,8]]]){
  assert.ok(fieldPath(map,{x:11,y:14},{x,y}).length);const exit=stepField({...base,x,y},direction);assert.deepEqual([exit.district,exit.x,exit.y],['lumiose-centrico-route',...expected]);
  const saved=restoreAdventurePosition(storeAdventurePosition({...base,...exit},130),130);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-centrico-route',...expected,['kept']]);
 }
 assert.equal(stepField({...base,x:11,y:14},'down').district,'lumiose-centrico-route');
});

test('Zone 20 west gate connects to Magenta canal without replacing legacy exits',()=>{
 const canal={area:3,district:'lumiose-magenta-canal-route',interior:null,x:21,y:10,teamIds:['kept'],zaZone20Items:['south-seed']};
 assert.equal(fieldMap(canal)[10][22],'X');assert.ok(fieldPath(fieldMap(canal),{x:1,y:8},{x:21,y:10}).length);assert.equal(stepField(canal,'right').blocked,true);
 assert.equal(stepField({...canal,zaMission38Complete:true,zaMission42Stage:2},'right').blocked,true);
 for(const unlocked of [{zaMission38Complete:true},{zaMission42Stage:1},{zaMission42Stage:3},{zaMission42Stage:4}]){
  const entered=stepField({...canal,...unlocked},'right');assert.deepEqual([entered.district,entered.x,entered.y],['lumiose-zone20',1,9]);
  const saved=restoreAdventurePosition(storeAdventurePosition({...canal,...unlocked,...entered},170),170);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaZone20Items],['lumiose-zone20',1,9,['kept'],['south-seed']]);
  const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-magenta-canal-route',21,10]);
 }
 assert.deepEqual([stepField({area:3,district:'lumiose-zone20',x:1,y:8},'left').district,fieldMap(canal)[8][22]],['lumiose-centrico-route','X']);
});

test('Zone 20 east gate connects a separate Vert-side canal bank and restores both layers',()=>{
 const zone={area:3,district:'lumiose-zone20',interior:null,x:21,y:9,zaMission38Complete:true,teamIds:['kept'],zaZone20Items:['south-seed']};
 const intoBank=stepField(zone,'right');assert.deepEqual([intoBank.district,intoBank.x,intoBank.y,intoBank.zaVertSaisonBank],['lumiose-vert-sector1',1,8,true]);
 const bank={...zone,...intoBank},map=fieldMap(bank);assert.equal(map[3][5],'~');assert.ok(fieldPath(map,bank,{x:21,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(bank,171),171);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaVertSaisonBank,saved.teamIds],['lumiose-vert-sector1',1,8,true,['kept']]);
 const stale=restoreAdventurePosition(storeAdventurePosition(bank,171),172);assert.equal(stale.district,null);assert.equal(stale.zaVertSaisonBank,undefined);assert.deepEqual(stale.zaZone20Items,['south-seed']);
 assert.equal(stepField({...saved,zaMission38Complete:false},'left').blocked,true);
 const zoneBack=stepField(saved,'left');assert.deepEqual([zoneBack.district,zoneBack.x,zoneBack.y,zoneBack.zaVertSaisonBank],['lumiose-zone20',21,9,false]);
 const street=stepField({...saved,x:21,y:8},'right');assert.deepEqual([street.district,street.x,street.y,street.zaVertSaisonBank],['lumiose-vert-sector1',1,8,false]);
 const bankBack=stepField({...saved,...street},'left');assert.deepEqual([bankBack.district,bankBack.x,bankBack.y,bankBack.zaVertSaisonBank],['lumiose-vert-sector1',21,8,true]);
 assert.equal(stepField({...zone,x:21,y:8},'right').district,'lumiose-centrico-route');
});

test('Southern Rouge Street joins Zone 20, Rouge Plaza and Sector 1 without replacing older exits',()=>{
 const plaza={area:3,district:'lumiose-zone3',interior:null,x:12,y:15,zaMission38Complete:true,teamIds:['kept'],zaZone20Items:['south-seed']};
 const intoStreet=stepField(plaza,'down');assert.deepEqual([intoStreet.district,intoStreet.x,intoStreet.y,intoStreet.zaRougeStreetSouth],['lumiose-rouge-north',11,1,true]);
 const street={...plaza,...intoStreet},map=fieldMap(street);assert.ok(fieldPath(map,street,{x:11,y:15}).length);assert.ok(fieldPath(map,street,{x:1,y:8}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(street,173),173);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaRougeStreetSouth,saved.teamIds],['lumiose-rouge-north',11,1,true,['kept']]);
 const stale=restoreAdventurePosition(storeAdventurePosition(street,173),174);assert.equal(stale.district,null);assert.equal(stale.zaRougeStreetSouth,undefined);assert.deepEqual(stale.zaZone20Items,['south-seed']);
 const back=stepField(saved,'up');assert.deepEqual([back.district,back.x,back.y,back.zaRougeStreetSouth],['lumiose-zone3',12,15,false]);
 const south={...saved,x:11,y:15};assert.equal(stepField({...south,zaMission38Complete:false},'down').blocked,true);
 const zone=stepField(south,'down');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone20',12,1]);
 const returnStreet=stepField({...south,...zone},'up');assert.deepEqual([returnStreet.district,returnStreet.x,returnStreet.y,returnStreet.zaRougeStreetSouth],['lumiose-rouge-north',11,15,true]);
 const sector=stepField({...saved,x:1,y:8},'left');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-rouge-sector1',21,9]);
 const returnFromSector=stepField({...saved,...sector},'right');assert.deepEqual([returnFromSector.district,returnFromSector.x,returnFromSector.y,returnFromSector.zaRougeStreetSouth],['lumiose-rouge-north',1,8,true]);
 const gallery=stepField({...saved,x:21,y:8},'right');assert.deepEqual([gallery.district,gallery.x,gallery.y,gallery.zaRougeStreetSouth],['lumiose-galerie-lune',1,8,false]);
 const returnFromGallery=stepField({...saved,...gallery},'left');assert.deepEqual([returnFromGallery.district,returnFromGallery.x,returnFromGallery.y,returnFromGallery.zaRougeStreetSouth],['lumiose-rouge-north',21,8,true]);
 const oldGalleryExit=stepField({...saved,...gallery,x:1,y:7,zaRougeStreetSouth:true},'left');assert.deepEqual([oldGalleryExit.district,oldGalleryExit.x,oldGalleryExit.y,oldGalleryExit.zaRougeStreetSouth],['lumiose-rouge-north',21,12,false]);
 assert.equal(stepField({...plaza,x:11,y:15},'down').district,'lumiose-centrico-route');assert.equal(stepField({...zone,x:11,y:1},'up').district,'lumiose-centrico-route');
});

test('Zone 20 northeastern promenade joins the north and east approaches',()=>{
 const base={area:3,district:'lumiose-zone20',interior:null,zaMission38Complete:true,teamIds:['kept'],zaZone20Items:['south-seed']},map=zone20Map(base);
 for(let x=11;x<=17;x++)assert.equal(map[1][x],',');
 for(let x=17;x<=21;x++)assert.equal(map[2][x],',');
 for(let y=2;y<=8;y++)assert.equal(map[y][21],',');
 assert.equal(map[5][19],'~');assert.equal(map[4][16],'g');assert.ok(fieldPath(map,{x:11,y:1},{x:21,y:8}).length);
 for(const [x,y] of [[11,1],[17,2],[21,6],[21,8]]){const saved=restoreAdventurePosition(storeAdventurePosition({...base,x,y},153),153);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaZone20Items],[base.district,x,y,['kept'],['south-seed']]);}
});


test('directional plaza gates stay walkable, non-NPC and keep old saved positions',()=>{
 const base={area:3,district:'lumiose-centrico-route',interior:null,x:11,y:8,teamIds:['kept']},map=fieldMap(base);
 for(const [x,y] of [[11,4],[3,8],[19,8]]){
  assert.equal(map[y][x],'G');assert.equal(cloudNpcTile('G',base),false);assert.ok(fieldPath(map,base,{x,y}).length);
  const restored=restoreAdventurePosition(storeAdventurePosition({...base,x,y},131),131);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],[base.district,x,y,['kept']]);
 }
});

test('Centrico north and west approaches preserve the Zone 20 gate and saved tiles',()=>{
 const s={area:3,district:'lumiose-centrico-route',interior:null,teamIds:['kept'],zaMission38Complete:true},map=fieldMap(s);
 for(let y=1;y<=4;y++)assert.equal(map[y][7],',');
 for(let x=7;x<=10;x++)assert.equal(map[4][x],',');
 assert.equal(map[4][11],'G');assert.equal(map[10][1],',');assert.equal(map[11][1],':');assert.equal(map[12][0],'X');
 assert.ok(fieldPath(map,{x:7,y:1},{x:11,y:4}).length);assert.ok(fieldPath(map,{x:1,y:12},{x:3,y:8}).length);
 for(const [x,y] of [[7,1],[7,4],[10,4],[1,10]]){const saved=restoreAdventurePosition(storeAdventurePosition({...s,x,y},154),154);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMission38Complete],[s.district,x,y,['kept'],true]);}
 assert.equal(stepField({...s,x:7,y:1},'up').district,'lumiose-rouge-sector1');assert.equal(stepField({...s,x:1,y:12},'left').district,'lumiose-magenta-canal-route');
});

test('central ruined tower supports preserve all four approaches and migrate older positions',()=>{
 const base={area:3,district:'lumiose-zone20',interior:null,zaMission38Complete:true,zaMission42Stage:3,zaZone20Items:['south-seed'],teamIds:['kept']},map=zone20Map(base);
 for(const [x,y] of ZONE20_RUIN_SUPPORTS){assert.equal(map[y][x],'|');const old=storeAdventurePosition({...base,x,y},166);old.districtPosition.zone20Layout=3;const restored=restoreAdventurePosition(structuredClone(old),166);assert.equal(restored.district,base.district);assert.notEqual(map[restored.y][restored.x],'|');assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.zaZone20Items,['south-seed']);assert.equal(restored.zaMission42Stage,3);assert.equal(restoreAdventurePosition(structuredClone(old),167).district,null);}
 for(const point of [{x:11,y:1},{x:1,y:8},{x:21,y:8},{x:11,y:14}])assert.ok(fieldPath(map,point,{x:11,y:7}).length);
 assert.equal(map[6][11],'n');assert.equal(zone20Visible(base,'a').species,1);assert.equal(storeAdventurePosition({...base,x:11,y:7},166).districtPosition.zone20Layout,5);
});

test('two independent Zone 20 alpha locations preserve legacy and spent state',()=>{
 const legacy={area:3,district:'lumiose-zone20',interior:null,x:11,y:14,zaZone20AlphaSpecies:448,zaZone20Spent:{alpha:true},teamIds:['kept']};
 assert.equal(zone20Visible(legacy,'d'),null);assert.equal(zone20Visible(legacy,'e'),null);
 const s={...legacy,zaZone20AlphaSpecies2:282},map=zone20Map(s);
 assert.equal(map[7][13],'g');assert.equal(map[7][9],'e');assert.equal(zone20Visible(s,'e').species,282);assert.equal(zone20Visible(s,'e').id,'alpha2');
 const saved=restoreAdventurePosition(storeAdventurePosition(s,201),201);assert.deepEqual([saved.zaZone20AlphaSpecies,saved.zaZone20AlphaSpecies2,saved.zaZone20Spent,saved.teamIds],[448,282,{alpha:true},['kept']]);
 assert.equal(zone20Visible({...s,zaZone20Spent:{alpha2:true}},'d').species,448);assert.equal(zone20Visible({...s,zaZone20Spent:{alpha2:true}},'e'),null);
 assert.ok(fieldPath(map,{x:11,y:14},{x:11,y:7}).length);
});

test('documented central alpha pool supports every battle species',async()=>{
 const {makeMon}=await import('../lib/game.mjs');assert.equal(ZONE20_ALPHA.length,67);assert.equal(new Set(ZONE20_ALPHA.map(p=>p.species)).size,67);
 for(const p of ZONE20_ALPHA){const mon=makeMon(p.species,64);assert.equal(mon.speciesId,p.species);assert.equal(mon.name,p.name);}
});

test('every Zone 20 research species has a wild encounter slot',async()=>{
 const {ZONE20_ENCOUNTER_SPECIES,zone20Encounter}=await import('../lib/cloud-adventure/adventure-mission42.mjs');const {LATER_ZONE_SPECIES}=await import('../lib/cloud-adventure/adventure-zone-research.mjs');
 assert.deepEqual([...ZONE20_ENCOUNTER_SPECIES].sort((a,b)=>a-b),[...LATER_ZONE_SPECIES[20]].sort((a,b)=>a-b));
 for(let i=0;i<ZONE20_ENCOUNTER_SPECIES.length;i++)assert.equal(zone20Encounter({},()=>((i+.5)/ZONE20_ENCOUNTER_SPECIES.length)).speciesId,ZONE20_ENCOUNTER_SPECIES[i]);
});

test('Zone 20 habitat pools are reachable on grass and retain every research species',async()=>{
 const {ZONE20_ENCOUNTER_SPECIES}=await import('../lib/cloud-adventure/adventure-mission42.mjs');
 const map=zone20Map({}),samples={grass:{x:10,y:10},waterside:{x:17,y:9},dry:{x:5,y:10},ruins:{x:5,y:5}},seen=new Set();
 for(const [habitat,pos] of Object.entries(samples)){
  assert.equal(map[pos.y][pos.x],'g');assert.equal(zone20Habitat(pos),habitat);
  assert.ok(fieldPath(map,{x:11,y:14},pos).length,habitat);
  const pool=ZONE20_HABITAT_POOLS[habitat];
  for(let i=0;i<pool.length;i++){const mon=zone20Encounter(pos,()=>((i+.5)/pool.length));assert.equal(mon.speciesId,pool[i]);seen.add(mon.speciesId);}
 }
 assert.deepEqual([...seen].sort((a,b)=>a-b),[...ZONE20_ENCOUNTER_SPECIES].sort((a,b)=>a-b));
 assert.equal(map[10][18],'~');
});

test('Zone 20 stream and distinct land remain connected and migrate earlier positions',()=>{
 const base={area:3,district:'lumiose-zone20',interior:null,x:11,y:14,facing:'up',zaMission38Complete:true,teamIds:['kept'],zaZone20Items:['south-seed'],zaMission42Stage:3},map=zone20Map(base);
 for(const [x,y] of ZONE20_NORTHEAST_STREAM){assert.equal(map[y][x],'~');const old=storeAdventurePosition({...base,x,y},200);old.districtPosition.zone20Layout=4;const restored=restoreAdventurePosition(old,200);assert.equal(restored.district,base.district);assert.notEqual(map[restored.y][restored.x],'~');assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.zaZone20Items,['south-seed']);assert.equal(restored.zaMission42Stage,3);assert.equal(restoreAdventurePosition(old,201).district,null);}
 assert.equal(map[3][1],',');assert.equal(map[10][1],';');assert.equal(map[3][5],'g');
 for(const target of [{x:11,y:1},{x:1,y:8},{x:21,y:8},{x:21,y:9},{x:17,y:11},{x:11,y:7}])assert.ok(fieldPath(map,base,target).length,`unreachable ${target.x},${target.y}`);
});

test('Floral Avenue connects to the south of Zone 20 without replacing legacy gates',()=>{
 const floral={area:3,district:'lumiose-floral',interior:null,x:12,y:1,teamIds:['kept'],zaMission38Complete:false};
 assert.equal(stepField(floral,'up').blocked,true);
 assert.equal(stepField({...floral,zaMission38Complete:true,zaMission42Stage:2},'up').blocked,true);
 for(const extra of [{zaMission38Complete:true},{zaMission42Stage:1},{zaMission42Stage:3},{zaMission42Stage:4}]){
  const entered=stepField({...floral,...extra},'up');assert.deepEqual([entered.district,entered.x,entered.y],['lumiose-zone20',12,15]);
  const zone={...floral,...extra,...entered,zaZone20Items:['south-seed'],zaZone20Spent:{alpha:true},coins:321};
  const restored=restoreAdventurePosition(storeAdventurePosition(zone,27),27);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds,restored.coins,restored.zaZone20Items,restored.zaZone20Spent],['lumiose-zone20',12,15,['kept'],321,['south-seed'],{alpha:true}]);
  const exit=stepField(restored,'down');assert.deepEqual([exit.district,exit.x,exit.y],['lumiose-floral',12,1]);
  assert.ok(fieldPath(zone20Map(zone),zone,{x:11,y:7}).length);assert.ok(fieldPath(zone20Map(zone),zone,{x:17,y:11}).length);
 }
 const old={area:3,district:'lumiose-zone20',interior:null,x:11,y:14,zaMission38Complete:true};assert.equal(stepField(old,'down').district,'lumiose-centrico-route');
});

test('Zone 20 wooded park keeps promenade, gates and pond while restoring old saves',async()=>{
 const {ZONE20_NORTHEAST_TREES,zone20ChamberMap}=await import('../lib/cloud-adventure/adventure-mission42.mjs');
 const s={area:3,district:'lumiose-zone20',interior:null,zaMission38Complete:true,zaMission42Stage:3,teamIds:['kept'],zaZone20Items:['south-seed'],zaZone20Spent:{bulbasaur:true}},map=zone20Map(s);
 for(const [x,y] of ZONE20_NORTHEAST_TREES){assert.equal(map[y][x],'^');const old=storeAdventurePosition({...s,x,y},310);delete old.districtPosition.zone20ParkLayout;const restored=restoreAdventurePosition(old,310);assert.notDeepEqual([restored.x,restored.y],[x,y]);assert.notEqual(map[restored.y][restored.x],'^');assert.ok(fieldPath(map,restored,{x:11,y:14}).length);assert.deepEqual([restored.teamIds,restored.zaZone20Items,restored.zaZone20Spent,restored.zaMission42Stage],[['kept'],['south-seed'],{bulbasaur:true},3]);}
 for(const target of [{x:11,y:1},{x:21,y:8},{x:1,y:8},{x:12,y:15},{x:20,y:11}])assert.ok(fieldPath(map,{x:17,y:2},target).length,JSON.stringify(target));
 assert.equal(map[3][18],'~');assert.equal(map[11][19],',');const underground={...s,zaMission42Underground:true,zaMission42ChamberV1:true};assert.deepEqual(zone20Map(underground),zone20ChamberMap());
 const legacy=storeAdventurePosition({...s,x:15,y:2,zaMission42Underground:true,zaMission42ChamberV1:false},313);delete legacy.districtPosition.zone20ParkLayout;const restoredLegacy=restoreAdventurePosition(legacy,313);assert.notDeepEqual([restoredLegacy.x,restoredLegacy.y],[15,2]);
 const old=storeAdventurePosition({...s,x:15,y:2},311);delete old.districtPosition.zone20ParkLayout;assert.equal(restoreAdventurePosition(old,312).district,null);
});

test('Zone 20 east park walk and pond crossing connect to ruins while older shore saves recover',async()=>{
 const {ZONE20_POND_SOUTH_EXTENSION,zone20ChamberMap}=await import('../lib/cloud-adventure/adventure-mission42.mjs');
 const s={area:3,district:'lumiose-zone20',interior:null,zaMission38Complete:true,zaMission42Stage:3,teamIds:['kept'],zaZone20Items:['south-seed'],zaZone20Spent:{bulbasaur:true}},map=zone20Map(s);
 for(const [x,y] of ZONE20_POND_SOUTH_EXTENSION){assert.equal(map[y][x],'~');const old=storeAdventurePosition({...s,x,y},320);delete old.districtPosition.zone20PondSouthLayout;const r=restoreAdventurePosition(old,320);assert.notDeepEqual([r.x,r.y],[x,y]);assert.notEqual(map[r.y][r.x],'~');assert.ok(fieldPath(map,r,{x:11,y:14}).length);assert.deepEqual([r.teamIds,r.zaZone20Items,r.zaZone20Spent,r.zaMission42Stage],[['kept'],['south-seed'],{bulbasaur:true},3]);}
 for(let y=9;y<=14;y++)assert.equal(map[y][21],',');for(let x=18;x<=20;x++)assert.equal(map[11][x],',');
 for(const target of [{x:11,y:1},{x:21,y:8},{x:1,y:8},{x:12,y:15},{x:11,y:7},{x:17,y:2}])assert.ok(fieldPath(map,{x:21,y:11},target).length,JSON.stringify(target));
 let v={...s,x:17,y:11};for(let i=0;i<4;i++)v={...v,...stepField(v,'right')};assert.deepEqual([v.x,v.y],[21,11]);assert.equal(stepField({...s,x:19,y:15},'up').blocked,true);
 const underground={...s,zaMission42ChamberV1:true,zaMission42Underground:true};assert.deepEqual(zone20Map(underground),zone20ChamberMap());const legacy=storeAdventurePosition({...s,x:19,y:14,zaMission42ChamberV1:false,zaMission42Underground:true},323);delete legacy.districtPosition.zone20PondSouthLayout;const legacyRestored=restoreAdventurePosition(legacy,323);assert.notDeepEqual([legacyRestored.x,legacyRestored.y],[19,14]);const old=storeAdventurePosition({...s,x:19,y:14},321);delete old.districtPosition.zone20PondSouthLayout;assert.equal(restoreAdventurePosition(old,322).district,null);
});
