import test from 'node:test';
import assert from 'node:assert/strict';
import {stepField,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {zone17Map,zone17Visible,zone17Encounter} from '../lib/cloud-adventure/adventure-zone17.mjs';
test('zone seventeen gate, field and save migration',()=>{
 const base={area:3,district:'lumiose-vert2',interior:null,x:1,y:5,facing:'left',zaRoyaleRank:'D'};
 assert.equal(stepField(base,'left').blocked,true);
 const entered=stepField({...base,zaRoyaleRank:'C'},'left');assert.equal(entered.district,'lumiose-zone17');
 const s={...base,...entered,zaRoyaleRank:'C'};assert.ok(fieldPath(zone17Map(s),s,{x:11,y:8}).length);
 assert.equal(zone17Visible(s,'a').species,650);assert.equal(zone17Encounter(s,()=>0).speciesId,650);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:8},2),2);assert.deepEqual([saved.district,saved.x,saved.y],['lumiose-zone17',11,8]);assert.equal(stepField(s,'down').district,'lumiose-vert2');
});

test('Zone 17 draft paths and stairs preserve existing travel and saved positions',()=>{
 const s={area:3,district:'lumiose-zone17',interior:null,x:11,y:10,zaRoyaleRank:'C',teamIds:['kept']};
 const map=zone17Map(s);assert.equal(map[10][11],':');assert.equal(map[3][4],'^');assert.equal(map[3][18],'^');
 assert.ok(fieldPath(map,{x:11,y:15},{x:11,y:1}).length);
 assert.ok(fieldPath(map,{x:6,y:1},{x:16,y:1}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition(s,3),3);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone17',11,10,['kept']]);
});

test('Vert Sector 7 leads into Zone 17 with rank gate and preserved saves',()=>{
 const road={area:3,district:'lumiose-vert-sector7',interior:null,x:11,y:1,zaRoyaleRank:'D',teamIds:['kept']};
 assert.equal(stepField(road,'up').blocked,true);
 const zone=stepField({...road,zaRoyaleRank:'C'},'up');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone17',21,8]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...road,...zone,zaRoyaleRank:'C'},44),44);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone17',21,8,['kept']]);
 const back=stepField(saved,'right');assert.deepEqual([back.district,back.x,back.y],['lumiose-vert-sector7',11,1]);
});
