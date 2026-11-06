// Locations and boss level are provisional; see source audit for Missions 20–23.
export const MISSION20_CASES=[
 {n:21,id:'mission21-mawile',name:'메가입치트',species:10052,stone:'mawilite',district:'lumiose-rooftop',tile:'m'},
 {n:22,id:'mission22-barbaracle',name:'메가거북손데스',species:10298,stone:'barbaracite',district:'lumiose-sewer',tile:'o'},
 {n:23,id:'mission23-ampharos',name:'메가전룡',species:10045,stone:'ampharosite',district:'lumiose-rouge-north',tile:'v'},
];
export const MISSION20_GUARD={id:'mission20-guard',name:'Rust Syndicate 단원',team:[[569,44],[305,44]]};
export const MISSION20_PHILIPPE={id:'mission20-philippe',name:'Philippe',team:[[208,46],[212,46],[227,47]],moves:[['Heavy Slam','Stealth Rock','Crunch','Rock Slide'],['Air Slash','Swords Dance','X-Scissor','Bullet Punch'],['Drill Run','Night Slash','Steel Wing','Air Slash']],item:'skarmorite'};
export const MISSION23_GWYNN={id:'mission23-gwynn',name:'Gwynn',team:[[354,45],[711,46],[94,46],[609,47]],item:'chandelurite'};
export function mission20Case(s,tile){if(!s.interior&&s.district==='lumiose-magenta-sector6-roof'&&tile==='m')return MISSION20_CASES.find(c=>c.n===21);return MISSION20_CASES.find(c=>c.district===s.district&&!s.interior&&c.tile===tile);}
export function mission20Complete(s){return MISSION20_CASES.every(c=>s[`zaMission${c.n}Complete`]===true);}

// The house layout and wild levels are provisional.
export const MISSION20_GHOSTS=[{tile:'q',id:92,name:'고오스'},{tile:'a',id:93,name:'고우스트'},{tile:'b',id:94,name:'팬텀'}];
export function mission20Ghost(s,tile){return s.district==='lumiose-ghost-house'&&!s.interior?MISSION20_GHOSTS.find(g=>g.tile===tile):undefined;}
export function mission20GhostsCaught(s){return [...new Set((Array.isArray(s.zaMission20GhostCaught)?s.zaMission20GhostCaught:[]).filter(id=>MISSION20_GHOSTS.some(g=>g.id===id)))];}
