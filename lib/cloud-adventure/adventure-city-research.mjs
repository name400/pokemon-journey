// Source-backed city habitats. Exact 2D coordinates and the Trubbish level
// are provisional; the enclosed courtyard Ralts is documented at level 10.
// https://www.siliconera.com/where-to-find-ralts-in-pokemon-legends-z-a/
// https://www.powerpyx.com/pokemon-legends-z-a-trubbish-location/
export const CITY_RESEARCH_ENCOUNTERS=Object.freeze([
 Object.freeze({id:'ralts',district:'lumiose-vert-sector4',layer:'courtyard',x:10,y:2,species:280,level:10,name:'랄토스'}),
 Object.freeze({id:'trubbish',district:'lumiose-north-boulevard',x:3,y:0,species:568,level:18,name:'깨봉이'}),
 // Rooftop encounters: exact 2D placements and availability are approximations.
 // https://www.siliconera.com/where-to-find-riolu-in-pokemon-legends-z-a/
 // https://www.powerpyx.com/pokemon-legends-z-a-dedenne-location/
 Object.freeze({id:'riolu',district:'lumiose-screw-ombrage',x:2,y:10,species:447,level:18,name:'리오르',period:'day',sunny:true}),
 Object.freeze({id:'dedenne',district:'lumiose-magenta-sector6-roof',x:0,y:8,species:702,level:20,name:'데덴네'}),
 // Rooftops in Vert 6; the specific map, 2D position and respawn rate are approximations.
 // https://www.powerpyx.com/pokemon-legends-z-a-dratini-location/
 Object.freeze({id:'dratini',district:'lumiose-vert6-roof',x:2,y:6,species:147,level:28,name:'미뇽',period:'day'}),
 // Rainy hillside between Jaune 10 and 12; 2D placement and level provisional.
 // https://www.powerpyx.com/pokemon-legends-z-a-goomy-location/
 Object.freeze({id:'goomy',district:'lumiose-jaune-sector10',x:7,y:4,species:704,level:20,name:'미끄메라',rain:true}),
 // Scraggy is documented in the sewers; this 2D position is provisional.
 // https://rotomlabs.net/dex/legends-z-a/scraggy
 Object.freeze({id:'scraggy',district:'lumiose-sewer',x:2,y:4,species:559,level:35,name:'곤율랭'}),
 // Northern main sewer; coordinates are provisional.
 // https://www.rpgsite.net/guide/18743-pokemon-legends-z-a-litwitck-guide-where-to-find-catch-litwick
 Object.freeze({id:'litwick',district:'lumiose-sewer',x:8,y:2,species:607,level:35,name:'불켜미'}),
]);
const CITY_RESEARCH_BY_DISTRICT=new Map();
for(const p of CITY_RESEARCH_ENCOUNTERS){const entries=CITY_RESEARCH_BY_DISTRICT.get(p.district)||[];entries.push(p);CITY_RESEARCH_BY_DISTRICT.set(p.district,entries);}
export function cityResearchEncounter(s,spot){
 if(s?.interior||spot?.tile!=='^'||(s?.district==='lumiose-sewer'&&(s.zaSewerIceBranch||s.zaMission19Inner)))return null;
 return CITY_RESEARCH_ENCOUNTERS.find(p=>s.zaCityResearchSpent?.[p.id]!==true&&(!p.rain||s.weather==='rain')&&(!p.sunny||s.weather==='')&&(!p.period||p.period===s.zaCityResearchPeriod)&&p.district===s?.district&&p.x===spot.x&&p.y===spot.y&&(!p.layer||p.layer===s.zaVert4Layer))||null;
}
// A fixed field individual must not be rolled again immediately after capture
// or defeat. Never infer spent encounters for older saves.
export function consumeCityResearch(s,id){
 if(!CITY_RESEARCH_ENCOUNTERS.some(p=>p.id===id))return false;
 s.zaCityResearchSpent={...(s.zaCityResearchSpent||{}),[id]:true};return true;
}
// Resolve against the actual map so inactive layers, weather and story walls
// never acquire a sprite or a hidden shiny roll.
export function visibleCityResearchEncounters(s,map){
 if(s?.interior||!Array.isArray(map))return [];
 return CITY_RESEARCH_ENCOUNTERS.filter(p=>p.district===s.district&&cityResearchEncounter(s,{x:p.x,y:p.y,tile:map[p.y]?.[p.x]})?.id===p.id);
}

// Reuse the existing day/night spawn clock, keeping a shiny until it is
// consumed. A missing cycle belongs to an older save and is only anchored.
export function refreshCityResearchSpawns(s,period,interval){
 if(!s||s.interior||s.combat||s.encounter||s.adventureCatchWindow||!['day','night'].includes(period)||!Number.isSafeInteger(interval))return false;
 const locations=CITY_RESEARCH_ENCOUNTERS.filter(p=>p.district===s.district);if(!locations.length)return false;
 const cycles=s.zaCityResearchCycles&&typeof s.zaCityResearchCycles==='object'&&!Array.isArray(s.zaCityResearchCycles)?s.zaCityResearchCycles:{};
 const old=cycles[s.district],valid=old&&['day','night'].includes(old.period)&&Number.isSafeInteger(old.interval);
 if(valid&&old.period===period&&old.interval===interval)return false;
 if(valid&&s.zaWildShinyRolls&&typeof s.zaWildShinyRolls==='object'&&!Array.isArray(s.zaWildShinyRolls)){
  const rolls={...s.zaWildShinyRolls};for(const p of locations){const key=`cityResearch:${p.id}:${p.species}`;if(rolls[key]!==true)delete rolls[key];}s.zaWildShinyRolls=rolls;
 }
 if(valid&&s.zaCityResearchSpent&&typeof s.zaCityResearchSpent==='object'&&!Array.isArray(s.zaCityResearchSpent)){
  const spent={...s.zaCityResearchSpent};for(const p of locations)delete spent[p.id];s.zaCityResearchSpent=spent;
 }
 s.zaCityResearchCycles={...cycles,[s.district]:{period,interval}};return true;
}

// An area describes the actual accessible layer, independent of weather: a
// temporary weather change must not discard the persistent shiny individual.
export function cityResearchArea(s){
 if(!s||s.interior||(s.district==='lumiose-sewer'&&(s.zaSewerIceBranch||s.zaMission19Inner)))return null;
 const p=CITY_RESEARCH_BY_DISTRICT.get(s.district)?.find(x=>!x.layer||x.layer===s.zaVert4Layer);
 return p?`${p.district}:${p.layer||''}`:null;
}
export function refreshCityResearchOnExit(s,oldArea){
 if(!oldArea||oldArea===cityResearchArea(s)||s.combat||s.encounter||s.adventureCatchWindow)return false;
 const locations=CITY_RESEARCH_ENCOUNTERS.filter(p=>`${p.district}:${p.layer||''}`===oldArea),rolls=s.zaWildShinyRolls,spent=s.zaCityResearchSpent;let changed=false;
 if(rolls&&typeof rolls==='object'&&!Array.isArray(rolls)){const keys=locations.map(p=>`cityResearch:${p.id}:${p.species}`).filter(key=>rolls[key]===false);if(keys.length){const next={...rolls};for(const key of keys)delete next[key];s.zaWildShinyRolls=next;changed=true;}}
 if(spent&&typeof spent==='object'&&!Array.isArray(spent)){const ids=locations.map(p=>p.id).filter(id=>spent[id]===true);if(ids.length){const next={...spent};for(const id of ids)delete next[id];s.zaCityResearchSpent=next;changed=true;}}
 return changed;
}
