// Pokemon.generateAbilityIndex and HiddenAbilityRateBoosterModifier in the
// user-provided source: regular selection precedes the independent HA roll.
export function classicWildAbility(abilities,charms,random){
 const regular=abilities.filter((a,i)=>a.slot!=='hidden'&&!abilities.slice(0,i).some(previous=>previous.slot!=='hidden'&&previous.key===a.key));
 const normal=regular.length>1?regular[Math.floor(random()*regular.length)]:regular[0];
 const count=Math.min(4,Math.max(0,Math.floor(charms))),denominator=count?256*2**(-1-count):256;
 const hidden=abilities.find(a=>a.slot==='hidden');
 return hidden&&Math.floor(random()*denominator)===0?hidden:normal||abilities[0];
}
