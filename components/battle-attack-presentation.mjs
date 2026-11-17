/** Presentation-only adaptations. The server's event objects are never changed. */
export function reviewedAttackKind(event){
 if(event?.kind!=='move')return '';
 return ({flamethrower:'fire-stream',hydropump:'water-stream',thunderbolt:'electric-bolt'})[event.moveId]||'';
}
export function reviewedAttackImmune(events,index){
 const move=events[index];if(!reviewedAttackKind(move)||!move.targetBoxId)return false;
 for(let i=index+1;i<events.length;i++){
  const next=events[i];if(['move','switch','faint'].includes(next.kind))break;
  if(next.kind==='immune'&&String(next.targetBoxId??next.boxId)===String(move.targetBoxId)&&next.targetSide===move.targetSide)return true;
 }
 return false;
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
