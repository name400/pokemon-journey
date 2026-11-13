// Legends Z-A: base wild shiny chance is 1/4096; the charm adds three rolls.
// https://rotomlabs.net/legends-z-a/shiny-rates
export function wildShinyChance(s){const rolls=Array.isArray(s?.zaResearchItemRewards)&&s.zaResearchItemRewards.includes(50)?4:1;return 1-(4095/4096)**rolls;}
/** @param {string|null} key */
export function assignWildShiny(s,mon,random,key=null){
 if(key!==null){const saved=s.zaWildShinyRolls?.[key];if(typeof saved==='boolean'){mon.shiny=saved;return mon;}}
 mon.shiny=random()<wildShinyChance(s);
 if(key!==null){
  const rolls={...(s.zaWildShinyRolls||{})};
  if(mon.shiny){
   // Older saves have no reliable spawn chronology. Protect their untracked
   // shinies rather than guessing which one was oldest.
   const order=[...new Set((Array.isArray(s.zaWildShinyOrder)?s.zaWildShinyOrder:[]).filter(k=>typeof k==='string'&&rolls[k]===true))];
   const tracked=new Set(order),hasUntracked=Object.keys(rolls).some(k=>rolls[k]===true&&!tracked.has(k));
   order.push(key);
   if(!hasUntracked)while(order.length>10){const oldest=order.shift();delete rolls[oldest];if(s.zaWildVisibleAlphaLevels)delete s.zaWildVisibleAlphaLevels[oldest];}
   s.zaWildShinyOrder=order;
  }
  rolls[key]=mon.shiny;s.zaWildShinyRolls=rolls;
 }
 return mon;
}
export function clearWildShiny(s,key){if(s.zaWildVisibleAlphaLevels&&Object.hasOwn(s.zaWildVisibleAlphaLevels,key)){const next={...s.zaWildVisibleAlphaLevels};delete next[key];s.zaWildVisibleAlphaLevels=next;}if(!s.zaWildShinyRolls||!Object.hasOwn(s.zaWildShinyRolls,key))return;const next={...s.zaWildShinyRolls};delete next[key];s.zaWildShinyRolls=next;if(Array.isArray(s.zaWildShinyOrder))s.zaWildShinyOrder=s.zaWildShinyOrder.filter(k=>k!==key);}
