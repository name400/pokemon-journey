// Rank F opponents and Mission 14 teams; see Bulbapedia and Serebii.
export const RANK_F_TRAINERS=[
 {id:'royale-f-arthur',name:'스쿨키드 Arthur',team:[[657,31],[666,31]],moves:[['Bubble Beam','Smokescreen','Aerial Ace','Shadow Sneak'],['Supersonic','Psybeam','U-turn','Air Slash']]},
 {id:'royale-f-manon',name:'스쿨키드 Manon',team:[[651,31],[662,31]],moves:[['Bite','Leech Seed','Pin Missile','Take Down'],['Feather Dance','Whirlwind','Flame Wheel','Steel Wing']]},
 {id:'royale-f-leandro',name:'배달원 Leandro',team:[[602,33],[310,33]],moves:[['Tackle','Thunder Wave','Spark'],['Eerie Impulse','Thunder Fang','Roar','Snarl']]},
 {id:'royale-f-malik',name:'웨이터 Malik',team:[[692,33],[582,33]],moves:[['Aqua Jet','Mud Shot','Water Pulse','Swords Dance'],['Icy Wind','Self-Destruct','Icicle Crash','Acid Armor']]},
 {id:'royale-f-alix',name:'웨이트리스 Alix',team:[[712,33],[459,33]],moves:[['Ice Fang','Iron Defense','Recover','Crunch'],['Ice Shard','Razor Leaf','Icy Wind','Growth']]},
];
export function rankFPoints(s){return Number.isInteger(s.zaRoyaleFPoints)&&s.zaRoyaleFPoints>=0?Math.min(32000,s.zaRoyaleFPoints):0;}
export function rankFWins(s){return [...new Set((Array.isArray(s.zaRoyaleFSessionWins)?s.zaRoyaleFSessionWins:[]).filter(id=>RANK_F_TRAINERS.some(t=>t.id===id)))];}
export const RANK_E_MANI={id:'rank-e-mani',name:'Mani',team:[[694,34],[587,34],[26,35]],moves:[['Parabolic Charge','Breaking Swipe','Bulldoze','Swift'],['Spark','Wing Attack','Charge','Nuzzle'],['Thunderbolt','Quick Attack','Brick Break','Spark']]};
export const RANK_E_TARRAGON={id:'rank-e-tarragon',name:'Tarragon',team:[[450,36],[660,36],[530,37]],moves:[['Heavy Slam','Amnesia','Crunch','Stealth Rock'],['Swords Dance','Take Down','Bounce','Bulldoze'],['Swords Dance','Dig','Rock Slide','X-Scissor']],item:'excadrite'};
export const RANK_E_CANARI={id:'rank-e-canari',name:'Canari',team:[[695,37],[618,38],[181,38],[604,39]],moves:[['Swift','Parabolic Charge','Volt Switch','Bulldoze'],['Discharge','Spark','Charge','Mud Shot'],['Cotton Guard','Discharge','Power Gem','Dragon Pulse'],['Discharge','Crunch','Volt Switch','Eerie Impulse']],item:'eelektrossite'};
