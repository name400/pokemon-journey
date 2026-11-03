import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {adventureEvolutionAbility,evolveAdventurePokemon} from '../lib/adventure-evolution.mjs';
import {applyAdventureEvolutionMoves} from '../lib/adventure-growth.mjs';

test('evolution maps regular and hidden abilities to the target species slot',()=>{
 const eevee=makeMon(133,20);
 assert.equal(adventureEvolutionAbility({...eevee,ability:'anticipation'},134),'hydration');
 assert.equal(adventureEvolutionAbility({...eevee,ability:'runaway'},134),'waterabsorb');
 assert.equal(adventureEvolutionAbility({...eevee,ability:'adaptability'},134),'waterabsorb');
 assert.equal(adventureEvolutionAbility({...makeMon(129,20),ability:'rattled'},130),'moxie');
});

test('manual evolution preserves ownership and damage while updating species and ability',()=>{
 const mon={...makeMon(129,20),boxId:'owned',ability:'rattled',hp:5,shiny:true,teraType:'Fire',status:'독',item:'leftovers',experience:21,pp:{splash:2},walkSteps:500,custom:{keep:true},battleAppearance:'magikarp',battleArtId:129};
 const next=evolveAdventurePokemon(mon,130);
 assert.equal(next.id,130);assert.equal(next.boxId,'owned');assert.equal(next.ability,'moxie');
 assert.equal(next.hp,Math.max(1,mon.hp+next.maxHp-mon.maxHp));assert.equal(next.status,'독');
 assert.deepEqual(next.ivs,mon.ivs);assert.deepEqual(next.evs,mon.evs);assert.deepEqual(next.pp,mon.pp);assert.deepEqual(next.moves,mon.moves);
 assert.equal(next.shiny,true);assert.equal(next.teraType,'Fire');assert.equal(next.item,'leftovers');assert.equal(next.walkSteps,500);assert.equal(next.experience,21);assert.deepEqual(next.custom,{keep:true});assert.equal(next.battleAppearance,undefined);
 assert.equal(evolveAdventurePokemon({...mon,hp:0},130).hp,0);
});

test('evolution moves fill vacancies or wait for a choice when full',()=>{
 const evolved=evolveAdventurePokemon({...makeMon(129,20),boxId:'owned'},130);
 const automatic=applyAdventureEvolutionMoves(evolved);assert.deepEqual(automatic.learned,['물기']);assert.deepEqual(automatic.pending,[]);
 const full={...evolveAdventurePokemon({...makeMon(129,20),boxId:'owned'},130),moves:['튀어오르기','몸통박치기','발버둥','울음소리']};
 const choice=applyAdventureEvolutionMoves(full);assert.deepEqual(choice.learned,[]);assert.deepEqual(choice.pending,['물기']);assert.equal(choice.mon.moves.length,4);
});
