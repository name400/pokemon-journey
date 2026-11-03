/** A stationary field only needs repainting when something visible has changed. */
export function shouldRenderField(previous,current,moving){
 return !previous||moving||previous.moving||previous.world!==current.world||previous.width!==current.width||previous.height!==current.height||previous.images!==current.images||previous.reduced!==current.reduced||previous.night!==current.night||previous.aiming!==current.aiming;
}

/** Coalesce invalidations and request another frame only while motion continues. */
export function createFieldScheduler(requestFrame,cancelFrame,draw){
 let pending=null,disposed=false;
 const invalidate=()=>{if(!disposed&&pending===null)pending=requestFrame(frame);};
 const frame=time=>{pending=null;if(disposed)return;if(draw(time))invalidate();};
 return {invalidate,dispose(){disposed=true;if(pending!==null)cancelFrame(pending);pending=null;}};
}
