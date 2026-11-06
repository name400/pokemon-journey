// Representative rank B trainers. Teams and per-win points are provisional.
export const RANK_B_TRAINERS=[
 {id:'royale-b-katrina',name:'베테랑 Katrina',team:[[80,56],[604,56]]},
 {id:'royale-b-eden',name:'베테랑 Eden',team:[[115,56],[282,56]]},
 {id:'royale-b-hank',name:'꼬마 Hank',team:[[123,49],[212,49]]},
];
export const GRISHAM={id:'mission35-grisham',name:'Grisham',team:[[675,61],[687,61],[668,61],[248,62],[373,62],[6,63]]};
export function rankBPoints(s){return Number.isInteger(s.zaRoyaleBPoints)&&s.zaRoyaleBPoints>=0?Math.min(45000,s.zaRoyaleBPoints):0;}
export function rankBWins(s){return [...new Set((Array.isArray(s.zaRoyaleBSessionWins)?s.zaRoyaleBSessionWins:[]).filter(id=>RANK_B_TRAINERS.some(t=>t.id===id)))];}
