import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {evolutionOptions} from '../lib/evolution.mjs';
import {fieldMap,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {CITY_RESEARCH_ENCOUNTERS,cityResearchEncounter} from '../lib/cloud-adventure/adventure-city-research.mjs';
test('city habitats preserve legacy positions and support the species evolution paths',()=>{
 for(const p of CITY_RESEARCH_ENCOUNTERS.filter(p=>p.id!=='litwick')){const state={district:p.district,area:3,x:p.id==='ralts'?11:5,y:p.id==='ralts'?8:2,zaVert4Layer:p.layer,teamIds:['kept'],adventureDexSpecies:[152]};const map=fieldMap(state);assert.equal(map[p.y][p.x],'^');assert.ok(fieldPath(map,state,{x:p.x,y:p.y+1}).length);assert.equal(cityResearchEncounter(state,{...p,tile:'^'}).species,p.species);const saved=storeAdventurePosition(state,2),restored=restoreAdventurePosition(saved,2);assert.deepEqual([restored.x,restored.y],[state.x,state.y]);assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.adventureDexSpecies,[152]);}
 for(const [id,level,next] of [[568,36,569],[280,20,281],[281,30,282]]){const options=evolutionOptions(makeMon(id,level),{adventureEngine:'cloud'},[],{});assert.equal(options.find(o=>o.id===next)?.ready,true);}
 assert.equal(cityResearchEncounter({district:'lumiose-vert-sector4',zaVert4Layer:'roof'},{tile:'^',x:10,y:2}),null);
});

test('Litwick appears in the main sewer before and after Mission 19 without blocking saved tiles',()=>{
 for(const stage of [10,16]){const s={district:'lumiose-sewer',interior:null,area:3,x:7,y:2,zaMission19Stage:stage,teamIds:['kept'],adventureDexSpecies:[152]};const map=fieldMap(s);assert.equal(map[2][8],'^');assert.equal(cityResearchEncounter(s,{tile:'^',x:8,y:2}).species,607);const restored=restoreAdventurePosition(storeAdventurePosition(s,22),22);assert.deepEqual([restored.x,restored.y],[7,2]);assert.deepEqual(restored.teamIds,['kept']);}
 const p={district:'lumiose-sewer',area:3,zaSewerIceBranch:true};assert.equal(cityResearchEncounter(p,{tile:'^',x:8,y:2}),null);assert.equal(cityResearchEncounter({...p,zaSewerIceBranch:false,zaMission19Inner:true},{tile:'^',x:8,y:2}),null);
 assert.equal(evolutionOptions(makeMon(607,41),{adventureEngine:'cloud'},[],{}).find(o=>o.id===608).ready,true);const evo=evolutionOptions(makeMon(608,45),{adventureEngine:'cloud'},[],{duskstone:1}).find(o=>o.id===609);assert.equal(evo.ready,true);assert.equal(evo.consume.item,'duskstone');
});
