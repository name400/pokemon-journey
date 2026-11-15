import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,fieldDialogue,storeAdventurePosition,restoreAdventurePosition,walkable} from '../lib/cloud-adventure/adventure-world.mjs';

test('Vernal connects to Centrico on the ground and preserves older exits and layers',()=>{
 const avenue={area:3,district:'lumiose-vernal',interior:null,x:8,y:1,teamIds:['kept'],money:731};
 assert.ok(fieldPath(fieldMap(avenue),{x:12,y:8},avenue).length);
 const plaza=stepField(avenue,'up');assert.deepEqual([plaza.district,plaza.x,plaza.y],['lumiose-centrico-route',15,15]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...avenue,...plaza},162),162);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.money],['lumiose-centrico-route',15,15,['kept'],731]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:19,y:8}).length);
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y,back.zaVernalEastRoof,back.zaVernalSlowbroBank],['lumiose-vernal',8,1,false,false]);
 assert.equal(stepField({...saved,zaVernalEastRoof:{version:2}},'down').blocked,true);
 assert.notEqual(stepField({...avenue,zaVernalSlowbroBank:true},'up').transitioned,true);
 assert.equal(stepField({...avenue,x:11,y:14},'down').district,'lumiose-floral');
});

test('Vert 4 ground path connects Vernal approach to Vert Plaza without altering layers',()=>{
 const s={area:3,district:'lumiose-vert-sector4',interior:null,x:21,y:5,teamIds:['kept'],money:731};
 assert.ok(fieldPath(fieldMap(s),{x:1,y:8},s).length);
 const plaza=stepField(s,'right');assert.deepEqual([plaza.district,plaza.x,plaza.y],['lumiose-vert-plaza',1,12]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,...plaza},158),158);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.money],['lumiose-vert-plaza',1,12,['kept'],731]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:11,y:8}).length);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y,back.zaVert4Layer],['lumiose-vert-sector4',21,5,'ground']);
 assert.equal(stepField({...s,zaVert4Layer:null},'right').district,'lumiose-vert-plaza');
 assert.equal(stepField({...saved,zaVert4Layer:{version:2}},'left').blocked,true);
 assert.notEqual(stepField({...s,zaVert4Layer:'roof'},'right').transitioned,true);
 assert.equal(stepField({...s,x:21,y:8},'right').district,'lumiose-vert-sector5');
});

test('Vert 2 connects to Vernal on the ground without altering nearby zone gates or layers',()=>{
 const city={area:3,district:'lumiose-vert2',interior:null,x:1,y:12,zaRoyaleRank:'F',zaMission03Stage:3,teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(city),city,{x:11,y:8}).length);assert.equal(stepField({...city,x:1,y:5},'left').blocked,true);
 const avenue=stepField(city,'left');assert.deepEqual([avenue.district,avenue.x,avenue.y,avenue.zaVernalEastRoof,avenue.zaVernalSlowbroBank],['lumiose-vernal',21,7,false,false]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...city,...avenue},129),129);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaMission03Stage,saved.teamIds],['lumiose-vernal',21,7,3,['kept']]);
 const back=stepField(saved,'right');assert.deepEqual([back.district,back.x,back.y,back.zaVert2RoofUpper],['lumiose-vert2',1,12,false]);
 assert.notEqual(stepField({...city,zaVert2RoofUpper:true},'left').transitioned,true);
 assert.notEqual(stepField({...saved,zaVernalSlowbroBank:true},'right').transitioned,true);
 assert.notEqual(stepField({...saved,zaVernalEastRoof:true},'right').transitioned,true);
 assert.equal(stepField({...city,zaVernalEastRoof:{version:2}},'left').blocked,true);
 assert.equal(stepField({...saved,zaVert2RoofUpper:{version:2}},'right').blocked,true);
 assert.equal(stepField({...city,x:21,y:8},'right').district,'lumiose-zone2');
 const old=restoreAdventurePosition(storeAdventurePosition({...city,x:11,y:8},129),129);assert.deepEqual([old.x,old.y],[11,8]);
});

test('Vert 2 and Vert Street connect at ground level without bypassing locked zones or Mission 3',()=>{
 const base={area:3,district:'lumiose-vert2',interior:null,x:21,y:5,zaMission03Stage:3,zaRoyaleRank:'F',teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(base),{x:11,y:8},base).length);
 assert.equal(stepField({...base,x:17,y:15},'down').blocked,true);assert.equal(stepField({...base,x:1,y:5},'left').blocked,true);
 const street=stepField(base,'right');assert.deepEqual([street.district,street.x,street.y],['lumiose-vert-street-route',1,14]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...base,...street},128),128);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaMission03Stage,saved.teamIds],['lumiose-vert-street-route',1,14,3,['kept']]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:10,y:13}).length);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y,back.zaVert2RoofUpper],['lumiose-vert2',21,5,false]);
 const active={...base,zaMission03Stage:2,zaMission03DetourRequired:true};assert.equal(stepField(active,'right').blocked,true);
 assert.equal(stepField({...active,district:'lumiose-vert-street-route',x:1,y:14},'left').blocked,true);
 assert.notEqual(stepField({...active,zaMission03DetourRequired:undefined},'right').blocked,true);
 assert.notEqual(stepField({...base,zaVert2RoofUpper:true},'right').transitioned,true);
 assert.equal(stepField({...base,x:21,y:8},'right').district,'lumiose-zone2');
 const old=restoreAdventurePosition(storeAdventurePosition({...base,x:11,y:8},128),128);assert.deepEqual([old.x,old.y],[11,8]);
});

test('Vert 5 and Vert Street connect while preserving Lida and the Mission 3 detour',()=>{
 const base={area:3,district:'lumiose-vert-sector5',interior:null,x:21,y:8,zaMission03Stage:3,zaRoyaleRank:'W',zaLidaStage:1,teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(base),{x:6,y:4},base).length);assert.equal(fieldMap(base)[4][5],'n');
 const street=stepField(base,'right');assert.deepEqual([street.district,street.x,street.y],['lumiose-vert-street-route',1,12]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...base,...street},127),127);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaLidaStage,saved.teamIds],['lumiose-vert-street-route',1,12,1,['kept']]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:10,y:13}).length);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-vert-sector5',21,8]);
 const active={...base,zaMission03Stage:2,zaMission03DetourRequired:true};assert.equal(stepField(active,'right').blocked,true);
 assert.equal(stepField({...active,district:'lumiose-vert-street-route',x:1,y:12},'left').blocked,true);
 assert.equal(stepField({...base,x:1,y:8},'left').district,'lumiose-vert-sector4');
 const old=restoreAdventurePosition(storeAdventurePosition({...base,x:11,y:1},127),127);assert.deepEqual([old.x,old.y],[11,1]);
});

test('Vert 8 and Vert Street connect without bypassing the active Mission 3 detour',()=>{
 const base={area:3,district:'lumiose-vert-sector8',interior:null,x:21,y:8,zaMission03Stage:3,teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(base),{x:11,y:8},base).length);
 const street=stepField(base,'right');assert.deepEqual([street.district,street.x,street.y],['lumiose-vert-street-route',21,12]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...base,...street},126),126);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaMission03Stage,saved.teamIds],['lumiose-vert-street-route',21,12,3,['kept']]);
 assert.ok(fieldPath(fieldMap(saved),saved,{x:10,y:13}).length);
 const back=stepField(saved,'right');assert.deepEqual([back.district,back.x,back.y],['lumiose-vert-sector8',21,8]);
 const active={...base,zaMission03Stage:2,zaMission03DetourRequired:true};assert.equal(stepField(active,'right').blocked,true);
 assert.equal(stepField({...active,district:'lumiose-vert-street-route',x:21,y:12},'right').blocked,true);
 assert.notEqual(stepField({...active,zaMission03DetourRequired:undefined},'right').blocked,true);
 assert.equal(stepField({...base,x:11,y:15},'down').district,'lumiose-zone1');
 const old=restoreAdventurePosition(storeAdventurePosition({...base,x:11,y:1},126),126);assert.deepEqual([old.x,old.y],[11,1]);
});

test('Vert 2, 4, 5 and Vert Plaza connect in both directions and retain saves',()=>{
 const start={area:3,district:'lumiose-vert2',interior:null,x:7,y:15,facing:'down',teamIds:['kept']};
 const four=stepField(start,'down');assert.deepEqual([four.district,four.x,four.y],['lumiose-vert-sector4',11,1]);
 let s={...start,...four};assert.ok(fieldPath(fieldMap(s),s,{x:21,y:8}).length);assert.equal(stepField(s,'up').district,'lumiose-vert2');
 const five=stepField({...s,x:21,y:8},'right');assert.deepEqual([five.district,five.x,five.y],['lumiose-vert-sector5',1,8]);
 s={...s,...five};assert.equal(stepField(s,'left').district,'lumiose-vert-sector4');assert.ok(fieldPath(fieldMap(s),s,{x:11,y:1}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:1},11),11);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[s.district,11,1,['kept']]);
 const plaza=stepField(saved,'up');assert.deepEqual([plaza.district,plaza.x,plaza.y],['lumiose-vert-plaza',15,15]);assert.equal(stepField({...saved,...plaza},'down').district,'lumiose-vert-sector5');
 assert.equal(restoreAdventurePosition(storeAdventurePosition(s,11),12).district,null);
 assert.equal(walkable(fieldMap({...start,...four})[3][3]),false);
});


test('Vert 4 street, roof and courtyard are separate saved layers',()=>{
 const street={area:3,district:'lumiose-vert-sector4',interior:null,x:9,y:6,facing:'up',teamIds:['kept']};
 assert.equal(fieldDialogue(street).action,'vert4Lift');const old=restoreAdventurePosition(storeAdventurePosition({...street,x:9,y:5},45),45);assert.deepEqual([old.district,old.x,old.y],[street.district,9,5]);
 const roof={...street,x:13,y:7,facing:'down',zaVert4Layer:'roof'},map=fieldMap(roof);assert.equal(fieldDialogue(roof).action,'vert4CourtyardDrop');assert.ok(fieldPath(map,roof,{x:4,y:9}).length);
 const court={...street,x:5,y:9,facing:'down',zaVert4Layer:'courtyard'};assert.equal(fieldDialogue(court).action,'vert4CourtyardLadder');
 for(const state of [roof,court]){const saved=restoreAdventurePosition(storeAdventurePosition(state,46),46);assert.deepEqual([saved.district,saved.x,saved.y,saved.zaVert4Layer,saved.teamIds],[state.district,state.x,state.y,state.zaVert4Layer,['kept']]);assert.equal(restoreAdventurePosition(storeAdventurePosition(state,46),47).district,null);}
});

test('Vernal Avenue and Vert 4 link near Cafe Classe without affecting roofs',()=>{
 const road={area:3,district:'lumiose-vernal',interior:null,x:21,y:4,facing:'right',teamIds:['kept']};
 const entered=stepField(road,'right');assert.deepEqual([entered.district,entered.x,entered.y],['lumiose-vert-sector4',1,8]);
 const sector={...road,...entered};assert.ok(fieldPath(fieldMap(sector),sector,{x:9,y:6}).length);const back=stepField(sector,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-vernal',21,4]);
 assert.equal(stepField({...road,zaVernalEastRoof:true},'right').blocked,true);
 for(const state of [road,sector]){const saved=restoreAdventurePosition(storeAdventurePosition(state,50),50);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[state.district,state.x,state.y,['kept']]);}
});

test('Vert 5 and Vert 8 join on the ground while hotel and Zone 1 exits remain',()=>{
 const start={area:3,district:'lumiose-vert-sector5',interior:null,x:11,y:1,teamIds:['kept'],zaMission05Stage:5};
 assert.ok(fieldPath(fieldMap(start),start,{x:11,y:15}).length);
 const south=stepField({...start,x:11,y:15},'down');assert.deepEqual([south.district,south.x,south.y],['lumiose-vert-sector8',9,1]);
 const eight={...start,...south};assert.ok(fieldPath(fieldMap(eight),eight,{x:11,y:15}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(eight,90),90);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMission05Stage],['lumiose-vert-sector8',9,1,['kept'],5]);
 const north=stepField(saved,'up');assert.deepEqual([north.district,north.x,north.y],['lumiose-vert-sector5',11,15]);
 assert.equal(stepField({...eight,x:11,y:1},'up').district,'lumiose');
 assert.equal(stepField({...eight,x:11,y:15},'down').district,'lumiose-zone1');
 const legacy=restoreAdventurePosition(storeAdventurePosition({...eight,x:11,y:1},91),91);
 assert.deepEqual([legacy.district,legacy.x,legacy.y,legacy.teamIds],['lumiose-vert-sector8',11,1,['kept']]);
});

test('Vert 8 and Vert 9 connect directly and preserve the waterway and old saves',()=>{
 const start={area:3,district:'lumiose-vert-sector8',interior:null,x:11,y:8,teamIds:['kept'],zaMission03Stage:7};
 assert.ok(fieldPath(fieldMap(start),start,{x:1,y:8}).length);
 const west=stepField({...start,x:1,y:8},'left');assert.deepEqual([west.district,west.x,west.y],['lumiose-vert-sector9',21,8]);
 const nine={...start,...west},map=fieldMap(nine);assert.equal(map[11][5],'~');assert.equal(map[11][11],':');
 assert.ok(fieldPath(map,nine,{x:11,y:15}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(nine,92),92);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMission03Stage],['lumiose-vert-sector9',21,8,['kept'],7]);
 const east=stepField(saved,'right');assert.deepEqual([east.district,east.x,east.y],['lumiose-vert-sector8',1,8]);
 assert.equal(stepField({...nine,x:11,y:15},'down').district,'lumiose-zone1');
 assert.equal(stepField({...start,x:11,y:1},'up').district,'lumiose');
 const legacy=restoreAdventurePosition(storeAdventurePosition({...nine,x:11,y:10},93),93);
 assert.deepEqual([legacy.district,legacy.x,legacy.y,legacy.teamIds],['lumiose-vert-sector9',11,10,['kept']]);
});

test('Vert 9 connects to Vert 4 and 5 without changing the waterway or roof layers',()=>{
 const base={area:3,district:'lumiose-vert-sector9',interior:null,x:11,y:8,teamIds:['kept'],zaMission03Stage:7};
 const map=fieldMap(base);assert.equal(map[11][5],'~');assert.equal(map[11][11],':');
 for(const [x,district,backX] of [[9,'lumiose-vert-sector4',11],[13,'lumiose-vert-sector5',9]]){
  assert.ok(fieldPath(map,base,{x,y:1}).length);
  const out=stepField({...base,x,y:1},'up');assert.deepEqual([out.district,out.x,out.y],[district,backX,15]);
  const saved=restoreAdventurePosition(storeAdventurePosition({...base,...out},94),94);
  assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaMission03Stage],[district,backX,15,['kept'],7]);
  const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y],['lumiose-vert-sector9',x,1]);
 }
 const roof={...base,district:'lumiose-vert-sector4',zaVert4Layer:'roof',x:11,y:10};
 assert.equal(fieldMap(roof)[16][11],'#');
 const old=restoreAdventurePosition(storeAdventurePosition({...base,x:11,y:10},95),95);assert.deepEqual([old.district,old.x,old.y],['lumiose-vert-sector9',11,10]);
 assert.equal(stepField({...base,x:21,y:8},'right').district,'lumiose-vert-sector8');
});
