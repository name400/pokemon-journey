// Internal preview only: the reward and party actions must remain gated until
// move learning and held-item transfers can be committed atomically.
import {configure,statKeys} from './pokemon-config.mjs';
import {sourceSpeciesFor} from './rogue-reference.mjs';

function check(mon){
 const species=sourceSpeciesFor(mon);
 if(!mon?.boxId||!species||mon.fusionSpecies||mon.rogueFusionRule||mon.rogueFormIndex||mon.rogueBattleSpecies||!mon.rogueBaseStats||!Array.isArray(mon.rogueTypes)||!mon.rogueTypes.length||!mon.ability||!Number.isInteger(mon.level)||!Number.isFinite(mon.hp)||!Number.isFinite(mon.maxHp)||mon.maxHp<=0||mon.hp<0||mon.hp>mon.maxHp||!Array.isArray(mon.moves)||!statKeys.every(k=>Number.isFinite(mon.rogueBaseStats[k])&&mon.rogueBaseStats[k]===species.baseStats[k])) throw new Error('Unsupported DNA fusion preview');
}
export function previewClassicDnaFusion(primary,donor,{random=Math.random}={}){
 check(primary);check(donor);
 if(primary.boxId===donor.boxId)throw new Error('DNA fusion requires two distinct Pokémon');
 const first=primary.rogueTypes[0],partner=donor.rogueTypes,second=partner[1]&&partner[1]!==first?partner[1]:partner[0]!==first?partner[0]:primary.rogueTypes[1];
 const types=second&&second!==first?[first,second]:[first];
 let statusOwner=primary.hp>0&&primary.status?primary:donor;
 if(primary.hp>0&&donor.hp>0&&primary.status&&donor.status){const roll=random();if(!Number.isFinite(roll)||roll<0||roll>=1)throw new Error('Invalid DNA fusion random value');statusOwner=roll<.5?donor:primary;}
 const fused=configure({...structuredClone(primary),fusionSpecies:donor.rogueSourceId,rogueFusionRule:'preview-v1',rogueFusion:{baseStats:structuredClone(donor.rogueBaseStats),primaryAbility:primary.ability,primaryTypes:structuredClone(primary.rogueTypes),donor:structuredClone(donor)},ability:donor.ability,rogueTypes:types,types,type:first,status:statusOwner.hp?statusOwner.status:null,rogueStatusState:statusOwner.hp?structuredClone(statusOwner.rogueStatusState??null):null});
 fused.hp=Math.min(fused.maxHp,Math.round(primary.maxHp*(primary.hp/primary.maxHp+donor.hp/donor.maxHp)/2));
 return {fused,offeredMoves:structuredClone(donor.moves),donorConsumed:true,heldItemsTransferred:false};
}
export function previewClassicDnaUnsplice(mon){
 if(mon?.rogueFusionRule!=='preview-v1'||!mon.rogueFusion?.donor||!mon.rogueFusion.primaryAbility||!Array.isArray(mon.rogueFusion.primaryTypes))throw new Error('Unsupported DNA unsplice preview');
 const out=structuredClone(mon),info=out.rogueFusion;
 out.ability=info.primaryAbility;out.rogueTypes=info.primaryTypes;out.types=[...info.primaryTypes];out.type=info.primaryTypes[0];
 delete out.rogueFusion;delete out.rogueFusionRule;delete out.fusionSpecies;
 return {primary:configure(out,{hp:out.hp}),donorRestored:false};
}
