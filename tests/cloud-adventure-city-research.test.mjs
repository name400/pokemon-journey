import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {evolutionOptions} from '../lib/evolution.mjs';
import {fieldMap,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {CITY_RESEARCH_ENCOUNTERS,cityResearchEncounter} from '../lib/cloud-adventure/adventure-city-research.mjs';
test('city habitats preserve legacy positions and support the species evolution paths',()=>{
 for(const p of CITY_RESEARCH_ENCOUNTERS.filter(p=>!p.form&&!['litwick','goomy','dratini','riolu','dedenne','scraggy'].includes(p.id))){const state={district:p.district,area:3,x:p.id==='ralts'?11:5,y:p.id==='ralts'?8:2,zaVert4Layer:p.layer,teamIds:['kept'],adventureDexSpecies:[152]};const map=fieldMap(state);assert.equal(map[p.y][p.x],'^');assert.ok(fieldPath(map,state,{x:p.x,y:p.y+1}).length);assert.equal(cityResearchEncounter(state,{...p,tile:'^'}).species,p.species);const saved=storeAdventurePosition(state,2),restored=restoreAdventurePosition(saved,2);assert.deepEqual([restored.x,restored.y],[state.x,state.y]);assert.deepEqual(restored.teamIds,['kept']);assert.deepEqual(restored.adventureDexSpecies,[152]);}
 for(const [id,level,next] of [[568,36,569],[280,20,281],[281,30,282]]){const options=evolutionOptions(makeMon(id,level),{adventureEngine:'cloud'},[],{});assert.equal(options.find(o=>o.id===next)?.ready,true);}
 assert.equal(cityResearchEncounter({district:'lumiose-vert-sector4',zaVert4Layer:'roof'},{tile:'^',x:10,y:2}),null);
});

test('Litwick appears in the main sewer before and after Mission 19 without blocking saved tiles',()=>{
 for(const stage of [10,16]){const s={district:'lumiose-sewer',interior:null,area:3,x:7,y:2,zaMission19Stage:stage,teamIds:['kept'],adventureDexSpecies:[152]};const map=fieldMap(s);assert.equal(map[2][8],'^');assert.equal(cityResearchEncounter(s,{tile:'^',x:8,y:2}).species,607);const restored=restoreAdventurePosition(storeAdventurePosition(s,22),22);assert.deepEqual([restored.x,restored.y],[7,2]);assert.deepEqual(restored.teamIds,['kept']);}
 const p={district:'lumiose-sewer',area:3,zaSewerIceBranch:true};assert.equal(cityResearchEncounter(p,{tile:'^',x:8,y:2}),null);assert.equal(cityResearchEncounter({...p,zaSewerIceBranch:false,zaMission19Inner:true},{tile:'^',x:8,y:2}),null);
 assert.equal(evolutionOptions(makeMon(607,41),{adventureEngine:'cloud'},[],{}).find(o=>o.id===608).ready,true);const evo=evolutionOptions(makeMon(608,45),{adventureEngine:'cloud'},[],{duskstone:1}).find(o=>o.id===609);assert.equal(evo.ready,true);assert.equal(evo.consume.item,'duskstone');
});

test('Goomy hillside and rainy evolution remain available across save restore',()=>{
 const base={area:3,district:'lumiose-jaune-sector10',x:8,y:4,teamIds:['kept'],adventureDexSpecies:[152]};
 const spot={x:7,y:4,tile:'^'};
 assert.equal(fieldMap({...base,weather:''})[4][7],'#');
 assert.equal(cityResearchEncounter({...base,weather:''},spot),null);
 const rainy={...base,weather:'rain'};assert.equal(fieldMap(rainy)[4][7],'^');assert.equal(cityResearchEncounter(rainy,spot)?.species,704);
 const restored=restoreAdventurePosition(storeAdventurePosition(rainy,7),7);assert.deepEqual([restored.x,restored.y],[8,4]);assert.deepEqual(restored.teamIds,['kept']);
 assert.equal(evolutionOptions(makeMon(704,40),{adventureEngine:'cloud'},[],{}).find(o=>o.id===705).ready,true);
 for(const [weather,ready] of [['',false],['rain',true]])assert.equal(evolutionOptions(makeMon(705,50),{adventureEngine:'cloud',weather},[],{}).find(o=>o.id===706).ready,ready);
});

test('Vert 6 roof Dratini is daytime only and leaves saved walkable tiles unchanged',()=>{
 const s={area:3,district:'lumiose-vert6-roof',x:3,y:6,zaCityResearchPeriod:'day',teamIds:['kept'],adventureDexSpecies:[152]};const spot={x:2,y:6,tile:'^'};
 assert.equal(fieldMap(s)[6][2],'^');assert.equal(cityResearchEncounter(s,spot)?.species,147);
 const night={...s,zaCityResearchPeriod:'night'};assert.equal(fieldMap(night)[6][2],'#');assert.equal(cityResearchEncounter(night,spot),null);
 const restored=restoreAdventurePosition(storeAdventurePosition(s,12),12);assert.deepEqual([restored.x,restored.y],[3,6]);assert.deepEqual(restored.teamIds,['kept']);
 for(const [id,level,next] of [[147,30,148],[148,55,149]])assert.equal(evolutionOptions(makeMon(id,level),{adventureEngine:'cloud'},[],{}).find(o=>o.id===next).ready,true);
});

test('Riolu and Dedenne rooftop habitats preserve blocked tiles and weather rules',()=>{
 const riolu={area:3,district:'lumiose-screw-ombrage',x:3,y:10,zaCityResearchPeriod:'day',weather:''},r={x:2,y:10,tile:'^'};
 assert.equal(cityResearchEncounter(riolu,r)?.species,447);assert.equal(fieldMap(riolu)[10][2],'^');for(const state of [{...riolu,weather:'rain'},{...riolu,zaCityResearchPeriod:'night'}]){assert.equal(cityResearchEncounter(state,r),null);assert.equal(fieldMap(state)[10][2],'#');}
 const d={area:3,district:'lumiose-magenta-sector6-roof',x:1,y:8},spot={x:0,y:8,tile:'^'};assert.equal(fieldMap(d)[8][0],'^');assert.equal(cityResearchEncounter(d,spot)?.species,702);const old=restoreAdventurePosition(storeAdventurePosition({...d,teamIds:['kept']},5),5);assert.deepEqual([old.x,old.y,old.teamIds],[1,8,['kept']]);
});

test('Scraggy appears in the main sewer without altering branch maps or saved paths',()=>{
 const s={area:3,district:'lumiose-sewer',x:3,y:4,teamIds:['kept'],adventureDexSpecies:[152]},spot={tile:'^',x:2,y:4};
 assert.equal(fieldMap(s)[4][2],'^');assert.equal(cityResearchEncounter(s,spot)?.species,559);
 for(const other of [{...s,zaSewerIceBranch:true},{...s,zaMission19Inner:true},{...s,interior:'shop'}])assert.equal(cityResearchEncounter(other,spot),null);
 const restored=restoreAdventurePosition(storeAdventurePosition(s,21),21);assert.deepEqual([restored.x,restored.y,restored.teamIds],[3,4,['kept']]);assert.equal(evolutionOptions(makeMon(559,39),{adventureEngine:'cloud'},[],{}).find(o=>o.id===560).ready,true);
});

test('consumed city spawns wait for area exit or a new cycle without removing other shinies',async()=>{
 const {consumeCityResearch,refreshCityResearchSpawns,refreshCityResearchOnExit,visibleCityResearchEncounters}=await import('../lib/cloud-adventure/adventure-city-research.mjs');
 const lit={x:8,y:2,tile:'^'},scr={x:2,y:4,tile:'^'},s={area:3,district:'lumiose-sewer',zaCityResearchPeriod:'day',zaCityResearchCycles:{'lumiose-sewer':{period:'day',interval:12}},zaWildShinyRolls:{'cityResearch:scraggy:559':true,'cityResearch:dratini:147':true},zaCityResearchSpent:{dratini:true}};
 assert.ok(cityResearchEncounter(s,lit));assert.ok(consumeCityResearch(s,'litwick'));assert.equal(cityResearchEncounter(s,lit),null);assert.ok(cityResearchEncounter(s,scr));assert.ok(!visibleCityResearchEncounters(s,fieldMap(s)).some(p=>p.id==='litwick'));assert.equal(refreshCityResearchSpawns(s,'day',12),false);assert.equal(s.zaCityResearchSpent.litwick,true);
 s.combat={};assert.equal(refreshCityResearchSpawns(s,'night',22),false);delete s.combat;assert.equal(refreshCityResearchSpawns(s,'night',22),true);assert.ok(cityResearchEncounter(s,lit));assert.equal(s.zaCityResearchSpent.dratini,true);assert.equal(s.zaWildShinyRolls['cityResearch:scraggy:559'],true);
 consumeCityResearch(s,'litwick');s.district='lumiose-bleu3-sewer-approach';assert.equal(refreshCityResearchOnExit(s,'lumiose-sewer:'),true);assert.equal(s.zaCityResearchSpent.litwick,undefined);assert.equal(s.zaCityResearchSpent.dratini,true);assert.equal(s.zaWildShinyRolls['cityResearch:scraggy:559'],true);s.district='lumiose-sewer';assert.ok(cityResearchEncounter(s,lit));
});


test('flower forms have accessible city encounters and preserve old positions',()=>{
 for(const p of CITY_RESEARCH_ENCOUNTERS.filter(p=>p.form)){
  const neighbors=[[p.x-1,p.y],[p.x+1,p.y],[p.x,p.y-1],[p.x,p.y+1]],base={area:3,district:p.district,teamIds:['kept']},map=fieldMap(base);
  assert.equal(map[p.y][p.x],'^');
  const stand=neighbors.find(([x,y])=>['.',',','g',';'].includes(map[y]?.[x]));assert.ok(stand,p.id);
  const state={...base,x:stand[0],y:stand[1]};assert.equal(cityResearchEncounter(state,{...p,tile:'^'}).form,p.form);
  assert.equal(makeMon(p.form,p.level).speciesId,669);assert.equal(makeMon(p.form,p.level).id,p.form);
  const saved=restoreAdventurePosition(storeAdventurePosition(state,7),7);assert.deepEqual([saved.x,saved.y,saved.teamIds],[...stand,['kept']]);
 }
});
