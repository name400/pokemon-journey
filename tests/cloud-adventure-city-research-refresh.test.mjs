import test from 'node:test';
import assert from 'node:assert/strict';
import {refreshCityResearchSpawns} from '../lib/cloud-adventure/adventure-city-research.mjs';
test('city refresh anchors old saves and resets only normal spawns on a new cycle',()=>{
 const lit='cityResearch:litwick:607',scr='cityResearch:scraggy:559',other='cityResearch:dratini:147';const s={district:'lumiose-sewer',zaWildShinyRolls:{[lit]:false,[scr]:true,[other]:false}};
 assert.equal(refreshCityResearchSpawns(s,'day',12),true);assert.deepEqual(s.zaWildShinyRolls,{[lit]:false,[scr]:true,[other]:false});assert.equal(refreshCityResearchSpawns(s,'day',12),false);
 s.combat={};assert.equal(refreshCityResearchSpawns(s,'night',13),false);delete s.combat;s.adventureCatchWindow={};assert.equal(refreshCityResearchSpawns(s,'night',13),false);delete s.adventureCatchWindow;
 assert.equal(refreshCityResearchSpawns(s,'night',13),true);assert.deepEqual(s.zaWildShinyRolls,{[scr]:true,[other]:false});assert.equal(refreshCityResearchSpawns(s,'night',13),false);
});

test('leaving a city habitat refreshes only its normal spawns and keeps layers separate',async()=>{
 const {cityResearchArea,refreshCityResearchOnExit}=await import('../lib/cloud-adventure/adventure-city-research.mjs');const s={district:'lumiose-sewer',zaWildShinyRolls:{'cityResearch:litwick:607':false,'cityResearch:scraggy:559':true,'cityResearch:dratini:147':false}},area=cityResearchArea(s);assert.equal(area,'lumiose-sewer:');assert.equal(refreshCityResearchOnExit(s,area),false);s.district='lumiose-bleu3-sewer-approach';assert.equal(refreshCityResearchOnExit(s,area),true);assert.deepEqual(s.zaWildShinyRolls,{'cityResearch:scraggy:559':true,'cityResearch:dratini:147':false});
 const v={district:'lumiose-vert-sector4',zaVert4Layer:'courtyard',zaWildShinyRolls:{'cityResearch:ralts:280':false}};const courtyard=cityResearchArea(v);v.zaVert4Layer='roof';assert.equal(refreshCityResearchOnExit(v,courtyard),true);assert.equal(v.zaWildShinyRolls['cityResearch:ralts:280'],undefined);
 const b={district:'lumiose-sewer',combat:{},zaWildShinyRolls:{'cityResearch:litwick:607':false}};assert.equal(refreshCityResearchOnExit(b,area),false);b.district='lumiose';assert.equal(refreshCityResearchOnExit(b,area),false);assert.equal(b.zaWildShinyRolls['cityResearch:litwick:607'],false);
});
