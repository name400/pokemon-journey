// Prices in Pokémon Legends: Z-A. Existing inventory quantities need no migration.
// https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Legends:_Z-A/Part_3
// https://bulbapedia.bulbagarden.net/wiki/Full_Heal
export const ADVENTURE_MEDICINES=Object.freeze([
 Object.freeze({id:'revive',name:'기력의조각',price:800,description:'기절한 포켓몬의 HP 절반 회복',category:'medicine',sprite:'revive'}),
 Object.freeze({id:'fullheal',name:'만병통치약',price:200,description:'상태이상 회복',category:'medicine',sprite:'full-heal'}),
]);
export function adventureMedicine(id){return ADVENTURE_MEDICINES.find(item=>item.id===id)||null;}
