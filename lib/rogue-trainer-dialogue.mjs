import reference from '../data/rogue-dialogue-ko-pinned.json' with {type:'json'};
import {rogueSeededRandom} from './rogue-seeded-rng.mjs';
// Exact Korean text from the locales submodule pinned by source 7c088125.
// Source license: GNU AGPL version 3; see licenses/pokerogue-locales-NOTICE.md.
const names={63:'youngster',200:'brock',201:'misty',202:'ltSurge',203:'erika',207:'giovanni',303:'lance',353:'steven',355:'cynthia'};
export function sourceDialoguePages(message){return String(message||'').split('$').map(page=>page.replace(/@(?:c|d)\{[^}]*\}/g,'').trim()).filter(Boolean);}
export function classicTrainerDialogue(encounter,phase,{seed='',wave=0}={}){
 if(!encounter?.trainer||!['intro','win','loss'].includes(phase)||encounter.kind==='mystery')return null;
 const id=encounter.trainer.id,key=encounter.kind==='rival'?(['rival','rival2','rival3','rival4','rival5','rival6'][id-375]):names[id],phaseKey={intro:'encounter',win:'victory',loss:'defeat'}[phase],options=reference[key]?.[phaseKey];
 if(!options)return null;const values=Object.keys(options).sort((a,b)=>Number(a)-Number(b)).map(key=>options[key]);if(!values.length)return null;
 const shifted=String(seed).split('').map(char=>String.fromCharCode(char.charCodeAt(0)+wave)).join(''),rng=rogueSeededRandom(shifted,{utf16:true}),message=values[values.length===1?0:Math.floor(rng()*values.length)],pages=sourceDialoguePages(message);
 return pages.length?{speaker:encounter.trainer.name,pages,phase,sourceKey:`${key}.${phaseKey}`} :null;
}
