// Pinned upstream pokemon.ts getNextMove: rank descent after move scoring.
// Scores/targets and the engine PRNG still differ from upstream. Keep the policy
// opt-in on new runs and do not describe it as complete source AI equivalence.
export function chooseClassicRankedMove(candidates,{smart=false,randomInt}){
 if(!Array.isArray(candidates)||!candidates.length||typeof randomInt!=='function')throw Error('상대 기술 후보를 확인하세요.');
 const keyOf=c=>c.m.slot??c.m.id,lethalKeys=new Set(candidates.filter(c=>c.knocksOut).map(keyOf));
 const grouped=new Map();
 for(const candidate of candidates){
  if(lethalKeys.size&&!lethalKeys.has(keyOf(candidate)))continue;
  if(!Number.isFinite(candidate.score))throw Error('상대 기술 점수를 확인하세요.');
  const key=candidate.m.slot??candidate.m.id,previous=grouped.get(key);
  if(!previous||candidate.score>previous.score)grouped.set(key,candidate);
 }
 let pool=[...grouped.values()];
 // Upstream removes non-KO moves when a usable move can KO a target.
 // Group targets after filtering move identities, so extra targets never add
 // extra chances for the same move. Target scoring itself remains local.
 pool.sort((a,b)=>b.score-a.score);let index=0;
 if(!smart){while(index<pool.length-1&&randomInt(8)>=5)index++;}
 else while(index<pool.length-1&&pool[index+1].score/pool[index].score>=0&&randomInt(100)<Math.round(pool[index+1].score/pool[index].score*50))index++;
 return pool[index];
}

// Only the equal-score subset is sampled here. Source target benefit scoring
// and the source RNG stream are not yet reproduced by the local scorer.
export function chooseClassicTiedTarget(best,candidates,randomInt){
 if(!Number.isInteger(best?.t?.target))return best;
 const key=best.m.slot??best.m.id,ties=candidates.filter(candidate=>(candidate.m.slot??candidate.m.id)===key&&candidate.t.side===best.t.side&&Number.isInteger(candidate.t.target)&&candidate.score===best.score&&!!candidate.knocksOut===!!best.knocksOut);
 return ties.length>1?ties[randomInt(ties.length)]:best;
}

// Source-like weighting over the local target scores. These scores and the
// engine RNG are not upstream benefit scores or the upstream RNG stream.
export function chooseClassicWeightedTarget(best,candidates,randomInt){
 if(!Number.isInteger(best?.t?.target)||best.t.side!==0)return best;
 const key=best.m.slot??best.m.id,targets=candidates.filter(c=>(c.m.slot??c.m.id)===key&&c.t.side===0&&Number.isInteger(c.t.target)&&Number.isFinite(c.score));
 if(targets.length<2)return best;
 targets.sort((a,b)=>b.score-a.score);const offset=targets.at(-1).score<1?1-targets.at(-1).score:0;
 const weighted=targets.map(c=>({candidate:c,weight:c.score+offset}));const cutoff=weighted.findIndex(item=>item.weight<weighted[0].weight/2);if(cutoff>=0)weighted.length=cutoff;
 if(weighted.length<2)return weighted[0]?.candidate??best;
 const scale=1000,weights=weighted.map(item=>Math.max(1,Math.round(item.weight*scale))),total=weights.reduce((a,b)=>a+b,0);if(!Number.isSafeInteger(total))return best;
 let draw=randomInt(total);for(let i=0;i<weights.length;i++){if(draw<weights[i])return weighted[i].candidate;draw-=weights[i];}return best;
}
