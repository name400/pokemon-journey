import {BALLS} from './capture.mjs';
const root='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/';
export const ROGUE_SUPPLIES=[
 {id:'potion',name:'상처약',field:'potions',sprite:'potion',price:100,description:'쓰러지지 않은 포켓몬의 HP를 20 회복'},
 {id:'super',name:'좋은상처약',field:'superPotions',sprite:'super-potion',price:200,description:'쓰러지지 않은 포켓몬의 HP를 60 회복'},
 {id:'hyper',name:'고급상처약',field:'hyperPotions',sprite:'hyper-potion',price:600,description:'쓰러지지 않은 포켓몬의 HP를 120 회복'},
 {id:'max',name:'풀회복약',field:'maxPotions',sprite:'max-potion',price:1200,description:'쓰러지지 않은 포켓몬의 HP를 전부 회복'},
 {id:'fullrestore',name:'회복약',field:'fullRestores',sprite:'full-restore',price:1500,description:'HP와 상태이상을 모두 회복'},
 {id:'antidote',name:'해독제',field:'antidotes',sprite:'antidote',price:80,description:'독·맹독 상태를 치료'},
].map(i=>({...i,image:root+i.sprite+'.png'}));
export {BALLS};
