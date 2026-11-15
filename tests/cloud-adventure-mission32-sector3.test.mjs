import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Vert 3 links the Dragonite courtyard without replacing its Zone 2 route',()=>{
 const s={area:3,district:'lumiose-vert-sector3',interior:null,x:14,y:15,facing:'down',teamIds:['kept'],zaSide66Stage:2,zaVert3CourtSludgeCleared:true,zaMission32Complete:false,zaMission32RewardPending:true};
 const blocked={...s,zaVert3CourtSludgeCleared:undefined};assert.equal(fieldMap(blocked)[16][14],'r');assert.equal(fieldDialogue(blocked).action,'clearVert3CourtSludge');assert.equal(stepField(blocked,'down').blocked,true);
 const entered=stepField(s,'down');assert.deepEqual([entered.district,entered.zaMission32Layer,entered.x,entered.y],['lumiose-mission32-courtyard','ground',18,8]);
 const court={...s,...entered};assert.ok(fieldPath(fieldMap(court),court,{x:14,y:6}).length);assert.equal(stepField(court,'right').district,s.district);assert.equal(stepField({...court,x:1,y:8},'left').district,'lumiose-zone2');
 const saved=restoreAdventurePosition(storeAdventurePosition(court,71),71);assert.deepEqual([saved.district,saved.zaMission32Layer,saved.teamIds,saved.zaSide66Stage,saved.zaMission32RewardPending],[court.district,'ground',['kept'],2,true]);
 const house=fieldDialogue({...s,x:20,y:5,facing:'left'});assert.equal(house.action,'side66Reward');assert.notEqual(fieldMap(s)[5][19],'X');
 assert.equal(stepField({...s,x:11,y:15},'down').district,'lumiose-vert-plaza');assert.equal(stepField({...s,x:17,y:15},'down').district,'lumiose-vert-street-route');
});
