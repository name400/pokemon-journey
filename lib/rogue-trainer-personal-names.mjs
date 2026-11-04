import names from '../data/rogue-trainers-common-ko-pinned.json' with {type:'json'};
const classKey=value=>String(value).toLowerCase().replace(/_([a-z0-9])/g,(_,char)=>char.toUpperCase());
// Trainer.constructor/getRandomLocaleEntry choose names after party template
// selection. Store the selected locale keys as well as text; never reroll on view.
export function classicTrainerPersonalIdentity(run,config,variant,doubles,random){
 if(run.trainerIdentityRule!=='source-v1')return null;
 const key=classKey(config.enumName),root=names[key];if(!root)return null;
 const effectiveVariant=doubles?2:variant,group=root.male?(effectiveVariant===1?'female':'male'):null;
 const choose=gender=>{
  const pool=gender?root[gender]:root;if(!pool||typeof pool!=='object')return null;
  const keys=Object.keys(pool);if(!keys.length||keys.some(k=>typeof pool[k]!=='string'))return null;
  const selected=keys[Math.floor(random()*keys.length)];return {name:pool[selected],nameKey:`trainersCommon:${key}${gender?'.'+gender:''}.${selected}`};
 };
 const first=choose(group);if(!first)return null;
 if(!doubles)return first;
 if(config.sourceCalls.some(call=>call.method==='setDoubleOnly')){
  const [name,partnerName]=first.name.split(' & ');
  return {...first,name:partnerName?`${name} & ${partnerName}`:name,...(partnerName?{partnerName}:{}),primaryName:name};
 }
 const partner=choose(root.female?'female':null);if(!partner)return first;
 return {...first,name:`${first.name} & ${partner.name}`,primaryName:first.name,partnerName:partner.name,partnerNameKey:partner.nameKey};
}
