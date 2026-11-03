/** Independent mathematical implementation of the pinned boss-shield rules. */
export function classicBossSegments(wave,level,baseTotal,{boss=false,legendary=false}={}){return boss||legendary||wave%10===0?2+Number(level>=100)+Number(baseTotal>=670)+Math.floor(wave/250):0;}
export function classicBossIndex(hp,maxHp,segments){if(segments<2)return 0;for(let index=segments-1;index>0;index--)if(hp>Math.round(maxHp/segments*index))return index;return 0;}
export function classicBossDamage(damage,hp,maxHp,segments,{minimumIndex=0,index=classicBossIndex(hp,maxHp,segments)}={}){
 if(segments<2||index<=0)return {damage,cleared:index};
 const size=maxHp/segments,boundary=size*index,remaining=hp-Math.round(boundary),over=damage-remaining;
 if(over<0)return {damage,cleared:index+1};if(over===0)return {damage,cleared:index};
 const bypass=Math.min(Math.max(0,Math.floor(Math.log2(over/size))),Math.max(0,index-minimumIndex));
 return {damage:Math.max(1,Math.floor(hp-boundary+size*bypass)),cleared:index-bypass};
}
export function classicBossBoosts(segments,oldIndex,cleared,stats,stages,rng=Math.random){const boosts={};let index=oldIndex;
 while(index>0&&cleared-1<index){index--;const eligible=['atk','def','spa','spd','spe'].filter(key=>(stages[key]||0)+(boosts[key]||0)<6);if(!eligible.length)continue;const total=eligible.reduce((n,key)=>n+stats[key],0);let roll=rng()*total,key=eligible.at(-1);for(const candidate of eligible){roll-=stats[candidate];if(roll<0){key=candidate;break;}}
  const gain=1+Number(segments>=3&&index===0||segments>=5&&index===1);boosts[key]=Math.min(6-(stages[key]||0),(boosts[key]||0)+gain);
 }
 return {boosts,index};
}
