import {confirmedCloudPathPrefix,predictCloudPathSteps} from './adventure-prediction.mjs';

// A local visual-only journal; it never sends or persists movement.
// Request tokens are unique for the lifetime of the journal, including reset.
export function createVisualMovementRequests(){
 let serial=0,active=null;
 const clone=value=>structuredClone(value);
 return {
  begin(world,directions,revision){
   if(active||!world||!Number.isSafeInteger(world.steps)||!Number.isSafeInteger(revision)||!Array.isArray(directions)||directions.length<1||directions.length>12)return null;
   const origin=clone(world),steps=predictCloudPathSteps(origin,directions);
   if(steps.length!==directions.length||steps.some(s=>s.predictedHazard||s.predictedTransition))return null;
   active={token:++serial,origin,revision,sentCount:steps.length,steps};
   return active.token;
  },
  append(token,directions){
   if(!active||active.token!==token||!Array.isArray(directions)||directions.length<1||active.steps.length+directions.length>24)return false;
   const tail=active.steps.at(-1),next=predictCloudPathSteps({...active.origin,...tail},directions);
   if(next.length!==directions.length||next.some(s=>s.predictedHazard||s.predictedTransition))return false;
   active.steps.push(...next);return true;
  },
  settle(token,result){
   if(!active||active.token!==token)return {kind:'ignored'};
   const current=active;active=null;
   const prefix=confirmedCloudPathPrefix(current.origin,current.steps,current.sentCount,current.revision,result);
   return prefix?{kind:'confirmed',...clone(prefix)}:{kind:'reset'};
  },
  reset(){active=null;},
  snapshot(){return active?clone({token:active.token,revision:active.revision,sentCount:active.sentCount,steps:active.steps}):null;},
 };
}
