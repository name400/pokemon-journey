import {makeMon} from '../game.mjs';
import {moveNameByKey} from '../pokemon-config.mjs';

// The leading partner for each mission 37 encounter; simultaneous story
// characters beyond the single companion side are not represented here.
// https://bulbapedia.bulbagarden.net/wiki/Ivor
// https://bulbapedia.bulbagarden.net/wiki/Canari
// https://bulbapedia.bulbagarden.net/wiki/Lebanne
// https://bulbapedia.bulbagarden.net/wiki/Corbeau
// https://bulbapedia.bulbagarden.net/wiki/Griselle
const TEAMS={
 2:{name:'Ivor',mons:[
  [870,60,'N','falinksite',['megahorn','ironhead','zenheadbutt','bulkup']],
  [214,58,'M','',['megahorn','rockblast','pinmissile','aerialace']],
  [308,59,'M','',['zenheadbutt','psybeam','bulletpunch','firepunch']],
  [68,59,'M','',['bulldoze','knockoff','bulletpunch','brutalswing']],
 ]},
 3:{name:'Canari',mons:[
  [604,60,'F','eelektrossite',['zapcannon','liquidation','crunch','thunderbolt']],
  [695,58,'F','',['thunderbolt','breakingswipe','swift','thunder']],
  [181,59,'F','',['zapcannon','powergem','thunder','focusblast']],
  [618,59,'F','',['sludgewave','thunderbolt','earthquake','discharge']],
 ]},
 4:{name:'Lebanne',mons:[
  [691,59,'F','dragalgite',['hydropump','sludgewave','dragonpulse','mudshot']],
  [715,58,'F','',['boomburst','airslash','dragonpulse','leechlife']],
  [697,58,'F','',['earthquake','gigaimpact','breakingswipe','crunch']],
  [445,58,'F','',['earthquake','ironhead','dragonclaw','crunch']],
 ]},
 5:{name:'Corbeau',mons:[
  [545,60,'M','scolipite',['megahorn','irontail','xscissor','poisonjab']],
  [24,58,'M','',['gunkshot','poisonjab','brutalswing','leechlife']],
  [130,59,'M','',['crunch','waterfall','dragonrush','bounce']],
  [407,59,'M','',['gigadrain','pinmissile','magicalleaf','dazzlinggleam']],
 ]},
 6:{name:'Griselle',mons:[
  [668,61,'M','pyroarite',['hypervoice','flamethrower','earthpower','hyperbeam']],
  [663,59,'F','',['bravebird','flareblitz','steelwing','flamewheel']],
  [323,59,'F','',['rockslide','heatcrash','earthquake','earthpower']],
  [142,60,'F','',['stoneedge','ironhead','crunch','firefang']],
  [376,60,'N','',['bulletpunch','lightscreen','brutalswing','icepunch']],
 ]},
};
export function mission37Companion(stage){
 if(!Object.hasOwn(TEAMS,stage))return null;
 const spec=TEAMS[stage];
 return {name:spec.name,team:spec.mons.map(([species,level,gender,item,moves],index)=>({
  ...makeMon(species,level),boxId:`mission37-ally-${stage}-${index}`,gender,item,
  moves:moves.map(id=>{const name=moveNameByKey[id];if(!name)throw Error(`미지원 동료 기술: ${id}`);return name;}),pp:{},
 }))};
}

// Additional independent trainers on the two three-partner encounters.
// These rosters are kept separate for a future three-active battle format;
// existing two-active battle snapshots and their ownership remain unchanged.
// https://bulbapedia.bulbagarden.net/wiki/Gwynn
// https://bulbapedia.bulbagarden.net/wiki/Grisham
const SECOND_PARTNER_TEAMS={
 2:{name:'Gwynn',mons:[
  [609,59,'F','chandelurite',['shadowball','flamethrower','psychic','darkpulse']],
  [354,57,'F','',['gunkshot','phantomforce','shadowclaw','knockoff']],
  [10030,58,'F','',['powerwhip','phantomforce','mysticalfire','moonblast']],
  [94,58,'F','',['sludgewave','shadowball','darkpulse','icywind']],
 ]},
 6:{name:'Grisham',mons:[
  [6,63,'M','charizarditex',['airslash','fireblast','dragonrush','firefang']],
  [675,61,'M','',['nightslash','bulletpunch','outrage','brickbreak']],
  [687,61,'M','',['psyshock','nightslash','psychocut','slash']],
  [668,61,'F','',['hypervoice','overheat','earthpower','snarl']],
  [248,62,'M','',['earthquake','stoneedge','crunch','heavyslam']],
  [373,62,'M','',['aerialace','earthquake','firefang','dracometeor']],
 ]},
};
export function mission37CompanionGroups(stage){
 const first=mission37Companion(stage);if(!first)return [];
 const spec=SECOND_PARTNER_TEAMS[stage];if(!spec)return [first];
 const team=spec.mons.map(([species,level,gender,item,moves],index)=>({
  ...makeMon(species,level),boxId:`mission37-second-ally-${stage}-${index}`,gender,item,
  moves:moves.map(id=>{const name=moveNameByKey[id];if(!name)throw Error(`미지원 동료 기술: ${id}`);return name;}),pp:{},
 }));
 return [first,{name:spec.name,team}];
}

// The simulator has one companion side with a six-Pokémon limit. Lida and
// Naveen therefore share a representative roster; this is not two trainers.
// https://www.serebii.net/pokearth/lumiosecity/centricoplaza.shtml
export function mission36Partners(){
 const mons=[
  [121,59,'N','starminite','mission36-lida',['psychic','reflect','powergem','hydropump']],
  [560,59,'M','scraftinite','mission36-naveen',['dynamicpunch','stoneedge','irontail','crunch']],
  [693,58,'F','','mission36-lida-1',['hydropump','darkpulse','aurasphere','icebeam']],
  [168,58,'M','','mission36-naveen-1',['megahorn','poisonjab','shadowsneak','dig']],
  [584,58,'F','','mission36-lida-2',['freezedry','flashcannon','icywind','icebeam']],
  [302,58,'M','','mission36-naveen-2',['zenheadbutt','shadowclaw','powergem','nightslash']],
 ];
 return mons.map(([species,level,gender,item,boxId,moves])=>({
  ...makeMon(species,level),boxId,gender,item,
  moves:moves.map(id=>{const name=moveNameByKey[id];if(!name)throw Error(`미지원 동료 기술: ${id}`);return name;}),pp:{},
 }));
}
