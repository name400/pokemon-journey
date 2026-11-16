// Test-only client lifecycle. The server is authoritative; failed requests are
// never retried automatically because they may already have committed.
export function createAdventureClockTabClient({send,setTimer=setInterval,clearTimer=clearInterval,interval=7000}){
 let opened=false,eligible=false,owner=null,timer=null,serial=Promise.resolve(),disposed=false,epoch=0;
 const stop=()=>{if(timer!==null){clearTimer(timer);timer=null;}};
 const enqueue=work=>{serial=serial.then(work,work);return serial;};
 const close=()=>enqueue(async()=>{const lease=owner;owner=null;if(lease&&!disposed)await send('clockLeaseClose',{owner:lease.owner,generation:lease.generation});});
 const renew=()=>enqueue(async()=>{if(!eligible||disposed||!owner)return;const r=await send('clockLeaseRenew',{owner:owner.owner,generation:owner.generation});if(!r?.clockLease){owner=null;stop();return;}owner=r.clockLease;});
 return {
  setOpen(value){
   value=!!value;if(disposed||value===opened)return;opened=value;const ticket=++epoch;
   if(!value){eligible=false;stop();void close();return;}
   eligible=true;void enqueue(async()=>{if(!eligible||disposed||ticket!==epoch)return;const r=await send('clockLeaseOpen',{});if(!r?.clockLease)return;owner=r.clockLease;if(!eligible||disposed||ticket!==epoch){const lease=owner;owner=null;if(!disposed)await send('clockLeaseClose',{owner:lease.owner,generation:lease.generation});return;}timer=setTimer(()=>void renew(),interval);});
  },
  suspend(){epoch++;eligible=false;stop();void close();},
  dispose(){epoch++;disposed=true;eligible=false;stop();owner=null;}
 };
}
