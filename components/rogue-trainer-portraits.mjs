import metadata from '../data/rogue-trainer-portrait-pairs.json' with {type:'json'};
// Presentation only; no gender draw, encounter rewrite or saved-state mutation.
export function classicTrainerPortraits(trainer,multiple=false){
 if(!trainer)return [];
 const primary={src:trainer.sprite||'/game/trainers/fallback.svg',name:trainer.name||'트레이너'},record=metadata.pairs[trainer.id];
 if(!multiple||trainer.variant!==2||!record||record.doubleOnly)return [primary];
 if(record.partnerId){if(trainer.partnerId!==record.partnerId)return [primary];return [primary,{src:record.partnerSrc||'/game/trainers/fallback.svg',name:record.partnerName||'파트너 트레이너'}];}
 return [primary,{src:record.hasGenders?record.femaleSrc||'/game/trainers/fallback.svg':primary.src,name:trainer.partnerName||record.name||'파트너 트레이너'}];
}
