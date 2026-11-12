// Representative rank B trainers. Teams and per-win points are provisional.
// https://www.serebii.net/legendsz-a/z-aroyale/rankb.shtml
export const RANK_B_TRAINERS=[
 {id:'royale-b-katrina',name:'베테랑 Katrina',team:[[80,56],[604,56],[428,56]],moves:[['Amnesia','Surf','Psychic','Future Sight'],['Thunderbolt','Wild Charge','Zap Cannon','Super Fang'],['Iron Tail','Cotton Guard','Bounce','Dynamic Punch']],item:'lopunnite'},
 {id:'royale-b-eden',name:'베테랑 Eden',team:[[115,56],[282,56],[18,56]],moves:[['Crunch','Endure','Outrage','Dynamic Punch'],['Calm Mind','Psychic','Mystical Fire','Moonblast'],['Air Slash','Feather Dance','Hurricane','Brave Bird']],item:'pidgeotite'},
 {id:'royale-b-hank',name:'스쿨키드 Hank',team:[[123,49],[212,49]],moves:[['Bug Buzz','Air Slash','Swords Dance','Lunge'],['Iron Defense','Swords Dance','Lunge','Iron Head']]},
 {id:'royale-b-maelle',name:'포켓몬센터 직원 Maëlle',team:[[715,56],[681,56],[531,56]],moves:[['Air Slash','Screech','Hurricane','Boomburst'],['Iron Defense','Iron Head','Swords Dance','Head Smash'],['Take Down','Wish','Hyper Voice','Double-Edge']],item:'audinite'},
 {id:'royale-b-lorenzo',name:'웨이터 Lorenzo',team:[[516,52],[689,52]],moves:[['Headbutt','Hydro Pump','Crunch','Focus Blast'],['Night Slash','Brick Break','Liquidation','Stone Edge']]},
];
export const GRISHAM={id:'mission35-grisham',name:'Grisham',team:[[675,61],[687,61],[668,61],[248,62],[373,62],[6,63]]};
export function rankBPoints(s){return Number.isInteger(s.zaRoyaleBPoints)&&s.zaRoyaleBPoints>=0?Math.min(45000,s.zaRoyaleBPoints):0;}
export function rankBWins(s){return [...new Set((Array.isArray(s.zaRoyaleBSessionWins)?s.zaRoyaleBSessionWins:[]).filter(id=>RANK_B_TRAINERS.some(t=>t.id===id)))];}
