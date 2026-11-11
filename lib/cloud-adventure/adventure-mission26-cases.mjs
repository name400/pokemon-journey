// Encounter locations are provisional; levels and moves follow the source audit.
export const MISSION26_CASES=[
 {n:27,id:'mission27-froslass',name:'메가눈여아',species:10285,stone:'froslassite',district:'lumiose-rooftop',tile:'7',level:53,moves:['고스트다이브','얼어붙은바람','도깨비불','섀도볼']},
 {n:28,id:'mission28-altaria',name:'메가파비코리',species:10067,stone:'altarianite',district:'lumiose-north-boulevard',tile:'8',level:53,moves:['용의파동','문포스','브레이브버드']},
 {n:29,id:'mission29-venusaur',name:'메가이상해꽃',species:10033,stone:'venusaurite',district:'lumiose-site',tile:'9',level:53,moves:['씨기관총','파워휩','오물웨이브']},
];
export function mission26Case(s,tile){if(!s.interior&&s.district==='lumiose-jaune-sector8'&&tile==='9')return MISSION26_CASES.find(c=>c.n===29);if(!s.interior&&s.district==='lumiose-mission27-roof'&&tile==='7')return MISSION26_CASES.find(c=>c.n===27);if(!s.interior&&['lumiose-magenta-sector4','lumiose-magenta-sector4-roof'].includes(s.district)&&tile==='8')return MISSION26_CASES.find(c=>c.n===28);return MISSION26_CASES.find(c=>!s.interior&&c.district===s.district&&c.tile===tile);}
export function mission26CasesComplete(s){return MISSION26_CASES.every(c=>s[`zaMission${c.n}Complete`]===true);}
