// The app owns move-learning/legality via pinned source and learnsets-modern.
// Native Battle consumes species/moves/abilities/items, not the simulator's
// six-generation TeamValidator learnset and event-legality catalogues.
export const BATTLE_LOOKUP_STUB='export const Learnsets={};export const Legality={};';
export function isNativeValidationData(source,importer){
 return typeof importer==='string'&&importer.replaceAll('\\','/').includes('/node_modules/@pkmn/sim/')&&/(?:^|\/)(?:learnsets|legality)\.(?:mjs|js)$/.test(source.split('?')[0]);
}
/** @returns {import('vite').Plugin} */
export function battleRuntimeData(){
 const id='\0pokerogue-native-validation-data';
 return {name:'pokerogue-battle-runtime-data',enforce:'pre',resolveId(source,importer){if(isNativeValidationData(source,importer))return id;},load(source){if(source===id)return BATTLE_LOOKUP_STUB;}};
}
