/** Presentation-only adaptations. The server's event objects are never changed. */
export function reviewedAttackKind(event){
 if(event?.kind!=='move')return '';
 return ({flamethrower:'fire-stream',hydropump:'water-stream',thunderbolt:'electric-bolt',energyball:'grass-orb',icebeam:'ice-beam',shadowball:'ghost-orb',dragonpulse:'dragon-wave',swift:'normal-stars',brickbreak:'fighting-strikes',sludgebomb:'poison-drops',earthquake:'ground-cracks',airslash:'flying-slashes',psychic:'psychic-rings',megahorn:'bug-thrust',rockslide:'rock-fall',darkpulse:'dark-rings',flashcannon:'steel-beam',moonblast:'fairy-orb'})[event.moveId]||'';
}
/** Only animate a Z dash when this action actually hit its declared opponent. */
export function confirmedZDash(events,index){
 const move=events[index];if(move?.kind!=='move'||move.moveId!=='breakneckblitz'||move.actorBoxId==null||move.targetBoxId==null||move.side===move.targetSide)return false;
 for(let i=index+1;i<events.length;i++){
  const event=events[i];if(['move','switch','faint'].includes(event.kind))break;
  if(event.kind==='damage'&&event.hit===true&&event.moveId===move.moveId&&event.actorBoxId===move.actorBoxId&&event.targetSide===move.targetSide&&String(event.targetBoxId)===String(move.targetBoxId))return true;
 }
 return false;
}
export function reviewedAttackImmune(events,index){
 const move=events[index];if(!reviewedAttackKind(move)||!move.targetBoxId)return false;
 for(let i=index+1;i<events.length;i++){
  const next=events[i];if(['move','switch','faint'].includes(next.kind))break;
  if(next.kind==='immune'&&String(next.targetBoxId??next.boxId)===String(move.targetBoxId)&&next.targetSide===move.targetSide)return true;
 }
 return false;
}
/** Collect only confirmed recipients of this action, preserving event order.
 * The simulator's move target can be the last recipient of a spread attack. */
export function reviewedAttackTargets(events,index){
 const move=events[index];if(!reviewedAttackKind(move))return [];
 const targets=[];
 for(let i=index+1;i<events.length;i++){
  const event=events[i];if(event.kind==='move'||event.kind==='switch')break;
  const direct=event.kind==='damage'&&event.hit===true&&event.moveId===move.moveId||event.kind==='immune'||event.kind==='miss';
  const id=event.targetBoxId??event.boxId,side=event.targetSide;
  if(!direct||event.actorBoxId!==move.actorBoxId||id==null||(side!==0&&side!==1))continue;
  const prior=targets.find(target=>target.side===side&&target.boxId===String(id));
  if(prior){if(event.kind==='immune')prior.immune=true;continue;}
  targets.push({side,boxId:String(id),immune:event.kind==='immune'});
 }
 if(!targets.length&&move.targetBoxId!=null&&(move.targetSide===0||move.targetSide===1))targets.push({side:move.targetSide,boxId:String(move.targetBoxId),immune:reviewedAttackImmune(events,index)});
 return targets;
}
/** Place effectiveness after its matching hit, including confirmed spread hits. */
export function orderReviewedBattleEvents(events){
 const ordered=[...events];
 for(let i=0;i<ordered.length-1;){
  const a=ordered[i];if(a?.kind!=='effect'||!['효과가 굉장했다!','효과가 별로다…'].includes(a.text)||a.targetBoxId==null){i++;continue;}
  let start=i-1;while(start>=0&&!['move','switch','faint'].includes(ordered[start]?.kind))start--;
  const action=ordered[start];let end=i+1;while(end<ordered.length&&!['move','switch','faint'].includes(ordered[end]?.kind))end++;
  const hits=ordered.slice(i+1,end).filter(e=>e.kind==='damage'&&e.hit===true);
  const match=hits.find(e=>e.targetSide===a.targetSide&&e.targetBoxId!=null&&String(e.targetBoxId)===String(a.targetBoxId));
  const index=match?ordered.indexOf(match,i+1):-1;
  const spread=reviewedAttackKind(action)&&action.actorBoxId!=null&&ordered.slice(start+1,end).some(e=>e.kind==='damage'&&e.hit===true&&e.actorBoxId===action.actorBoxId&&e.moveId===action.moveId&&(e.targetSide!==a.targetSide||String(e.targetBoxId)!==String(a.targetBoxId)));
  if(index===i+1||index>i+1&&spread&&match.actorBoxId===action.actorBoxId&&match.moveId===action.moveId){ordered.splice(i,1);ordered.splice(index,0,a);continue;}
  i++;
 }
 return ordered;
}
