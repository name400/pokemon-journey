// Source-backed city habitats. Exact 2D coordinates and the Trubbish level
// are provisional; the enclosed courtyard Ralts is documented at level 10.
// https://www.siliconera.com/where-to-find-ralts-in-pokemon-legends-z-a/
// https://www.powerpyx.com/pokemon-legends-z-a-trubbish-location/
export const CITY_RESEARCH_ENCOUNTERS=Object.freeze([
 Object.freeze({id:'ralts',district:'lumiose-vert-sector4',layer:'courtyard',x:10,y:2,species:280,level:10,name:'랄토스'}),
 Object.freeze({id:'trubbish',district:'lumiose-north-boulevard',x:3,y:0,species:568,level:18,name:'깨봉이'}),
 // Rooftops in Vert 6; the specific map, 2D position and respawn rate are approximations.
 // https://www.powerpyx.com/pokemon-legends-z-a-dratini-location/
 Object.freeze({id:'dratini',district:'lumiose-vert6-roof',x:2,y:6,species:147,level:28,name:'미뇽',period:'day'}),
 // Rainy hillside between Jaune 10 and 12; 2D placement and level provisional.
 // https://www.powerpyx.com/pokemon-legends-z-a-goomy-location/
 Object.freeze({id:'goomy',district:'lumiose-jaune-sector10',x:7,y:4,species:704,level:20,name:'미끄메라',rain:true}),
 // Northern main sewer; coordinates are provisional.
 // https://www.rpgsite.net/guide/18743-pokemon-legends-z-a-litwitck-guide-where-to-find-catch-litwick
 Object.freeze({id:'litwick',district:'lumiose-sewer',x:8,y:2,species:607,level:35,name:'불켜미'}),
]);
export function cityResearchEncounter(s,spot){
 if(s?.interior||spot?.tile!=='^'||(s?.district==='lumiose-sewer'&&(s.zaSewerIceBranch||s.zaMission19Inner)))return null;
 return CITY_RESEARCH_ENCOUNTERS.find(p=>(!p.rain||s.weather==='rain')&&(!p.period||p.period===s.zaCityResearchPeriod)&&p.district===s?.district&&p.x===spot.x&&p.y===spot.y&&(!p.layer||p.layer===s.zaVert4Layer))||null;
}
