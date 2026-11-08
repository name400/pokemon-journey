import {isAdventureBattleOnlyForm} from './adventure-battle-forms.mjs';
import evolutionRules from '../data/evolution-rules.json' with {type:'json'};
const evolvedSpeciesIds=new Set(evolutionRules.map(r=>r.to));
import {makeMon,species,moves} from './game.mjs';import {configure,levelMoves} from './pokemon-config.mjs';
export const TRAINERS=[
 {id:'brock',name:'웅',title:'회색 체육관',type:'바위',badge:'그레이배지',sprite:'brock-gen3',team:[[74,12],[95,14]],strategy:'defense'},
 {id:'misty',name:'이슬',title:'블루 체육관',type:'물',badge:'블루배지',sprite:'misty-gen3',team:[[120,18],[121,21]],strategy:'pressure'},
 {id:'ltsurge',name:'마티스',title:'오렌지 체육관',type:'전기',badge:'오렌지배지',sprite:'ltsurge-gen3',team:[[100,21],[25,18],[26,24]],strategy:'speed'},
 {id:'erika',name:'민화',title:'무지개 체육관',type:'풀',badge:'레인보우배지',sprite:'erika-gen3',team:[[71,29],[114,24],[45,29]],strategy:'status'},
 {id:'koga',name:'독수',title:'연분홍 체육관',type:'독',badge:'핑크배지',sprite:'koga-gen3',team:[[109,37],[109,37],[89,39],[110,43]],strategy:'status'},
 {id:'sabrina',name:'초련',title:'노랑 체육관',type:'에스퍼',badge:'골드배지',sprite:'sabrina-gen3',team:[[64,38],[122,37],[49,38],[65,43]],strategy:'setup'},
 {id:'blaine',name:'강연',title:'홍련 체육관',type:'불꽃',badge:'크림슨배지',sprite:'blaine-gen3',team:[[58,42],[77,40],[78,42],[59,47]],strategy:'pressure'},
 {id:'giovanni',name:'비주기',title:'상록 체육관',type:'땅',badge:'그린배지',sprite:'giovanni-gen3',team:[[111,45],[51,42],[31,44],[34,45],[111,50]],strategy:'balanced'},
 {id:'lorelei',name:'칸나',title:'사천왕 · 얼음',type:'얼음',sprite:'lorelei-gen3',team:[[87,52],[91,51],[80,52],[124,54],[131,54]],strategy:'defense'},
 {id:'bruno',name:'시바',title:'사천왕 · 격투',type:'격투',sprite:'bruno-gen3',team:[[95,51],[107,53],[106,53],[95,54],[68,56]],strategy:'pressure'},
 {id:'agatha',name:'국화',title:'사천왕 · 고스트',type:'고스트',sprite:'agatha-gen3',team:[[94,54],[42,54],[93,53],[24,56],[94,58]],strategy:'status'},
 {id:'lance',name:'목호',title:'사천왕 · 드래곤',type:'드래곤',sprite:'lance-gen3',team:[[130,56],[148,54],[148,54],[142,58],[149,60]],strategy:'balanced'},
 {id:'blue',name:'그린',title:'챔피언',type:'다양',sprite:'blue-gen3champion',team:[[18,59],[65,57],[112,59],[103,59],[130,61],[6,63]],strategy:'champion'}
];
export const AREAS=[
 {id:0,name:'태초의 초록마을',biome:'meadow',min:3,max:8,description:'연구소에서 받은 첫 파트너와 출발하는 길.'},
 {id:1,name:'회색 산길',biome:'rock',min:7,max:13}, {id:2,name:'블루 물가',biome:'water',min:13,max:20},
 {id:3,name:'오렌지 항구',biome:'electric',min:19,max:25},{id:4,name:'무지개 숲',biome:'forest',min:24,max:31},
 {id:5,name:'연분홍 습지',biome:'poison',min:30,max:40},{id:6,name:'노랑 도시 외곽',biome:'psychic',min:36,max:44},
 {id:7,name:'홍련 화산길',biome:'volcano',min:41,max:49},{id:8,name:'상록 협곡',biome:'ground',min:46,max:54},
 {id:9,name:'석영 리그',biome:'league',min:50,max:60}
];
const layout=['###############','#ggg....gggg..#','#gH..g..gg.G..#','#....g........#','#.gggg..###...#','W.............E','#..###..gggg..#','#....N..gg.M..#','#.ggg.........#','#.............#','###############'];
export function areaMap(id){if(id===9)return ['###############','#.............#','#.H.L.L.L.L.C.#','#.............#','#..ggg...ggg..#','W.............#','#.............#','#.........M...#','#.............#','#.............#','###############'];return layout;}
const biomeTypes={meadow:['노말','벌레','풀'],rock:['바위','땅','격투'],water:['물','비행'],electric:['전기','노말'],forest:['풀','벌레','페어리'],poison:['독','물','벌레'],psychic:['에스퍼','고스트','악'],volcano:['불꽃','바위','강철'],ground:['땅','드래곤','바위']};
export function encounterPool(area){const a=AREAS[area]||AREAS[0],types=biomeTypes[a.biome]||['드래곤','강철'];let pool=species.filter(s=>s.defaultForm&&!s.legendary&&!isAdventureBattleOnlyForm(s)&&(area!==0||(!evolvedSpeciesIds.has(s.speciesId)&&!s.formName&&s.generation<=3&&s.hp+s.atk+s.def+s.spd<=240))&&s.types.some(t=>types.includes(t))&&(area>3||s.hp+s.atk+s.def+s.spd<300));return pool.length?pool:species.filter(s=>s.defaultForm&&!s.legendary&&!isAdventureBattleOnlyForm(s));}
export function trainerTeam(trainer,levelOverride){return trainer.team.map(([id,level],i)=>{let p=makeMon(id,Math.min(100,levelOverride??level));const legal=levelMoves(p,p.level);const attacking=legal.filter(m=>moves[m]?.power>0).sort((a,b)=>moves[b].power-moves[a].power);const status=legal.filter(m=>moves[m]?.power===0);p.moves=[...new Set([...attacking.slice(0,3),...status.slice(-1)])].slice(0,4);if(!p.moves.length)p.moves=['몸부림'];p.boxId=`npc-${trainer.id}-${i}`;if(p.level>30)p.item=i===trainer.team.length-1?'sitrusberry':'';p.nature=trainer.strategy==='speed'?'timid':trainer.strategy==='defense'?'bold':'hardy';return configure(p);});}
export function currentObjective(state){const badges=state.badges||[];if(badges.length<8)return `${TRAINERS[badges.length].name}에게 도전해 ${TRAINERS[badges.length].badge}을 얻으세요.`;if((state.league||0)<5)return `석영 리그: ${TRAINERS[8+(state.league||0)].name}에게 도전하세요.`;return '챔피언 등극! 포켓몬 도감과 새로운 파티를 완성해 보세요.';}
