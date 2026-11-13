import test from 'node:test';
import assert from 'node:assert/strict';
import {refreshCityResearchSpawns} from '../lib/cloud-adventure/adventure-city-research.mjs';
test('city refresh anchors old saves and resets only normal spawns on a new cycle',()=>{
 const lit='cityResearch:litwick:607',scr='cityResearch:scraggy:559',other='cityResearch:dratini:147';const s={district:'lumiose-sewer',zaWildShinyRolls:{[lit]:false,[scr]:true,[other]:false}};
 assert.equal(refreshCityResearchSpawns(s,'day',12),true);assert.deepEqual(s.zaWildShinyRolls,{[lit]:false,[scr]:true,[other]:false});assert.equal(refreshCityResearchSpawns(s,'day',12),false);
 s.combat={};assert.equal(refreshCityResearchSpawns(s,'night',13),false);delete s.combat;s.adventureCatchWindow={};assert.equal(refreshCityResearchSpawns(s,'night',13),false);delete s.adventureCatchWindow;
 assert.equal(refreshCityResearchSpawns(s,'night',13),true);assert.deepEqual(s.zaWildShinyRolls,{[scr]:true,[other]:false});assert.equal(refreshCityResearchSpawns(s,'night',13),false);
});
