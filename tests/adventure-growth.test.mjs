import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {configure} from '../lib/pokemon-config.mjs';
import {applyAdventureLevelMoves,teachAdventureMove} from '../lib/adventure-growth.mjs';

test('teaching one move preserves other PP and initializes only the new move',()=>{
 const mon={moves:['몸통박치기','울음소리'],pp:{tackle:3,growl:9,vinewhip:1,legacy:2}};
 teachAdventureMove(mon,'덩굴채찍',1);
 assert.deepEqual(mon.moves,['몸통박치기','덩굴채찍']);
 assert.deepEqual(mon.pp,{tackle:3,legacy:2});
});

test('new level moves fill empty slots in order and leave full slots for choice',()=>{
 const before={...makeMon(1,14),moves:['몸통박치기','울음소리','덩굴채찍'],pp:{tackle:3,poisonpowder:0}};
 const after=configure({...before},{level:15,hp:before.hp});
 const result=applyAdventureLevelMoves(before,after);
 assert.deepEqual(result.learned,['독가루']);assert.deepEqual(result.pending,['수면가루']);
 assert.deepEqual(result.mon.moves,['몸통박치기','울음소리','덩굴채찍','독가루']);
 assert.equal(result.mon.pp.tackle,3);assert.equal(result.mon.pp.poisonpowder,undefined);
 const next=configure({...result.mon},{level:16,hp:result.mon.hp});
 const repeat=applyAdventureLevelMoves(result.mon,next);
 assert.deepEqual(repeat.learned,[]);assert.deepEqual(repeat.pending,[]);
});
