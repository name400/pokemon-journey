import {Dex} from '@pkmn/sim';
import {species} from './game.mjs';
import {configure,rules} from './pokemon-config.mjs';

// Infer the ability slot from the current species. A hidden ability stays in
// the hidden slot even when the target has fewer ordinary ability slots.
export function adventureEvolutionAbility(mon,targetId){
 const source=Dex.species.get(rules.species[mon.id]?.key||'');
 const target=Dex.species.get(rules.species[targetId]?.key||'');
 const toId=value=>Dex.abilities.get(value||'').id;
 const current=toId(mon.ability),slot=Object.entries(source.abilities||{}).find(([,value])=>toId(value)===current)?.[0];
 const choice=(slot&&target.abilities?.[slot])||Object.values(target.abilities||{}).find(value=>toId(value)===current)||target.abilities?.['0'];
 return choice?toId(choice):rules.species[targetId]?.abilities?.[0]||'';
}

export function evolveAdventurePokemon(mon,targetId,{consumeHeld=false}={}){
 const target=species.find(entry=>entry.id===targetId);if(!target)throw Error('진화할 포켓몬을 확인하세요.');
 // Species data changes, while every other per-Pokémon field is retained.
 const next={...mon,...target,moves:mon.moves,ability:adventureEvolutionAbility(mon,targetId),item:consumeHeld?'':mon.item,
  baseHp:target.hp,baseAtk:target.atk,baseDef:target.def,baseSpa:target.spa,baseSpdDef:target.spdDef,baseSpeed:target.spd};
 for(const key of ['battleAppearance','battleArtId','battleSprite','currentAbility','currentTypes'])delete next[key];
 const result=configure(next,{hp:mon.hp});
 // Evolution changes maximum HP but retains the amount of damage already taken.
 result.hp=mon.hp<=0?0:Math.min(result.maxHp,Math.max(1,mon.hp+result.maxHp-mon.maxHp));
 return result;
}

export function createAdventureShedinja(mon,boxId){
 if(mon.speciesId!==290||typeof boxId!=='string'||!boxId)throw Error('껍질몬 생성 조건을 확인하세요.');
 const child=evolveAdventurePokemon(mon,292);
 Object.assign(child,{boxId,origin:'evolution',gender:'N',ability:'wonderguard',item:'',status:null,originBall:'pokeball',teraType:'Bug',hp:mon.hp>0?1:0,moves:[...mon.moves],pp:{...(mon.pp||{})}});
 for(const key of ['terastallized','dynamaxed','gigantamax','mega','primal','ultra','battleCriticals'])delete child[key];
 return child;
}
