// Saves created before the choice existed retain the original companion.
export function mzRivalName(world){return world.pcMZRival==='tani'?'타니':'가이';}
export function zaPartnerStone(speciesId){
 if([152,153,154].includes(speciesId))return 'meganiumite';
 if([498,499,500].includes(speciesId))return 'emboarite';
 if([158,159,160].includes(speciesId))return 'feraligite';
 return '';
}
