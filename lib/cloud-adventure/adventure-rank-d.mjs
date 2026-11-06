// Representative Rank E teams; see Bulbapedia's Rank E trainer list.
export const RANK_E_TRAINERS=[
 {id:'royale-e-henri',name:'사무원 Henri',team:[[560,39],[229,39]]},
 {id:'royale-e-clarisse',name:'오컬트마니아 Clarisse',team:[[353,35],[607,35]]},
 {id:'royale-e-apolline',name:'조거 Apolline',team:[[694,35],[310,35]]},
];
export function rankEPoints(s){return Number.isInteger(s.zaRoyaleEPoints)&&s.zaRoyaleEPoints>=0?Math.min(35000,s.zaRoyaleEPoints):0;}
export function rankEWins(s){return [...new Set((Array.isArray(s.zaRoyaleESessionWins)?s.zaRoyaleESessionWins:[]).filter(id=>RANK_E_TRAINERS.some(t=>t.id===id)))];}
