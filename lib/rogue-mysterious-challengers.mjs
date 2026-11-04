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

// The source permits at most five retries when the hard trainer matches normal.
// draw and describe must use the run's persisted random cursor.
export function selectMysteriousChallengerCandidates(draw, describe) {
  const normal = describe(draw(false));
  let hardId = draw(false);
  for (let retries = 0; retries < 5 && hardId === normal.id; retries++) hardId = draw(false);
  const hard = describe(hardId);
  const brutal = describe(draw(true));
  return {normal, hard, brutal};
}

// Upstream shifts each UTF-16 code unit and restores the prior random stream.
export function mysteriousChallengerSeed(seed,wave,difficulty) {
  const factors={normal:10,hard:100,brutal:1000};
  if(typeof seed!=='string'||!Number.isInteger(wave)||wave<1||!Object.hasOwn(factors,difficulty))throw Error('도전자 난수 설정을 확인하세요.');
  const offset=wave*factors[difficulty];
  return shiftSourceSeed(seed,offset);
}

export function shiftSourceSeed(seed,offset) {
  if(typeof seed!=='string'||!Number.isSafeInteger(offset))throw Error('시드 오프셋을 확인하세요.');
  return seed.split('').map(char=>String.fromCharCode(char.charCodeAt(0)+offset)).join('');
}
export function mysteriousChallengerMemberOffset(wave,trainerId,index,{staticParty=false,sameSeed=false}={}) {
  if(!Number.isSafeInteger(wave)||wave<1||!Number.isSafeInteger(trainerId)||trainerId<0||!Number.isSafeInteger(index)||index<0)throw Error('도전자 파티 시드를 확인하세요.');
  return staticParty?trainerId+((index+1)<<8):wave+(trainerId<<10)+(((sameSeed?0:index)+1)<<8);
}
