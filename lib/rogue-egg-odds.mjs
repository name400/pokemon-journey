// Shared by the server's draw and its probability disclosure.
export const CLASSIC_EGG_ROLL_SIZE=512;
export const MANAPHY_EGG_DENOMINATOR=408;
export function rollClassicEggTier(value,machineId){
 const roll=Math.min(511,Math.max(0,Math.floor(value*512))),legendary=machineId==='legendary'?2:1;
 return roll<legendary?3:roll<legendary+14?2:roll<legendary+102?1:0;
}
export function classicEggOdds(machineId){
 const legendary=(machineId==='legendary'?2:1)/512,commonTier=1-legendary-14/512-88/512,manaphy=commonTier/MANAPHY_EGG_DENOMINATOR;
 return {common:commonTier-manaphy,rare:88/512,epic:14/512,legendary,manaphy};
}
export function classicEggSpeciesWeight(record,base){return Math.max(1,Math.floor(base*(record.mythical ? 0.5 : 1)));}
