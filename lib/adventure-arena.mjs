// PC-only progression is intentionally namespaced until the cloud branch is compared.
export const CITY_RANKS=Array.from('ZYXWVUTSRQPONMLKJIHGFEDCBA');
export const ARENA_BONUSES={steady:{label:'기절 없이 승리',reward:300},careful:{label:'가방 도구 없이 승리',reward:200}};
const opponents=[25,54,37,133,63,92,66,58,79,81,96,103,111,114,123,128,130,131,142,149,143,65,94,248,445,149,6,9];
const contenders=[
 {name:'준',sprite:'youngster',style:'balanced'},{name:'하나',sprite:'lass',style:'speed'},
 {name:'도윤',sprite:'fisherman',style:'defense'},{name:'서아',sprite:'beauty',style:'status'},
 {name:'강산',sprite:'hiker',style:'defense'},{name:'유리',sprite:'swimmer',style:'speed'},
 {name:'민호',sprite:'scientist',style:'setup'},{name:'수빈',sprite:'pokemonranger',style:'balanced'},
 {name:'태오',sprite:'blackbelt',style:'pressure'},{name:'나린',sprite:'psychic',style:'status'},
 {name:'서준',sprite:'birdkeeper',style:'speed'},{name:'은별',sprite:'acetrainer',style:'balanced'},
 {name:'재하',sprite:'worker',style:'pressure'},{name:'세라',sprite:'veteran',style:'defense'},
 {name:'시온',sprite:'gentleman',style:'champion'},
];
export function arenaProgress(world){
 const raw=world.pcCityArena||{},rank=Math.max(0,Math.min(CITY_RANKS.length-1,Number.isInteger(raw.rank)?raw.rank:0)),points=Math.max(0,Math.min(2,Number.isInteger(raw.points)?raw.points:0));
 return {rank,points,wins:Math.max(0,Number.isInteger(raw.wins)?raw.wins:0),complete:rank===CITY_RANKS.length-1};
}
export function arenaTrainer(world){
 const p=arenaProgress(world);if(p.complete)return null;
 const promotion=p.points>=2,level=Math.min(96,22+p.rank*2+(promotion?3:0)),offset=promotion?0:p.points,first=opponents[p.rank+offset],second=opponents[p.rank+offset+1],third=opponents[p.rank+3],person=contenders[(p.rank*3+(promotion?2:p.points))%contenders.length];
 return {id:promotion?'pc-city-promotion':'pc-city-points',name:person.name,title:promotion?`${CITY_RANKS[p.rank]} → ${CITY_RANKS[p.rank+1]} 승급전`:`${CITY_RANKS[p.rank]} 랭크 포인트전`,sprite:`/game/trainers/${person.sprite}.png`,team:promotion?[[first,level],[second,Math.min(100,level+1)],[third,Math.min(100,level+2)]]:[[first,level],[second,Math.min(100,level+1)]],strategy:person.style};
}
export function awardArenaWin(world,trainerId){
 const p=arenaProgress(world),expected=arenaTrainer(world);if(!expected||expected.id!==trainerId)return false;
 world.pcCityArena={rank:p.rank+(trainerId==='pc-city-promotion'?1:0),points:trainerId==='pc-city-promotion'?0:Math.min(2,p.points+1),wins:p.wins+1};return true;
}
