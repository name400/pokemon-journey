import reference from '../data/rogue-dialogue-ko-full-pinned.json' with {type:'json'};
import doubleReference from '../data/rogue-double-dialogue-ko-pinned.json' with {type:'json'};
import index from '../data/rogue-trainer-dialogue-index.json' with {type:'json'};
import world from '../data/rogue-world-reference.json' with {type:'json'};
import {rogueSeededRandom} from './rogue-seeded-rng.mjs';
// Source references are parsed from the supplied TS, not inferred enum names.
// Source license: GNU AGPL version 3; see licenses/pokerogue-locales-NOTICE.md.
export function sourceDialoguePages(message){return String(message||'').split('$').map(page=>page.replace(/@(?:c|d)\{[^}]*\}/g,'').trim()).filter(Boolean);}
export function classicTrainerDialogueSourceStatus(id){
 return Object.hasOwn(index.trainers,id)?'mapped':Object.hasOwn(world.trainerConfigs,id)?'none-in-source':'unknown';
}
export function resolveClassicTrainerDialogueReference(ref){
 if(typeof ref!=='string')return null;
 const [namespace,path]=ref.split(':');
 const root=namespace==='dialogue'?reference:namespace==='doubleBattleDialogue'?doubleReference:null;
 const value=path?.split('.').reduce((object,key)=>object?.[key],root);
 return typeof value==='string'?value:null;
}
export function classicTrainerDialogue(encounter,phase,{seed='',wave=0}={}){
 if(!encounter?.trainer||!['intro','win','loss'].includes(phase)||encounter.kind==='mystery')return null;
 const id=encounter.trainer.id,phaseKey={intro:'encounter',win:'victory',loss:'defeat'}[phase],variants=index.trainers[id];
 if(!variants)return null;
 const female=encounter.trainer.variant===1||encounter.trainer.variant==='female'||encounter.trainer.gender==='F';
 let refs=(female?variants[1]?.[phaseKey]:null)||variants[0]?.[phaseKey];
 if(encounter.doubles){const name=world.trainerConfigs[id]?.sourceCalls.find(call=>call.method==='setHasDouble')?.args?.[0];refs=index.doubles[name]?.[phaseKey]||refs;}
 if(!refs?.length)return null;
 const values=refs.map(ref=>({ref,text:resolveClassicTrainerDialogueReference(ref)}));
 // Missing original text is never replaced by invented or untranslated text.
 if(values.some(value=>value.text===null))return null;
 const shifted=String(seed).split('').map(char=>String.fromCharCode(char.charCodeAt(0)+wave)).join(''),rng=rogueSeededRandom(shifted,{utf16:true});
 const chosen=values[values.length===1?0:Math.floor(rng()*values.length)],pages=sourceDialoguePages(chosen.text);
 return pages.length?{speaker:encounter.trainer.name,pages,phase,sourceKey:chosen.ref.split(':')[1].split('.').slice(0,-1).join('.')} :null;
}
