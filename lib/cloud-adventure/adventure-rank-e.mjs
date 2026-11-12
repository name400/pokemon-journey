// Rank F opponents and Mission 14 teams; see Bulbapedia and Serebii.
export const RANK_F_TRAINERS=[
 {id:'royale-f-arthur',name:'스쿨키드 Arthur',team:[[657,31],[666,31]],moves:[['Bubble Beam','Smokescreen','Aerial Ace','Shadow Sneak'],['Supersonic','Psybeam','U-turn','Air Slash']]},
 {id:'royale-f-manon',name:'스쿨키드 Manon',team:[[651,31],[662,31]],moves:[['Bite','Leech Seed','Pin Missile','Take Down'],['Feather Dance','Whirlwind','Flame Wheel','Steel Wing']]},
 {id:'royale-f-leandro',name:'배달원 Leandro',team:[[602,33],[310,33]],moves:[['Tackle','Thunder Wave','Spark'],['Eerie Impulse','Thunder Fang','Roar','Snarl']]},
 {id:'royale-f-malik',name:'웨이터 Malik',team:[[692,33],[582,33]],moves:[['Aqua Jet','Mud Shot','Water Pulse','Swords Dance'],['Icy Wind','Self-Destruct','Icicle Crash','Acid Armor']]},
 {id:'royale-f-alix',name:'웨이트리스 Alix',team:[[712,33],[459,33]],moves:[['Ice Fang','Iron Defense','Recover','Crunch'],['Ice Shard','Razor Leaf','Icy Wind','Growth']]},
 {id:'royale-f-lara',name:'사무원 Lara',team:[[676,32],[678,32]],moves:[['Cotton Guard','Charm','Crunch','Snarl'],['Charm','Psybeam','Light Screen','Reflect']]},
 {id:'royale-f-clemence',name:'오컬트마니아 Clemence',team:[[353,31],[708,31]],moves:[['Shadow Sneak','Shadow Claw','Curse','Shadow Ball'],['Confuse Ray','Will-O-Wisp','Growth','Horn Leech']]},
 {id:'royale-f-marion',name:'배틀걸 Marion',team:[[447,31],[307,31]],moves:[['Rock Smash','Screech','Detect','Bulldoze'],['Psybeam','Calm Mind','Zen Headbutt','Take Down']]},
 {id:'royale-f-tyler',name:'작업원 Tyler',team:[[618,34],[450,34]],moves:[['Rock Tomb','Charge','Spark','Earthquake'],['Crunch','Amnesia','Take Down','Roar']]},
 {id:'royale-f-yuna',name:'관광객 Yuna',team:[[127,31],[123,31]],moves:[['Rock Smash','Brutal Swing','Detect','Take Down'],['Double Team','Brutal Swing','Slash','Focus Energy']]},
 {id:'royale-f-dylan',name:'배낭여행자 Dylan',team:[[361,32],[459,32]],moves:[['Protect','Icy Wind','Fake Tears','Ice Fang'],['Ice Shard','Razor Leaf','Icy Wind','Growth']]},
];
// Shared draft arena positions for the additional Rank F trainers.
export const RANK_F_EXTRA_POSITIONS=Object.freeze([['e',12,5,5],['t',3,11,6],['j',9,11,7],['k',15,11,8],['n',19,5,9],['q',12,11,10]]);
export function rankFPoints(s){return Number.isInteger(s.zaRoyaleFPoints)&&s.zaRoyaleFPoints>=0?Math.min(32000,s.zaRoyaleFPoints):0;}
export function rankFWins(s){return [...new Set((Array.isArray(s.zaRoyaleFSessionWins)?s.zaRoyaleFSessionWins:[]).filter(id=>RANK_F_TRAINERS.some(t=>t.id===id)))];}
export const RANK_E_MANI={id:'rank-e-mani',name:'Mani',team:[[694,34],[587,34],[26,35]],moves:[['Parabolic Charge','Breaking Swipe','Bulldoze','Swift'],['Spark','Wing Attack','Charge','Nuzzle'],['Thunderbolt','Quick Attack','Brick Break','Spark']]};
export const RANK_E_TARRAGON={id:'rank-e-tarragon',name:'Tarragon',team:[[450,36],[660,36],[530,37]],moves:[['Heavy Slam','Amnesia','Crunch','Stealth Rock'],['Swords Dance','Take Down','Bounce','Bulldoze'],['Swords Dance','Dig','Rock Slide','X-Scissor']],item:'excadrite'};
export const RANK_E_CANARI={id:'rank-e-canari',name:'Canari',team:[[695,37],[618,38],[181,38],[604,39]],moves:[['Swift','Parabolic Charge','Volt Switch','Bulldoze'],['Discharge','Spark','Charge','Mud Shot'],['Cotton Guard','Discharge','Power Gem','Dragon Pulse'],['Discharge','Crunch','Volt Switch','Eerie Impulse']],item:'eelektrossite'};
