// Rank D opponents and Corbeau's promotion team. Ticket point award is provisional.
// https://www.serebii.net/legendsz-a/z-aroyale/rankd.shtml
export const RANK_D_TRAINERS=[
 {id:'royale-d-elise',name:'경찰관 Elise',team:[[701,43],[68,43]],moves:[['Bounce','Taunt','Flying Press','Swords Dance'],['Brick Break','Bulldoze','Detect','Heavy Slam']]},
 {id:'royale-d-larissa',name:'오컬트마니아 Larissa',team:[[608,43],[608,43]],moves:[['Fire Spin','Flamethrower','Shadow Ball','Flame Wheel'],['Fire Spin','Flamethrower','Shadow Ball','Flame Wheel']]},
 {id:'royale-d-colette',name:'배틀걸 Colette',team:[[870,44],[675,44]],moves:[['Iron Head','Brick Break','No Retreat','Iron Defense'],['Parting Shot','Brutal Swing','Crunch','Body Slam']]},
 {id:'royale-d-hector',name:'웨이터 Hector',team:[[514,40],[693,40]],moves:[['Amnesia','Headbutt','Fire Blast','Crunch'],['Water Pulse','Swords Dance','Aura Sphere','Dark Pulse']]},
 {id:'royale-d-gabriel',name:'꼬마 Gabriel',team:[[660,40],[505,40]],moves:[['Dig','Bounce','Take Down','Super Fang'],['Focus Energy','Work Up','Nasty Plot','Iron Tail']]},
 {id:'royale-d-bryan',name:'관광객 Bryan',team:[[560,40],[587,40]],moves:[['Parting Shot','Brick Break','Detect','Crunch'],['Eerie Impulse','Spark','Air Slash','Volt Switch']]},
 {id:'royale-d-clara',name:'조깅 Clara',team:[[676,41],[229,41]],moves:[['Charm','Crunch','Snarl','Double-Edge'],['Snarl','Take Down','Fire Fang','Dark Pulse']]},
 {id:'royale-d-amina',name:'배달원 Amina',team:[[375,43],[227,43]],moves:[['Flash Cannon','Take Down','Psycho Cut','Psychic'],['Steel Wing','Night Slash','Drill Run','Metal Sound']]},
 {id:'royale-d-emmanuel',name:'운전기사 Emmanuel',team:[[553,41],[553,41]],moves:[['Dig','Take Down','Crunch','Iron Tail'],['Dig','Take Down','Crunch','Iron Tail']]},
 {id:'royale-d-enora',name:'배낭여행객 Enora',team:[[695,42],[714,42]],moves:[['Breaking Swipe','Morning Sun','Thunderbolt','Charge'],['Whirlwind','Super Fang','Air Slash','Screech']]},
 {id:'royale-d-mylan',name:'컬렉터 Mylan',team:[[569,42],[569,42]],moves:[['Sludge Bomb','Toxic','Self-Destruct','Sludge Wave'],['Sludge Bomb','Toxic','Self-Destruct','Sludge Wave']]},
 {id:'royale-d-remi',name:'작업원 Rémi',team:[[208,42],[703,42]],moves:[['Screech','Sand Tomb','Stealth Rock','Heavy Slam'],['Light Screen','Flash Cannon','Rock Slide','Stealth Rock']]},
 {id:'royale-d-laure',name:'후리소데 Laure',team:[[671,44],[671,44]],moves:[['Magical Leaf','Charm','Synthesis','Energy Ball'],['Magical Leaf','Charm','Synthesis','Energy Ball']]},
 {id:'royale-d-sam',name:'도련님 Sam',team:[[680,44],[247,44]],moves:[['Shadow Claw','Iron Defense','Iron Head','Swords Dance'],['Crunch','Earthquake','Stone Edge','Rock Blast']]},
 {id:'royale-d-charlie',name:'엘리트 트레이너 Charlie',team:[[713,44],[36,44],[323,44]],moves:[['Crunch','Take Down','Icicle Crash','Double-Edge'],['Moonlight','Amnesia','Dazzling Gleam','Mystical Fire'],['Earth Power','Curse','Take Down','Earthquake']]},
 {id:'royale-d-wharton',name:'DYN4MO Wharton',team:[[702,42],[25,42]],moves:[['Volt Switch','Play Rough','Thunderbolt','Super Fang'],['Thunderbolt','Charge','Light Screen','Thunder']]},
 {id:'royale-d-gabi',name:'정의의 주먹 Gabi',team:[[308,43],[214,43]],moves:[['Zen Headbutt','Take Down','Agility','Recover'],['Rock Blast','Bug Buzz','Lunge','Swords Dance']]},
 {id:'royale-d-ameline',name:'정의의 주먹 Ameline',team:[[710,43],[302,43]],moves:[['Brutal Swing','Hypnosis','Shadow Ball','Mystical Fire'],['Psybeam','Night Slash','Power Gem','Zen Headbutt']]},
 {id:'royale-d-rust-steel',name:'러스트단 조무래기',team:[[306,44],[208,44]],moves:[['Iron Head','Metal Sound','Take Down','Iron Tail'],['Sand Tomb','Stealth Rock','Heavy Slam','Dig']]},
 {id:'royale-d-rust-grass',name:'러스트단 조무래기',team:[[71,44],[315,44]],moves:[['Poison Jab','Leech Life','Sludge Wave','Power Whip'],['Giga Drain','Poison Jab','Synthesis','Toxic']]},
];
// Existing walkable arena tiles; original trainer positions are not confirmed.
export const RANK_D_EXTRA_POSITIONS=Object.freeze([['b',19,11,4],['e',12,5,5],['t',3,11,6],['j',9,11,7],['k',15,11,8],['n',19,5,9],['q',12,11,10],['e',5,3,11],['t',9,3,12],['j',15,3,13],['k',19,3,14],['n',5,13,15],['q',17,13,16],['e',7,13,17],['t',15,13,18],['j',3,7,19]]);
export const CORBEAU={id:'mission24-corbeau',name:'Corbeau',team:[[24,50],[130,51],[407,51],[545,52]],moves:[['독찌르기','불꽃엄니','맹독','흡혈'],['깨물어부수기','폭포오르기','드래곤다이브','뛰어오르다'],['기가드레인','광합성','오물폭탄','섀도볼'],['더스트슈트','방어','시저크로스','지진']]};
export function rankDPoints(s){return Number.isInteger(s.zaRoyaleDPoints)&&s.zaRoyaleDPoints>=0?Math.min(38000,s.zaRoyaleDPoints):0;}
export function rankDWins(s){return [...new Set((Array.isArray(s.zaRoyaleDSessionWins)?s.zaRoyaleDSessionWins:[]).filter(id=>RANK_D_TRAINERS.some(t=>t.id===id)))];}
