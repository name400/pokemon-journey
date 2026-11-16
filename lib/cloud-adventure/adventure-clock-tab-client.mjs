// Test-only client lifecycle. Retry once only after a server-confirmed
// pre-commit revision conflict; uncertain network failures are never retried.
export function createAdventureClockTabClient({send,setTimer=setInterval,clearTimer=clearInterval,interval=7000}){
 let opened=false,eligible=false,owner=null,timer=null,serial=Promise.resolve(),disposed=false,epoch=0;
 const stop=()=>{if(timer!==null){clearTimer(timer);timer=null;}};
 const enqueue=work=>{serial=serial.then(work,work);return serial;};
 const request=async(action,extra,canRetry=()=>true)=>{const r=await send(action,extra);if(!r?.clockRevisionConflict||disposed||!canRetry())return r;return send(action,action==='clockLeaseOpen'?{...extra,sinceRevision:r.issuedRevision}:extra);};
 const close=()=>enqueue(async()=>{const lease=owner;owner=null;if(lease&&!disposed)await request('clockLeaseClose',{owner:lease.owner,generation:lease.generation});});
 const renew=()=>enqueue(async()=>{if(!eligible||disposed||!owner)return;const r=await request('clockLeaseRenew',{owner:owner.owner,generation:owner.generation},()=>eligible);if(!r?.clockLease){owner=null;stop();return;}owner=r.clockLease;});
 return {
  setOpen(value){
   value=!!value;if(disposed||value===opened)return;opened=value;const ticket=++epoch;
   if(!value){eligible=false;stop();void close();return;}
   eligible=true;void enqueue(async()=>{if(!eligible||disposed||ticket!==epoch)return;const r=await request('clockLeaseOpen',{},()=>eligible&&ticket===epoch);if(!r?.clockLease)return;owner=r.clockLease;if(!eligible||disposed||ticket!==epoch){const lease=owner;owner=null;if(!disposed)await request('clockLeaseClose',{owner:lease.owner,generation:lease.generation});return;}timer=setTimer(()=>void renew(),interval);});
  },
  suspend(){epoch++;eligible=false;stop();void close();},
  dispose(){epoch++;disposed=true;eligible=false;stop();owner=null;}
 };
}
