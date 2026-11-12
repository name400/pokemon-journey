// Source teams: https://www.serebii.net/legendsz-a/mainmissions/reachingrankd.shtml
export const MISSION19_CANARI={id:'mission19-canari',name:'Canari',team:[[695,42],[181,43],[618,43],[604,44]],moves:[['Thunder Wave','Parabolic Charge','Thunderbolt','Bulldoze'],['Dazzling Gleam','Discharge','Power Gem','Ice Punch'],['Discharge','Thunder Shock','Stealth Rock','Mud Shot'],['Discharge','Fire Punch','Volt Switch','Giga Drain']],item:'eelektrossite'};
export const MISSION19_GWYNN={id:'mission19-gwynn',name:'Gwynn',team:[[354,43],[711,44],[609,45]],moves:[['Shadow Sneak','Shadow Claw','Knock Off','Heal Block'],['Trick-or-Treat','Shadow Claw','Bullet Seed','Brutal Swing'],['Flamethrower','Fire Spin','Shadow Ball','Protect']],item:'chandelurite'};
export const MISSION19_IVOR={id:'mission19-ivor',name:'Ivor',team:[[214,45],[308,46],[68,46],[870,47]],moves:[['Rock Blast','Pin Missile','Aerial Ace','Brick Break'],['Zen Headbutt','Rock Smash','Protect','Ice Punch'],['Bulldoze','Brick Break','Brutal Swing','Bulk Up'],['Iron Head','Brick Break','Rock Slide','No Retreat']],item:'falinksite'};
export const SEWER_OBJECTS=['a','b','e','d'];
export function sewerInspected(s){return [...new Set((Array.isArray(s.zaMission19Inspected)?s.zaMission19Inspected:[]).filter(x=>SEWER_OBJECTS.includes(x)))];}
// Branch locations and exact tile coordinates are drafts based on the sewer walkthrough.
export const SEWER_BRANCH_ITEMS=[
 {id:'fork-nugget',x:16,y:3,item:'nugget',name:'금구슬'},
 {id:'fork-ice-stone',x:18,y:3,item:'icestone',name:'얼음의돌'},
 {id:'ice-room-stone',x:15,y:7,item:'icestone',name:'얼음의돌'},
 {id:'hall-hp-up',x:17,y:13,item:'hpup',name:'맥스업'},
];
export function sewerBranchItem(s,x,y){return SEWER_BRANCH_ITEMS.find(p=>p.x===x&&p.y===y&&!(Array.isArray(s.zaSewerBranchItems)&&s.zaSewerBranchItems.includes(p.id)))||null;}

// South sewer items from the Mission 19 walkthrough. Exact coordinates are a 2D draft.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-19-reaching-rank-d
export const SEWER_SOUTH_ITEMS=[
 {id:'southwest-hyper',x:3,y:8,kind:'hyper_potions',name:'고급상처약'},
 {id:'south-iron',x:9,y:14,kind:'iron',name:'사포닌'},
 {id:'southeast-great',x:19,y:11,kind:'greatball',name:'슈퍼볼'},
];
export function sewerSouthItem(s,x,y){return SEWER_SOUTH_ITEMS.find(p=>p.x===x&&p.y===y&&!(Array.isArray(s.zaSewerSouthItems)&&s.zaSewerSouthItems.includes(p.id)))||null;}
