// Candidate coverage only: presence in encounter data or an evolution graph
// does not prove that a map, item, condition or quest is playable.
import {LATER_ZONE_SPECIES} from '../lib/cloud-adventure/adventure-zone-research.mjs';
import {CITY_RESEARCH_ENCOUNTERS} from '../lib/cloud-adventure/adventure-city-research.mjs';
import {NORTH_MONKEY_TREES} from '../lib/cloud-adventure/adventure-city-monkeys.mjs';
import {BLEU5_MARKET_POKEMON} from '../lib/cloud-adventure/adventure-side14.mjs';
import {FOSSILS,megaStoneShopStock} from '../lib/cloud-adventure/adventure-side27.mjs';
import {LYSANDRE_WILD} from '../lib/cloud-adventure/adventure-lysandre-maze.mjs';
import {ZONE20_ALPHA,ZONE20_VISIBLE,ZONE20_ENCOUNTER_SPECIES} from '../lib/cloud-adventure/adventure-mission42.mjs';
import {SHARD_MEGA_STONES} from '../lib/cloud-adventure/adventure-mega-exchange.mjs';
import {researchSummary,RESEARCH_TYPES} from '../lib/cloud-adventure/adventure-research.mjs';
import lumiose from '../data/lumiose-dex.json' with {type:'json'};
import pokedex from '../data/pokedex.json' with {type:'json'};
import {species as gameSpecies} from '../lib/game.mjs';
import rules from '../data/evolution-rules.json' with {type:'json'};

const dex=lumiose.nationalSpeciesIds.slice(0,230),names=new Map(pokedex.map(p=>[p.id,p.name]));
const direct=new Set([...CITY_RESEARCH_ENCOUNTERS,...NORTH_MONKEY_TREES,...BLEU5_MARKET_POKEMON,...Object.values(FOSSILS),...LYSANDRE_WILD,...ZONE20_ALPHA,...ZONE20_VISIBLE].map(p=>p.species).filter(Number.isInteger));
// Manually identified special paths: sewer encounters, missions 40–42 and starters.
for(const id of [...ZONE20_ENCOUNTER_SPECIES,168,686,690,714,716,717,718,152,498,158])direct.add(id);
const missingByZone={};
for(let n=1;n<=19;n++){
 const m=await import(`../lib/cloud-adventure/adventure-zone${n}.mjs`),encounter=m[`zone${n}Encounter`],candidates=new Set(m[`ZONE${n}_SPECIES`]||[]);
 for(const p of m[`ZONE${n}_VISIBLE`]||[])if(Number.isInteger(p.species))candidates.add(p.species);
 if(n>=5)for(let k=0;k<100;k++)for(const period of ['day','night'])for(const [x,y] of [[2,2],[8,8],[8,11],[18,13]])for(const upper of [false,true]){
  const rng=()=>k/100,s={x,y,[`zaZone${n}Upper`]:upper,[`zaZone${n}Period`]:period};
  const p=n===5?encounter(rng):n===6?encounter(rng,period):[7,13,15].includes(n)?encounter(period,rng):[16,17,19].includes(n)?encounter(s,rng,period):encounter(s,rng);
  if(Number.isInteger(p?.speciesId))candidates.add(p.speciesId);
 }
 for(const id of candidates)direct.add(id);
 if(n>=5)missingByZone[n]=LATER_ZONE_SPECIES[n].filter(id=>!candidates.has(id));
}
const zone20=new Set([...ZONE20_ENCOUNTER_SPECIES,...ZONE20_VISIBLE.map(p=>p.species),...ZONE20_ALPHA.map(p=>p.species)]);
missingByZone[20]=LATER_ZONE_SPECIES[20].filter(id=>!zone20.has(id));
const closure=new Set(direct);let changed=true;
while(changed){changed=false;for(const r of rules){const from=Number(r.from),to=Number(r.to);if(closure.has(from)&&to>0&&!closure.has(to)){closure.add(to);changed=true;}}}
const missing=dex.filter(id=>!closure.has(id));
const mega=[...new Set([...SHARD_MEGA_STONES.map(p=>p.id),...megaStoneShopStock({zaMission37Complete:true,zaIntroStarterSpecies:152}).map(p=>p[0]),'absolite','slowbronite','cameruptite','victreebelite'])];
const fixture={adventureDexSpecies:dex,zaResearchCaptures:Object.fromEntries(RESEARCH_TYPES.map(t=>[t,50])),zaResearchTrainerWins:1000,zaResearchEvolutions:50,zaResearchItemEvolutions:10,zaResearchTradeEvolutions:5,zaResearchMegaStones:mega,zaResearchCrystalBreaks:1000,zaMission40Anomalies:['steelix','gallade','pangoro'],zaResearchActivities:{fossil:3,cafe:3,bench:3}};
const directSpeciesTypeCandidates=Object.fromEntries(RESEARCH_TYPES.map(type=>[type,dex.filter(id=>direct.has(id)&&gameSpecies.some(p=>p.speciesId===id&&p.types?.includes(type))).length]));
const scenarios={};for(const [label,patch] of Object.entries({allCandidateMaximum:{},noTrade:{zaResearchTradeEvolutions:0},threeTradeEvolutions:{zaResearchTradeEvolutions:3},crystals250:{zaResearchCrystalBreaks:250},crystals249:{zaResearchCrystalBreaks:249},only44Mega:{zaResearchMegaStones:mega.slice(0,44)},only100TrainerWins:{zaResearchTrainerWins:100}}))scenarios[label]=researchSummary({...fixture,...patch});
console.log(JSON.stringify({warning:'Candidate data only; not a playable-route proof. Special paths are manually listed, include non-wild gifts/fossils, and all evolution versions and conditions are ignored.',zoneCandidateGaps:missingByZone,dexDirectCandidateCount:dex.filter(id=>direct.has(id)).length,dexEvolutionGraphCandidateCount:dex.length-missing.length,dexCandidateGaps:missing.map(id=>({id,name:names.get(id)})),megaCandidates:mega.length,directSpeciesTypeCandidates,fullySeededFixture:researchSummary(fixture),scenarios},null,2));
