import test from 'node:test';
import assert from 'node:assert/strict';
import {visibleWildAlpha} from '../lib/cloud-adventure/adventure-visible-alpha.mjs';
import {randomWildAlphaLevel} from '../lib/cloud-adventure/adventure-random-alpha.mjs';
import {LATER_ZONE_SPECIES} from '../lib/cloud-adventure/adventure-zone-research.mjs';

test('visible alpha overlay preserves original records, fixed alphas and burrows',()=>{
 const p={id:'abra',species:63,level:13},state={zaWildVisibleAlphaLevels:{'zone5:abra:63':24}};
 const before=JSON.stringify(p);assert.deepEqual(visibleWildAlpha(state,5,p),{...p,level:24,alpha:true});assert.equal(JSON.stringify(p),before);assert.equal(visibleWildAlpha(state,6,p),p);assert.equal(visibleWildAlpha(state,5,{...p,alpha:true,level:40}).level,40);assert.equal(visibleWildAlpha(state,5,{...p,burrow:true}).level,13);assert.equal(visibleWildAlpha(state,5,null),null);
});

test('representative newly visible species require survey and use sourced level ranges',()=>{
 for(const [zone,id,min,max] of [[5,63,24,26],[6,688,31,32],[10,318,41,42],[11,692,40,41],[12,67,44,45],[15,246,50,53],[16,656,30,35],[18,715,58,59]]){
  const dex=LATER_ZONE_SPECIES[zone],s={zaMission05Complete:true,adventureDexSpecies:dex};assert.equal(randomWildAlphaLevel({...s,adventureDexSpecies:dex.slice(1)},zone,id,()=>0),null);assert.equal(randomWildAlphaLevel(s,zone,id,()=>0),min);let calls=0;assert.equal(randomWildAlphaLevel(s,zone,id,()=>calls++===0?.049:.999),max);
 }
});

test('Zone 8 buried alpha identity is overlaid without revealing or changing its species',async()=>{
 const {resetZone8Burrows}=await import('../lib/cloud-adventure/adventure-zone8.mjs');
 const s={zaZone8Burrows:{gible:443,drilbur:529},zaWildShinyRolls:{'zone8:gible:443':true,'zone8:drilbur:529':false},zaWildVisibleAlphaLevels:{'zone8:gible:443':35,'zone8:drilbur:529':34}};
 const p={id:'gible',species:443,level:24,burrow:true};assert.deepEqual(visibleWildAlpha(s,8,p),{...p,alpha:true,level:35});resetZone8Burrows(s);assert.equal(s.zaZone8Burrows.gible,443);assert.equal(s.zaWildVisibleAlphaLevels['zone8:gible:443'],35);assert.equal(s.zaZone8Burrows.drilbur,undefined);assert.equal(s.zaWildVisibleAlphaLevels['zone8:drilbur:529'],undefined);
});
