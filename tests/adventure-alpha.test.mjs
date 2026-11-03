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
