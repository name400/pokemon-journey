import test from 'node:test';
import assert from 'node:assert/strict';
import {zone2Encounter,zone2Habitat,ZONE2_SPECIES} from '../lib/cloud-adventure/adventure-zone2.mjs';
import {lumioseZone2Map,walkable} from '../lib/cloud-adventure/adventure-world.mjs';

test('zone two draft uses documented gate, trees, island and water habitats',()=>{
 const cases=[['gate',{x:10,y:14},[406],[406]],['gate',{x:5,y:2},[406],[406]],['trees',{x:6,y:5},[14,406],[14,406]],['island',{x:11,y:8},[504,688],[504,688]],['shore',{x:16,y:8},[129],[120,129]]];
 for(const [habitat,pos,day,night]of cases){assert.equal(lumioseZone2Map()[pos.y][pos.x],'g');assert.equal(walkable(lumioseZone2Map()[pos.y][pos.x]),true);assert.equal(zone2Habitat(pos),habitat);for(const [period,pool]of [['day',day],['night',night]])for(let i=0;i<pool.length;i++)assert.deepEqual(zone2Encounter(period,()=>i/pool.length,pos),{speciesId:pool[i],level:6});}
 const known=new Set(cases.flatMap(c=>c[3]));assert.deepEqual([...known].sort((a,b)=>a-b),[...ZONE2_SPECIES].sort((a,b)=>a-b));
 assert.equal(zone2Habitat({x:NaN,y:8}),null);assert.equal(zone2Encounter('night',()=>0,{x:0,y:0}).speciesId,14);
});
