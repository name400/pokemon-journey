import {test} from 'node:test';
import assert from 'node:assert/strict';
import {refreshEarlyAlpha,markEarlyAlphaSpent} from '../lib/cloud-adventure/adventure-alpha-refresh.mjs';

const cases=[
 ['lumiose-zone1-roof','zaZone1RoofAlphaSpent',18,5,'alpha:zone1-roof-pidgey:16'],
 ['lumiose-zone2','zaZone2AlphaSpent',20,11,'alpha:zone2-island:129'],
 ['lumiose-zone4','zaZone4AlphaSpent',4,10,'alpha:zone4-spinarak:167'],
 ['lumiose-zone7','zaZone7AlphaSpent',11,8,'alpha:zone7-fletchinder:662'],
];
test('early alpha refresh respects old saves, occupied spawn tiles, and active battles',()=>{
 for(const [district,spent,x,y,key] of cases){
  const s={district,x,y,[spent]:true,zaWildShinyRolls:{[key]:false,other:true,'alpha:zone2-island:120':true},teamIds:['owned'],coins:100};
  assert.equal(refreshEarlyAlpha(s,'day',1),true);assert.equal(s[spent],true); // legacy baseline
  assert.equal(refreshEarlyAlpha(s,'night',2),false);assert.equal(s[spent],true);
  s.x++;s.combat={};assert.equal(refreshEarlyAlpha(s,'night',2),false);delete s.combat;
  s.encounter={};assert.equal(refreshEarlyAlpha(s,'night',2),false);delete s.encounter;
  assert.equal(refreshEarlyAlpha(s,'night',2),true);assert.equal(s[spent],undefined);assert.equal(s.zaWildShinyRolls[key],undefined);assert.equal(s.zaWildShinyRolls.other,true);assert.deepEqual(s.teamIds,['owned']);assert.equal(s.coins,100);
  assert.equal(s.zaWildShinyRolls['alpha:zone2-island:120'],true);
  assert.equal(refreshEarlyAlpha(s,'night',2),false);
  s.zaWildShinyRolls[key]=true;assert.equal(refreshEarlyAlpha(s,'day',3),true);assert.equal(s.zaWildShinyRolls[key],true);
 }
});

test('a spent single alpha clears a stale shiny roll without clearing another time-exclusive alpha',()=>{
 for(const [district,spent,x,y,key] of cases){
  const other='alpha:zone2-island:120',s={district,x:x+1,y,[spent]:true,zaEarlyAlphaCycles:{[district]:{period:'day',interval:1}},zaWildShinyRolls:{[key]:true,[other]:true}};
  assert.equal(refreshEarlyAlpha(s,'night',2),true);
  assert.equal(s.zaWildShinyRolls[key],district==='lumiose-zone2'?true:undefined);
  assert.equal(s.zaWildShinyRolls[other],true);
 }
});

test('resolved early alphas use the current interval without changing unrelated saved state',()=>{
 const ids=['zone1-roof-pidgey','zone2-island','zone4-spinarak','zone7-fletchinder'];
 for(let i=0;i<cases.length;i++){
  const [district,spent,x,y]=cases[i],s={district,x:x+1,y,teamIds:['owned'],coins:100,zaEarlyAlphaCycles:{[district]:{period:'day',interval:1},other:{period:'day',interval:1}}};
  assert.equal(markEarlyAlphaSpent(s,ids[i],'night',2),true);assert.equal(s[spent],true);
  assert.deepEqual(s.zaEarlyAlphaCycles[district],{period:'night',interval:2});assert.equal(refreshEarlyAlpha(s,'night',2),false);
  assert.deepEqual(s.teamIds,['owned']);assert.equal(s.coins,100);assert.deepEqual(s.zaEarlyAlphaCycles.other,{period:'day',interval:1});
  assert.equal(refreshEarlyAlpha(s,'day',3),true);assert.equal(s[spent],undefined);
 }
});
