// Training Session source facts pinned to PokeRogue 7c088125. These helpers
// do not activate the encounter or mutate an existing player/account record.
const STATS=['hp','atk','def','spa','spd','spe'];
export function classicTrainingEligible(run,mon){
 const actual=Array.isArray(run?.party)?run.party.find(p=>p.boxId===mon?.boxId):null;
 return !!actual&&Number.isFinite(actual.hp)&&actual.hp>0&&!actual.fusionSpecies&&!run.challenges?.length&&run.party.filter(p=>p.hp>0).length>=2;
}
export function classicTrainingSegments(wave,mode){
 if(!Number.isInteger(wave)||wave<10||wave>180||!['iv','nature','ability'].includes(mode))throw Error('훈련 조건을 확인하세요.');
 return Math.min(2+Math.floor(wave/({iv:50,nature:40,ability:30})[mode]),mode==='iv'?5:6);
}
export function classicTrainingIvResult(ivs,random){
 if(typeof random!=='function'||!ivs||STATS.some(k=>!Number.isInteger(ivs[k])||ivs[k]<0||ivs[k]>31))throw Error('훈련 개체값을 확인하세요.');
 const result={...ivs},candidates=STATS.filter(k=>ivs[k]<31),changes=[];
 while(candidates.length&&changes.length<2){
  for(let i=candidates.length-1;i>0;i--){const value=random();if(!Number.isFinite(value)||value<0||value>=1)throw Error('훈련 난수를 확인하세요.');const j=Math.floor(value*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
  const stat=candidates.pop(),before=ivs[stat],increase=(before===1?1:0)+(before<=10?10:before<=20?5:3),after=Math.min(31,before+increase);
  result[stat]=after;changes.push({stat,before,after});
 }
 return {ivs:result,changes};
}
