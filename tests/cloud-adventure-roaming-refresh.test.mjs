import {test} from 'node:test';
import assert from 'node:assert/strict';
import {refreshRoamingWildSpawns} from '../lib/cloud-adventure/adventure-roaming-refresh.mjs';

test('roaming encounters return on the next interval without changing existing individuals or story',()=>{
 const s={district:'lumiose-zone2',x:3,y:3,zaZone2Budew:{x:9,y:14,escaped:true},zaZone2KakunaSpent:true,zaZone2AlphaSpent:true,zaZone2FieldSpent:{patrat:true},zaZone2FieldPositions:{patrat:{x:11,y:9},patrat2:{x:11,y:7}},zaWildShinyRolls:{'field2:patrat:504':true,'field2:patrat2:504':true,'field2:budew:406':true,'field2:kakuna:14':false,'zone19:other:1':true},party:[{id:'owned'}]};
 assert.equal(refreshRoamingWildSpawns(s,'day',1),true);assert.equal(s.zaZone2FieldSpent.patrat,true);
 assert.equal(refreshRoamingWildSpawns(s,'night',2),true);assert.equal(s.zaZone2FieldSpent.patrat,undefined);assert.equal(s.zaZone2Budew,undefined);assert.equal(s.zaZone2KakunaSpent,undefined);assert.equal(s.zaZone2AlphaSpent,true);assert.deepEqual(s.zaZone2FieldPositions.patrat2,{x:11,y:7});assert.equal(s.zaWildShinyRolls['field2:patrat2:504'],true);assert.equal(s.zaWildShinyRolls['field2:patrat:504'],undefined);assert.equal(s.zaWildShinyRolls['zone19:other:1'],true);assert.deepEqual(s.party,[{id:'owned'}]);
});

test('roaming refresh waits for occupied spawn tiles and active encounters',()=>{
 const s={district:'lumiose-zone3',x:8,y:5,zaZone3FieldSpent:{litleo:true},zaWildSpawnCycles:{3:{period:'day',interval:1}},zaRoyaleRank:'A'};
 assert.equal(refreshRoamingWildSpawns(s,'night',2),false);assert.equal(s.zaZone3FieldSpent.litleo,true);
 s.x=2;s.combat={};assert.equal(refreshRoamingWildSpawns(s,'night',2),false);delete s.combat;
 assert.equal(refreshRoamingWildSpawns(s,'night',2),true);assert.equal(s.zaZone3FieldSpent.litleo,undefined);
});

test('a moving individual prevents another from respawning on its position',()=>{
 const s={district:'lumiose-zone2',x:3,y:3,zaZone2FieldSpent:{patrat:true},zaZone2FieldPositions:{patrat2:{x:11,y:8}},zaWildSpawnCycles:{2:{period:'day',interval:1}}};
 assert.equal(refreshRoamingWildSpawns(s,'night',2),false);assert.equal(s.zaZone2FieldSpent.patrat,true);
 delete s.zaZone2FieldPositions.patrat2;assert.equal(refreshRoamingWildSpawns(s,'night',2),true);assert.equal(s.zaZone2FieldSpent.patrat,undefined);
});

test('respawn clears alpha identity only for consumed roaming individuals',()=>{
 const s={district:'lumiose-zone2',x:3,y:3,zaWildSpawnCycles:{2:{period:'day',interval:1}},zaZone2FieldSpent:{patrat:true},zaWildShinyRolls:{'field2:patrat:504':true,'field2:patrat2:504':true},zaWildVisibleAlphaLevels:{'field2:patrat:504':17,'field2:patrat2:504':18}};
 assert.equal(refreshRoamingWildSpawns(s,'night',2),true);assert.equal(s.zaWildVisibleAlphaLevels['field2:patrat:504'],undefined);assert.equal(s.zaWildVisibleAlphaLevels['field2:patrat2:504'],18);assert.equal(s.zaWildShinyRolls['field2:patrat2:504'],true);
});
