import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {makeAdventureAlpha} from '../lib/adventure-alpha.mjs';
import {makeAdventureAlpha as makeCloudAdventureAlpha} from '../lib/cloud-adventure/adventure-alpha.mjs';
import {rules} from '../lib/pokemon-config.mjs';
import {adventureMoveMastered} from '../lib/cloud-adventure/adventure-plus-mastery.mjs';

test('new alpha preserves existing wild IV policy and gets 252 HP EVs at full HP',()=>{
 const base=makeMon(16,24),alpha=makeAdventureAlpha(base);
 assert.ok(Object.values(alpha.ivs).filter(value=>value===31).length>=3);
 assert.equal(alpha.evs.hp,252);assert.equal(alpha.adventureAlphaMove,'유턴');assert.equal(alpha.moves[0],'유턴');assert.equal(new Set(alpha.moves).size,alpha.moves.length);assert.ok(alpha.maxHp>base.maxHp);assert.equal(alpha.hp,alpha.maxHp);assert.equal(alpha.adventureAlpha,true);
 assert.ok(!base.moves.includes('유턴'));assert.equal(base.evs.hp,0);assert.ok(Object.values(base.ivs).every(value=>value===31));
 const cloudAlpha=makeCloudAdventureAlpha(base);
 assert.deepEqual(cloudAlpha.adventurePlusMastered,[...new Set(cloudAlpha.moves.map(name=>rules.moves[name]?.key).filter(Boolean))]);
 assert.equal(adventureMoveMastered(cloudAlpha,'uturn'),true);
 assert.equal(adventureMoveMastered({...cloudAlpha,moves:['전기쇼크']},'thundershock'),false);
 assert.equal(adventureMoveMastered({...base,moves:['유턴']},'uturn'),false);
});

test('new Spinarak alpha knows its documented special move without changing input',()=>{
 const base=makeMon(167,20),before=[...base.moves],alpha=makeAdventureAlpha(base);
 assert.equal(alpha.adventureAlphaMove,'구멍파기');assert.equal(alpha.moves[0],'구멍파기');assert.deepEqual(base.moves,before);assert.equal(alpha.evs.hp,252);
});

test('new wild alphas receive the confirmed move for their species and form',()=>{
 for(const [id,name,key] of [[69,'맹독','toxic'],[80,'냉동빔','icebeam'],[530,'기합구슬','focusblast'],[688,'시저크로스','xscissor'],[678,'10만볼트','thunderbolt'],[10025,'대지의힘','earthpower']]){
  const base=makeMon(id,35),before=JSON.stringify(base),alpha=makeCloudAdventureAlpha(base);
  assert.equal(alpha.adventureAlphaMove,name);assert.equal(alpha.moves[0],name);assert.equal(alpha.moves.filter(m=>m===name).length,1);assert.ok(alpha.adventurePlusMastered.includes(key));assert.equal(JSON.stringify(base),before);
 }
 const unknown=makeCloudAdventureAlpha(makeMon(10165,35));assert.equal(unknown.adventureAlphaMove,undefined);
});

test('captured alpha can use an initially mastered Plus move after reload',async()=>{
 const {createCombat,combatView,playCpu}=await import('../lib/party-battle.mjs');
 const caught=JSON.parse(JSON.stringify({...makeCloudAdventureAlpha(makeMon(16,24)),boxId:'caught'}));
 const foe={...makeMon(143,70),boxId:'foe',moves:['튀어오르기']};
 const legacy=createCombat([caught],[foe]),fresh={...legacy,adventurePlusGaugeV1:{charge:1,max:3}};
 assert.equal(combatView(fresh).requests[0].moves.find(m=>m.id==='uturn').plusReady,true);
 assert.throws(()=>playCpu(legacy,{type:'move',move:'유턴',plus:true}));
 const next=playCpu(fresh,{type:'move',move:'유턴',plus:true});
 assert.equal(next.adventurePlusGaugeV1.charge,0);
 assert.deepEqual(JSON.parse(JSON.stringify(next)).teams[0][0].adventurePlusMastered,caught.adventurePlusMastered);
});

test('wild alpha doubles four battle stats in the serialized battle only',async()=>{
 const {Battle,Dex}=await import('@pkmn/sim');const {createCombat,playCpu}=await import('../lib/party-battle.mjs');const {applyAdventureAlphaBattleStats}=await import('../lib/adventure-alpha.mjs');
 const own={...makeMon(1,30),boxId:'mine'},alpha={...makeAdventureAlpha(makeMon(16,24)),boxId:'wild'},combat=createCombat([own],[alpha]);
 const before=Battle.fromJSON(combat.snapshot),base={...before.p2.active[0].storedStats},ownStats={...before.p1.active[0].storedStats};
 const originalDefence=before.actions.getDamage(before.p1.active[0],before.p2.active[0],Dex.moves.get('tackle'),true);
 applyAdventureAlphaBattleStats(combat);const after=Battle.fromJSON(combat.snapshot),stats=after.p2.active[0].storedStats;
 for(const k of ['atk','def','spa','spd'])assert.equal(stats[k],base[k]*2);assert.equal(stats.spe,base.spe);assert.deepEqual(after.p1.active[0].storedStats,ownStats);
 assert.ok(after.actions.getDamage(after.p1.active[0],after.p2.active[0],Dex.moves.get('tackle'),true)<originalDefence);
 const next=playCpu(combat,{type:'move',move:combat.requests[0].moves[0].name}),continued=Battle.fromJSON(next.snapshot);
 assert.equal(continued.p2.pokemon[0].storedStats.def,base.def*2);assert.equal(next.teams[1][0].stats.def,alpha.stats.def);assert.equal(alpha.stats.def,base.def);
});
