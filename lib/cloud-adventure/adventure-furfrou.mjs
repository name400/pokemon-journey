// Exploratory grooming is independent of shared species and other-game forms.
export const FURFROU_TRIMS=Object.freeze({natural:'야생의 모습',heart:'하트컷',star:'스타컷',diamond:'다이아컷'});
export function validAdventureFurfrou(mon){return !!mon&&mon.id===676&&mon.speciesId===676&&!mon.fusionSpecies&&!mon.rogueFusion&&mon.rogueSourceId==null&&!mon.sourceImage&&!mon.sourceBackImage&&!mon.sourceShinyImage&&!mon.sourceShinyBackImage&&!mon.sourceAppearanceMissing&&(!mon.battleAppearance||mon.battleAppearance==='furfrou')&&(mon.adventureFurfrouTrim==null||Object.hasOwn(FURFROU_TRIMS,mon.adventureFurfrouTrim));}
export function adventureFurfrouAtlas(mon,facing='front'){
 const trim=mon?.adventureFurfrouTrim;if(!validAdventureFurfrou(mon)||!['heart','star','diamond'].includes(trim)||mon.sourceImage||mon.sourceAppearanceMissing||mon.battleAppearance&&mon.battleAppearance!=='furfrou'||!['front','back'].includes(facing))return null;
 return {key:`676-${trim}`,shiny:!!mon.shiny,facing};
}
