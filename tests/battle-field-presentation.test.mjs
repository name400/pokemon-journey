import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {build} from 'esbuild';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu,combatView} from '../lib/party-battle.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,classicCombatView} from '../lib/rogue-battle-engine.mjs';
import {createMission10DoubleSnapshot,playMission10MultiTurn,mission10MultiView} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
await mkdir('.sites-runtime/tests',{recursive:true});await build({entryPoints:['hooks/use-battle-playback.ts'],outfile:'.sites-runtime/tests/field-playback.mjs',bundle:true,format:'esm',platform:'node',external:['react']});const {battleDisplay,applyBattleEvent}=await import('../.sites-runtime/tests/field-playback.mjs');
const verify=(view,kind,value,moveId)=>{const index=view.events.findIndex(e=>e.kind===kind&&e[kind]===value),move=view.events.findIndex(e=>e.kind==='move'&&e.moveId===moveId);assert.ok(move>=0&&index>move,JSON.stringify(view.events));let display=battleDisplay(view,true,true);assert.equal(display[kind],'');for(let i=0;i<view.events.length;i++){display=applyBattleEvent(display,view.events[i]);if(i<index)assert.equal(display[kind],'');if(i===index)assert.equal(display[kind],value);}assert.equal(display[kind],value);assert.equal(battleDisplay(view,false,true)[kind],value);};
for(const [kind,move,eng,value] of [['weather','비바라기','raindance','raindance'],['terrain','일렉트릭필드','electricterrain','electricterrain']]){
 test(`adventure single ${kind} follows real field event and serialized restore`,()=>{const hero={...makeMon(25,50),boxId:'hero',moves:[move]},foe={...makeMon(133,80),boxId:'foe',moves:['튀어오르기']};const initial=createCombat([hero],[foe]);initial.disableCpuTera=true;const next=playCpu(initial,{type:'move',move:eng});verify(combatView(JSON.parse(JSON.stringify(next))),kind,value,eng);});
 test(`adventure double ${kind} follows real field event`,()=>{const mon=(id,boxId,m)=>({...makeMon(id,50),boxId,moves:[m]}),initial=createMission10DoubleSnapshot([mon(25,'hero',move)],[mon(155,'ally','튀어오르기')],[mon(143,'f0','튀어오르기'),mon(143,'f1','튀어오르기')]);if(kind==='weather')initial.adventureWeatherLockV1=false;const next=playMission10MultiTurn(initial,{type:'move',move:eng});verify(mission10MultiView(JSON.parse(JSON.stringify(next))),kind,value,eng);});
 test(`PokeRogue ${kind} follows real field event and serialized restore`,()=>{const hero=makeReferenceMon(25,50,{boxId:'hero',moves:[kind==='weather'?'Rain Dance':'Electric Terrain']}),foe=makeReferenceMon(133,80,{boxId:'foe',moves:['Splash']}),run={id:'field-test',wave:1,biome:0,rng:42,party:[hero],tools:{},modifiers:[],encounter:{kind:'wild'}};run.combat=createClassicCombat(run,[foe]);run.party=run.combat.teams[0];const next=playClassicCombat(run,{type:'move',move:eng});verify(classicCombatView(JSON.parse(JSON.stringify(next))),kind,value,eng);});
}
test('older snapshots keep final field state and fog remains locked',()=>{const view={teams:[[],[]],active:[0,0],weather:'raindance',terrain:'',events:[]};assert.equal(battleDisplay(view,true).weather,'raindance');const fog=battleDisplay({...view,beforeWeather:'fog',weather:'fog'},true);assert.equal(applyBattleEvent(fog,{kind:'weather',side:0,weather:'sunnyday'}).weather,'fog');});

test('new ZA multi weather lock continues to reject weather changes',()=>{const mon=(id,boxId,m)=>({...makeMon(id,50),boxId,moves:[m]}),initial=createMission10DoubleSnapshot([mon(25,'hero','비바라기')],[mon(155,'ally','튀어오르기')],[mon(143,'f0','튀어오르기'),mon(143,'f1','튀어오르기')]);const view=mission10MultiView(playMission10MultiTurn(initial,{type:'move',move:'raindance'}));assert.equal(view.weather,'');assert.equal(view.events.some(e=>e.kind==='weather'),false);assert.ok(view.events.some(e=>e.text==='하지만 실패했다!'));});

test('expired weather and terrain stay visible until their real end events',async()=>{
 const {Battle}=await import('@pkmn/sim');
 for(const [kind,value,setter] of [['weather','raindance','setWeather'],['terrain','electricterrain','setTerrain']]){
  const hero={...makeMon(25,50),boxId:'hero',moves:['튀어오르기']},foe={...makeMon(133,80),boxId:'foe',moves:['튀어오르기']},initial=createCombat([hero],[foe]),sim=Battle.fromJSON(initial.snapshot);sim.field[setter](value,sim.p1.active[0],sim.dex.moves.get(value));sim.field[kind+'State'].duration=1;initial.snapshot=sim.toJSON();initial.disableCpuTera=true;
  const view=combatView(playCpu(initial,{type:'move',move:'splash'})),index=view.events.findIndex(e=>e.kind===kind&&e[kind]==='');assert.ok(index>=0,JSON.stringify(view.events));let display=battleDisplay(view,true);assert.equal(display[kind],value);for(let i=0;i<view.events.length;i++){display=applyBattleEvent(display,view.events[i]);if(i<index)assert.equal(display[kind],value);if(i===index)assert.equal(display[kind],'');}assert.equal(view[kind],'');
 }
});

test('real paralysis and ground immunity retain event order across serialized battles in both modes',()=>{
 for(const id of [7,27]){
  // Thunder Wave can miss; retry the naturally simulated move to test its hit outcome.
  let verified=false;
  for(let attempt=0;attempt<20&&!verified;attempt++){
  const adventure=createCombat([{...makeMon(25,50),boxId:'hero',moves:['전기자석파']}],[{...makeMon(id,50),boxId:'foe',moves:['튀어오르기']}]);adventure.disableCpuTera=true;
  const a=combatView(JSON.parse(JSON.stringify(playCpu(adventure,{type:'move',move:'thunderwave'}))));
  const hero=makeReferenceMon(25,50,{boxId:'hero',moves:['Thunder Wave']}),foe=makeReferenceMon(id,50,{boxId:'foe',moves:['Splash']}),run={id:'status-test',wave:1,biome:0,rng:42,party:[hero],tools:{},modifiers:[],encounter:{kind:'wild'}};run.combat=createClassicCombat(run,[foe]);run.party=run.combat.teams[0];
  const r=classicCombatView(JSON.parse(JSON.stringify(playClassicCombat(run,{type:'move',move:'thunderwave'}))));
  if([a,r].some(view=>view.events.some(e=>e.kind==='miss'&&e.side===0)))continue;
  for(const view of [a,r]){const move=view.events.findIndex(e=>e.kind==='move'&&e.moveId==='thunderwave'),kind=id===7?'status':'immune',outcome=view.events.findIndex(e=>e.kind===kind&&e.side===1);assert.ok(move>=0&&outcome>move,JSON.stringify(view.events));assert.equal(view.events.some(e=>e.kind===(id===7?'immune':'status')&&e.side===1),false);if(id===7)assert.equal(view.events[outcome].status,'마비');}
  verified=true;
  }
  assert.ok(verified,'Thunder Wave missed in every isolated attempt');
 }
});
