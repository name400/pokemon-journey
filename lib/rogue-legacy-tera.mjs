import { canonicalTeraType, fixedTeraType } from './tera-type.mjs';

// Recover only an unambiguous type already recorded in a finished battle.
// Never rewrite its snapshot or infer an identity from an active slot index.
export function recoverClassicLegacyBattleTera(run) {
 const c=run?.combat;
 if(!['reward','interlude','route','advance','prepared'].includes(run?.screen)||!c?.ended||!c.snapshot?.ended||run.pendingCapture||run.pendingEvolution||run.pendingMoves?.length||run.pendingGrowth?.length||!Array.isArray(run.party)||!Array.isArray(c.teams?.[0])||!Array.isArray(c.snapshot?.sides?.[0]?.pokemon))return;
 const team=c.teams[0],native=c.snapshot.sides[0].pokemon;
 run.party=run.party.map(mon=>{
  if(mon.teraType||!mon.boxId||mon.fusionSpecies||mon.rogueFormIndex||mon.mega||mon.primal||mon.ultra||mon.dynamaxed||mon.gigantamax||mon.terastallized||fixedTeraType(mon.rogueSourceId||mon.speciesId||mon.id))return mon;
  const id=String(mon.boxId),members=run.party.filter(p=>p.boxId!=null&&String(p.boxId)===id),saved=team.filter(p=>p.boxId!=null&&String(p.boxId)===id),snap=native.filter(p=>p.set?.trainerToken!=null&&String(p.set.trainerToken)===id);
  if(members.length!==1||saved.length!==1||snap.length!==1||saved[0].id!==mon.id||saved[0].fusionSpecies||saved[0].rogueFormIndex||saved[0].terastallized||snap[0].transformed)return mon;
  const type=canonicalTeraType(snap[0].set?.teraType),teamType=saved[0].teraType?canonicalTeraType(saved[0].teraType):null;
  if(!type||saved[0].teraType&&teamType!==type)return mon;
  return {...mon,teraType:type};
 });
}
