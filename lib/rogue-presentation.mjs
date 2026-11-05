// A save revision may change only dialogue; it must not replay the same turn.
export function classicBattlePresentationKey(run,battle){return run&&battle?'classic:'+run.id+':'+run.wave+':'+battle.turn+':'+JSON.stringify(battle.events||[])+':'+String(battle.actionResult||''):'';}
export function classicDialoguePresentation(dialogue,battle,key,presentedKey){
 const wait=!!dialogue&&dialogue.phase!=='intro'&&!!battle&&(dialogue.phase==='outro'||battle.ended||battle.actionResult)&&!!battle.events?.length&&key!==presentedKey;
 return {visible:!!dialogue&&!wait,intro:!!dialogue&&dialogue.phase==='intro'};
}
