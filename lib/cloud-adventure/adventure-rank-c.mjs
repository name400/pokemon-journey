// Rank D opponents and Corbeau's promotion team. Ticket point award is provisional.
// https://www.serebii.net/legendsz-a/z-aroyale/rankd.shtml
export const RANK_D_TRAINERS=[
 {id:'royale-d-elise',name:'경찰관 Elise',team:[[701,43],[68,43]],moves:[['Bounce','Taunt','Flying Press','Swords Dance'],['Brick Break','Bulldoze','Detect','Heavy Slam']]},
 {id:'royale-d-larissa',name:'오컬트마니아 Larissa',team:[[608,43],[608,43]],moves:[['Fire Spin','Flamethrower','Shadow Ball','Flame Wheel'],['Fire Spin','Flamethrower','Shadow Ball','Flame Wheel']]},
 {id:'royale-d-colette',name:'배틀걸 Colette',team:[[870,44],[675,44]],moves:[['Iron Head','Brick Break','No Retreat','Iron Defense'],['Parting Shot','Brutal Swing','Crunch','Body Slam']]},
 {id:'royale-d-hector',name:'웨이터 Hector',team:[[514,40],[693,40]],moves:[['Amnesia','Headbutt','Fire Blast','Crunch'],['Water Pulse','Swords Dance','Aura Sphere','Dark Pulse']]},
];
export const CORBEAU={id:'mission24-corbeau',name:'Corbeau',team:[[24,50],[130,51],[407,51],[545,52]],moves:[['독찌르기','불꽃엄니','맹독','흡혈'],['깨물어부수기','폭포오르기','드래곤다이브','뛰어오르다'],['기가드레인','광합성','오물폭탄','섀도볼'],['더스트슈트','방어','시저크로스','지진']]};
export function rankDPoints(s){return Number.isInteger(s.zaRoyaleDPoints)&&s.zaRoyaleDPoints>=0?Math.min(38000,s.zaRoyaleDPoints):0;}
export function rankDWins(s){return [...new Set((Array.isArray(s.zaRoyaleDSessionWins)?s.zaRoyaleDSessionWins:[]).filter(id=>RANK_D_TRAINERS.some(t=>t.id===id)))];}
