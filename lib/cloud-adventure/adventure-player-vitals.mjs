import {zone8PlayerThreat,zone8PlayerNear} from './adventure-zone8.mjs';
import {zone6PlayerThreat,zone6PlayerNear} from './adventure-zone6.mjs';
import {zone5PlayerThreat,zone5PlayerNear} from './adventure-zone5.mjs';
import {canariLevel} from './adventure-canari.mjs';
// Player health currently supports center visits and provisional alpha roars.
// https://www.serebii.net/legendsz-a/playerhealth.shtml
export const ADVENTURE_PLAYER_BASE_HP=100;
export const ADVENTURE_PLAYER_IMMUNITY_MS=2000; // short immunity: duration is provisional
const validTime=n=>Number.isSafeInteger(n)&&n>=0;
export function playerMaxHp(world){const level=canariLevel(world,'green');return level<0?null:ADVENTURE_PLAYER_BASE_HP+50*level;}
function validVitals(v,maxHp,allowZero=false){
 return Number.isInteger(maxHp)&&!!v&&typeof v==='object'&&!Array.isArray(v)&&v.version===1&&Number.isInteger(v.hp)&&v.hp>=(allowZero?0:1)&&v.hp<=maxHp&&
  (v.lastDamageAt===undefined||validTime(v.lastDamageAt))&&(v.recoveryAt===undefined||validTime(v.recoveryAt))&&
  (v.recoveryRemainder===undefined||Number.isInteger(v.recoveryRemainder)&&v.recoveryRemainder>=0&&v.recoveryRemainder<5000&&v.recoveryAt!==undefined);
}
// Do not reinterpret malformed V1 health as valid merely by raising its cap.
export function canUpgradePlayerHealth(world){const v=world?.zaPlayerVitalsV1;return v?.version!==1||validVitals(v,playerMaxHp(world),true);}
export function playerRecoverySafe(world){return !!world&&!world.combat&&!world.adventureCatchWindow&&!world.unionHost&&!world.inUnion&&!world.expedition&&!(zone5PlayerNear(world)&&zone5PlayerThreat(world)?.id===world.zaZone5AlphaRoarAlertV1&&typeof world.zaZone5AlphaRoarAlertV1==='string')&&!(zone6PlayerNear(world)&&zone6PlayerThreat(world)?.id===world.zaZone6AlphaRoarAlertV1&&typeof world.zaZone6AlphaRoarAlertV1==='string')&&!(zone8PlayerNear(world)&&zone8PlayerThreat(world)?.id===world.zaZone8AlphaRoarAlertV1&&typeof world.zaZone8AlphaRoarAlertV1==='string')&&!(world.district==='lumiose-wild'&&world.zaWildAlphaAlert===true&&world.zaWildAlphaSpent!==true)&&!(world.district==='lumiose-zone1-roof'&&!world.interior&&world.zaZone1RoofRoarAlert===true&&world.zaZone1RoofAlphaSpent!==true)&&!(world.district==='lumiose-zone2'&&!world.interior&&['magikarp','staryu'].includes(world.zaZone2IslandRoarAlert)&&world.zaZone2RockCleared&&world.zaZone2AlphaSpent!==true)&&!(world.district==='lumiose-rouge-tower-interior'&&!world.interior&&world.zaZone3LitleoAwakeV1===true&&world.zaZone3LitleoRoarAlertV1===true&&world.zaZone3LitleoSpent!==true);}

// Never infer historical injuries or visits from a missing legacy field, nor
// rewrite unknown/malformed schema. Caller resolves the actual known center.
export function recordPlayerCenterVisit(world,center){
 if(!world||!center||typeof center.id!=='string'||!center.id)return false;
 const old=world.zaPlayerVitalsV1,maxHp=playerMaxHp(world);if(maxHp===null||old!==undefined&&!validVitals(old,maxHp,true))return false;
 const next={...(old||{}),version:1,hp:maxHp,lastCenterId:center.id};delete next.recoveryAt;delete next.recoveryRemainder;world.zaPlayerVitalsV1=next;return true;
}

// A physically visited center becomes the return point without healing an
// existing player. Missing legacy health starts only after a verified visit;
// unknown or invalid schemas are never reinterpreted.
export function recordPlayerCenterPassage(world,center){
 if(!world||!center||typeof center.id!=='string'||!center.id)return false;
 const old=world.zaPlayerVitalsV1,maxHp=playerMaxHp(world);if(maxHp===null)return false;
 if(old===undefined){world.zaPlayerVitalsV1={version:1,hp:maxHp,lastCenterId:center.id};return true;}
 if(!validVitals(old,maxHp)||old.lastCenterId===center.id)return false;
 world.zaPlayerVitalsV1={...old,lastCenterId:center.id};return true;
}

// 4.2 HP per real second: 21/5000 HP per millisecond. The remainder preserves
// fractional progress across frequent movement requests; no timer causes writes.
export function syncPlayerVitals(world,now=Date.now(),{startRecovery=true}={}){
 const old=world?.zaPlayerVitalsV1,maxHp=playerMaxHp(world);if(!validVitals(old,maxHp)||!validTime(now))return false;
 if(old.hp===maxHp&&old.recoveryAt===undefined&&old.recoveryRemainder===undefined)return false;
 const safe=playerRecoverySafe(world),next={...old};
 if(!safe||old.hp===maxHp){delete next.recoveryAt;delete next.recoveryRemainder;}
 else if(old.recoveryAt===undefined){if(startRecovery){next.recoveryAt=now;next.recoveryRemainder=0;}}
 else if(now>=old.recoveryAt){const elapsed=Math.min(now-old.recoveryAt,Math.ceil(maxHp*5000/21)),units=elapsed*21+(old.recoveryRemainder??0),healed=Math.floor(units/5000);next.hp=Math.min(maxHp,old.hp+healed);if(next.hp===maxHp){delete next.recoveryAt;delete next.recoveryRemainder;}else{next.recoveryAt=now;next.recoveryRemainder=units%5000;}}
 if(next.hp===old.hp&&next.recoveryAt===old.recoveryAt&&next.recoveryRemainder===old.recoveryRemainder)return false;world.zaPlayerVitalsV1=next;return true;
}
// Projection is read-only; a successful revision-checked action persists it.
export function projectPlayerVitals(world,now=Date.now()){
 const old=world?.zaPlayerVitalsV1;if(!validVitals(old,playerMaxHp(world)))return old;
 const view={...world,zaPlayerVitalsV1:{...old}};syncPlayerVitals(view,now,{startRecovery:false});return view.zaPlayerVitalsV1;
}

// A lethal first hit leaves 1 HP; a later hit at 1 HP blacks out. The caller
// validates the center before applying damage.
export function applyPlayerWildDamage(world,damage,now=Date.now()){
 const old=world?.zaPlayerVitalsV1,maxHp=playerMaxHp(world);
 if(!validVitals(old,maxHp)||!validTime(now)||!Number.isSafeInteger(damage)||damage<=0||typeof old.lastCenterId!=='string'||!old.lastCenterId)return null;
 if(old.lastDamageAt!==undefined&&now-old.lastDamageAt<ADVENTURE_PLAYER_IMMUNITY_MS)return {immune:true,damage:0,blackout:false};
 const next={...old,lastDamageAt:now};delete next.recoveryAt;delete next.recoveryRemainder;
 if(old.hp===1){next.hp=maxHp;world.zaPlayerVitalsV1=next;return {blackout:true,damage:1};}
 next.hp=Math.max(1,old.hp-damage);world.zaPlayerVitalsV1=next;return {blackout:false,damage:old.hp-next.hp};
}
export function applyPlayerAlphaRoar(world,now=Date.now()){return applyPlayerWildDamage(world,10,now);}
