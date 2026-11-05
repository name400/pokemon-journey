import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
const out='.sites-runtime/tests/ui-readability/long-session';await mkdir(out,{recursive:true});await build({entryPoints:['hooks/use-battle-playback.ts'],outfile:out+'/playback.mjs',bundle:true,format:'esm',platform:'node',external:['react']});
const {BattlePlaybackController}=await import('../../../'+out+'/playback.mjs');
const nativeSet=globalThis.setTimeout,nativeClear=globalThis.clearTimeout,active=new Set();let peak=0,frames=0;
globalThis.setTimeout=(fn,ms,...args)=>{const timer=nativeSet(()=>{active.delete(timer);fn(...args);},ms);active.add(timer);peak=Math.max(peak,active.size);return timer;};globalThis.clearTimeout=timer=>{active.delete(timer);return nativeClear(timer);};
try{
 const controller=new BattlePlaybackController({onFrame:frame=>{if(frame.event)frames++;},durationMs:10000,gapMs:10000});
 for(let i=0;i<200;i++){
  const old=controller.play([{side:0,kind:'move'},{side:0,kind:'damage'}],'old:'+i);
  const replacement=controller.play([],'new:'+i);assert.equal(await old,false);assert.equal(await replacement,true);assert.equal(active.size,0);
  assert.equal(await controller.play([{side:0,kind:'move'}],'new:'+i),false);
  const unmount=controller.play([{side:0,kind:'move'}],'unmount:'+i);controller.cancel();assert.equal(await unmount,false);assert.equal(active.size,0);
 }
 const result={iterations:200,eventFrames:frames,expectedEventFrames:400,peakPendingTimers:peak,remainingTimers:active.size,completedKeys:controller.completed.size,supersededKeys:controller.superseded.size};assert.equal(frames,400);assert.ok(controller.completed.size<=128);assert.ok(controller.superseded.size<=128);await writeFile(out+'/playback-lifecycle.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{globalThis.setTimeout=nativeSet;globalThis.clearTimeout=nativeClear;for(const timer of active)nativeClear(timer);}
