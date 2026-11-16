import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {academyCourtyardMap} from '../lib/cloud-adventure/adventure-academy.mjs';

test('Academy road joins Rouge Plaza, Hibernal and Sector 6 while retaining the older road',()=>{
 const base={area:3,district:'lumiose-rouge-north',zaRougeStreetSouth:true,interior:null,x:21,y:11,facing:'right'};
 const enter=stepField(base,'right');assert.equal(enter.zaAcademyCourtyard,true);const school={...base,...enter};assert.equal(fieldMap(school)[12][0],'W');assert.equal(stepField(school,'left').district,'lumiose-rouge-north');
 const east=stepField({...school,x:21,y:12},'right');assert.equal(east.district,'lumiose-hibernal-approach');assert.equal(east.zaAcademyCourtyard,false);assert.equal(stepField({...school,...east},'left').zaAcademyCourtyard,true);
 const north=stepField({...school,x:11,y:1},'up');assert.equal(north.district,'lumiose-rouge-sector6');assert.equal(north.zaAcademyCourtyard,false);assert.equal(stepField({...school,...north},'down').zaAcademyCourtyard,true);
 const saved=storeAdventurePosition({...school,x:11,y:7},12),restored=restoreAdventurePosition(saved,12);assert.equal(restored.zaAcademyCourtyard,true);assert.deepEqual([restored.x,restored.y],[11,7]);
 const old={...school,zaAcademyCourtyard:false,x:1,y:8};assert.equal(stepField(old,'left').district,'lumiose-rouge-north');
 assert.ok(academyCourtyardMap(school).every(row=>!row.includes('g')));
});

test('recovers only the identified Rouge 6 defeat save at its matching revision',()=>{
 const base={area:3,district:'lumiose-rouge-sector6',interior:null,x:3,y:5,facing:'up',teamIds:['kept'],zaMission20Stage:5,zaMission21Complete:true,zaMission22Complete:true,log:['파티가 쓰러져 포켓몬 센터에서 회복했다.']};
 const stored=storeAdventurePosition(base,22),restored=restoreAdventurePosition(stored,22);
 assert.deepEqual([restored.district,restored.x,restored.y],['lumiose-rouge-sector6',2,5]);
 assert.deepEqual([restored.teamIds,restored.zaMission20Stage,restored.zaMission21Complete,restored.zaMission22Complete],[['kept'],5,true,true]);
 assert.equal(restoreAdventurePosition({...stored,log:['다른 기록']},22).district,null);
 assert.equal(restoreAdventurePosition(stored,23).district,null);
});
