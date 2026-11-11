import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath,storeAdventurePosition,restoreAdventurePosition,stepField,cloudNpcTile,fieldMap} from '../lib/cloud-adventure/adventure-world.mjs';
import {zone20Map,zone20Visible,zone20Encounter,ZONE20_ALPHA,ZONE20_CONTAINERS,ZONE20_ROCKS,ZONE20_RUIN_SUPPORTS} from '../lib/cloud-adventure/adventure-mission42.mjs';
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
 const fresh=storeAdventurePosition(s,9);assert.equal(fresh.districtPosition.zone20Layout,4);const again=restoreAdventurePosition(fresh,9);assert.deepEqual([again.x,again.y],[17,11]);
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
 assert.equal(map[6][11],'n');assert.equal(zone20Visible(base,'a').species,1);assert.equal(storeAdventurePosition({...base,x:11,y:7},166).districtPosition.zone20Layout,4);
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
