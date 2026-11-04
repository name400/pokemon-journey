import classes from '../data/rogue-trainer-classes-ko-pinned.json' with {type:'json'};
// battle-scene.generateNewBattleTrainer draws gender before constructing the
// trainer/party, unless the DOUBLE override already supplies its variant.
export function classicTrainerVariant(run,doubles,kind,random){
 if(run.trainerVariantRule!=='source-v1'||kind!=='trainer')return undefined;
 return doubles?2:Math.floor(random()*2)?1:0;
}
const camel=value=>String(value).trim().replace(/(^|[\s_-]+)([^\s_-])/gu,(_,separator,char)=>separator?char.toUpperCase():char.toLowerCase());
export function classicTrainerPresentation(config,{variant,doubles=false,defaultLabel,sourceKey,appearance}){
 const gender=config.sourceCalls.find(call=>call.method==='setHasGenders');
 const female=variant===1&&!!gender;
 const rawName=female?gender.args[0]:doubles?config.sourceCalls.find(call=>call.method==='setHasDouble')?.args?.[0]:null;
 const classKey=rawName?camel(rawName):female&&sourceKey?sourceKey+'Female':null;
 const label=classes[classKey]||defaultLabel;
 const portrait=female?appearance?.variants?.female||null:doubles?appearance?.variants?.double||appearance:appearance;
 return {label,portrait:portrait||{src:'/game/trainers/fallback.svg'},...(variant===undefined?{}:{variant}),...(gender&&variant!==2&&variant!==undefined?{gender:female?'F':'M'}:{}),...(female&&!portrait?{portraitVariantMissing:true}:{})};
}
