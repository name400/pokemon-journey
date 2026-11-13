import test from 'node:test';
import assert from 'node:assert/strict';
import {wildShinyChance,assignWildShiny,clearWildShiny} from '../lib/cloud-adventure/adventure-wild-shiny.mjs';

test('wild colors use one base or four charm rolls and persist by spawn',()=>{
 assert.equal(wildShinyChance({}),1/4096);assert.equal(wildShinyChance({zaResearchItemRewards:[50]}),1-(4095/4096)**4);
 const s={},one={};assignWildShiny(s,one,()=>0,'zone9:sableye');assert.equal(one.shiny,true);
 const restored=JSON.parse(JSON.stringify(s)),again={};assignWildShiny(restored,again,()=>.999,'zone9:sableye');assert.equal(again.shiny,true);
 clearWildShiny(restored,'zone9:sableye');const next={};assignWildShiny(restored,next,()=>.999,'zone9:sableye');assert.equal(next.shiny,false);
 const threshold=1/2048,base={},boosted={};assignWildShiny({},base,()=>threshold);assignWildShiny({zaResearchItemRewards:[50]},boosted,()=>threshold);assert.equal(base.shiny,false);assert.equal(boosted.shiny,true);
});

test('new visible shinies retain the ten most recent across zones and reload',()=>{
 let s={};const names=['zone2:a:1','field3:b:2','sewer:c:3','alpha:d:4',...Array.from({length:7},(_,i)=>`zone${i+5}:slot:25`)];
 for(const key of names.slice(0,10))assignWildShiny(s,{},()=>0,key);
 s=JSON.parse(JSON.stringify(s));assert.equal(s.zaWildShinyOrder.length,10);
 assignWildShiny(s,{},()=>0,names[10]);assert.equal(s.zaWildShinyRolls[names[0]],undefined);assert.deepEqual(s.zaWildShinyOrder,names.slice(1));
 const old={};assignWildShiny(s,old,()=>.999,names[1]);assert.equal(old.shiny,true);assert.deepEqual(s.zaWildShinyOrder,names.slice(1));
 clearWildShiny(s,names[1]);assert.equal(s.zaWildShinyOrder.includes(names[1]),false);assignWildShiny(s,{},()=>0,'zone19:new:25');assert.equal(s.zaWildShinyOrder.length,10);assert.equal(s.zaWildShinyRolls[names[2]],true);
});

test('unordered legacy shinies are protected until their identities are cleared',()=>{
 const s={zaWildShinyRolls:{'legacy:rare':true}};for(let i=0;i<12;i++)assignWildShiny(s,{},()=>0,`new:${i}`);
 assert.equal(s.zaWildShinyRolls['legacy:rare'],true);assert.equal(s.zaWildShinyOrder.length,12);
 clearWildShiny(s,'legacy:rare');assignWildShiny(s,{},()=>0,'new:12');assert.equal(s.zaWildShinyOrder.length,10);assert.equal(s.zaWildShinyRolls['new:0'],undefined);assert.equal(s.zaWildShinyRolls['new:3'],true);
 const before=JSON.stringify(s);assignWildShiny(s,{},()=>0);assert.equal(JSON.stringify(s),before);
});

test('clearing or evicting a visible shiny also clears its alpha identity',()=>{
 const s={zaWildShinyRolls:{},zaWildShinyOrder:[],zaWildVisibleAlphaLevels:{}};
 for(let i=0;i<11;i++){const key=`zone14:slot${i}:304`;s.zaWildVisibleAlphaLevels[key]=38;assignWildShiny(s,{},()=>0,key);}
 assert.equal(s.zaWildVisibleAlphaLevels['zone14:slot0:304'],undefined);assert.equal(s.zaWildVisibleAlphaLevels['zone14:slot1:304'],38);clearWildShiny(s,'zone14:slot1:304');assert.equal(s.zaWildVisibleAlphaLevels['zone14:slot1:304'],undefined);
});
