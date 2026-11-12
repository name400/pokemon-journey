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
 const s={area:3,district:'lumiose-zone1',interior:null,x:11,y:1,zaMission04Complete:true,zaRoyaleRank:'Y'};assert.equal(recordZoneEntry(s,'lumiose-vert-sector9','.'),true);assert.deepEqual(mapTravelDestinations(s).map(x=>x.id),['zone1']);assert.equal(recordZoneEntry(s,'lumiose-zone1','.'),false);assert.equal(canMapTravel(s),true);assert.equal(canMapTravel({...s,combat:{}}),false);assert.equal(canMapTravel({...s,zaLeWowRun:{course:1}}),false);assert.equal(canMapTravel({...s,district:'lumiose-royale'}),false);assert.equal(canMapTravel({...s,district:'lumiose-zone3',zaZone3TowerUpper:true}),false);assert.equal(canMapTravel({...s,district:'lumiose-zone6',zaZone6Layer:'roof'}),false);
 assert.equal(zoneTravelUnlocked({zaRoyaleRank:'C'},18),false);assert.equal(zoneTravelUnlocked({zaRoyaleRank:'B'},18),true);assert.equal(zoneTravelUnlocked({zaRoyaleRank:'C'},19),false);assert.equal(zoneTravelUnlocked({zaRoyaleRank:'B'},19),true);assert.equal(zoneTravelUnlocked({zaRoyaleRank:'A'},20),false);assert.equal(zoneTravelUnlocked({zaMission42Complete:true},20),true);assert.equal(canMapTravel({...s,district:'lumiose-zone20'}),false);assert.equal(canMapTravel({...s,district:'lumiose-zone20',zaMission42Complete:true}),true);
 assert.equal(taxiAvailable({...s,district:'lumiose-south-boulevard'},{tile:'n',x:14,y:6}),true);assert.equal(taxiAvailable({...s,district:'lumiose-south-boulevard'},{tile:'n',x:13,y:6}),false);
});
