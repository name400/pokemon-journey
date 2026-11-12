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
];
// Existing walkable arena tiles; original trainer positions are not confirmed.
export const RANK_D_EXTRA_POSITIONS=Object.freeze([['b',19,11,4],['e',12,5,5],['t',3,11,6],['j',9,11,7],['k',15,11,8],['n',19,5,9]]);
export const CORBEAU={id:'mission24-corbeau',name:'Corbeau',team:[[24,50],[130,51],[407,51],[545,52]],moves:[['독찌르기','불꽃엄니','맹독','흡혈'],['깨물어부수기','폭포오르기','드래곤다이브','뛰어오르다'],['기가드레인','광합성','오물폭탄','섀도볼'],['더스트슈트','방어','시저크로스','지진']]};
export function rankDPoints(s){return Number.isInteger(s.zaRoyaleDPoints)&&s.zaRoyaleDPoints>=0?Math.min(38000,s.zaRoyaleDPoints):0;}
export function rankDWins(s){return [...new Set((Array.isArray(s.zaRoyaleDSessionWins)?s.zaRoyaleDSessionWins:[]).filter(id=>RANK_D_TRAINERS.some(t=>t.id===id)))];}
