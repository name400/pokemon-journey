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
// Reviewed source AttackMove entries with fixed power and no effect attributes.
const sourcePlainAttackMoves=new Set(['pound','megapunch','scratch','visegrip','cut','slam','vinewhip','megakick','hornattack','tackle','watergun','hydropump','strength','rockthrow','quickattack','eggbomb','machpunch','feintattack','megahorn','vitalthrow','extremespeed','shadowpunch','dragonclaw','magicalleaf','shockwave','aquatail','seedbomb','xscissor','powergem','vacuumwave','bulletpunch','iceshard','shadowsneak','powerwhip','magnetbomb','aquajet','fairywind','highhorsepower','leafage','smartstrike','accelerock','branchpoke','falsesurrender','jetpunch','kowtowcleave','mightycleave']);
const sourceTagTargetScores={confusion:5,attract:5,nightmare:5,yawn:5,encore:2,leechseed:3};
const sourceStatusImmunities={limber:['par'],insomnia:['slp'],vitalspirit:['slp'],immunity:['psn','tox'],magmaarmor:['frz'],waterveil:['brn'],waterbubble:['brn'],leafguard:[]};
const sourceFieldStatusImmunities=new Set(['sweetveil','flowerveil']);
const sourceStatusBypassAbilities=new Set(['corrosion']);
const neutralPollenAbilities=new Set(['pressure','runaway','pickup','keeneye','limber','insomnia','vitalspirit','immunity','waterveil','magmaarmor','owntempo']);
const neutralPollenItems=new Set(['','leftovers','sitrusberry','lumberry','oranberry','pechaberry']);
const statPollenAbilities=new Set(['hugepower','purepower','hustle','solarpower','defeatist']);
const statPollenItems=new Set(['eviolite','assaultvest','choicescarf']);
const neutralPollenWeather=new Set(['','sunnyday','raindance','sandstorm','snowscape','hail','desolateland','primordialsea','deltastream']);
const neutralPollenTerrain=new Set(['','grassyterrain','electricterrain','mistyterrain','psychicterrain']);
export function classicAiSourceTargetScore(move,context){
 if(context?.plainAttackStatus&&sourcePlainAttackMoves.has(move?.id)&&move.target==='normal'&&['Physical','Special'].includes(move.category)&&Number.isFinite(move.basePower)&&move.basePower>0){
  const {battle,user,target,teams,modifiers}=context,dex=battle?.dex,active=battle?.sides?.flatMap(side=>side.active||[]);
  // Unknown abilities, form changes, fields and held modifiers can alter source effectiveness or effective stats.
  if(!dex||!user||!target||!Array.isArray(active)||!Array.isArray(teams)||!Array.isArray(modifiers)||modifiers.length||battle.rogueInverseBattle||battle.field?.weather||battle.field?.terrain||Object.keys(battle.field?.pseudoWeather||{}).length||battle.sides.some(side=>Object.keys(side.sideConditions||{}).length)||teams.flat().some(mon=>mon?.roguePassiveAbility)||active.some(p=>p?.hp>0&&(!['pressure','noguard','runaway'].includes(p.ability)||p.item||p.status||p.transformed||p.terastallized||p.illusion||Object.keys(p.volatiles||{}).length||Object.values(p.boosts||{}).some(value=>value!==0)))||typeof user.getStat!=='function'||typeof target.getTypes!=='function')return null;
  const types=target.getTypes(),attack=user.getStat(move.category==='Physical'?'atk':'spa'),other=user.getStat(move.category==='Physical'?'spa':'atk');
  if(!Array.isArray(types)||!types.length||types.some(type=>!dex.types.get(type).exists)||!Number.isFinite(attack)||attack<=0||!Number.isFinite(other)||other<0)return null;
  const effectiveness=dex.getImmunity(move.type,types)?2**dex.getEffectiveness(move.type,types):0;let score=(effectiveness-1)**2*(effectiveness<1?-2:2),ratio=other/attack;if(ratio<=.75)score*=2;else if(ratio<=.875)score*=1.5;score+=Math.floor(move.basePower/5);
  return Number.isFinite(score)&&Math.abs(score)<Number.MAX_SAFE_INTEGER?score:null;
 }
 // Pollen Puff adds HealOnAllyAttr's HP benefit to AttackMove's type and
 // power benefit even for an opponent. Only score reviewed, neutral states.
 if(context?.pollenTargetStatus&&move?.id==='pollenpuff'&&move.category==='Special'&&move.target==='normal'&&move.basePower===90){
  const {battle,user,target,teams}=context,dex=battle?.dex,active=battle?.sides?.flatMap(side=>side.active||[]);
  const expanded=context.expandedPollenStatus===true,stats=context.pollenStatAbilities===true,passive=mon=>String(mon?.roguePassiveAbility||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  if(!dex||!user||!target||!Array.isArray(active)||!Array.isArray(teams)||battle.rogueInverseBattle&&!expanded||teams.flat().some(mon=>passive(mon)&&(!expanded||!neutralPollenAbilities.has(passive(mon))))||expanded&&(!Array.isArray(context.modifiers)||context.modifiers.length>0)||(!expanded?(battle.field?.weather||battle.field?.terrain):(!neutralPollenWeather.has(battle.field?.weather||'')||!neutralPollenTerrain.has(battle.field?.terrain||'')))||Object.keys(battle.field?.pseudoWeather||{}).length||battle.sides.some(side=>Object.keys(side.sideConditions||{}).length)||active.some(p=>p?.hp>0&&((expanded?!neutralPollenAbilities.has(p.ability)&&!(stats&&p===user&&statPollenAbilities.has(p.ability)):p.ability!=='pressure')||(expanded?!neutralPollenItems.has(p.item||'')&&!(stats&&statPollenItems.has(p.item||'')):!!p.item)||p.status||p.transformed||p.terastallized||p.illusion||Object.keys(p.volatiles||{}).some(key=>!expanded||!key.startsWith('roguepassive:')||!neutralPollenAbilities.has(key.slice('roguepassive:'.length)))||!expanded&&Object.values(p.boosts||{}).some(n=>n!==0)))||typeof user.getStat!=='function'||typeof target.getTypes!=='function'||!Number.isFinite(target.hp)||!Number.isFinite(target.maxhp)||target.maxhp<=0||target.hp<0||target.hp>target.maxhp)return null;
  const types=target.getTypes();let spa=user.getStat('spa'),atk=user.getStat('atk');
  if(stats&&statPollenAbilities.has(user.ability)){
   const stages=user.boosts,base=user.storedStats;if(!base||!stages||!['atk','spa'].every(stat=>Number.isFinite(base[stat])&&base[stat]>0&&Number.isInteger(stages[stat])&&Math.abs(stages[stat])<=6))return null;
   const mod=stat=>{let multiplier=1;if(stat==='atk'&&['hugepower','purepower'].includes(user.ability))multiplier=2;if(stat==='atk'&&user.ability==='hustle')multiplier=1.5;if(stat==='spa'&&user.ability==='solarpower'&&['sunnyday','desolateland'].includes(battle.field?.weather))multiplier=1.5;if(user.ability==='defeatist'&&user.hp/user.maxhp<=0.5)multiplier=0.5;const stage=stages[stat];return Math.max(1,Math.floor(base[stat]*multiplier*Math.max(2,2+stage)/Math.max(2,2-stage)));};atk=mod('atk');spa=mod('spa');
  }
  if(!Array.isArray(types)||!types.length||types.some(type=>!dex.types.get(type).exists)||!Number.isFinite(spa)||spa<=0||!Number.isFinite(atk)||atk<0)return null;
  const effectiveness=dex.getImmunity('Bug',types)?2**dex.getEffectiveness('Bug',types):0;
  let attack=(effectiveness-1)**2*(effectiveness<1?-2:2),ratio=atk/spa;
  if(ratio<=0.75)attack*=2;else if(ratio<=0.875)attack*=1.5;
  const healing=Math.round(((1-target.hp/target.maxhp)*20-5)/0.75),score=attack+18-healing;
  return Number.isSafeInteger(score)||context.fractionalTargetStatus&&Number.isFinite(score)&&Math.abs(score)<Number.MAX_SAFE_INTEGER?score:null;
 }
 // Heal Pulse has a source HealAttr that scores the recipient's missing HP.
 // Avoid guessing for commanded targets, which have a separate source rule.
 if(context?.healingStatus&&move?.category==='Status'&&(
  move.id==='healpulse'&&move.target==='any'||
  context.milkTargetStatus&&move.id==='milkdrink'&&move.target==='self'||
  context.floralTargetStatus&&move.id==='floralhealing'&&move.target==='normal'
 )){
  const target=context.target,hp=target?.hp,maxhp=target?.maxhp;
  if(!Number.isFinite(hp)||!Number.isFinite(maxhp)||maxhp<=0||hp<0||hp>maxhp||target.volatiles?.commanded||target.side?.active?.some(p=>p?.volatiles?.commanded))return null;
  const ratio=move.id==='floralhealing'?context.floralAiRatio:0.5;
  if(![1,0.5,2/3].includes(ratio))return null;
  // This module stores the inverse of the source benefit score so its shared
  // selection path can keep a positive score for harm to an opponent.
  const score=Math.round(((1-hp/maxhp)*20-ratio*10)/(1-ratio/2));
  return score===0?0:-score;
 }
 if(move?.category!=='Status'||move.target!=='normal'||move.self||move.secondary||move.secondaries)return null;
 if(move.boosts){
  const changes=Object.entries(move.boosts);
  if(context?.statStatus&&!move.volatileStatus&&!move.status&&!move.selfdestruct&&!move.selfSwitch&&changes.length>0){
   let benefit=0;for(const [stat,amount] of changes){const stage=context?.target?.boosts?.[stat],defense=['def','spd'].includes(stat);if(!(['atk','spa','spe','accuracy','evasion'].includes(stat)||defense&&context.defenseStatus)||!Number.isInteger(amount)||amount>=0||!Number.isInteger(stage)||stage< -6||stage>6)return null;if(defense){const user=context?.user,dex=context?.battle?.dex;if(!user||user.transformed||!Array.isArray(user.moveSlots)||!dex?.moves)return null;const learned=user.moveSlots.map(slot=>dex.moves.get(slot.id));if(learned.some(m=>!m.exists))return null;if(!learned.some(m=>m.category==='Physical'))continue;}const levels=Math.max(stage+amount,-6)-stage;benefit+=levels*4+(levels>0?-2:2);}return benefit===0?0:-benefit;
  }
  if(!context?.compoundStatus||move.volatileStatus!=='confusion'||move.status||changes.length!==1)return null;
  const [[stat,amount]]=changes,stage=context?.target?.boosts?.[stat];
  if(!['atk','spa'].includes(stat)||!Number.isInteger(amount)||amount<=0||!Number.isInteger(stage)||stage< -6||stage>6)return null;
  const levels=Math.min(stage+amount,6)-stage;return 5-(levels*4+(levels>0?-2:2));
 }
 if(sourceTagTargetScores[move.volatileStatus]!=null)return sourceTagTargetScores[move.volatileStatus];
 if(!['brn','par','psn','tox','slp','frz'].includes(move.status)||move.volatileStatus)return null;
 const {battle,user,target,teams,fieldStatus=false,abilityStatus=false,passiveStatus=false,fieldAbilityStatus=false,corrosionStatus=false}=context||{};
 // Other abilities, passives and forms need the source status-immunity
 // calculation; keep their existing score until supported.
 if(!battle||!user||!target||!fieldStatus&&(battle.field?.weather||battle.field?.terrain)||user.terastallized||target.terastallized||user.transformed||target.transformed||user.illusion||target.illusion||!Array.isArray(teams)||teams.flat().some(mon=>mon?.roguePassiveAbility&&(!passiveStatus||!(Object.hasOwn(sourceStatusImmunities,String(mon.roguePassiveAbility).toLowerCase().replace(/[^a-z0-9]/g,''))||fieldAbilityStatus&&sourceFieldStatusImmunities.has(String(mon.roguePassiveAbility).toLowerCase().replace(/[^a-z0-9]/g,''))||corrosionStatus&&sourceStatusBypassAbilities.has(String(mon.roguePassiveAbility).toLowerCase().replace(/[^a-z0-9]/g,'')))))||battle.sides.flatMap(side=>side.active||[]).some(mon=>mon?.hp>0&&mon.ability!=='pressure'&&(!abilityStatus||!(Object.hasOwn(sourceStatusImmunities,mon.ability)||fieldAbilityStatus&&sourceFieldStatusImmunities.has(mon.ability)||corrosionStatus&&sourceStatusBypassAbilities.has(mon.ability)))))return null;
 if(target.status||target.side?.sideConditions?.safeguard)return 0;
 if(fieldAbilityStatus){
  if(!Array.isArray(target.side?.active)||target.side.active.some(p=>p?.hp>0&&typeof p.hasAbility!=='function'))return null;
  const allies=target.side.active.filter(p=>p?.hp>0);
  if(move.status==='slp'&&allies.some(p=>p.hasAbility('sweetveil'))||target!==user&&target.getTypes().includes('Grass')&&allies.some(p=>p.hasAbility('flowerveil')))return 0;
 }
 const terrain=battle.field?.terrain,weather=battle.field?.weather;
 if(passiveStatus){
  if(typeof target.hasAbility!=='function')return null;
  const immuneAbilities=Object.entries(sourceStatusImmunities).filter(([,statuses])=>statuses.includes(move.status)).map(([ability])=>ability);
  if(target.hasAbility(immuneAbilities)||['sunnyday','desolateland'].includes(weather)&&target.hasAbility('leafguard'))return 0;
 }else if(abilityStatus&&target.ability!=='pressure'){
  if(typeof target.ignoringAbility!=='function')return null;
  if(!target.ignoringAbility()&&(sourceStatusImmunities[target.ability]?.includes(move.status)||target.ability==='leafguard'&&['sunnyday','desolateland'].includes(weather)))return 0;
 }
 if(fieldStatus&&['mistyterrain','electricterrain'].includes(terrain)){
  if(typeof target.isGrounded!=='function')return null;
  if(target.isGrounded()&&(terrain==='mistyterrain'||terrain==='electricterrain'&&move.status==='slp'))return 0;
 }
 if(fieldStatus&&move.status==='frz'&&['sunnyday','desolateland'].includes(weather))return 0;
 const types=target.getTypes(),poisonTypeImmune=['psn','tox'].includes(move.status)&&types.some(type=>type==='Poison'||type==='Steel');
 if(poisonTypeImmune&&corrosionStatus&&typeof user.hasAbility!=='function')return null;
 const immune=move.status==='brn'&&types.includes('Fire')||move.status==='par'&&types.includes('Electric')||poisonTypeImmune&&(!corrosionStatus||!user.hasAbility('corrosion'))||move.status==='frz'&&types.includes('Ice');
 return immune?0:10;
}

// Source scores a reviewed plain attack after choosing its target. Keep this
// separate from target weighting: allies invert the benefit and divide by
// effectiveness, while opponents multiply it.
export function classicAiSourcePlainMoveScore(move,context){
 const targetScore=classicAiSourceTargetScore(move,context);
 if(!context?.plainAttackStatus||!sourcePlainAttackMoves.has(move?.id)||!Number.isFinite(targetScore))return null;
 const {battle,user,target}=context,types=target.getTypes(),userTypes=user.getTypes();
 if(!Array.isArray(userTypes))return null;
 const effectiveness=battle.dex.getImmunity(move.type,types)?2**battle.dex.getEffectiveness(move.type,types):0,ally=target.side===user.side,stab=userTypes.includes(move.type);
 let score=ally?-targetScore:targetScore;
 if(ally){if(effectiveness){score/=effectiveness;if(stab)score/=1.5;}}
 else{score*=effectiveness;if(stab)score*=1.5;}
 return score===0?-20:Number.isFinite(score)?score:null;
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

// Reproduce source target-before-move draw order only when every available
// move and candidate has a reviewed source score. The battle PRNG and move
// scores are still local, so this is not complete source RNG equivalence.
export function chooseClassicSourceTargetFirst(candidates,{smart=false,randomInt,randomFraction,allowFraction=false,allowImplicit=false,filterKoBeforeTargets=false}){
 let koFiltered=false;
 if(filterKoBeforeTargets&&Array.isArray(candidates)){
  const keys=new Set(candidates.filter(c=>c.knocksOut).map(c=>c.m.slot??c.m.id));
  if(keys.size){candidates=candidates.filter(c=>keys.has(c.m.slot??c.m.id));koFiltered=true;}
 }
 if(!Array.isArray(candidates)||!candidates.length||typeof randomInt!=='function'||allowFraction&&typeof randomFraction!=='function'||candidates.some(c=>!Number.isFinite(c.score)||!(Number.isSafeInteger(c.sourceTargetScore)||allowFraction&&Number.isFinite(c.sourceTargetScore)&&Math.abs(c.sourceTargetScore)<Number.MAX_SAFE_INTEGER)||!(Number.isInteger(c.t?.target)||allowImplicit&&c.t?.target===undefined&&c.t?.side===0)||![0,1].includes(c.t?.side)))return null;
 const groups=new Map(),ids=new Map();for(const c of candidates){const key=c.m.slot??c.m.id;if(ids.has(c.m.id)&&ids.get(c.m.id)!==key)return null;ids.set(c.m.id,key);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c);}
 const pools=[];for(const targets of groups.values()){
  if(targets.some(c=>c.t.target===undefined)&&targets.length!==1)return null;
  const ranked=targets.map(candidate=>({candidate,score:candidate.sourceTargetScore*(candidate.t.side===1?-1:1)})).sort((a,b)=>b.score-a.score),low=ranked.at(-1).score,offset=low<1?1-low:0,weighted=ranked.map(x=>({...x,weight:x.score+offset})),cutoff=weighted.findIndex(x=>x.weight<weighted[0].weight/2);if(cutoff>=0)weighted.length=cutoff;
  const total=weighted.reduce((sum,x)=>sum+x.weight,0);if(!(Number.isSafeInteger(total)||allowFraction&&Number.isFinite(total)&&total<Number.MAX_SAFE_INTEGER)||total<1)return null;pools.push({weighted,total});
 }
 const selected=pools.map(({weighted,total})=>{let draw=total<=1?0:Number.isSafeInteger(total)?randomInt(total):Math.floor(randomFraction()*total);for(const item of weighted){if(draw<item.weight)return item.candidate;draw-=item.weight;}return weighted.at(-1).candidate;});
 if(selected.length===1)return selected[0];
 // A move qualifies if any target can be knocked out, even when its weighted
 // target draw selects a different opponent.
 if(koFiltered){const ranked=selected.map(c=>({...c,knocksOut:true})),choice=chooseClassicRankedMove(ranked,{smart,randomInt});return selected[ranked.indexOf(choice)];}
 return chooseClassicRankedMove(selected,{smart,randomInt});
}
