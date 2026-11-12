import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {recordLandmarks,mapTravelDestinations,taxiDestinations} from '../lib/cloud-adventure/adventure-fast-travel.mjs';

test('Gare exterior offers departure without changing existing saved paths',()=>{
 const s={area:3,district:'lumiose-vert-street-route',interior:null,x:8,y:6,facing:'up',zaRoyaleRank:'Y',zaMission04Complete:true,teamIds:['kept']};const map=fieldMap(s);assert.equal(map[5][8],'u');assert.equal(map[6][8],'.');assert.ok(fieldDialogue(s).actions.some(a=>a.action==='stationLeave'));assert.match(fieldDialogue({...s,zaStationLeaveConfirm:2}).text,/정말/);assert.ok(taxiDestinations(s).some(p=>p.id==='gare'));assert.equal(recordLandmarks(s),true);assert.ok(mapTravelDestinations(s).some(p=>p.id==='gare'));
 const restored=restoreAdventurePosition(storeAdventurePosition({...s,zaStationLeaveConfirm:1},55),55);assert.deepEqual([restored.district,restored.x,restored.y,restored.zaStationLeaveConfirm,restored.teamIds],[s.district,8,6,1,['kept']]);
});
