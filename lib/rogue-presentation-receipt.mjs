/** Evidence for one playback attempt. This is deliberately separate from the
 * completion used to unlock dialogue: completion can also mean skipped. */
export class PresentationReceipt {
 constructor(key,eventCount){this.key=key;this.eventCount=eventCount;this.painted=new Map();this.completed=new Set();this.invalid=false;}
 invalidate(){this.invalid=true;}
 paint(index,frameKey){if(this.invalid||!Number.isInteger(index)||index<0||index>=this.eventCount||!frameKey)return;if(this.painted.get(index)!==frameKey)this.completed.delete(index);this.painted.set(index,frameKey);}
 complete(index,frameKey){if(!this.invalid&&frameKey&&this.painted.has(index)&&this.painted.get(index)===frameKey)this.completed.add(index);}
 snapshot(){return {version:1,key:this.key,complete:!this.invalid&&this.eventCount>0&&this.completed.size===this.eventCount,events:[...this.completed].sort((a,b)=>a-b)};}
}
