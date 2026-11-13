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
