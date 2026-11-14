// Player health currently supports center visits and provisional alpha roars.
// https://www.serebii.net/legendsz-a/playerhealth.shtml
export const ADVENTURE_PLAYER_BASE_HP=100;
export const ADVENTURE_PLAYER_IMMUNITY_MS=2000; // short immunity: duration is provisional
const validTime=n=>Number.isSafeInteger(n)&&n>=0;
function validVitals(v,allowZero=false){
 return !!v&&typeof v==='object'&&!Array.isArray(v)&&v.version===1&&Number.isInteger(v.hp)&&v.hp>=(allowZero?0:1)&&v.hp<=ADVENTURE_PLAYER_BASE_HP&&
  (v.lastDamageAt===undefined||validTime(v.lastDamageAt))&&(v.recoveryAt===undefined||validTime(v.recoveryAt))&&
  (v.recoveryRemainder===undefined||Number.isInteger(v.recoveryRemainder)&&v.recoveryRemainder>=0&&v.recoveryRemainder<5000&&v.recoveryAt!==undefined);
}
export function playerRecoverySafe(world){return !!world&&!world.combat&&!world.adventureCatchWindow&&!world.unionHost&&!world.inUnion&&!world.expedition&&!(world.district==='lumiose-wild'&&world.zaWildAlphaAlert===true);}

// Never infer historical injuries or visits from a missing legacy field, nor
// rewrite unknown/malformed schema. Caller resolves the actual known center.
export function recordPlayerCenterVisit(world,center){
 if(!world||!center||typeof center.id!=='string'||!center.id)return false;
 const old=world.zaPlayerVitalsV1;if(old!==undefined&&!validVitals(old,true))return false;
 const next={...(old||{}),version:1,hp:ADVENTURE_PLAYER_BASE_HP,lastCenterId:center.id};delete next.recoveryAt;delete next.recoveryRemainder;world.zaPlayerVitalsV1=next;return true;
}

// 4.2 HP per real second: 21/5000 HP per millisecond. The remainder preserves
// fractional progress across frequent movement requests; no timer causes writes.
export function syncPlayerVitals(world,now=Date.now(),{startRecovery=true}={}){
 const old=world?.zaPlayerVitalsV1;if(!validVitals(old)||!validTime(now))return false;
 if(old.hp===ADVENTURE_PLAYER_BASE_HP&&old.recoveryAt===undefined&&old.recoveryRemainder===undefined)return false;
 const safe=playerRecoverySafe(world),next={...old};
 if(!safe||old.hp===ADVENTURE_PLAYER_BASE_HP){delete next.recoveryAt;delete next.recoveryRemainder;}
 else if(old.recoveryAt===undefined){if(startRecovery){next.recoveryAt=now;next.recoveryRemainder=0;}}
 else if(now>=old.recoveryAt){const elapsed=Math.min(now-old.recoveryAt,25000),units=elapsed*21+(old.recoveryRemainder??0),healed=Math.floor(units/5000);next.hp=Math.min(ADVENTURE_PLAYER_BASE_HP,old.hp+healed);if(next.hp===ADVENTURE_PLAYER_BASE_HP){delete next.recoveryAt;delete next.recoveryRemainder;}else{next.recoveryAt=now;next.recoveryRemainder=units%5000;}}
 if(next.hp===old.hp&&next.recoveryAt===old.recoveryAt&&next.recoveryRemainder===old.recoveryRemainder)return false;world.zaPlayerVitalsV1=next;return true;
}
// Projection is read-only; a successful revision-checked action persists it.
export function projectPlayerVitals(world,now=Date.now()){
 const old=world?.zaPlayerVitalsV1;if(!validVitals(old))return old;
 const view={...world,zaPlayerVitalsV1:{...old}};syncPlayerVitals(view,now,{startRecovery:false});return view.zaPlayerVitalsV1;
}

// One alpha roar causes 10 HP; a lethal first hit leaves 1 HP, then a later
// hit at 1 HP blacks out. The caller validates the center before applying it.
export function applyPlayerAlphaRoar(world,now=Date.now()){
 const old=world?.zaPlayerVitalsV1;
 if(!validVitals(old)||!validTime(now)||typeof old.lastCenterId!=='string'||!old.lastCenterId)return null;
 if(old.lastDamageAt!==undefined&&now-old.lastDamageAt<ADVENTURE_PLAYER_IMMUNITY_MS)return {immune:true,damage:0,blackout:false};
 const next={...old,lastDamageAt:now};delete next.recoveryAt;delete next.recoveryRemainder;
 if(old.hp===1){next.hp=ADVENTURE_PLAYER_BASE_HP;world.zaPlayerVitalsV1=next;return {blackout:true,damage:1};}
 next.hp=Math.max(1,old.hp-10);world.zaPlayerVitalsV1=next;return {blackout:false,damage:old.hp-next.hp};
}
