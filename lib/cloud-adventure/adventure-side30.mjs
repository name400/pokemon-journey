// Arden's Vernal Avenue position is a provisional tile, not an original map coordinate.
// https://www.serebii.net/legendsz-a/sidemissions/showmeamegacamerupt.shtml
export function side30Available(s={}){return s.zaSide30Started===true||s.zaSide30Won===true||!!s.zaMission14Stage||['E','D','C','B','A','S'].includes(s.zaRoyaleRank)||Number(s.zaMission15Stage)>=1;}
export function side30Spot(s,p){return s?.area===3&&s.district==='lumiose-vernal'&&!s.interior&&!s.zaVernalEastRoof&&!s.zaVernalSlowbroBank&&p?.tile==='#'&&p.x===7&&p.y===0;}
// Follow-up missions share Arden's location, but have independent battle and reward state.
export const ARDEN_FOLLOWUPS=Object.freeze({
 31:Object.freeze({species:302,name:'깜까미',team:[[505,35],[552,35],[703,35]],moves:[['Bite','Crunch','Detect','Confuse Ray'],['Crunch','Dig','Sand Tomb','Bite'],['Dazzling Gleam','Flash Cannon','Power Gem','Rock Throw']],coins:3000,items:{sodapop:2}}),
 32:Object.freeze({species:308,name:'요가램',team:[[505,35],[552,35],[678,35]],moves:[['Super Fang','Crunch','Detect','Shadow Ball'],['Crunch','Dig','Sand Tomb','Shadow Claw'],['Disarming Voice','Psybeam','Swift','Reflect']],coins:5000,items:{lemonade:2,'za-exp-candy-m':1}}),
});
export function ardenFollowupReady(s,n){return n===31?s?.zaSide30Won===true&&s.zaSide30RewardPending===false:n===32?s?.zaSide31Won===true&&s.zaSide31RewardPending===false:false;}
