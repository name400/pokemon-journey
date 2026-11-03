import {Dex} from '@pkmn/sim';
import {species} from './game.mjs';
import {configure,rules} from './pokemon-config.mjs';
const byId=new Map(species.map(mon=>[mon.id,mon]));
// Source getSpeciesFormIndex, PokéRogue beta 7c088125; other species keep base form.
export function classicEggFormIndex(record,random,gender='N'){
 const id=record.sourceId,length=record.formList.length;if(!length)return 0;
 const pick=n=>Math.floor(random()*n);
 if(id===876)return gender==='F'?1:0;
 if([201,422,479,550,585,664,669,676,710,741,893,931,999,412,8128].includes(id))return pick(length);
 if([854,1012].includes(id))return pick(16)===0?1:0;
 if(id===172)return pick(8)===0?1:0;
 if([133,801].includes(id))return pick(2);
 if(id===978)return pick(3);
 if(id===718)return pick(4);
 if(id===774)return pick(7);
 return 0;
}
export function applyClassicEggForm(mon,record,random){
 const index=classicEggFormIndex(record,random,mon.gender),form=record.formList.find(f=>f.formIndex===index);if(!form||index===0)return mon;
 const target=byId.get(form.pokemonId);if(!target)return mon;
 const ability=(form.abilities||[]).find(a=>a.slot===mon.rogueAbilitySlot)||(form.abilities||[]).find(a=>a.slot==='primary');
 const native=Dex.species.get(form.nativeSpecies||rules.species[target.id]?.key||'');
 return configure({...mon,id:target.id,artId:target.artId,name:form.formName?`${record.name} · ${form.formName}`:record.name,baseName:record.name,speciesId:target.speciesId,formId:target.formId,identifier:target.identifier,formName:form.formName||'',rogueFormIndex:index,rogueFormKey:form.formKey||'',rogueBaseStats:{...(form.baseStats||record.baseStats)},rogueTypes:[...(form.types||record.types)],types:[...(form.types||record.types)],type:(form.types||record.types)[0],rogueBattleSpecies:form.nativeSpecies||null,rogueSpriteKey:form.spriteKey||null,sourceImage:form.sourceImage||null,sourceBackImage:form.sourceBackImage||null,sourceShinyImage:form.sourceShinyImage||null,sourceShinyBackImage:form.sourceShinyBackImage||null,sourceAppearanceMissing:!!form.sourceAppearanceMissing,battleAppearance:native.exists?native.id:null,battleArtId:target.artId,battleSprite:native.exists?native.spriteid:null,ability:ability?.key||mon.ability,rogueAbilitySlot:ability?.slot||mon.rogueAbilitySlot},{level:mon.level,nature:mon.nature});
}
