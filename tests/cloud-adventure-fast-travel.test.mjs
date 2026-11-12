import test from 'node:test';
import assert from 'node:assert/strict';
import {FAST_TRAVEL_CENTERS,centerAt,recordCenter,registeredCenters} from '../lib/cloud-adventure/adventure-fast-travel.mjs';
import {fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('registered centers are limited to real center tiles and survive save restoration',()=>{
 for(const c of FAST_TRAVEL_CENTERS){const s={area:3,district:c.district,interior:null,zaRougeStreetSouth:c.zaRougeStreetSouth,x:c.x,y:c.y,facing:'down'};assert.equal(fieldMap(s)[c.y][c.x],'H');assert.equal(centerAt(s,{...c,tile:'H'}).id,c.id);}
 const s={area:3,district:'lumiose',interior:null,x:3,y:5,facing:'down',zaMission06Started:true,teamIds:['kept']};assert.equal(recordCenter(s,{x:3,y:5,tile:'H'}),true);assert.equal(recordCenter(s,{x:3,y:5,tile:'H'}),false);assert.equal(recordCenter(s,{x:1,y:5,tile:'H'}),false);
 s.zaFastTravelCenters.push('untrusted','bleu');const restored=restoreAdventurePosition(storeAdventurePosition(s,88),88);assert.deepEqual(registeredCenters(restored).map(c=>c.id),['hotel','bleu']);assert.deepEqual(restored.teamIds,['kept']);assert.ok(fieldDialogue(restored).actions.some(a=>a.action==='fastTravel-bleu'));
});

test('wild zone registration follows actual ground entry and existing progression gates',async()=>{
 const {fastTravelEnabled,recordZoneEntry,mapTravelDestinations,canMapTravel,zoneTravelUnlocked,taxiAvailable}=await import('../lib/cloud-adventure/adventure-fast-travel.mjs');
 assert.equal(fastTravelEnabled({zaRoyaleRank:'Z'}),false);assert.equal(fastTravelEnabled({zaMission04Complete:true}),true);
 const s={area:3,district:'lumiose-zone1',interior:null,x:11,y:1,zaMission04Complete:true,zaRoyaleRank:'Y'};assert.equal(recordZoneEntry(s,'lumiose-vert-sector9','.'),true);assert.deepEqual(mapTravelDestinations(s).map(x=>x.id),['zone1']);assert.equal(recordZoneEntry(s,'lumiose-zone1','.'),false);assert.equal(canMapTravel(s),true);assert.equal(canMapTravel({...s,combat:{}}),false);assert.equal(canMapTravel({...s,zaLeWowRun:{course:1}}),false);assert.equal(canMapTravel({...s,district:'lumiose-royale'}),false);assert.equal(canMapTravel({...s,district:'lumiose-zone3',zaZone3TowerUpper:true}),false);assert.equal(canMapTravel({...s,district:'lumiose-zone6',zaZone6Layer:'roof'}),false);assert.equal(canMapTravel({...s,district:'lumiose-south-boulevard',zaVert7RoofUpper:true}),false);assert.equal(canMapTravel({...s,district:'lumiose-vert-sector4',zaVert4Layer:'roof'}),false);assert.equal(canMapTravel({...s,district:'lumiose-bleu-sector7',zaBleu7Upper:true}),false);
 assert.equal(zoneTravelUnlocked({zaRoyaleRank:'C'},18),false);assert.equal(zoneTravelUnlocked({zaRoyaleRank:'B'},18),true);assert.equal(zoneTravelUnlocked({zaRoyaleRank:'C'},19),false);assert.equal(zoneTravelUnlocked({zaRoyaleRank:'B'},19),true);assert.equal(zoneTravelUnlocked({zaRoyaleRank:'A'},20),false);assert.equal(zoneTravelUnlocked({zaMission42Complete:true},20),true);assert.equal(canMapTravel({...s,district:'lumiose-zone20'}),false);assert.equal(canMapTravel({...s,district:'lumiose-zone20',zaMission42Complete:true}),true);assert.equal(canMapTravel({...s,district:'lumiose-zone20',zaMission42Complete:true,zaMission42Underground:true}),false);
 assert.equal(taxiAvailable({...s,district:'lumiose-south-boulevard'},{tile:'n',x:14,y:6}),true);assert.equal(taxiAvailable({...s,district:'lumiose-south-boulevard'},{tile:'n',x:13,y:6}),false);
});

test('Centrico taxis and landmark registration preserve gates and existing walkable tiles',async()=>{
 const {taxiAvailable,taxiDestinations,recordLandmarks,registeredLandmarks,mapTravelDestinations}=await import('../lib/cloud-adventure/adventure-fast-travel.mjs');
 const plaza={area:3,district:'lumiose-centrico-route',interior:null,zaMission04Complete:true,zaRoyaleRank:'Y',x:1,y:7,facing:'left',teamIds:['kept']};const map=fieldMap(plaza);
 for(const x of [0,22])for(const y of [7,9]){assert.equal(map[y][x],'n');assert.ok(taxiAvailable(plaza,{x,y,tile:'n'}));assert.ok(taxiAvailable({...plaza,zaVert7RoofUpper:true},{x,y,tile:'n'}));}
 const saved=restoreAdventurePosition(storeAdventurePosition(plaza,13),13);assert.deepEqual([saved.x,saved.y,saved.teamIds],[1,7,['kept']]);assert.ok(fieldDialogue(plaza).actions.some(p=>p.action==='taxi-le-wow'));
 assert.ok(!taxiDestinations(plaza).some(p=>p.id==='quasartico'));assert.ok(taxiDestinations({...plaza,zaMission10Stage:6}).some(p=>p.id==='quasartico'));
 const lab={...plaza,district:'lumiose-floral',x:5,y:6};assert.equal(recordLandmarks(lab),true);assert.equal(recordLandmarks(lab),false);assert.deepEqual(registeredLandmarks(lab).map(p=>p.id),['research-lab']);assert.ok(mapTravelDestinations(lab).some(p=>p.id==='research-lab'));
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
