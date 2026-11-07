// Persisted values use Showdown type names, shared by both battle engines.
export const TERA_TYPES=['Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy','Stellar'];
export const TERA_LABELS=['노말','불꽃','물','전기','풀','얼음','격투','독','땅','비행','에스퍼','벌레','바위','고스트','드래곤','악','강철','페어리','스텔라'];
export function fixedTeraType(speciesId){return Number(speciesId)===1024?'Stellar':Number(speciesId)===1017?'Grass':null;}
export function initialTeraType(speciesId,randomValue){return fixedTeraType(speciesId)||TERA_TYPES[(randomValue>>>0)%TERA_TYPES.length];}

export function stableTeraType(mon){
 const source=Number(mon?.rogueSourceId||mon?.speciesId||mon?.id),fixed=fixedTeraType(source);if(fixed)return fixed;
 if(mon?.teraType)return mon.teraType;
 let seed=Number.isInteger(mon?.personality)?mon.personality:Number.isInteger(mon?.encryptionConstant)?mon.encryptionConstant:null;
 if(seed===null){seed=2166136261;for(const c of String(mon?.boxId||`${source}`)){seed=Math.imul(seed^c.charCodeAt(0),16777619);}}
 return initialTeraType(source,seed);
}
