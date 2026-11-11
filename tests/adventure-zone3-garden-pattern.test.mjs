import test from 'node:test';
import assert from 'node:assert/strict';
import {zone3GardenPattern,zone3ExitLabel} from '../lib/cloud-adventure/adventure-zone3-garden.mjs';
import {lumioseZone3Map,fieldPath} from '../lib/cloud-adventure/adventure-world.mjs';

test('four ground patterns follow west Budew and east Roselia without changing garden routes',()=>{
 const map=lumioseZone3Map(),before=JSON.stringify(map);
 for(const y of [6.5,10.5]){
  assert.equal(zone3GardenPattern(8.5,y-.34),'bud');
  assert.equal(zone3GardenPattern(14.05,y-.3),'rose-red');
  assert.equal(zone3GardenPattern(14.95,y-.3),'rose-blue');
  for(const x of [8,14]){assert.equal(map[Math.floor(y)][x],'g');assert.ok(fieldPath(map,{x:11,y:8},{x,y:Math.floor(y)}).length);}
 }
 assert.equal(zone3GardenPattern(11,8),null);assert.equal(zone3GardenPattern(NaN,2),null);assert.equal(JSON.stringify(map),before);
});

test('plaza edge labels identify city connections without calling them garden gates',()=>{
 for(const [x,y,label] of [[0,6,'서쪽'],[0,8,'서쪽'],[22,12,'동쪽'],[11,0,'북쪽'],[17,0,'북쪽'],[11,16,'남쪽']])assert.equal(zone3ExitLabel(x,y),label);
});

test('draft arch uses existing fence piers and leaves the central approach open',()=>{
 const map=lumioseZone3Map();
 assert.equal(map[4][9],'|');assert.equal(map[4][13],'|');
 for(const x of [10,11,12])assert.equal(map[4][x],'.');
 assert.ok(fieldPath(map,{x:11,y:3},{x:11,y:8}).length);
});
