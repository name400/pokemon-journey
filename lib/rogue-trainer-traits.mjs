// PokéRogue beta 7c088125: trainer generation uses ordinary ability slots,
// a 1/256 hidden-ability roll, wave-scaled IVs and wave-scaled friendship.
// The caller supplies the persisted Classic RNG; its sequence is not upstream's.
export function classicTrainerAbility(abilities, random) {
 const regular=abilities.filter(a=>a.slot!=='hidden');
 const normal=regular.length>1?regular[Math.floor(random()*regular.length)]:regular[0];
 const hidden=abilities.find(a=>a.slot==='hidden');
 return hidden&&Math.floor(random()*256)===0?hidden:normal||abilities[0];
}
export function classicTrainerIvs(wave, random) {
 const minimum=Math.min(31,Math.max(0,Math.floor(wave/10)));
 return Object.fromEntries(['hp','atk','def','spa','spd','spe'].map(stat=>[stat,minimum+Math.floor(random()*(32-minimum))]));
}
export function classicTrainerFriendship(wave) {
 return Math.min(255,Math.max(50,Math.round(255*wave/145)));
}
