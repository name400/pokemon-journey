// Party templates from PokéRogue 7c088125's Mysterious Challengers encounter.
// This is a building block only; the encounter is not yet enabled in play.
export function mysteriousChallengersHardTemplate(wave) {
  if (!Number.isInteger(wave) || wave < 1) throw Error('웨이브를 확인하세요.');
  const size = 1 + Math.min(Math.ceil(wave / 20), 5);
  return {
    kind: 'compound', size, strength: 3, sameSpecies: false, balanced: false,
    rootEvoThresholdKind: 1,
    slots: Array.from({length: size}, (_, index) => ({
      index, strength: index === 0 ? 5 : 3, sameSpecies: false,
      balanced: true, evoThresholdKind: 1, groupIndex: index === 0 ? 0 : 1,
      groupStart: index === 0 ? 0 : 1,
    })),
  };
}
