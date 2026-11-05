// Original Finn/Ivy trainer sprites; see data/rogue-rival-asset-provenance.json.
// Presentation only: never draw a new gender or advance the encounter RNG.
export function classicRivalPortrait(trainer = {}) {
 const female = trainer.variant === 1 || trainer.variant === 'female' || trainer.gender === 'F';
 return `/game/trainers/rival-${female ? 'f' : 'm'}.png`;
}

export function classicRivalTrainerPresentation(encounter) {
 if (encounter?.kind !== 'rival' || !encounter.trainer) return encounter?.trainer;
 const trainer = encounter.trainer;
 if (trainer.sprite && !['/game/trainers/fallback.svg', '/game/trainers/rival-local.svg'].includes(trainer.sprite)) return trainer;
 return {...trainer, sprite: classicRivalPortrait(trainer)};
}
