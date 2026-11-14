// Encounter locations are provisional; levels and moves follow the source audit.
export const MISSION20_CASES=[
 {n:21,id:'mission21-mawile',name:'메가입치트',species:10052,stone:'mawilite',district:'lumiose-rooftop',tile:'m',level:48,moves:['아이언헤드','치근거리기','깨물어부수기','칼춤']},
 {n:22,id:'mission22-barbaracle',name:'메가거북손데스',species:10298,stone:'barbaracite',district:'lumiose-sewer',tile:'o',level:48,moves:['스톤샤워','그로우펀치','폭포오르기']},
 {n:23,id:'mission23-ampharos',name:'메가전룡',species:10045,stone:'ampharosite',district:'lumiose-rouge-north',tile:'v',level:48,moves:['용의파동','와이드브레이커','충전']},
];
export const MISSION20_GUARD={id:'mission20-guard',name:'Rust Syndicate 단원',team:[[569,44],[305,44]]};
export const MISSION20_PHILIPPE={id:'mission20-philippe',name:'Philippe',team:[[208,46],[212,46],[227,47]],moves:[['Heavy Slam','Stealth Rock','Crunch','Rock Slide'],['Air Slash','Swords Dance','X-Scissor','Bullet Punch'],['Drill Run','Night Slash','Steel Wing','Air Slash']],item:'skarmorite'};
export const MISSION23_GWYNN={id:'mission23-gwynn',name:'Gwynn',team:[[354,45],[711,46],[94,46],[609,47]],item:'chandelurite'};
export function mission20Case(s,tile){if(!s.interior&&s.district==='lumiose-rouge-sector6'&&tile==='v')return MISSION20_CASES.find(c=>c.n===23);if(!s.interior&&s.district==='lumiose-mission23-roof'&&tile==='v')return MISSION20_CASES.find(c=>c.n===23);if(!s.interior&&s.district==='lumiose-mission22-tunnel'&&tile==='o')return MISSION20_CASES.find(c=>c.n===22);if(!s.interior&&s.district==='lumiose-magenta-sector6-roof'&&tile==='m')return MISSION20_CASES.find(c=>c.n===21);return MISSION20_CASES.find(c=>c.district===s.district&&!s.interior&&c.tile===tile);}
export function mission20Complete(s){return MISSION20_CASES.every(c=>s[`zaMission${c.n}Complete`]===true);}

// IDs identify the original save slots, not species. Keep slot 93 for
// compatibility with saves and in-flight encounters from the earlier draft.
// https://bulbapedia.bulbagarden.net/wiki/Old_Building
export const MISSION20_GHOSTS=[{tile:'q',id:92,species:92,level:40,name:'고오스',moves:['Shadow Ball','Icy Wind','Dark Pulse','Haze']},{tile:'a',id:93,species:94,level:42,name:'팬텀',moves:['Shadow Ball','Dark Pulse','Haze','Icy Wind']},{tile:'b',id:94,species:94,level:42,name:'팬텀',moves:['Shadow Ball','Dark Pulse','Haze','Icy Wind']}];
export function mission20Ghost(s,tile){return s.district==='lumiose-ghost-house'&&!s.interior?MISSION20_GHOSTS.find(g=>g.tile===tile):undefined;}
export function mission20GhostsCaught(s){return [...new Set((Array.isArray(s.zaMission20GhostCaught)?s.zaMission20GhostCaught:[]).filter(id=>MISSION20_GHOSTS.some(g=>g.id===id)))];}

// Four adjacent floor tiles per ghost are a conservative 2D approximation.
// Legacy in-progress saves lack the motion marker and keep their fixed slots.
export function mission20GhostPosition(s,g){
 const motion=s?.zaMission20GhostMotionV1,phase=Number.isInteger(motion?.phase)&&motion.phase>=0&&motion.phase<4?motion.phase:0;
 const offset=[[0,0],[1,0],[1,1],[0,1]][phase];return {x:({92:6,93:11,94:16})[g.id]+offset[0],y:5+offset[1]};
}
export function advanceMission20Ghosts(s){
 const motion=s?.zaMission20GhostMotionV1;if(s?.district!=='lumiose-ghost-house'||s.interior||s.zaMission20Stage!==7||!motion||!Number.isInteger(motion.phase)||motion.phase<0||motion.phase>3||!Number.isInteger(motion.tick)||motion.tick<0||motion.tick>2)return false;
 const caught=mission20GhostsCaught(s),remaining=MISSION20_GHOSTS.filter(g=>!caught.includes(g.id));if(!remaining.length)return false;
 // Do not move an encounter out from under a player trying to interact.
 if(remaining.some(g=>{const p=mission20GhostPosition(s,g);return Math.abs(p.x-s.x)+Math.abs(p.y-s.y)<=1;}))return false;
 if(motion.tick<2){s.zaMission20GhostMotionV1={...motion,tick:motion.tick+1};return false;}
 const next={...motion,phase:(motion.phase+1)%4,tick:0},future={...s,zaMission20GhostMotionV1:next};
 if(remaining.some(g=>{const p=mission20GhostPosition(future,g);return Math.abs(p.x-s.x)+Math.abs(p.y-s.y)<=1;}))return false;
 s.zaMission20GhostMotionV1=next;return true;
}
