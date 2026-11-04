// Heights are metres. A logarithmic curve keeps small and large species distinct
// while limiting obstruction on a shared battlefield.
export function classicSpeciesScale(mon, heights) {
  const key=String(mon?.battleAppearance||mon?.rogueBattleSpecies||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const byKey=heights?.byKey||{}, byId=heights?.byId||{};
  const candidates=[byKey[key],byId[String(mon?.id)]];
  const height=candidates.find(value=>Number.isFinite(value)&&value>0);
  return height===undefined?1:Math.max(.65,Math.min(1.35,.82+.32*Math.log2(1+height)));
}
