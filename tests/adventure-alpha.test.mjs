import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {makeAdventureAlpha} from '../lib/adventure-alpha.mjs';

test('new alpha preserves existing wild IV policy and gets 252 HP EVs at full HP',()=>{
 const base=makeMon(16,24),alpha=makeAdventureAlpha(base);
 assert.ok(Object.values(alpha.ivs).filter(value=>value===31).length>=3);
 assert.equal(alpha.evs.hp,252);assert.ok(alpha.maxHp>base.maxHp);assert.equal(alpha.hp,alpha.maxHp);assert.equal(alpha.adventureAlpha,true);
 assert.equal(base.evs.hp,0);assert.ok(Object.values(base.ivs).every(value=>value===31));
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
