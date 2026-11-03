/** Server-owned, deterministic game-coin valuations; never accepts prices from a client. */
export function pokemonCoinValue({baseStatTotal,legendary=false,powerForm=false}){
 const bst=Math.max(1,Math.min(1500,Number(baseStatTotal)||200));
 return Math.round((1000+Math.max(0,bst-200)*10+(legendary?10000:0)+(powerForm?1800:0))/50)*50;
}
export function capsulePricing(candidates,weights,focusPremium=1){
 if(!candidates.length||candidates.length!==weights.length||weights.some(w=>!Number.isFinite(w)||w<=0))throw Error('Invalid capsule candidates');
 const total=weights.reduce((a,b)=>a+b,0),average=key=>candidates.reduce((sum,p,i)=>sum+(Number(p[key])||0)*weights[i],0)/total;
 const expectedValue=candidates.reduce((sum,p,i)=>sum+pokemonCoinValue(p)*weights[i],0)/total;
 return {price:Math.ceil(expectedValue*.8*focusPremium/250)*250,averageStats:Math.round(average('baseStatTotal')),legendaryChance:average('legendary')*100,powerFormChance:average('powerForm')*100,expectedValue:Math.round(expectedValue),version:1};
}
