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
