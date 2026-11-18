// A save revision may change only dialogue; it must not replay the same turn.
export function classicBattlePresentationKey(run,battle){
 if(!run||!battle)return '';
 const events=battle.events||[],batch=battle.presentationBatch,id=batch?.batchId;
 const validBatch=batch?.version===1&&typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)&&Array.isArray(events)&&events.length>0&&Array.isArray(batch.eventIds)&&batch.eventIds.length===events.length&&batch.eventIds.every((eventId,index)=>eventId===`${id}:${index}`);
 return 'classic:'+run.id+':'+run.wave+':'+battle.turn+':'+JSON.stringify(events)+':'+String(battle.actionResult||'')+(validBatch?':batch:'+id:'');
}
export function classicDialoguePresentation(dialogue,battle,key,presentedKey){
 const wait=!!dialogue&&dialogue.phase!=='intro'&&!!battle&&(dialogue.phase==='outro'||battle.ended||battle.actionResult)&&!!battle.events?.length&&key!==presentedKey;
 return {visible:!!dialogue&&!wait,intro:!!dialogue&&dialogue.phase==='intro'};
}
export function classicVoucherRewardNotice(run){
 const reward=run?.lastVoucherReward;
 return reward&&reward.wave===run.wave?reward:null;
}
