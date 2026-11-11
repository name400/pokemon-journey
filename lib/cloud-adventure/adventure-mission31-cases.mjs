// Encounter locations are provisional; levels and moves follow the source audit.
export const MISSION31_CASES=[
 {n:32,id:'mission32-dragonite',name:'메가망나뇽',species:10281,stone:'dragoninite',district:'lumiose-rooftop',tile:'6',level:59,moves:['에어슬래시','역린','화염방사','드래곤다이브']},
 {n:33,id:'mission33-tyranitar',name:'메가마기라스',species:10049,stone:'tyranitarite',district:'lumiose-north-boulevard',tile:'6',level:59,moves:['스톤샤워','깨물어부수기','모래지옥','역린']},
 {n:34,id:'mission34-starmie',name:'메가아쿠스타',species:10280,stone:'starminite',district:'lumiose-site',tile:'6',level:59,moves:['아쿠아제트','사념의박치기','물의파동','벌크업']},
];
export function mission31Case(s,tile){if(!s.interior&&s.district==='lumiose-mission32-courtyard'&&s.zaMission32Layer==='high'&&tile==='6')return MISSION31_CASES.find(c=>c.n===32);if(!s.interior&&s.district==='lumiose-mission33-alley'&&tile==='6')return MISSION31_CASES.find(c=>c.n===33);if(!s.interior&&s.district==='lumiose-mission34-roof'&&((tile==='6'&&!s.zaMission34PhilippeWon)||(tile==='7'&&s.zaMission34PhilippeWon)))return MISSION31_CASES.find(c=>c.n===34);return MISSION31_CASES.find(c=>!s.interior&&c.district===s.district&&c.tile===tile);}
export function mission31CasesComplete(s){return MISSION31_CASES.every(c=>s[`zaMission${c.n}Complete`]===true);}
