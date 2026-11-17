import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {build} from 'esbuild';
await mkdir('.sites-runtime/tests',{recursive:true});
await build({entryPoints:['hooks/use-battle-playback.ts'],outfile:'.sites-runtime/tests/reload-presentation-safety.mjs',bundle:true,format:'esm',platform:'node',external:['react']});
const {BattlePlaybackController}=await import('../.sites-runtime/tests/reload-presentation-safety.mjs');
const events=[{side:0,kind:'switch',text:'entry'},{side:1,kind:'move',text:'move'}];
for(const [name,options] of [['reduced motion',{reducedMotion:()=>true}],['disabled animations',{enabled:()=>false}],['zero playback budget',{maxDurationMs:0}]])test(`${name} completion is not proof that events were displayed`,async()=>{
 const frames=[];const playback=new BattlePlaybackController({onFrame:frame=>frames.push(frame),durationMs:1,...options});
 assert.equal(await playback.play(events,name),true);
 assert.equal(frames.filter(frame=>frame.event).length,0);
});
test('cancellation does not prove playback and permits a subsequent replay',async()=>{
 const frames=[];const playback=new BattlePlaybackController({onFrame:frame=>frames.push(frame),durationMs:100});
 const pending=playback.play(events,'reload');playback.cancel();assert.equal(await pending,false);
 assert.equal(await playback.play(events,'reload'),true);
 assert.ok(frames.filter(frame=>frame.event).length>=events.length);
});
