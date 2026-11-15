// Representative rank B trainers. Teams and per-win points are provisional.
// https://www.serebii.net/legendsz-a/z-aroyale/rankb.shtml
export const RANK_B_TRAINERS=[
 {id:'royale-b-katrina',name:'베테랑 Katrina',team:[[80,56],[604,56],[428,56]],moves:[['Amnesia','Surf','Psychic','Future Sight'],['Thunderbolt','Wild Charge','Zap Cannon','Super Fang'],['Iron Tail','Cotton Guard','Bounce','Dynamic Punch']],item:'lopunnite'},
 {id:'royale-b-eden',name:'베테랑 Eden',team:[[115,56],[282,56],[18,56]],moves:[['Crunch','Endure','Outrage','Dynamic Punch'],['Calm Mind','Psychic','Mystical Fire','Moonblast'],['Air Slash','Feather Dance','Hurricane','Brave Bird']],item:'pidgeotite'},
 {id:'royale-b-hank',name:'스쿨키드 Hank',team:[[123,49],[212,49]],moves:[['Bug Buzz','Air Slash','Swords Dance','Lunge'],['Iron Defense','Swords Dance','Lunge','Iron Head']]},
 {id:'royale-b-maelle',name:'포켓몬센터 직원 Maëlle',team:[[715,56],[681,56],[531,56]],moves:[['Air Slash','Screech','Hurricane','Boomburst'],['Iron Defense','Iron Head','Swords Dance','Head Smash'],['Take Down','Wish','Hyper Voice','Double-Edge']],item:'audinite'},
 {id:'royale-b-lorenzo',name:'웨이터 Lorenzo',team:[[516,52],[689,52]],moves:[['Headbutt','Hydro Pump','Crunch','Focus Blast'],['Night Slash','Brick Break','Liquidation','Stone Edge']]},
 {id:'royale-b-mila',name:'스쿨키드 Mila',team:[[663,49],[18,49]],moves:[['Steel Wing','Air Slash','Agility','Flare Blitz'],['Agility','Air Slash','Feather Dance','Hurricane']]},
 {id:'royale-b-felix',name:'관광객 Felix',team:[[319,49],[323,49]],moves:[['Crunch','Agility','Take Down','Liquidation'],['Curse','Take Down','Earthquake','Flamethrower']]},
 {id:'royale-b-sara',name:'관광객 Sara',team:[[227,49],[225,49]],moves:[['Night Slash','Drill Run','Metal Sound','Spikes'],['Feather Dance','Ice Punch','Freeze-Dry','Blizzard']]},
 {id:'royale-b-safa',name:'배낭여행자 Safa',team:[[460,50],[709,50]],moves:[['Growth','Leech Seed','Wood Hammer','Blizzard'],["Forest's Curse",'Phantom Force','Wood Hammer','Curse']]},
 {id:'royale-b-helena',name:'오컬트마니아 Héléna',team:[[354,50],[711,50]],moves:[['Shadow Ball','Swords Dance','Phantom Force','Gunk Shot'],['Shadow Ball','Mystical Fire','Phantom Force','Power Whip']]},
 {id:'royale-b-rosalie',name:'베테랑 Rosalie',team:[[658,55],[609,55],[460,55]],moves:[['Substitute','Night Slash','Bounce','Double Team'],['Flame Wheel','Curse','Heal Block','Overheat'],['Leech Seed','Wood Hammer','Blizzard','Leaf Storm']]},

 {id:'royale-b-ethan',name:'도련님 Éthan',team:[[691,48],[715,48]],moves:[['Poison Jab','Dragon Pulse','Sludge Bomb','Hydro Pump'],['Super Fang','Air Slash','Screech','Hurricane']]},
 {id:'royale-b-nathaniel',name:'컬렉터 Nathaniel',team:[[247,48],[705,48]],moves:[['Earthquake','Stone Edge','Rock Blast','Hyper Beam'],['Dragon Pulse','Take Down','Curse','Body Slam']]},
 {id:'royale-b-liham',name:'작업원 Liham',team:[[306,48],[530,48]],moves:[['Metal Sound','Take Down','Iron Tail','Iron Defense'],['Rock Slide','Swords Dance','Drill Run','Earthquake']]},
 {id:'royale-b-elea',name:'후리소데 Eléa',team:[[685,50],[683,50]],moves:[['Energy Ball','Wish','Play Rough','Sticky Web'],['Moonblast','Psychic','Heal Block','Hypnosis']]},
 {id:'royale-b-amira',name:'오컬트마니아 Amira',team:[[709,50],[354,50]],moves:[["Forest's Curse",'Phantom Force','Wood Hammer','Curse'],['Shadow Ball','Swords Dance','Phantom Force','Gunk Shot']]},
 {id:'royale-b-fredrique',name:'엘리트 트레이너 Fredrique',team:[[655,54],[130,54],[530,54]],moves:[['Will-O-Wisp','Psychic','Agility','Fire Blast'],['Bounce','Hurricane','Dragon Rush','Hydro Pump'],['Swords Dance','Drill Run','Earthquake','Megahorn']]},

];
// Shared 2D arena coordinates are provisional.
export const RANK_B_EXTRA_POSITIONS=Object.freeze([['e',12,5,5],['t',3,11,6],['j',9,11,7],['k',15,11,8],['n',19,5,9],['q',12,11,10],['e',5,3,11],['t',9,3,12],['j',15,3,13],['k',19,3,14],['n',5,13,15],['q',17,13,16]]);
export const GRISHAM={id:'mission35-grisham',name:'Grisham',team:[[675,61],[687,61],[668,61],[248,62],[373,62],[6,63]],moves:[['Brick Break','Crunch','Bullet Punch','Protect'],['Hypnosis','Psyshock','Night Slash','Liquidation'],['Overheat','Earth Power','Snarl','Hyper Voice'],['Stone Edge','Ice Punch','Crunch','Earthquake'],['Aerial Ace','Earthquake','Fire Fang','Draco Meteor'],['Flare Blitz','Air Slash','Dragon Rush','Protect']],aceItem:'charizarditex'};
export function rankBPoints(s){return Number.isInteger(s.zaRoyaleBPoints)&&s.zaRoyaleBPoints>=0?Math.min(45000,s.zaRoyaleBPoints):0;}
export function rankBWins(s){return [...new Set((Array.isArray(s.zaRoyaleBSessionWins)?s.zaRoyaleBSessionWins:[]).filter(id=>RANK_B_TRAINERS.some(t=>t.id===id)))];}
