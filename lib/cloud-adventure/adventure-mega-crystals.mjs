import {clearedCrystals} from './adventure-mission20-jobs.mjs';

// Draft pixel coordinates on Zone 9 rooftops, where original guides document
// groups of crystals. Sizes and individual positions have not been surveyed.
// https://game8.jp/pokemon-legends-z-a/730152
// https://www.serebii.net/itemdex/megashard.shtml
export const ZONE9_CRYSTALS=Object.freeze([
 {x:4,y:3,size:'small'},{x:6,y:3,size:'large'},{x:4,y:6,size:'small'},
 {x:6,y:6,size:'large'},{x:4,y:8,size:'small'},{x:6,y:8,size:'large'},
 {x:15,y:3,size:'small'},{x:17,y:3,size:'large'},{x:19,y:3,size:'small'},
 {x:15,y:6,size:'large'},{x:17,y:6,size:'small'},{x:19,y:6,size:'large'},
]);
export const CRYSTAL_RESPAWN_MS=600000;
export function crystalFieldsUnlocked(s){return s?.zaRooftopCrystalCleared===true||s?.zaShardExchangeUnlocked===true;}
export function zone9CrystalAt(s,spot){return s?.district==='lumiose-zone9'&&!s.interior&&s.zaZone9Upper===true&&crystalFieldsUnlocked(s)&&spot?.tile==='*'?ZONE9_CRYSTALS.find(c=>c.x===spot.x&&c.y===spot.y)||null:null;}
export function crystalResearchCount(s){const repeats=s?.zaResearchCrystalBreaks,n=Number.isSafeInteger(repeats)&&repeats>=0?Math.min(1000,repeats):0;return Math.min(1000,n+clearedCrystals(s).length+(s?.zaRooftopCrystalCleared===true?1:0));}
export function crystalResearchProgress(s){const count=crystalResearchCount(s),thresholds=[20,50,100,150,200,250,300,400,500,1000],complete=thresholds.filter(x=>count>=x).length;return {count,points:100*complete,next:thresholds[complete]??null};}
