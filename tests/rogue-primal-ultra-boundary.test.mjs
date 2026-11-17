import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {classicBattleMegaOptions} from '../lib/rogue-transformations.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

for(const [id,item,native] of [[382,'blueorb','kyogreprimal'],[383,'redorb','groudonprimal']]){
 test(`${native} requires the correct owned orb and bracelet and survives a battle and reversal`,async()=>{
  const hero=makeReferenceMon(id,100,{boxId:'hero',moves:['Tackle']});hero.hp=201;
  let {doc,run,state}=fixture([hero]);run.formItemStateRule='source-v1';
  assert.equal(classicBattleMegaOptions(hero,run,state.system).length,0);
  run.formItems.hero=[item];run.formItemStates={hero:{[item]:false}};run.tools.megaBracelet=false;
  assert.equal(classicBattleMegaOptions(hero,run,state.system).length,0);
  run.tools.megaBracelet=true;
  assert.ok(classicBattleMegaOptions(hero,run,state.system).some(o=>o.battleKind==='primal'&&o.itemKey===item));
  assert.equal(!!hero.primal,false,'Eligibility must not transform a Pokémon');
  run.screen='battle';const foe=makeReferenceMon(19,1,{boxId:'foe',moves:['Splash']});foe.hp=1;
  run.combat=createClassicCombat(run,[foe],{system:state.system});run.party=run.combat.teams[0];
  const before=run.combat.requests[0].moves.find(m=>m.id==='tackle').pp;
  assert.ok(run.combat.requests[0].specials.some(s=>s.key==='primal:'+item));
  applyClassicAction(doc,{action:'turn',command:{type:'move',move:'tackle',special:'primal:'+item}});
  assert.equal(run.screen,'reward');assert.equal(run.party[0].rogueBattleSpecies,native);
  assert.equal(run.party[0].hp,201);assert.equal(run.party[0].pp.tackle,before-1);
  doc=await decodeGameData(await encodeGameData(doc));run=doc.classic.slots[0];
  assert.equal(run.formItemStates.hero[item],true);assert.equal(run.party[0].rogueBattleSpecies,native);
  applyClassicAction(doc,{action:'form',boxId:'hero',item:'reverse:'+item});
  assert.equal(run.party[0].primal,false);assert.equal(run.party[0].hp,201);
  assert.equal(run.party[0].pp.tackle,before-1);assert.equal(run.formItemStates.hero[item],false);
  assert.deepEqual(run.formItems.hero,[item]);assert.deepEqual(doc.adventure,{safe:true});
  assert.deepEqual(doc.classic.slots[1],{id:'other'});
 });
}

for(const [partner,item,origin,native] of [[791,'nsolarizer','dusk-mane','necrozmaduskmane'],[792,'nlunarizer','dawn-wings','necrozmadawnwings']]){
 test(`Necrozma ${origin} and Ultra item states round-trip independently`,async()=>{
  const hero=makeReferenceMon(800,100,{boxId:'hero',moves:['Tackle']});hero.hp=201;
  let {doc,run,state}=fixture([hero]);run.formItemStateRule='source-v1';
  run.formItems.hero=[item,'ultranecroziumz'];run.formItemStates={hero:{[item]:false,ultranecroziumz:false}};
  assert.equal(classicBattleMegaOptions(hero,run,state.system).some(o=>o.itemKey===item),false);
  state.system.dex[partner]={...state.system.dex[partner],caught:true};
  assert.ok(classicBattleMegaOptions(hero,run,state.system).some(o=>o.battleKind==='necrozma'&&o.itemKey===item));
  run.screen='battle';const foe=makeReferenceMon(19,1,{boxId:'foe',moves:['Splash']});foe.hp=1;
  run.combat=createClassicCombat(run,[foe],{system:state.system});run.party=run.combat.teams[0];
  const pp=run.combat.requests[0].moves.find(m=>m.id==='tackle').pp;
  applyClassicAction(doc,{action:'turn',command:{type:'move',move:'tackle',special:'necrozma:'+item}});
  assert.equal(run.screen,'reward');assert.equal(run.party[0].rogueFormKey,origin);assert.equal(run.party[0].rogueBattleSpecies,native);
  doc=await decodeGameData(await encodeGameData(doc));run=doc.classic.slots[0];
  applyClassicAction(doc,{action:'form',boxId:'hero',item:'ultranecroziumz'});
  assert.equal(run.party[0].rogueFormKey,'ultra');assert.equal(run.party[0].rogueUltraOrigin,origin);
  doc=await decodeGameData(await encodeGameData(doc));run=doc.classic.slots[0];
  const combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'next',moves:['Splash']})],{system:doc.classic.system});
  assert.equal(restoreClassicNativeBattle(combat,run,doc.classic.system).p1.active[0].species.id,'necrozmaultra');
  assert.equal(combat.teams[0][0].hp,201);assert.equal(combat.teams[0][0].pp.tackle,pp-1);
  applyClassicAction(doc,{action:'form',boxId:'hero',item:'reverse:ultranecroziumz'});
  assert.equal(run.party[0].rogueFormKey,origin);
  applyClassicAction(doc,{action:'form',boxId:'hero',item:'reverse:'+item});
  assert.equal(run.party[0].rogueFormIndex,0);assert.equal(run.party[0].hp,201);
  assert.equal(run.party[0].pp.tackle,pp-1);assert.deepEqual(run.formItemStates.hero,{[item]:false,ultranecroziumz:false});
  assert.deepEqual(run.formItems.hero,[item,'ultranecroziumz']);assert.deepEqual(doc.adventure,{safe:true});assert.deepEqual(doc.classic.slots[1],{id:'other'});
 });
}
