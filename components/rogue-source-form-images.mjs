// Forms with distinct, verified atlases at the pinned PokéRogue assets commit.
const alcremie=['vanilla-cream','ruby-cream','matcha-cream','mint-cream','lemon-cream','salted-cream','ruby-swirl','caramel-swirl','rainbow-swirl'];
export function classicSourceFormAtlas(mon,facing='front'){
 const source=mon?.rogueSourceId??(mon?.formIndex!=null?mon.sourceId:undefined),index=mon?.rogueFormIndex??mon?.formIndex??0;
 if(mon?.fusionSpecies||mon?.sourceAppearanceMissing||!['front','back'].includes(facing))return null;
 if(source===869&&Number.isInteger(index)&&index>=0&&index<alcremie.length&&(!mon?.rogueFormKey||mon.rogueFormKey===alcremie[index])&&(!mon?.battleAppearance||mon.battleAppearance==='alcremie'))return {key:index===0?'869':`869-${alcremie[index]}`,shiny:!!mon.shiny,facing};
 // The original uses the same atlas for both antique and phony Polteageist.
 if(source===855&&(index===0||index===1)&&(!mon?.rogueFormKey||mon.rogueFormKey===(index===0?'phony':'antique'))&&(!mon?.battleAppearance||mon.battleAppearance==='polteageist'))return {key:'855',shiny:!!mon.shiny,facing};
 return null;
}
