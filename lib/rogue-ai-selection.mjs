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
