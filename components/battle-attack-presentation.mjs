/** Presentation-only adaptations. The server's event objects are never changed. */
export function reviewedAttackKind(event){
 if(event?.kind!=='move')return '';
 return ({flamethrower:'fire-stream',hydropump:'water-stream',thunderbolt:'electric-bolt',energyball:'grass-orb',icebeam:'ice-beam',shadowball:'ghost-orb',dragonpulse:'dragon-wave',swift:'normal-stars',brickbreak:'fighting-strikes',sludgebomb:'poison-drops',earthquake:'ground-cracks',airslash:'flying-slashes',psychic:'psychic-rings',megahorn:'bug-thrust',rockslide:'rock-fall',darkpulse:'dark-rings',flashcannon:'steel-beam',moonblast:'fairy-orb'})[event.moveId]||'';
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
/** Move an adjacent effectiveness line after its own hit. Other event order is untouched. */
export function orderReviewedBattleEvents(events){
 const ordered=[...events];
 for(let i=0;i<ordered.length-1;i++){
  const a=ordered[i],b=ordered[i+1];
  if(a?.kind==='effect'&&['효과가 굉장했다!','효과가 별로다…'].includes(a.text)&&b?.kind==='damage'&&b.hit===true&&a.targetSide===b.targetSide&&a.targetBoxId!=null&&String(a.targetBoxId)===String(b.targetBoxId)){
   ordered[i]=b;ordered[i+1]=a;i++;
  }
 }
 return ordered;
}
