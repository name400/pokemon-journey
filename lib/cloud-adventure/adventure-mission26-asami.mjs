// Only classify an identifiable direct hit. Residual damage and other unclear
// finishes return null and retain the legacy Mega-seen rule.
export function asamiMegaFinalHit(combat){
 if(!combat?.ended||combat.winner!==0||!Array.isArray(combat.events)||!Array.isArray(combat.before?.[0]))return null;
 const events=combat.events;
 const faintIndex=events.findLastIndex(e=>e.kind==='faint'&&(e.targetSide??e.side)===1);
 if(faintIndex<0)return null;
 const faint=events[faintIndex],target=faint.targetBoxId??faint.boxId;if(typeof target!=='string')return null;
 let damageIndex=-1;
 for(let i=faintIndex-1;i>=0;i--){const e=events[i];if(e.kind==='damage'&&(e.targetSide??e.side)===1&&(e.targetBoxId??e.boxId)===target&&e.hp===0){damageIndex=i;break;}}
 if(damageIndex<0)return null;
 const damage=events[damageIndex];if(damage.hit!==true||typeof damage.actorBoxId!=='string')return null;
 const actor=combat.before[0].find(m=>m.boxId===damage.actorBoxId);if(!actor)return null;
 let mega=actor.mega===true;
 for(let i=0;i<damageIndex;i++){const e=events[i];if(e.kind==='form'&&(e.targetSide??e.side)===0&&(e.targetBoxId??e.boxId)===actor.boxId&&typeof e.pokemon?.mega==='boolean')mega=e.pokemon.mega;}
 return mega;
}
