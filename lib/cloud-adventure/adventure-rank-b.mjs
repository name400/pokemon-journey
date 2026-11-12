// Rank C examples and tournament rosters; see the source audit.
// https://www.serebii.net/legendsz-a/z-aroyale/rankc.shtml
export const RANK_C_TRAINERS=[
 {id:'royale-c-ylan',name:'경찰관 Ylan',team:[[780,47],[310,47]],moves:[['Amnesia','Dragon Pulse','Light Screen','Fly'],['Snarl','Charge','Thunderbolt','Wild Charge']]},
 {id:'royale-c-maiko',name:'배틀걸 Maiko',team:[[68,47],[308,47]],moves:[['Bulldoze','Detect','Heavy Slam','Double-Edge'],['Zen Headbutt','Take Down','Agility','Recover']]},
 {id:'royale-c-elif',name:'아티스트 Elif',team:[[711,47],[354,47]],moves:[['Shadow Ball','Mystical Fire','Phantom Force','Power Whip'],['Curse','Shadow Ball','Swords Dance','Phantom Force']]},
 {id:'royale-c-lena',name:'웨이트리스 Lena',team:[[583,46],[516,46]],moves:[['Icicle Crash','Acid Armor','Ice Beam','Explosion'],['Headbutt','Hydro Pump','Crunch','Focus Blast']]},
];
export const RANK_B_ROUNDS=[
 {name:'Canari',team:[[695,53],[181,54],[618,54],[604,55]],coins:3960},
 {name:'Ivor',team:[[214,53],[308,54],[68,54],[870,55]],coins:3960},
 {name:'Corbeau',team:[[24,54],[130,55],[407,55],[545,56]],coins:4032},
 {name:'지가르데',team:[[718,57]],coins:0},
 {name:'Jacinthe',team:[[703,57],[303,58],[699,58],[282,58],[36,59]],coins:4248},
];
export function rankCPoints(s){return Number.isInteger(s.zaRoyaleCPoints)&&s.zaRoyaleCPoints>=0?Math.min(41000,s.zaRoyaleCPoints):0;}
export function rankCWins(s){return [...new Set((Array.isArray(s.zaRoyaleCSessionWins)?s.zaRoyaleCSessionWins:[]).filter(id=>RANK_C_TRAINERS.some(t=>t.id===id)))];}
