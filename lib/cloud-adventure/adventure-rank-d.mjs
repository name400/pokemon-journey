// Representative Rank E teams; see Bulbapedia's Rank E trainer list.
// https://www.serebii.net/legendsz-a/z-aroyale/ranke.shtml
export const RANK_E_TRAINERS=[
 {id:'royale-e-henri',name:'사무원 Henri',team:[[560,39],[229,39]],moves:[['Protect','Parting Shot','Brick Break','Detect'],['Snarl','Take Down','Fire Fang','Dark Pulse']]},
 {id:'royale-e-clarisse',name:'오컬트마니아 Clarisse',team:[[353,35],[607,35]],moves:[['Shadow Claw','Curse','Shadow Ball','Swords Dance'],['Will-O-Wisp','Fire Spin','Flamethrower','Shadow Ball']]},
 {id:'royale-e-apolline',name:'조거 Apolline',team:[[694,35],[310,35]],moves:[['Bulldoze','Volt Switch','Breaking Swipe','Morning Sun'],['Eerie Impulse','Thunder Fang','Roar','Snarl']]},
 {id:'royale-e-gianni',name:'웨이터 Gianni',team:[[690,39],[689,39]],moves:[['Toxic','Water Pulse','Poison Jab','Dragon Pulse'],['Rock Blast','Bulldoze','Slash','Iron Defense']]},
];
export function rankEPoints(s){return Number.isInteger(s.zaRoyaleEPoints)&&s.zaRoyaleEPoints>=0?Math.min(35000,s.zaRoyaleEPoints):0;}
export function rankEWins(s){return [...new Set((Array.isArray(s.zaRoyaleESessionWins)?s.zaRoyaleESessionWins:[]).filter(id=>RANK_E_TRAINERS.some(t=>t.id===id)))];}
