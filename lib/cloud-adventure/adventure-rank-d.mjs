// Representative Rank E teams; see Bulbapedia's Rank E trainer list.
// https://www.serebii.net/legendsz-a/z-aroyale/ranke.shtml
export const RANK_E_TRAINERS=[
 {id:'royale-e-henri',name:'사무원 Henri',team:[[560,39],[229,39]],moves:[['Protect','Parting Shot','Brick Break','Detect'],['Snarl','Take Down','Fire Fang','Dark Pulse']]},
 {id:'royale-e-clarisse',name:'오컬트마니아 Clarisse',team:[[353,35],[607,35]],moves:[['Shadow Claw','Curse','Shadow Ball','Swords Dance'],['Will-O-Wisp','Fire Spin','Flamethrower','Shadow Ball']]},
 {id:'royale-e-apolline',name:'조거 Apolline',team:[[694,35],[310,35]],moves:[['Bulldoze','Volt Switch','Breaking Swipe','Morning Sun'],['Eerie Impulse','Thunder Fang','Roar','Snarl']]},
 {id:'royale-e-gianni',name:'웨이터 Gianni',team:[[690,39],[689,39]],moves:[['Toxic','Water Pulse','Poison Jab','Dragon Pulse'],['Rock Blast','Bulldoze','Slash','Iron Defense']]},
 {id:'royale-e-izia',name:'드라이버 Izia',team:[[64,36],[18,36]],moves:[['Psycho Cut','Recover','Psyshock','Psychic'],['Wing Attack','Whirlwind','Agility','Air Slash']]},
 {id:'royale-e-mayline',name:'아가씨 Mayline',team:[[705,40],[36,40]],moves:[['Mud Shot','Water Pulse','Dragon Pulse','Take Down'],['Bubble Beam','Moonlight','Amnesia','Dazzling Gleam']]},
 {id:'royale-e-wyatt',name:'작업원 Wyatt',team:[[95,36],[305,36]],moves:[['Breaking Swipe','Screech','Sand Tomb','Stealth Rock'],['Rock Slide','Iron Head','Metal Sound','Take Down']]},
 {id:'royale-e-cleo',name:'관광객 Cléo',team:[[545,37],[618,37]],moves:[['Pin Missile','Take Down','Poison Jab','Toxic'],['Charge','Spark','Earthquake','Discharge']]},
 {id:'royale-e-lily',name:'아티스트 Lily',team:[[583,37],[569,37]],moves:[['Self-Destruct','Icicle Crash','Acid Armor','Ice Beam'],['Poison Jab','Sludge Bomb','Toxic','Self-Destruct']]},
 {id:'royale-e-jonas',name:'배달원 Jonas',team:[[714,38],[334,38]],moves:[['Leech Life','Whirlwind','Super Fang','Air Slash'],['Safeguard','Cotton Guard','Twister','Take Down']]},
 {id:'royale-e-justin',name:'수집가 Justin',team:[[444,39],[26,39]],moves:[['Bulldoze','Bite','Slash','Dragon Claw'],['Charm','Thunderbolt','Charge','Light Screen']]},
 {id:'royale-e-melissa',name:'배낭여행자 Mélissa',team:[[305,36],[323,36]],moves:[['Rock Slide','Iron Head','Metal Sound','Take Down'],['Lava Plume','Earth Power','Curse','Take Down']]},
 {id:'royale-e-esther',name:'오컬트마니아 Esther',team:[[710,38],[708,38]],moves:[['Bullet Seed','Brutal Swing','Hypnosis','Shadow Ball'],['Growth','Horn Leech',"Forest's Curse",'Phantom Force']]},
 {id:'royale-e-kiri',name:'후리소데 Kiri',team:[[707,39],[282,39]],moves:[['Metal Claw','Metal Sound','Draining Kiss','Flash Cannon'],['Double Team','Wish','Calm Mind','Psychic']]},
 {id:'royale-e-kenzo',name:'엘리트 트레이너 Kenzo',team:[[212,39],[689,39],[569,39]],moves:[['Focus Energy','X-Scissor','Bug Buzz','Air Slash'],['Rock Blast','Bulldoze','Slash','Iron Defense'],['Sludge Bomb','Toxic','Self-Destruct','Sludge Wave']]},
 {id:'royale-e-kenner',name:'DYN4MO Kenner',team:[[450,38],[95,38]],moves:[['Amnesia','Take Down','Roar','Heavy Slam'],['Breaking Swipe','Screech','Sand Tomb','Stealth Rock']]},
 {id:'royale-e-cecil',name:'DYN4MO Cecil',team:[[181,38],[587,38]],moves:[['Confuse Ray','Cotton Guard','Power Gem','Thunderbolt'],['Wing Attack','Eerie Impulse','Spark','Air Slash']]},
 {id:'royale-e-akira',name:'정의단 Akira',team:[[308,39],[67,39]],moves:[['Calm Mind','Zen Headbutt','Take Down','Agility'],['Bulk Up','Brick Break','Bulldoze','Detect']]},
 {id:'royale-e-miya',name:'정의단 Miya',team:[[354,39],[93,39]],moves:[['Shadow Claw','Curse','Shadow Ball','Swords Dance'],['Curse','Haze','Icy Wind','Dark Pulse']]},
];
// Positions are draft markers in the shared 2D arena.
export const RANK_E_EXTRA_POSITIONS=Object.freeze([['b',19,11,4],['e',12,5,5],['t',3,11,6],['j',9,11,7],['k',15,11,8],['n',19,5,9],['q',12,11,10],['e',5,3,11],['t',9,3,12],['j',15,3,13],['k',19,3,14],['n',5,13,15],['q',17,13,16],['e',7,13,17],['t',15,13,18]]);
export function rankEPoints(s){return Number.isInteger(s.zaRoyaleEPoints)&&s.zaRoyaleEPoints>=0?Math.min(35000,s.zaRoyaleEPoints):0;}
export function rankEWins(s){return [...new Set((Array.isArray(s.zaRoyaleESessionWins)?s.zaRoyaleESessionWins:[]).filter(id=>RANK_E_TRAINERS.some(t=>t.id===id)))];}
