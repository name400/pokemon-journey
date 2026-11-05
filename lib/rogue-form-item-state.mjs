export const CLASSIC_FORM_ITEM_STATE_RULE='source-v1';
export const classicTracksFormItems=run=>run?.formItemStateRule===CLASSIC_FORM_ITEM_STATE_RULE;
// Ownership remains in formItems. Never discard unknown state or silently turn
// an ambiguous record into an active item.
export function readClassicFormItemStates(run,boxId,owned,inferred={}){
 if(run.formItemStates!=null&&(typeof run.formItemStates!=='object'||Array.isArray(run.formItemStates)))throw Error('폼 도구 활성 기록을 확인하세요.');
 const record=run.formItemStates?.[boxId];
 if(record!=null&&(typeof record!=='object'||Array.isArray(record)||Object.entries(record).some(([key,value])=>!owned.includes(key)||typeof value!=='boolean')))throw Error('폼 도구 활성 기록을 확인하세요.');
 return Object.fromEntries(owned.map(key=>[key,record&&Object.hasOwn(record,key)?record[key]:!!inferred[key]]));
}
export function writeClassicFormItemStates(run,boxId,states){run.formItemStates={...(run.formItemStates||{}),[boxId]:{...states}};}
export function discardClassicFormItemStates(run,boxId){if(run.formItemStates)delete run.formItemStates[boxId];}
