import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {adventureBattleBase,adventureBattleBaseFor,restoreAdventurePokemon} from '../lib/adventure-battle.mjs';

test('battle presentation returns to its saved baseline without losing persistent state',()=>{
 const original={...makeMon(1,50),boxId:'owned',battleAppearance:'bulbasaur',battleArtId:25,teraType:'Fire',custom:{keep:true},pp:{tackle:3}};
 const combat={adventureBattleBase:adventureBattleBase([[original]])};
 const temporary={...original,terastallized:'Fire',battleAppearance:'other',battleSprite:'other',currentTypes:['불꽃'],currentAbility:'other',hp:12,pp:{tackle:2}};
 const restored=restoreAdventurePokemon(temporary,adventureBattleBaseFor(combat,0,temporary));
 assert.equal(restored.battleAppearance,'bulbasaur');assert.equal(restored.battleArtId,25);assert.equal(restored.teraType,'Fire');
 assert.equal(restored.terastallized,undefined);assert.equal(restored.currentTypes,undefined);assert.equal(restored.battleSprite,undefined);
 assert.deepEqual(restored.custom,{keep:true});assert.equal(restored.hp,12);assert.equal(restored.pp.tackle,2);
});

test('temporary Dynamax HP returns to the same base fraction without reviving',()=>{
 const mon={...makeMon(1,50),boxId:'owned'},base=adventureBattleBase([[mon]])[0][0].fields;
 const hp=mon.maxHp*2-25,restored=restoreAdventurePokemon({...mon,dynamaxed:true,maxHp:mon.maxHp*2,hp},base);
 assert.equal(restored.hp,Math.ceil(hp/2));assert.equal(restored.maxHp,mon.maxHp);assert.equal(restored.dynamaxed,undefined);
 assert.equal(restoreAdventurePokemon({...mon,dynamaxed:true,maxHp:mon.maxHp*2,hp:0},base).hp,0);
});
