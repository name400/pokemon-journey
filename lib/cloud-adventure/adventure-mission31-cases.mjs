// Encounter locations are provisional; levels and moves follow the source audit.
export const MISSION31_CASES=[
 {n:32,id:'mission32-dragonite',name:'메가망나뇽',species:10281,stone:'dragoninite',district:'lumiose-rooftop',tile:'6',level:59,moves:['에어슬래시','역린','화염방사','드래곤다이브']},
 {n:33,id:'mission33-tyranitar',name:'메가마기라스',species:10049,stone:'tyranitarite',district:'lumiose-north-boulevard',tile:'6',level:59,moves:['스톤샤워','깨물어부수기','모래지옥','역린']},
 {n:34,id:'mission34-starmie',name:'메가아쿠스타',species:10280,stone:'starminite',district:'lumiose-site',tile:'6',level:59,moves:['아쿠아제트','사념의박치기','물의파동','벌크업']},
];
// Philippe's Mission 34 rematch; no other teammate holds an item.
// https://www.serebii.net/legendsz-a/mainmissions/aroguemegastarmie.shtml
export const MISSION34_PHILIPPE={id:'mission34-philippe',name:'Philippe',team:[[208,56],[212,56],[306,56],[227,57]],moves:[['스톤에지','헤비봄버','스텔스록','와이드브레이커'],['방어','아이언헤드','시저크로스','에어슬래시'],['아이언테일','스톤샤워','지진','냉동펀치'],['드릴라이너','깜짝베기','강철날개','방어']],strategy:'balanced'};
export function mission31Case(s,tile){if(!s.interior&&s.district==='lumiose-mission32-courtyard'&&s.zaMission32Layer==='high'&&tile==='6')return MISSION31_CASES.find(c=>c.n===32);if(!s.interior&&s.district==='lumiose-mission33-alley'&&tile==='6')return MISSION31_CASES.find(c=>c.n===33);if(!s.interior&&s.district==='lumiose-mission34-roof'&&((tile==='6'&&!s.zaMission34PhilippeWon)||(tile==='7'&&s.zaMission34PhilippeWon)))return MISSION31_CASES.find(c=>c.n===34);return MISSION31_CASES.find(c=>!s.interior&&c.district===s.district&&c.tile===tile);}
export function mission31CasesComplete(s){return MISSION31_CASES.every(c=>s[`zaMission${c.n}Complete`]===true);}
