// Locations are approximate coordinates on the existing 2D streets.
// https://www.serebii.net/legendsz-a/sidemissions/atunethatbeckonsdoom.shtml
// https://www.serebii.net/legendsz-a/sidemissions/myadorable%2Cadorablebabies.shtml
export const LATE_BATTLES=Object.freeze({
 110:Object.freeze({district:'lumiose-rouge-sector8',x:17,y:7,tile:',',name:'Chante',team:[[359,67],[334,67],[94,68]],moves:[['Perish Song','X-Scissor','Stone Edge','Night Slash'],['Perish Song','Dragon Rush','Moonblast','Brave Bird'],['Perish Song','Phantom Force','Dark Pulse','Sludge Wave']],prize:4896,reward:3400,items:[['kasibberry',5],['za-exp-candy-m',5]]}),
 111:Object.freeze({district:'lumiose-vert-sector4',x:6,y:10,tile:';',name:'Aimée',team:[[173,68],[406,68],[172,68],[447,68]],moves:[['Light Screen','Moonblast','Ice Beam','Flamethrower'],['Sludge Bomb','Shadow Ball','Energy Ball','Dazzling Gleam'],['Wild Charge','Iron Tail','Play Rough','Brick Break'],['Earthquake','Ice Punch','Bullet Punch','Poison Jab']],prize:4352,reward:20000,items:[['moomoomilk',12]]}),
});
export function lateBattleAvailable(s,n){return [1,2,3].includes(s?.[`zaSide${n}Stage`])||s?.zaMission37Complete===true||s?.zaMission38Started===true||s?.zaMission38Complete===true||s?.zaMission39Started===true;}
export function lateBattleSpot(s,p,n){const t=LATE_BATTLES[n];return !!t&&s?.district===t.district&&!s.interior&&p?.tile===t.tile&&p.x===t.x&&p.y===t.y;}
export function lateBattleAt(s,p){const n=s?.district==='lumiose-rouge-sector8'?110:s?.district==='lumiose-vert-sector4'?111:0;return n&&lateBattleSpot(s,p,n)&&lateBattleAvailable(s,n)?n:0;}
