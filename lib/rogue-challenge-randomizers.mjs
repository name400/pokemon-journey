import pools from '../data/rogue-challenge-randomizer-pools.json' with {type:'json'};
import tmRules from '../data/rogue-trainer-tms.json' with {type:'json'};
import {Dex} from '@pkmn/sim';
import {sourceSpeciesFor,sourceMove,rogueSpecies} from './rogue-reference.mjs';
import {moveNameByKey,rules} from './pokemon-config.mjs';
import {rogueSeededRandom} from './rogue-seeded-rng.mjs';
export const CLASSIC_RANDOMIZER_POOLS=pools;
const nativeMove=name=>Dex.moves.get(rules.moves[name]?.key||name);
const moveRows=new Map(pools.moves.map(row=>[row.id,row]));
const abilityByKey=new Map(pools.abilities.map(row=>[row.key,row]));
const globalTms=Object.keys(tmRules.tiers).map(Number);
export function classicChallengeSeed(seed,offset){return rogueSeededRandom(String(seed).split('').map(c=>String.fromCharCode(c.charCodeAt(0)+offset)).join(''),{utf16:true});}
export function classicIndividualSeed(mon){if(Number.isInteger(mon.personality))return mon.personality>>>0;let n=2166136261;for(const c of String(mon.boxId||mon.id))n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
export function classicRandomizedMoveName(id){const row=moveRows.get(id);return row?moveNameByKey[row.key]||Dex.moves.get(row.key).name:sourceMove(id);}
export function classicChallengeLevelMoves(mon,rows,record=sourceSpeciesFor(mon)){
 if(!mon.rogueMovesetSeed)return rows;
 let root=record;const seen=new Set();while(root&&!root.isStarter&&!seen.has(root.sourceId)){seen.add(root.sourceId);root=rogueSpecies.get(root.preEvolutionId??root.preEvolutionIds?.[0])||root;if(seen.has(root.sourceId))break;}
 return rows.map(([level,id])=>[level,pools.moves[Math.floor(classicChallengeSeed(mon.rogueMovesetSeed,2000*(root?.sourceId||record.sourceId)+id+(record.sourceId===235?level:0))()*pools.moves.length)].id]);
}
export function classicChallengeTMs(mon,ids,sourceId=sourceSpeciesFor(mon)?.sourceId){
 if(!mon.rogueMovesetSeed)return ids;
 const shuffled=[...globalTms],random=classicChallengeSeed(mon.rogueMovesetSeed,500*sourceId);for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}return shuffled.slice(0,new Set(ids).size);
}
const preserved=new Set(['battlebond','disguise','iceface','powerconstruct','schooling','shieldsdown','teraformzero','terashell','terashift','zerotohero']);
export function classicRandomizedAbility(speciesId,key,seed,value,{passive=false,sourceId}={}){
 if(passive&&value<2||!passive&&value>2&&preserved.has(key))return key;
 const originalId=sourceId??abilityByKey.get(key)?.id??Dex.abilities.get(key).num;
 return pools.abilities[Math.floor(classicChallengeSeed(seed,500*speciesId+originalId)()*pools.abilities.length)].key;
}
const fallback={노말:'pound',격투:'rocksmash',비행:'peck',독:'acid',땅:'mudslap',바위:'rockthrow',벌레:'pounce',고스트:'lick',강철:'metalclaw',불꽃:'ember',물:'watergun',풀:'leafage',전기:'thundershock',에스퍼:'confusion',얼음:'powdersnow',드래곤:'twister',악:'pursuit',페어리:'fairywind'};
export function classicRandomizerInitialMoves(mon,{starter=false,mystery=false,final=false}={}){
 if(final)return Array(4).fill(moveNameByKey.metronome||'Metronome');
 const source=sourceSpeciesFor(mon),form=source?.formList.find(f=>f.formIndex===(mon.rogueFormIndex||0)),rows=classicChallengeLevelMoves(mon,[...(source?.levelMoves||[]),...(source?.formLevelMoves?.[form?.formKey||'']||[])]);
 if(mystery){const pool=[...pools.moves],random=classicChallengeSeed(mon.rogueMovesetSeed,classicIndividualSeed(mon));for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.slice(0,4).map(r=>classicRandomizedMoveName(r.id));}
 let names=rows.filter(([level])=>level>=1&&level<=mon.level).map(([,id])=>classicRandomizedMoveName(id)).filter(Boolean);names=[...new Set(names)];names=starter?names.slice(0,3):names.slice(-4);
 if(!names.some(name=>nativeMove(name).category!=='Status')){const key=fallback[(mon.rogueTypes||source.types)[0]]||'tackle',move=moveNameByKey[key]||Dex.moves.get(key).name;if(names.length<4)names.push(move);else names[0]=move;}return names;
}
export function classicRandomizerEvolution(mon,evolution){
 if(mon.rogueMovesetRandomizer!==2)return evolution;
 const next=structuredClone(evolution),conditions=[].concat(next.condition||[]),source=sourceSpeciesFor(mon);
 if(source?.sourceId===236){if(!mon.moves.some(name=>['lowsweep','machpunch','rapidspin'].includes(nativeMove(name).id))){const chosen=[107,106,237][Math.floor(classicChallengeSeed(mon.rogueMovesetSeed,classicIndividualSeed(mon))()*3)];if(next.speciesId===chosen)next.condition=null;}return next;}
 if(conditions.some(c=>c.key===3)){next.condition=conditions.filter(c=>c.key!==3);if(next.level===1)next.level=next.evoLevelThreshold?.[0]??next.evoDelay?.[0]??50;}return next;
}

export function classicRandomizedAbilityValid(mon,form){
 if(![1,2,3].includes(mon.rogueAbilityRandomizer)||typeof mon.rogueRandomizerSeed!=='string'||!mon.rogueRandomizerSeed)return false;
 const species=sourceSpeciesFor(mon),abilities=form?.abilities||species?.abilities||[],base=abilities.find(a=>a.slot===(mon.rogueAbilitySlot||'primary'))||abilities[0];return !!base&&mon.ability===classicRandomizedAbility(species.sourceId,base.key,mon.rogueRandomizerSeed,mon.rogueAbilityRandomizer,{sourceId:base.sourceId});
}
