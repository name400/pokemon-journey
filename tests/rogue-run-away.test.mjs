import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,attemptClassicEscape} from '../lib/rogue-battle-engine.mjs';
const ivs={hp:10,atk:10,def:10,spa:10,spd:10,spe:10};
function fixture({ability='runaway',passive=null,foeAbility='runaway',boss=false}={}){
 const hero=makeReferenceMon(151,40,{boxId:'hero',ability,ivs,nature:'hardy',moves:['Splash']});if(passive)hero.roguePassiveAbility=passive;
 const foe=makeReferenceMon(151,40,{boxId:'enemy',ability:foeAbility,ivs,nature:'hardy',moves:['Splash'],rogueBoss:boss,rogueBossSegments:boss?2:0});
 const run={id:'escape-source',wave:22,biome:1,rng:42,party:[hero],modifiers:[],tools:{},balls:{},encounter:{kind:'wild'},escapeAttempts:0};
 run.combat=createClassicCombat(run,[foe]);run.party=run.combat.teams[0];return run;
}
test('source escape uses permanent Speed despite rank changes, paralysis and Tailwind',()=>{
 for(const mode of ['boost','paralysis','tailwind']){
  const run=fixture({ability:'pressure'}),b=restoreClassicNativeBattle(run.combat,run);
  if(mode==='boost')b.p1.active[0].boosts.spe=6;
  if(mode==='paralysis')b.p1.active[0].setStatus('par');
  if(mode==='tailwind')b.p1.addSideCondition('tailwind',b.p1.active[0],b.dex.moves.get('tailwind'));
  run.combat.snapshot=snapshotClassicNativeBattle(b);
  assert.equal(attemptClassicEscape(run,{rng:()=>.27}).escaped,true,mode);
  run.escapeAttempts=0;assert.equal(attemptClassicEscape(run,{rng:()=>.28}).escaped,false,mode);
 }
});
test('Transform does not replace the permanent Speed used for escaping',()=>{
 const run=fixture({ability:'pressure'}),foe=makeReferenceMon(213,40,{boxId:'slow-foe',ability:'runaway',ivs,nature:'hardy',moves:['Splash']});
 run.combat=createClassicCombat(run,[foe]);run.party=run.combat.teams[0];
 const b=restoreClassicNativeBattle(run.combat,run),hero=b.p1.active[0];assert.equal(hero.transformInto(b.p2.active[0]),true);
 assert.ok(hero.baseStoredStats.spe>hero.storedStats.spe*4);run.combat.snapshot=snapshotClassicNativeBattle(b);
 assert.equal(attemptClassicEscape(run,{rng:()=>.94}).escaped,true);
});
test('source escape boss caps and repeated-attempt bonuses remain distinct',()=>{
 const run=fixture({ability:'pressure',boss:true});
 assert.equal(attemptClassicEscape(run,{rng:()=>.079}).escaped,true);
 run.escapeAttempts=0;assert.equal(attemptClassicEscape(run,{rng:()=>.08}).escaped,false);
 run.escapeAttempts=100;assert.equal(attemptClassicEscape(run,{rng:()=>.25}).escaped,false);
 const ordinary=fixture({ability:'pressure'});ordinary.escapeAttempts=100;assert.equal(attemptClassicEscape(ordinary,{rng:()=>.95}).escaped,false);
});
test('a passive trap blocks escape, while Run Away still bypasses it',()=>{
 const run=fixture({ability:'pressure'});run.combat.teams[1][0].roguePassiveAbility='shadowtag';
 run.combat=createClassicCombat(run,run.combat.teams[1]);run.party=run.combat.teams[0];
 assert.throws(()=>attemptClassicEscape(run,{rng:()=>0}),/붙잡혀/);
 const bypass=fixture({ability:'pressure',passive:'runaway',foeAbility:'shadowtag'});
 assert.equal(attemptClassicEscape(bypass,{rng:()=>.999}).escaped,true);
});
