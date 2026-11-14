// First stage of player health: center visits only. Wild attacks and blackout
// are deliberately not connected until the field danger/return flow exists.
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
