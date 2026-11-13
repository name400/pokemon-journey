import test from 'node:test';
import assert from 'node:assert/strict';
import {randomWildAlphaLevel} from '../lib/cloud-adventure/adventure-random-alpha.mjs';
import {ZONE2_SPECIES} from '../lib/cloud-adventure/adventure-zone2.mjs';
import {ZONE3_SPECIES} from '../lib/cloud-adventure/adventure-zone3.mjs';
import {ZONE4_SPECIES} from '../lib/cloud-adventure/adventure-zone4.mjs';

test('surveyed Zones 2–4 unlock only their documented random alpha species',()=>{
 for(const [zone,species,first,low,high] of [[2,ZONE2_SPECIES,406,17,18],[3,ZONE3_SPECIES,25,18,20],[4,ZONE4_SPECIES,679,22,23]]){
  const state={zaMission05Complete:true,adventureDexSpecies:species};
  assert.equal(randomWildAlphaLevel({...state,zaMission05Complete:false},zone,first,()=>0),null);
  assert.equal(randomWildAlphaLevel({...state,adventureDexSpecies:species.filter(id=>id!==first)},zone,first,()=>0),null);
  assert.equal(randomWildAlphaLevel(state,zone,9999,()=>0),null);
  assert.equal(randomWildAlphaLevel(state,zone,first,()=>.05),null);
  assert.equal(randomWildAlphaLevel(state,zone,first,()=>0),low);
  let calls=0; assert.equal(randomWildAlphaLevel(state,zone,first,()=>calls++===0?.049:.999),high);
  assert.equal(randomWildAlphaLevel({...state,zaMission05Complete:false,zaMission06Started:true},zone,first,()=>0),low);
 }
 assert.equal(randomWildAlphaLevel({zaMission05Complete:true,adventureDexSpecies:ZONE4_SPECIES},4,302,()=>0),null);
});

test('Zones 5–8 require their own complete survey before rolling a documented alpha',async()=>{
 const {LATER_ZONE_SPECIES}=await import('../lib/cloud-adventure/adventure-zone-research.mjs');
 for(const [zone,id,min,max] of [[5,543,26,27],[6,307,31,32],[7,670,31,33],[8,552,40,41]]){
  const dex=LATER_ZONE_SPECIES[zone],state={zaMission05Complete:true,adventureDexSpecies:dex};
  let calls=0;assert.equal(randomWildAlphaLevel({...state,adventureDexSpecies:dex.slice(1)},zone,id,()=>{calls++;return 0}),null);assert.equal(calls,0);
  assert.equal(randomWildAlphaLevel({...state,zaMission05Complete:false},zone,id,()=>0),null);
  assert.equal(randomWildAlphaLevel(state,zone,id,()=>.05),null);
  assert.equal(randomWildAlphaLevel(state,zone,id,()=>0),min);
  calls=0;assert.equal(randomWildAlphaLevel(state,zone,id,()=>calls++===0?.049:.999),max);
 }
 const state={zaMission05Complete:true,adventureDexSpecies:LATER_ZONE_SPECIES[7]};assert.equal(randomWildAlphaLevel(state,7,406,()=>0),null);
});
