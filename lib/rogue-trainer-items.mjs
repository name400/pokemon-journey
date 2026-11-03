// Explicit trainer modifiers in PokéRogue beta 7c088125. These native items
// reproduce the corresponding fixed effects; random modifier pools and the
// multi-purpose Mystical Rock need their own implementation.
export function applyClassicTrainerFixedItems(team, trainerName) {
 const give=(index,species,item,ability=null)=>{
  const mon=team[index];
  if(mon?.rogueSourceId===species&&(!ability||mon.ability===ability))team[index]={...mon,item};
 };
 if(trainerName==='RED')give(0,25,'lightball');
 if(trainerName==='WALLACE')give(5,350,'toxicorb','marvelscale');
 if(trainerName==='KIERAN')give(2,472,'toxicorb','poisonheal');
 if(trainerName==='GUZMA_2')give(4,472,'toxicorb','poisonheal');
 if(trainerName==='RIVAL_5'||trainerName==='RIVAL_6')give(1,277,'flameorb','guts');
 return team;
}
