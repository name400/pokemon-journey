import test from 'node:test';import assert from 'node:assert/strict';import {advanceMission03Companion} from '../lib/cloud-adventure/adventure-mission03-companion.mjs';
test('companion follows a valid detour without crossing blocked cells or exit tiles',()=>{
 const map=['#######','#..#..#','#..#..#','#.....#','#######'];let s={district:'lumiose-station-roof',x:5,y:1,facing:'right',zaMission03CompanionPosition:{district:'lumiose-station-roof',x:1,y:1,facing:'right'}};
 for(let i=0;i<8;i++){const p=advanceMission03Companion(s,map);assert.ok(['.',',',';'].includes(map[p.y][p.x]));assert.equal(Math.abs(p.x-s.zaMission03CompanionPosition.x)+Math.abs(p.y-s.zaMission03CompanionPosition.y),1);s={...s,zaMission03CompanionPosition:p};}
 assert.deepEqual([s.zaMission03CompanionPosition.x,s.zaMission03CompanionPosition.y],[5,1]);
 const cut=['#######','#..#..#','#..#..#','###X###','#######'];const stuck={...s,zaMission03CompanionPosition:{district:s.district,x:1,y:1,facing:'right'}};assert.deepEqual(advanceMission03Companion(stuck,cut),stuck.zaMission03CompanionPosition);
});
test('companion swaps past the player and stale layers initialize safely',()=>{
 const map=['#####','#...#','#####'];const s={district:'d',x:2,y:1,facing:'left',zaMission03CompanionPosition:{district:'d',x:1,y:1,facing:'right'}};assert.deepEqual(advanceMission03Companion(s,map),{district:'d',x:2,y:1,facing:'right'});assert.deepEqual(advanceMission03Companion({...s,zaMission03CompanionPosition:{district:'other',x:1,y:1}},map),{district:'d',x:2,y:1,facing:'left'});
});
test('companion does not step onto the player destination',()=>{
 const map=['#####','#...#','#...#','#####'];const s={district:'d',x:2,y:1,facing:'down',zaMission03CompanionPosition:{district:'d',x:2,y:2,facing:'up'}};const p=advanceMission03Companion(s,map,{x:1,y:2});assert.notDeepEqual([p.x,p.y],[1,2]);
});
test('companion steps aside when player leaves a ladder onto its tile',()=>{
 const map=['#####','#l..#','#...#','#####'];const s={district:'d',x:1,y:1,facing:'right',zaMission03CompanionPosition:{district:'d',x:2,y:1,facing:'left'}};const p=advanceMission03Companion(s,map,{x:2,y:1});assert.ok(['.',',',';'].includes(map[p.y][p.x]));assert.notDeepEqual([p.x,p.y],[2,1]);assert.equal(Math.abs(p.x-2)+Math.abs(p.y-1),1);
});
