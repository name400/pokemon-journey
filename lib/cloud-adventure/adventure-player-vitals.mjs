// Player health is currently connected only to center visits and the
// provisional field alpha-roar path; other attacks are not yet connected.
// https://www.serebii.net/legendsz-a/playerhealth.shtml
export const ADVENTURE_PLAYER_BASE_HP=100;

// Missing state is an old save, not evidence of previous injuries or visits.
// Never rewrite unknown or malformed future state. The center ID must already
// have been resolved against the game's known center locations by the caller.
export function recordPlayerCenterVisit(world,center){
 if(!world||!center||typeof center.id!=='string'||!center.id)return false;
 const old=world.zaPlayerVitalsV1;
 if(old!==undefined&&(!old||typeof old!=='object'||Array.isArray(old)||old.version!==1||!Number.isInteger(old.hp)||old.hp<0||old.hp>ADVENTURE_PLAYER_BASE_HP))return false;
 world.zaPlayerVitalsV1={...(old||{}),version:1,hp:ADVENTURE_PLAYER_BASE_HP,lastCenterId:center.id};
 return true;
}

// A newly noticed field alpha roars for 10 HP. A lethal first hit leaves 1 HP;
// the next hit at 1 HP blacks out. The caller validates the return destination
// before invoking this so an unknown/legacy center can never strand a player.
export function applyPlayerAlphaRoar(world){
 const old=world?.zaPlayerVitalsV1;
 if(!old||typeof old!=='object'||Array.isArray(old)||old.version!==1||!Number.isInteger(old.hp)||old.hp<1||old.hp>ADVENTURE_PLAYER_BASE_HP||typeof old.lastCenterId!=='string'||!old.lastCenterId)return null;
 if(old.hp===1){world.zaPlayerVitalsV1={...old,hp:ADVENTURE_PLAYER_BASE_HP};return {blackout:true,damage:1};}
 const hp=Math.max(1,old.hp-10);world.zaPlayerVitalsV1={...old,hp};return {blackout:false,damage:old.hp-hp};
}
