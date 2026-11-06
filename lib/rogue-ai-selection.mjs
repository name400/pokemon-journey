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

// Source AddBattlerTagAttr assigns fixed scores by tag. The enemy's score
// against an opponent is the sign-inverted target benefit.
const sourceTagTargetScores={confusion:5,attract:5,nightmare:5,yawn:5,encore:2,leechseed:3};
const sourceStatusImmunities={limber:['par'],insomnia:['slp'],vitalspirit:['slp'],immunity:['psn','tox'],magmaarmor:['frz'],waterveil:['brn'],waterbubble:['brn'],leafguard:[]};
export function classicAiSourceTargetScore(move,context){
 if(move?.category!=='Status'||move.target!=='normal'||move.boosts||move.self||move.secondary||move.secondaries)return null;
 if(sourceTagTargetScores[move.volatileStatus]!=null)return sourceTagTargetScores[move.volatileStatus];
 if(!['brn','par','psn','tox','slp','frz'].includes(move.status)||move.volatileStatus)return null;
 const {battle,user,target,teams,fieldStatus=false,abilityStatus=false}=context||{};
 // Other abilities, passives and forms need the source status-immunity
 // calculation; keep their existing score until supported.
 if(!battle||!user||!target||!fieldStatus&&(battle.field?.weather||battle.field?.terrain)||user.terastallized||target.terastallized||user.transformed||target.transformed||user.illusion||target.illusion||!Array.isArray(teams)||teams.flat().some(mon=>mon?.roguePassiveAbility)||battle.sides.flatMap(side=>side.active||[]).some(mon=>mon?.hp>0&&mon.ability!=='pressure'&&(!abilityStatus||!Object.hasOwn(sourceStatusImmunities,mon.ability))))return null;
 if(target.status||target.side?.sideConditions?.safeguard)return 0;
 const terrain=battle.field?.terrain,weather=battle.field?.weather;
 if(abilityStatus&&target.ability!=='pressure'){
  if(typeof target.ignoringAbility!=='function')return null;
  if(!target.ignoringAbility()&&(sourceStatusImmunities[target.ability]?.includes(move.status)||target.ability==='leafguard'&&['sunnyday','desolateland'].includes(weather)))return 0;
 }
 if(fieldStatus&&['mistyterrain','electricterrain'].includes(terrain)){
  if(typeof target.isGrounded!=='function')return null;
  if(target.isGrounded()&&(terrain==='mistyterrain'||terrain==='electricterrain'&&move.status==='slp'))return 0;
 }
 if(fieldStatus&&move.status==='frz'&&['sunnyday','desolateland'].includes(weather))return 0;
 const types=target.getTypes(),immune=move.status==='brn'&&types.includes('Fire')||move.status==='par'&&types.includes('Electric')||['psn','tox'].includes(move.status)&&types.some(type=>type==='Poison'||type==='Steel')||move.status==='frz'&&types.includes('Ice');
 return immune?0:10;
}

// Use source target scores only for reviewed move attributes. Other moves use
// local scores; the engine RNG and draw timing remain different from upstream.
export function chooseClassicWeightedTarget(best,candidates,randomInt,{allowAllies=false}={}){
 if(!Number.isInteger(best?.t?.target))return best;
 const key=best.m.slot??best.m.id,matching=candidates.filter(c=>(c.m.slot??c.m.id)===key&&[0,1].includes(c.t.side)&&Number.isInteger(c.t.target)&&Number.isFinite(c.score));
 const includeAllies=allowAllies&&matching.length>0&&matching.every(c=>Number.isFinite(c.sourceTargetScore));
 if(!includeAllies&&best.t.side!==0)return best;
 const targets=includeAllies?matching:matching.filter(c=>c.t.side===0);if(targets.length<2)return best;
 const source=targets.every(c=>Number.isFinite(c.sourceTargetScore)),score=c=>source?c.sourceTargetScore*(c.t.side===1?-1:1):c.score;targets.sort((a,b)=>score(b)-score(a));const offset=score(targets.at(-1))<1?1-score(targets.at(-1)):0;
 const weighted=targets.map(c=>({candidate:c,weight:score(c)+offset}));const cutoff=weighted.findIndex(item=>item.weight<weighted[0].weight/2);if(cutoff>=0)weighted.length=cutoff;
 if(weighted.length<2)return weighted[0]?.candidate??best;
 const scale=1000,weights=weighted.map(item=>Math.max(1,Math.round(item.weight*scale))),total=weights.reduce((a,b)=>a+b,0);if(!Number.isSafeInteger(total))return best;
 let draw=randomInt(total);for(let i=0;i<weights.length;i++){if(draw<weights[i])return weighted[i].candidate;draw-=weights[i];}return best;
}
