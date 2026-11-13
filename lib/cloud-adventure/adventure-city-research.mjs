// Source-backed city habitats. Exact 2D coordinates and the Trubbish level
// are provisional; the enclosed courtyard Ralts is documented at level 10.
// https://www.siliconera.com/where-to-find-ralts-in-pokemon-legends-z-a/
// https://www.powerpyx.com/pokemon-legends-z-a-trubbish-location/
export const CITY_RESEARCH_ENCOUNTERS=Object.freeze([
 Object.freeze({id:'ralts',district:'lumiose-vert-sector4',layer:'courtyard',x:10,y:2,species:280,level:10,name:'랄토스'}),
 Object.freeze({id:'trubbish',district:'lumiose-north-boulevard',x:3,y:0,species:568,level:18,name:'깨봉이'}),
]);
export function cityResearchEncounter(s,spot){
 if(s?.interior||spot?.tile!=='^')return null;
 return CITY_RESEARCH_ENCOUNTERS.find(p=>p.district===s?.district&&p.x===spot.x&&p.y===spot.y&&(!p.layer||p.layer===s.zaVert4Layer))||null;
}
