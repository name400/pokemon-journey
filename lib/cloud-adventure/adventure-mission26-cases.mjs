// Temporary locations and levels for the three Rogue Mega incidents.
export const MISSION26_CASES=[
 {n:27,id:'mission27-froslass',name:'메가눈여아',species:10285,stone:'froslassite',district:'lumiose-rooftop',tile:'7'},
 {n:28,id:'mission28-altaria',name:'메가파비코리',species:10067,stone:'altarianite',district:'lumiose-north-boulevard',tile:'8'},
 {n:29,id:'mission29-venusaur',name:'메가이상해꽃',species:10033,stone:'venusaurite',district:'lumiose-site',tile:'9'},
];
export function mission26Case(s,tile){if(!s.interior&&s.district==='lumiose-magenta-sector4'&&tile==='8')return MISSION26_CASES.find(c=>c.n===28);return MISSION26_CASES.find(c=>!s.interior&&c.district===s.district&&c.tile===tile);}
export function mission26CasesComplete(s){return MISSION26_CASES.every(c=>s[`zaMission${c.n}Complete`]===true);}
