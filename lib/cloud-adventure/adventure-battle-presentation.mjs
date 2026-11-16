/** A GET restores the committed state; its saved turn events are not new actions. */
export function restoreAdventureBattlePresentation(battle){
 if(!battle||!Array.isArray(battle.events)||battle.events.length===0)return battle;
 return {...battle,events:[]};
}
