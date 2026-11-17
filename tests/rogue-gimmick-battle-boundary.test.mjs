import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

for(const special of ['dynamax','terastallize','zmove']){
 test(`${special} battle win, saved reward and a new battle preserve damaged HP and spent PP`,async()=>{
  const hero=makeReferenceMon(151,100,{boxId:'hero',moves:['Tackle'],...(special==='zmove'?{item:'normaliumz'}:{})});
  hero.hp=201;
  const {doc,run}=fixture([hero]);
  run.screen='battle';run.tools={dynamaxBand:true,teraOrb:true,zRing:true};run.teraCharged=true;
  const foe=makeReferenceMon(19,1,{boxId:'foe',moves:['Splash']});foe.hp=1;
  run.combat=createClassicCombat(run,[foe]);
  const ppBefore=run.combat.requests[0].moves.find(m=>m.id==='tackle').pp;
  assert.ok(run.combat.requests[0].specials.some(s=>s.key===special));
  const result=applyClassicAction(doc,{action:'turn',command:{type:'move',move:'tackle',special}});
  assert.equal(run.combat.ended,true);
  assert.ok(result.finishedBattle);
  assert.equal(run.screen,'reward');
  assert.equal(run.party[0].pp.tackle,ppBefore-1);
  if(special==='dynamax'){assert.equal(run.party[0].hp,402);assert.equal(run.party[0].maxHp,hero.maxHp*2);}
  else assert.equal(run.party[0].hp,201);
  if(special==='terastallize'){assert.ok(run.party[0].terastallized);assert.equal(run.teraCharged,false);}
  if(special==='zmove')assert.equal(restoreClassicNativeBattle(run.combat,run).p1.zMoveUsed,true);
  const saved=await decodeGameData(await encodeGameData(doc));
  assert.deepEqual(saved.adventure,{safe:true});
  assert.deepEqual(saved.classic.slots[1],{id:'other'});
  const restored=saved.classic.slots[0];
  assert.equal(restored.party[0].pp.tackle,ppBefore-1);
  assert.equal(restored.party[0].hp,run.party[0].hp);
  if(special==='terastallize')assert.equal(restored.teraCharged,false);
  const next=createClassicCombat(restored,[makeReferenceMon(143,100,{boxId:'next',moves:['Splash']})]);
  assert.equal(next.teams[0][0].hp,201);
  assert.equal(next.teams[0][0].maxHp,hero.maxHp);
  assert.equal(next.teams[0][0].pp.tackle,ppBefore-1);
  assert.equal(next.teams[0][0].dynamaxed,false);
  assert.equal(next.teams[0][0].terastallized,null);
  if(special==='zmove')assert.equal(restoreClassicNativeBattle(next,restored).p1.zMoveUsed,false);
  if(special==='terastallize')assert.equal(restored.teraCharged,false,'A new fight must not recharge the orb');
 });
}
