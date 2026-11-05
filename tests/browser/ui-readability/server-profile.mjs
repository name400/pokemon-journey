// Local synthetic controller/codec timings. No account, DB or production calls.
import {createFixture} from './fixture.mjs';
import {applyClassicAction,classicGameView,activeClassicRun} from '../../../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../../../lib/game-storage.mjs';

const results=[];
for(const scenario of ['single-layout','double-layout']){
 let document=createFixture(scenario);const rows=[];
 for(let i=0;i<20;i++){
  const run=activeClassicRun(document),actors=run.combat.requests[0].actors.filter(a=>a.kind==='move');
  const command=actors.length>1?{type:'turn',actions:actors.map(a=>({actor:a.slot,type:'move',move:'splash'}))}:{type:'move',move:'splash'};
  const t0=performance.now();applyClassicAction(document,{action:'turn',command});const t1=performance.now();
  const encoded=await encodeGameData(document),t2=performance.now(),view=classicGameView(document),t3=performance.now(),json=JSON.stringify(view),t4=performance.now();
  document=await decodeGameData(encoded);const t5=performance.now();
  rows.push({turn:i+1,action:t1-t0,encode:t2-t1,view:t3-t2,json:t4-t3,decode:t5-t4,responseBytes:Buffer.byteLength(json),encodedBytes:Buffer.byteLength(encoded),total:t5-t0});
 }
 const summary=Object.fromEntries(['action','encode','view','json','decode','total','responseBytes','encodedBytes'].map(key=>{
  const values=rows.map(row=>row[key]).sort((a,b)=>a-b);return [key,{p50:values[9],p95:values[18],max:values[19]}];
 }));
 results.push({scenario,turns:rows.length,summary,first:rows[0],last:rows.at(-1)});
}
console.log(JSON.stringify({environment:'Local Node, synthetic real controller + codec; no DB, network or browser',results},null,2));
