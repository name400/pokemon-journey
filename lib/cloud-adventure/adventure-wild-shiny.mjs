// Legends Z-A: base wild shiny chance is 1/4096; the charm adds three rolls.
// https://rotomlabs.net/legends-z-a/shiny-rates
export function wildShinyChance(s){const rolls=Array.isArray(s?.zaResearchItemRewards)&&s.zaResearchItemRewards.includes(50)?4:1;return 1-(4095/4096)**rolls;}
/** @param {string|null} key */
export function assignWildShiny(s,mon,random,key=null){
 if(key!==null){const saved=s.zaWildShinyRolls?.[key];if(typeof saved==='boolean'){mon.shiny=saved;return mon;}}
 mon.shiny=random()<wildShinyChance(s);
 if(key!==null)s.zaWildShinyRolls={...(s.zaWildShinyRolls||{}),[key]:mon.shiny};
 return mon;
}
export function clearWildShiny(s,key){if(!s.zaWildShinyRolls||!Object.hasOwn(s.zaWildShinyRolls,key))return;const next={...s.zaWildShinyRolls};delete next[key];s.zaWildShinyRolls=next;}
