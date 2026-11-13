import test from 'node:test';
import assert from 'node:assert/strict';
import {FAST_TRAVEL_CENTERS,centerAt,recordCenter,recordNearbyCenter,registeredCenters} from '../lib/cloud-adventure/adventure-fast-travel.mjs';
import {fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('registered centers are limited to real center tiles and survive save restoration',()=>{
 for(const c of FAST_TRAVEL_CENTERS){const s={area:3,district:c.district,interior:null,zaRougeStreetSouth:c.zaRougeStreetSouth,x:c.x,y:c.y,facing:'down'};assert.equal(fieldMap(s)[c.y][c.x],'H');assert.equal(centerAt(s,{...c,tile:'H'}).id,c.id);}
 const s={area:3,district:'lumiose',interior:null,x:3,y:5,facing:'down',zaMission06Started:true,teamIds:['kept']};assert.equal(recordCenter(s,{x:3,y:5,tile:'H'}),true);assert.equal(recordCenter(s,{x:3,y:5,tile:'H'}),false);assert.equal(recordCenter(s,{x:1,y:5,tile:'H'}),false);
 s.zaFastTravelCenters.push('untrusted','bleu');const restored=restoreAdventurePosition(storeAdventurePosition(s,88),88);assert.deepEqual(registeredCenters(restored).map(c=>c.id),['hotel','bleu']);assert.deepEqual(restored.teamIds,['kept']);assert.ok(fieldDialogue(restored).actions.some(a=>a.action==='fastTravel-bleu'));
});

test('nearby center discovery checks the actual layer and keeps unknown saved entries',()=>{
 const s={area:3,district:'lumiose-bleu-sector7',interior:null,x:10,y:13,zaFastTravelCenters:['future-center'],teamIds:['kept']};
 assert.equal(recordNearbyCenter({...s,x:8},()=>{throw Error('map should not be read');}),false);
 assert.equal(recordNearbyCenter({...s,interior:'hotel'},()=>{throw Error('interior');}),false);
 assert.equal(recordNearbyCenter(s,()=>[]),false);assert.deepEqual(s.zaFastTravelCenters,['future-center']);
 assert.equal(recordNearbyCenter(s,()=>fieldMap(s)),true);assert.deepEqual(s.zaFastTravelCenters,['future-center','bleu']);assert.deepEqual(s.teamIds,['kept']);
 assert.equal(recordNearbyCenter(s,()=>{throw Error('already registered');}),false);
 const upper={...s,zaFastTravelCenters:[],zaBleu7Upper:true};assert.notEqual(fieldMap(upper)[13]?.[11],'H');assert.equal(recordNearbyCenter(upper,()=>fieldMap(upper)),false);
 const wrongSide={area:3,district:'lumiose-rouge-north',x:14,y:11,zaRougeStreetSouth:false};assert.equal(recordNearbyCenter(wrongSide,()=>{throw Error('wrong side');}),false);
});

test('wild zone registration follows actual ground entry and existing progression gates',async()=>{
 const {fastTravelEnabled,recordZoneEntry,mapTravelDestinations,canMapTravel,zoneTravelUnlocked,taxiAvailable}=await import('../lib/cloud-adventure/adventure-fast-travel.mjs');
 assert.equal(fastTravelEnabled({zaRoyaleRank:'Z'}),false);assert.equal(fastTravelEnabled({zaMission04Complete:true}),true);
 const s={area:3,district:'lumiose-zone1',interior:null,x:11,y:1,zaMission04Complete:true,zaRoyaleRank:'Y'};assert.equal(recordZoneEntry(s,'lumiose-vert-sector9','.'),true);assert.deepEqual(mapTravelDestinations(s).map(x=>x.id),['zone1']);assert.equal(recordZoneEntry(s,'lumiose-zone1','.'),false);assert.equal(canMapTravel(s),true);assert.equal(canMapTravel({...s,combat:{}}),false);assert.equal(canMapTravel({...s,zaLeWowRun:{course:1}}),false);assert.equal(canMapTravel({...s,district:'lumiose-royale'}),false);assert.equal(canMapTravel({...s,district:'lumiose-zone3',zaZone3TowerUpper:true}),false);assert.equal(canMapTravel({...s,district:'lumiose-zone6',zaZone6Layer:'roof'}),false);assert.equal(canMapTravel({...s,district:'lumiose-south-boulevard',zaVert7RoofUpper:true}),false);assert.equal(canMapTravel({...s,district:'lumiose-vert-sector4',zaVert4Layer:'roof'}),false);assert.equal(canMapTravel({...s,district:'lumiose-bleu-sector7',zaBleu7Upper:true}),false);
 assert.equal(zoneTravelUnlocked({zaRoyaleRank:'C'},18),false);assert.equal(zoneTravelUnlocked({zaRoyaleRank:'B'},18),true);assert.equal(zoneTravelUnlocked({zaRoyaleRank:'C'},19),false);assert.equal(zoneTravelUnlocked({zaRoyaleRank:'B'},19),true);assert.equal(zoneTravelUnlocked({zaRoyaleRank:'A'},20),false);assert.equal(zoneTravelUnlocked({zaMission42Complete:true},20),true);assert.equal(canMapTravel({...s,district:'lumiose-zone20'}),false);assert.equal(canMapTravel({...s,district:'lumiose-zone20',zaMission42Complete:true}),true);assert.equal(canMapTravel({...s,district:'lumiose-zone20',zaMission42Complete:true,zaMission42Underground:true}),false);
 assert.equal(taxiAvailable({...s,district:'lumiose-south-boulevard'},{tile:'n',x:14,y:6}),true);assert.equal(taxiAvailable({...s,district:'lumiose-south-boulevard'},{tile:'n',x:13,y:6}),false);
});

test('zone re-entry repairs only a saved destination on definite wall or water',async()=>{
 const {recordZoneEntry}=await import('../lib/cloud-adventure/adventure-fast-travel.mjs');
 const s={area:3,district:'lumiose-zone1',interior:null,x:11,y:1,zaMission04Complete:true,zaRoyaleRank:'Y',zaFastTravelZones:{1:{x:3,y:2},2:{x:11,y:1}},teamIds:['kept']};
 assert.equal(fieldMap(s)[2][3],'~');assert.equal(recordZoneEntry(s,'lumiose-vert-sector9','.',()=>fieldMap(s)),true);assert.deepEqual(s.zaFastTravelZones,{1:{x:11,y:1},2:{x:11,y:1}});assert.deepEqual(s.teamIds,['kept']);
 const dynamic={...s,zaFastTravelZones:{1:{x:4,y:4}}};assert.equal(recordZoneEntry(dynamic,'lumiose-vert-sector9','.',()=>{const m=fieldMap(dynamic).slice();m[4]=m[4].slice(0,4)+'a'+m[4].slice(5);return m;}),false);assert.deepEqual(dynamic.zaFastTravelZones[1],{x:4,y:4});
 const old={...s,zaFastTravelZones:{1:{x:3,y:2}}};assert.equal(recordZoneEntry(old,null,'.',()=>fieldMap(old)),false);assert.equal(recordZoneEntry({...old,interior:'hotel'},'lumiose','.',()=>fieldMap(old)),false);assert.equal(recordZoneEntry(old,'lumiose','g'),false);
});

test('Centrico taxis and landmark registration preserve gates and existing walkable tiles',async()=>{
 const {taxiAvailable,taxiDestinations,recordLandmarks,registeredLandmarks,mapTravelDestinations}=await import('../lib/cloud-adventure/adventure-fast-travel.mjs');
 const plaza={area:3,district:'lumiose-centrico-route',interior:null,zaMission04Complete:true,zaRoyaleRank:'Y',x:1,y:7,facing:'left',teamIds:['kept']};const map=fieldMap(plaza);
 for(const x of [0,22])for(const y of [7,9]){assert.equal(map[y][x],'n');assert.ok(taxiAvailable(plaza,{x,y,tile:'n'}));assert.ok(taxiAvailable({...plaza,zaVert7RoofUpper:true},{x,y,tile:'n'}));}
 const saved=restoreAdventurePosition(storeAdventurePosition(plaza,13),13);assert.deepEqual([saved.x,saved.y,saved.teamIds],[1,7,['kept']]);assert.ok(fieldDialogue(plaza).actions.some(p=>p.action==='taxi-le-wow'));
 assert.ok(!taxiDestinations(plaza).some(p=>p.id==='quasartico'));assert.ok(taxiDestinations({...plaza,zaMission10Stage:6}).some(p=>p.id==='quasartico'));
 const lab={...plaza,district:'lumiose-floral',x:5,y:6};assert.equal(recordLandmarks(lab),true);assert.equal(recordLandmarks(lab),false);assert.deepEqual(registeredLandmarks(lab).map(p=>p.id),['research-lab']);assert.ok(mapTravelDestinations(lab).some(p=>p.id==='research-lab'));
});

test('Café Bataille destination uses its ground entrance and the mission gate',async()=>{
 const {recordLandmarks,taxiDestinations,mapTravelDestinations,groundDestinationFlags}=await import('../lib/cloud-adventure/adventure-fast-travel.mjs');
 const s={area:3,district:'lumiose-zone6',interior:null,x:19,y:3,facing:'left',zaRoyaleRank:'Y',zaMission06Started:true,zaZone6Layer:'ground',teamIds:['kept']};
 assert.equal(fieldMap(s)[3][19],',');assert.equal(fieldMap(s)[3][18],'q');assert.ok(fieldDialogue(s).actions.some(a=>a.action==='batailleBlend'));
 assert.equal(recordLandmarks({...s,zaZone6Layer:'roof'}),false);assert.equal(recordLandmarks({...s,zaZone6Layer:'canal'}),false);assert.equal(recordLandmarks(s),true);assert.ok(mapTravelDestinations(s).some(p=>p.id==='cafe-bataille'));
 assert.ok(taxiDestinations(s).some(p=>p.id==='cafe-bataille'));assert.ok(!taxiDestinations({...s,zaMission06Started:false,zaRoyaleRank:'Y'}).some(p=>p.id==='cafe-bataille'));assert.deepEqual(groundDestinationFlags('lumiose-zone6'),{zaZone6Layer:'ground'});
 const restored=restoreAdventurePosition(storeAdventurePosition(s,66),66);assert.ok(mapTravelDestinations(restored).some(p=>p.id==='cafe-bataille'));assert.deepEqual(restored.teamIds,['kept']);
});

test('Café Ultimo destination respects Zone 15 access and ground layer',async()=>{
 const {recordLandmarks,taxiDestinations,mapTravelDestinations,groundDestinationFlags}=await import('../lib/cloud-adventure/adventure-fast-travel.mjs');
 const s={area:3,district:'lumiose-zone15',interior:null,x:17,y:7,facing:'up',zaRoyaleRank:'D',zaZone15Upper:false,teamIds:['kept']};
 assert.equal(fieldMap(s)[7][17],',');assert.equal(fieldMap(s)[6][17],'q');assert.match(fieldDialogue(s).name,/Ultimo/);assert.equal(recordLandmarks({...s,zaZone15Upper:true}),false);assert.equal(recordLandmarks(s),true);assert.ok(mapTravelDestinations(s).some(p=>p.id==='cafe-ultimo'));
 assert.ok(taxiDestinations(s).some(p=>p.id==='cafe-ultimo'));assert.ok(!taxiDestinations({...s,zaRoyaleRank:'E'}).some(p=>p.id==='cafe-ultimo'));assert.deepEqual(groundDestinationFlags('lumiose-zone15'),{zaZone15Upper:false});
 const restored=restoreAdventurePosition(storeAdventurePosition(s,66),66);assert.ok(mapTravelDestinations(restored).some(p=>p.id==='cafe-ultimo'));assert.deepEqual(restored.teamIds,['kept']);
});

test('taxi landmarks land on walkable tiles facing their existing entrances',async()=>{
 const {FAST_TRAVEL_LANDMARKS}=await import('../lib/cloud-adventure/adventure-fast-travel.mjs');const expected={'museum':'enterMuseum','gare':'stationLeave','hotel-z':'enterHotel','research-lab':'enterLumioseLab','richissime':'enterRichissime','le-wow':'enterLeWow','le-nah':'enterLeNah','sushi':'enterSushi','quasartico':'enterQuasarticoOffice','cafe-woof':'woofNatural','cafe-gallant':'enterCafeGallant','cafe-nouveau2':'cafe2Water'};
 for(const p of FAST_TRAVEL_LANDMARKS){const s={area:3,...p,interior:null,zaMission10Stage:6,zaRoyaleRank:'V',zaRougeStreetSouth:false};assert.ok(['.',',',';','g','H'].includes(fieldMap(s)[s.y][s.x]),p.id);const d=fieldDialogue(s),actions=d?.actions||(d?.action?[d]:[]);if(expected[p.id])assert.ok(actions.some(a=>a.action===expected[p.id]),`${p.id}: ${d?.name}`);if(p.id==='richissime')assert.match(d.name,/리시심/);}
});

test('Rouge Plaza driver and new destinations respect mission gates',async()=>{
 const {taxiAvailable,taxiDestinations,rougeTaxiUnlocked}=await import('../lib/cloud-adventure/adventure-fast-travel.mjs');
 const early={area:3,district:'lumiose-zone3',interior:null,x:1,y:5,facing:'left',zaMission04Complete:true,zaRoyaleRank:'Y'};assert.equal(rougeTaxiUnlocked(early),false);assert.equal(fieldMap(early)[5][0],'#');assert.ok(!taxiDestinations(early).some(p=>p.id==='plaza-rouge'));
 const later={...early,zaRoyaleRank:'C',zaMission30Started:true};assert.equal(fieldMap(later)[5][0],'n');assert.ok(taxiAvailable(later,{tile:'n',x:0,y:5}));assert.ok(taxiDestinations(later).some(p=>p.id==='plaza-rouge'));assert.ok(fieldDialogue(later).actions.some(p=>p.action==='taxi-cafe-woof'));
});

test('Hibernal Center registers and permits map travel only at the center',async()=>{
 const {centerAt,recordCenter,registeredCenters,taxiDestinations,canMapTravel}=await import('../lib/cloud-adventure/adventure-fast-travel.mjs');
 const s={area:3,district:'lumiose-mission33-alley',interior:null,x:5,y:3,facing:'down',zaMission31Stage:3,zaRoyaleRank:'B',teamIds:['kept']};assert.equal(fieldMap(s)[3][5],'H');assert.equal(centerAt(s,{tile:'H',x:5,y:3}).id,'hibernal');assert.equal(recordCenter(s,{tile:'H',x:5,y:3}),true);assert.ok(registeredCenters(s).some(c=>c.id==='hibernal'));assert.ok(taxiDestinations(s).some(c=>c.id==='hibernal'));assert.equal(canMapTravel(s),true);assert.equal(canMapTravel({...s,x:5,y:11}),false);assert.equal(canMapTravel({...s,combat:{}}),false);
 const restored=restoreAdventurePosition(storeAdventurePosition(s,99),99);assert.deepEqual([restored.district,restored.x,restored.y,restored.zaMission31Stage,restored.teamIds],['lumiose-mission33-alley',5,3,3,['kept']]);
});

test('Bleu sewer map point requires opening and entry and only allows departure at the entrance',async()=>{
 const {mapTravelDestinations,canMapTravel,taxiDestinations}=await import('../lib/cloud-adventure/adventure-fast-travel.mjs');
 const base={area:3,district:'lumiose-sewer',x:11,y:15,zaRoyaleRank:'D',zaMission19Complete:true,zaBleuSewerOpened:true,zaBleuSewerVisited:true,zaSewerReturn:'bleu3'};
 assert.ok(mapTravelDestinations(base).some(p=>p.id==='bleu-sewer'));assert.equal(canMapTravel(base),true);
 for(const patch of [{zaBleuSewerVisited:false},{zaBleuSewerOpened:false},{zaMission19Complete:false}])assert.ok(!mapTravelDestinations({...base,...patch}).some(p=>p.id==='bleu-sewer'));
 for(const patch of [{x:10},{zaSewerReturn:null},{zaSewerIceBranch:true},{zaMission19Inner:true},{combat:{}},{interior:'museum1'}])assert.equal(canMapTravel({...base,...patch}),false);
 assert.ok(!taxiDestinations(base).some(p=>p.id==='bleu-sewer'));
});

test('zone 20 never registers an underground tile as a ground destination',async()=>{
 const {recordZoneEntry,mapTravelDestinations}=await import('../lib/cloud-adventure/adventure-fast-travel.mjs');
 const s={area:3,district:'lumiose-zone20',interior:null,x:11,y:13,zaMission42Complete:true,zaMission42ChamberV1:true,zaMission42Underground:true,zaFastTravelZones:{1:{x:11,y:1}}};
 assert.equal(recordZoneEntry(s,'lumiose', '.'),false);assert.deepEqual(s.zaFastTravelZones,{1:{x:11,y:1}});assert.ok(!mapTravelDestinations(s).some(p=>p.id==='zone20'));
 s.zaMission42Underground=false;assert.equal(recordZoneEntry(s,null,fieldMap(s)[s.y][s.x]),true);assert.deepEqual(s.zaFastTravelZones[20],{x:11,y:13});s.x=10;assert.equal(recordZoneEntry(s,null,fieldMap(s)[s.y][s.x]),false);assert.deepEqual(s.zaFastTravelZones[20],{x:11,y:13});
});

test('zone 11 elevated bank is not recorded or used as a ground travel origin',async()=>{
 const {recordZoneEntry,canMapTravel,groundDestinationFlags,clearMapTravelTransient}=await import('../lib/cloud-adventure/adventure-fast-travel.mjs');
 const upper={area:3,district:'lumiose-zone11',interior:null,x:19,y:11,zaZone11Upper:true,zaMission04Complete:true,zaRoyaleRank:'D',zaFastTravelZones:{11:{x:19,y:2}},teamIds:['kept']};
 assert.equal(canMapTravel(upper),false);const unregistered={...upper,zaFastTravelZones:{}};assert.equal(recordZoneEntry(unregistered,'lumiose-zone11-sw-top','.'),false);assert.deepEqual(unregistered.zaFastTravelZones,{});assert.equal(recordZoneEntry(upper,'lumiose-zone11-sw-top','.'),false);assert.deepEqual(upper.zaFastTravelZones[11],{x:19,y:2});assert.deepEqual(groundDestinationFlags('lumiose-zone11'),{zaZone11Upper:false});
 const ground={...upper,zaZone11Upper:false,zaFastTravelZones:{},x:19,y:2};assert.equal(canMapTravel(ground),true);assert.equal(recordZoneEntry(ground,'lumiose-test','.'),true);assert.deepEqual(ground.zaFastTravelZones[11],{x:19,y:2});clearMapTravelTransient(upper);assert.equal(upper.zaZone11Upper,undefined);assert.deepEqual(upper.teamIds,['kept']);assert.deepEqual(upper.zaFastTravelZones[11],{x:19,y:2});
});

test('two side mission cafe landmarks register only from the boulevard ground',async()=>{
 const {recordLandmarks,registeredLandmarks,taxiDestinations,groundDestinationFlags}=await import('../lib/cloud-adventure/adventure-fast-travel.mjs');
 const state={area:3,district:'lumiose-south-boulevard',interior:null,x:12,y:6,zaMission04Complete:true,zaMission07Started:true,zaVert7RoofUpper:true,teamIds:['kept']};
 assert.equal(recordLandmarks(state),false);assert.equal(state.zaFastTravelLandmarks,undefined);assert.deepEqual(groundDestinationFlags(state.district),{zaVert7RoofUpper:false});
 state.zaVert7RoofUpper=false;assert.equal(recordLandmarks(state),true);assert.deepEqual(registeredLandmarks(state).map(p=>p.id),['cafe-shutterbug']);state.x=17;assert.equal(recordLandmarks(state),true);assert.deepEqual(registeredLandmarks(state).map(p=>p.id),['cafe-shutterbug','cafe-soleil']);
 assert.ok(taxiDestinations(state).some(p=>p.id==='cafe-shutterbug'));assert.ok(taxiDestinations(state).some(p=>p.id==='cafe-soleil'));assert.deepEqual(state.teamIds,['kept']);
});

test('Café Action registers its outdoor entrance and preserves interior saves',async()=>{
 const {recordLandmarks,taxiDestinations,mapTravelDestinations}=await import('../lib/cloud-adventure/adventure-fast-travel.mjs');
 const s={area:3,district:'lumiose-jaune-sector8',interior:null,x:18,y:7,facing:'up',zaMission04Complete:true,zaRoyaleRank:'Y',zaFastTravelLandmarks:['future-landmark'],teamIds:['kept']};
 assert.equal(fieldMap(s)[6][18],'q');assert.equal(fieldDialogue(s).action,'enterCafeAction');assert.equal(recordLandmarks(s),true);assert.equal(recordLandmarks(s),false);assert.deepEqual(s.zaFastTravelLandmarks,['future-landmark','cafe-action']);
 assert.ok(taxiDestinations(s).some(p=>p.id==='cafe-action'));assert.ok(mapTravelDestinations(s).some(p=>p.id==='cafe-action'));
 const inside={...s,interior:'cafeAction',x:11,y:6};assert.equal(recordLandmarks({...inside,zaFastTravelLandmarks:[]}),false);const restored=restoreAdventurePosition(storeAdventurePosition(inside,66),66);assert.deepEqual([restored.district,restored.interior,restored.x,restored.y,restored.teamIds],['lumiose-jaune-sector8','cafeAction',11,6,['kept']]);assert.equal(fieldDialogue(restored).actions.length,9);
});
