import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {evolutionOptions} from '../lib/evolution.mjs';
import {fieldMap,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {CITY_RESEARCH_ENCOUNTERS,cityResearchEncounter} from '../lib/cloud-adventure/adventure-city-research.mjs';
test('city habitats preserve legacy positions and support the species evolution paths',()=>{
 for(const p of CITY_RESEARCH_ENCOUNTERS){const state={district:p.district,area:3,x:p.id==='ralts'?11:5,y:p.id==='ralts'?8:2,zaVert4Layer:p.layer,teamIds:['kept'],adventureDexSpecies:[152]};const map=fieldMap(state);assert.equal(map[p.y][p.x],'^');assert.ok(fieldPath(map,state,{x:p.x,y:p.y+1}).length);assert.equal(cityResearchEncounter(state,{...p,tile:'^'}).species,p.species);const saved=storeAdventurePosition(state,2),restored=restoreAdventurePosition(saved,2);assert.deepEqual([restored.x,restored.y],[state.x,state.y]);assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.adventureDexSpecies,[152]);}
 for(const [id,level,next] of [[568,36,569],[280,20,281],[281,30,282]]){const options=evolutionOptions(makeMon(id,level),{adventureEngine:'cloud'},[],{});assert.equal(options.find(o=>o.id===next)?.ready,true);}
 assert.equal(cityResearchEncounter({district:'lumiose-vert-sector4',zaVert4Layer:'roof'},{tile:'^',x:10,y:2}),null);
});
