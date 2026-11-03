import rules from '../data/rules.json' with {type:'json'};
import learnsets from '../data/learnsets-modern.json' with {type:'json'};
import movePools from '../data/move-pools.json' with {type:'json'};
export const statKeys=['hp','atk','def','spa','spd','spe'];
export const defaultIVs=()=>Object.fromEntries(statKeys.map(k=>[k,31]));
export const defaultEVs=()=>Object.fromEntries(statKeys.map(k=>[k,0]));
export const moveNameByKey=Object.fromEntries(Object.entries(rules.moves).map(([name,m])=>[m.key,name]));
export function learnableMoves(species,level){const learn=learnsets[species.id]||learnsets[species.artId]||learnsets[species.speciesId]||[];const found=learn.filter(x=>x.level<=level).map(x=>moveNameByKey[x.id.replaceAll('-','')]).filter(Boolean);return [...new Set(found)].length?[...new Set(found)]:['몸부림'];}
export function tutorMoves(mon){return (movePools[mon.id]||[]).map(id=>moveNameByKey[id]).filter(Boolean);}
export function levelMoves(species,level){return learnableMoves(species,level).slice(-4);}
export function calculateStats(mon){const raw=(mon.rogueSourceId&&mon.rogueBaseStats)||rules.species[mon.id]?.baseStats||{hp:mon.baseHp??mon.hp,atk:mon.baseAtk??mon.atk,def:mon.baseDef??mon.def,spa:mon.baseSpa??mon.spa??mon.atk,spd:mon.baseSpdDef??mon.spdDef??mon.def,spe:mon.baseSpeed??mon.spd},base=Object.fromEntries(statKeys.map(key=>{let value=raw[key];for(const delta of mon.rogueJuiceMods||[])value=Math.min(999999,Math.max(1,Math.floor(value+(key==='hp'?delta/2:delta))));return [key,Math.floor(value*(1+.1*(mon.rogueBaseBoosts?.[key]||0)))];}));const ivs=mon.ivs||defaultIVs(),evs=mon.evs||defaultEVs(),nature=rules.natures[mon.nature||'hardy'];const stats={};for(const key of statKeys){let v=Math.floor((2*base[key]+ivs[key]+Math.floor(evs[key]/4))*mon.level/100);const dew=Math.max(0,Math.min(10,Number(mon.rogueNatureDewCount)||0)),multiplier=nature?.plus===key?1.1+.1*dew:nature?.minus===key?.9-.1*dew:1;stats[key]=key==='hp'?v+mon.level+10:Math.max(1,(mon.rogueSourceId&&multiplier>1?Math.ceil:Math.floor)((v+5)*multiplier))}if(mon.speciesId===292||mon.rogueSourceId&&(mon.ability==='wonderguard'||mon.roguePassiveAbility==='wonderguard'))stats.hp=1;return stats;}
export function configure(mon,patch={}){const out={...mon,...patch};out.stats=calculateStats(out);out.maxHp=out.stats.hp;out.hp=Math.min(out.maxHp,Math.max(0,patch.hp??out.maxHp));return out;}
export {rules};

