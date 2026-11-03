// Source rules: pokerogue 7c088125 (egg.ts, rates.ts, egg-gacha-ui-handler.ts),
// species data is the repository's pinned 1.12.2.3 reference. Variant
// availability keys come from the pinned assets masterlist (see metadata).
import variants from '../data/rogue-variant-keys.json' with {type:'json'};
import {Dex} from '@pkmn/sim';
import {species} from './game.mjs';
import {rules} from './pokemon-config.mjs';
import {rogueFormArt} from './rogue-form-art.mjs';
import {rogueSpecies,makeReferenceMon} from './rogue-reference.mjs';
import {rogueSeededRandom} from './rogue-seeded-rng.mjs';
import {ensureClassicState} from './rogue-classic-state.mjs';
import {CLASSIC_GACHA_VOUCHERS,CLASSIC_GACHA_HATCH_WAVES,classicGachaTiers,classicEggSpeciesWeight,classicGachaEggMoveIndex} from './rogue-egg-gacha-rules.mjs';
const availableVariants=new Set(variants.keys),records=[...rogueSpecies.values()].filter(p=>p.isStarter&&Number.isInteger(p.eggTier));
const random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
const randomUnit=rng=>{const n=rng();if(!(n>=0&&n<1))throw Error('알 뽑기 난수를 확인하세요.');return n;};
const randomIndex=(rng,count)=>{if(count<1)throw Error('알 후보를 확인하세요.');return Math.floor(randomUnit(rng)*count);};
const checkCounts=value=>{if(!value||typeof value!=='object'||['regular','plus','premium','golden'].some(k=>value[k]!==undefined&&(!Number.isSafeInteger(value[k])||value[k]<0)))throw Error('알 바우처 저장을 확인하세요.');return {regular:0,plus:0,premium:0,golden:0,...value};};
export function classicLegendaryFocus(timestamp=Date.now()){
 if(!Number.isFinite(timestamp)||timestamp<0)throw Error('알 뽑기 시간을 확인하세요.');
 const pool=records.filter(p=>p.eggTier===3&&p.sourceId!==890).map(p=>p.sourceId);if(!pool.length)throw Error('전설 알 후보가 없습니다.');
 const day=Math.floor(timestamp/86400000),offset=Math.floor(day/pool.length),seed=[...'1073741824'].map(c=>String.fromCharCode(c.charCodeAt(0)+offset)).join(''),rng=rogueSeededRandom(seed);
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}return pool[day%pool.length];
}
function selectSpecies(tier,variant,system,eggs,unlockPity,rng){
 let pool=records.filter(p=>p.eggTier===tier&&![489,490,890].includes(p.sourceId));
 if(unlockPity[tier]>=9){const locked=pool.filter(p=>!system.dex?.[p.sourceId]?.caught&&!eggs.some(e=>e.pokemon?.rogueSourceId===p.sourceId));if(locked.length)pool=locked;}
 if(variant>0)pool=pool.filter(p=>availableVariants.has(String(p.sourceId)));
 if(!pool.length)throw Error('해당 알의 후보를 확인할 수 없습니다.');
 const weights=pool.map(p=>classicEggSpeciesWeight(tier,p.starterCost)),total=weights.reduce((a,b)=>a+b,0);let roll=randomIndex(rng,total),selected=pool.at(-1);for(let i=0;i<pool.length;i++){roll-=weights[i];if(roll<0){selected=pool[i];break;}}
 const seen=!!system.dex?.[selected.sourceId]?.caught||eggs.some(e=>e.pokemon?.rogueSourceId===selected.sourceId);unlockPity[tier]=seen?Math.min(10,unlockPity[tier]+1):0;return selected;
}
// Source: battle-scene.ts getSpeciesFormIndex at 7c088125. Only species that
// can occur in this repository's pinned egg-tier starter data are listed.
export function classicEggFormIndex(record,rng=Math.random,gender='N'){
 const id=record.sourceId,length=record.formList.length;if(!length)return 0;if(id===876)return gender==='F'?1:0;
 if([201,422,479,550,585,664,669,676,710,741,893,931,999,412,8128].includes(id))return randomIndex(rng,length);
 if([854,1012].includes(id))return randomIndex(rng,16)===0?1:0;
 if(id===172)return randomIndex(rng,8)===0?1:0;
 if([133,801].includes(id))return randomIndex(rng,2);
 if(id===978)return randomIndex(rng,3);
 if(id===718)return randomIndex(rng,4);
 if(id===774)return randomIndex(rng,7);
 return 0;
}
export function classicEggFormPatch(record,index,shiny){
 const form=record.formList.find(f=>f.formIndex===index);if(!form)return {};const target=species.find(p=>p.id===form.pokemonId);if(!target)throw Error('알의 포켓몬 모습을 확인할 수 없습니다.');
 const native=Dex.species.get(form.nativeSpecies||rules.species[target.id]?.key||'');return {id:target.id,artId:target.artId,name:form.formName?record.name+' · '+form.formName:record.name,baseName:record.name,speciesId:target.speciesId,formId:target.formId,identifier:target.identifier,formName:form.formName||'',rogueFormIndex:index,rogueFormKey:form.formKey||'',rogueBaseStats:{...(form.baseStats||record.baseStats)},rogueTypes:[...(form.types||record.types)],types:[...(form.types||record.types)],type:(form.types||record.types)[0],rogueBattleSpecies:form.nativeSpecies||null,rogueSpriteKey:form.spriteKey||null,battleAppearance:native.exists?native.id:null,battleArtId:target.artId,battleSprite:native.exists?native.spriteid:null,...rogueFormArt(form,shiny)};
}
export function pullClassicGacha(document,{mode,voucherKey},rng=random,now=Date.now()){
 if(!['move','legendary','shiny'].includes(mode)||!Object.hasOwn(CLASSIC_GACHA_VOUCHERS,voucherKey))throw Error('알 뽑기 종류를 확인하세요.');
 const state=ensureClassicState(document),system=state.system,option=CLASSIC_GACHA_VOUCHERS[voucherKey],type=voucherKey==='regular10'?'regular':voucherKey,counts=checkCounts(system.voucherCounts||{}),eggs=structuredClone(system.eggs||[]);
 if(eggs.length+option.pulls>99)throw Error('알은 99개까지 보관할 수 있습니다.');if(counts[type]<option.cost)throw Error('알 바우처가 부족합니다.');
 const adminCount=system.adminVoucherCounts?.[type]??0;if(!Number.isSafeInteger(adminCount)||adminCount<0||adminCount>counts[type])throw Error('관리자 바우처 기록을 확인하세요.');const spentAdmin=Math.max(0,option.cost-(counts[type]-adminCount));
 const pity=system.eggPity||[0,0,0,0],unlockPity=[...(system.unlockPity||[0,0,0,0])];if(unlockPity.length!==4||unlockPity.some(n=>!Number.isSafeInteger(n)||n<0))throw Error('알 누적 기록을 확인하세요.');
 const drawn=classicGachaTiers({mode,pulls:option.pulls,pity,rng}),added=[];
 for(const tier of drawn.tiers){
  const rawId=randomIndex(rng,1073741824)+1073741824*tier,manaphy=tier===0&&rawId%204===0,shiny=randomIndex(rng,mode==='shiny'?64:128)===0;
  let variant=shiny?(()=>{const n=randomIndex(rng,10);return n>=4?0:n>=1?1:2;})():0,selected;
  if(manaphy){selected=rogueSpecies.get(randomIndex(rng,8)===1?490:489);if(variant&&!availableVariants.has(String(selected.sourceId)))variant=0;}
  else if(tier===3&&mode==='legendary'&&randomIndex(rng,2)===0){selected=rogueSpecies.get(classicLegendaryFocus(now));if(variant&&!availableVariants.has(String(selected.sourceId)))variant=0;}
  else selected=selectSpecies(tier,variant,system,eggs,unlockPity,rng);
  if(!selected)throw Error('알의 포켓몬을 확인할 수 없습니다.');
  const gender=selected.malePercent==null?'N':randomUnit(rng)*100<=selected.malePercent?'M':'F';const formIndex=classicEggFormIndex(selected,rng,gender),form=selected.formList.find(f=>f.formIndex===formIndex),abilities=form?.abilities?.length?form.abilities:selected.abilities;const hidden=abilities.find(a=>a.slot==='hidden'),ordinary=abilities.filter(a=>a.slot!=='hidden'),ability=hidden&&randomIndex(rng,192)===0?hidden:ordinary[randomIndex(rng,ordinary.length)],firstId=randomIndex(rng,4294967296),secondId=randomIndex(rng,4294967295),ivs=Object.fromEntries(['hp','atk','def','spa','spd','spe'].map((key,i)=>[key,Math.max((firstId>>>(25-i*5))&31,(secondId>>>(25-i*5))&31)]));
  const pokemon=makeReferenceMon(selected.sourceId,1,{...classicEggFormPatch(selected,formIndex,shiny),boxId:crypto.randomUUID(),origin:'egg',ivs,nature:Dex.natures.all()[randomIndex(rng,25)].id,ability:ability.key,rogueAbilitySlot:ability.slot,gender,shiny,variant});
  const tierForMove=manaphy?2:tier,egg={id:crypto.randomUUID(),productId:['common','rare','epic','legendary'][tier],paidPrice:0,purchasedAt:now,source:'gacha',adminGranted:spentAdmin>0,mode,tier,manaphy,hatchWaves:CLASSIC_GACHA_HATCH_WAVES[tier],pokemon,eggMoveIndex:classicGachaEggMoveIndex(tierForMove,mode,rng)};eggs.push(egg);added.push({id:egg.id,tier,manaphy});
 }
 counts[type]-=option.cost;if(spentAdmin)system.adminVoucherCounts[type]-=spentAdmin;system.voucherCounts=counts;system.eggPity=drawn.pity;system.unlockPity=unlockPity;system.eggs=eggs;return {eggs:added,voucherType:type,pulls:option.pulls};
}
