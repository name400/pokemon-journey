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

// Hotel Z rooftops contain renewable crystals; exact 2D locations are drafts.
export const HOTEL_ROOF_CRYSTALS=Object.freeze([{x:5,y:5,size:'small'},{x:8,y:5,size:'large'}]);
export function hotelRoofCrystalAt(s,spot){return s?.district==='lumiose-rooftop'&&!s.interior&&s.zaRooftopCrystalCleared===true&&spot?.tile==='*'?HOTEL_ROOF_CRYSTALS.find(c=>c.x===spot.x&&c.y===spot.y)||null:null;}

// Server time only; unknown versions or corrupt timestamps must not be overwritten.
export function knownCrystalLedger(times){return times==null||(typeof times==='object'&&!Array.isArray(times)&&!Object.hasOwn(times,'version')&&!Object.hasOwn(times,'v'));}
export function crystalRespawnStatus(times,crystal,now=Date.now()){
 if(!knownCrystalLedger(times))return {state:'unknown'};
 const last=times?.[`${crystal.x},${crystal.y}`];
 if(last===undefined)return {state:'ready'};
 if(!Number.isSafeInteger(last)||last<0||!Number.isSafeInteger(now)||now<0)return {state:'unknown'};
 const remaining=CRYSTAL_RESPAWN_MS-(now-last);
 return remaining>0?{state:'waiting',seconds:Math.ceil(remaining/1000)}:{state:'ready'};
}
export function crystalFieldDialogue(name,action,times,crystal,now=Date.now()){
 const status=crystalRespawnStatus(times,crystal,now);
 if(status.state==='unknown')return {name,text:'결정 재생 기록을 확인할 수 없습니다.'};
 if(status.state==='waiting')return {name,text:`결정이 다시 생기기까지 약 ${status.seconds}초 남았다.`};
 return {name,text:'공격 기술로 메가결정을 부술 수 있다.',action,label:'결정 부수기'};
}
