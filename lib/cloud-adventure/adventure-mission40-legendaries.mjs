import {makeMon} from '../game.mjs';
import {configure,rules,statKeys} from '../pokemon-config.mjs';

// https://bulbapedia.bulbagarden.net/wiki/List_of_in-game_event_Pok%C3%A9mon_in_Pok%C3%A9mon_Legends:_Z-A
const LEGENDARIES={
  716:['메가혼','문포스','우드혼','지오컨트롤'],
  717:['폭풍','악의파동','사이코키네시스','데스윙'],
};
export function makeMissionLegendary(species,random=Math.random){
 const moves=LEGENDARIES[species];
 if(!moves)throw Error('전설의 포켓몬을 확인하세요.');
 const roll=()=>{const n=random();if(!Number.isFinite(n)||n<0||n>=1)throw Error('포켓몬 생성 난수를 확인하세요.');return n;};
 const ivs=Object.fromEntries(statKeys.map(key=>[key,Math.floor(roll()*32)]));
 const available=[...statKeys];
 for(let i=0;i<3;i++){const index=Math.floor(roll()*available.length);ivs[available.splice(index,1)[0]]=31;}
 const natures=Object.keys(rules.natures),nature=natures[Math.floor(roll()*natures.length)];
 return configure({...makeMon(species,75),ivs,nature,shiny:false,moves:[...moves]});
}
