import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {knowsAdventureMove,sameAdventureMove} from '../lib/cloud-adventure/adventure-move-identity.mjs';
import {applyAdventureLevelMoves,applyAdventureIntroStarterMoves,teachAdventureMove} from '../lib/cloud-adventure/adventure-growth.mjs';
import {canLearnStoryTm} from '../lib/cloud-adventure/adventure-story-tm.mjs';
import {canLearnResearchTm} from '../lib/cloud-adventure/adventure-research.mjs';

test('move aliases are recognized without inventing unknown IDs',()=>{
 assert.equal(sameAdventureMove('화염방사','Flamethrower'),true);assert.equal(sameAdventureMove('rocksmash','바위깨기'),true);
 assert.equal(sameAdventureMove('unknown-a','unknown-b'),false);assert.equal(sameAdventureMove('unknown-a','unknown-a'),true);
 const charizard={...makeMon(6,50),moves:['Flamethrower']},pikachu={...makeMon(25,50),moves:['thunderbolt']};
 assert.equal(canLearnStoryTm({'za-tm062':1},charizard,'za-tm062'),false);assert.equal(canLearnResearchTm({zaResearchRewards:[24]},pikachu,24),false);
 assert.equal(knowsAdventureMove(charizard,'화염방사'),true);assert.equal(knowsAdventureMove(charizard,'냉동빔'),false);
});

test('growth skips an existing alias and replacement preserves remaining PP',()=>{
 const before={...makeMon(25,19),moves:['Spark','울음소리'],pp:{spark:3,growl:7}};
 const result=applyAdventureLevelMoves(before,{...before,level:20,moves:[...before.moves],pp:{...before.pp}});
 assert.deepEqual(result.learned,[]);assert.deepEqual(result.pending,[]);assert.deepEqual(result.mon.moves,before.moves);assert.deepEqual(result.mon.pp,before.pp);
 const previous={...makeMon(6,50),moves:['Flamethrower','울음소리'],pp:{flamethrower:2,growl:3}};teachAdventureMove(previous,'할퀴기',0);assert.deepEqual(previous.pp,{growl:3});
 const duplicate={...makeMon(6,50),moves:['Flamethrower','화염방사'],pp:{flamethrower:2}};teachAdventureMove(duplicate,'할퀴기',0);assert.deepEqual(duplicate.pp,{flamethrower:2});
});

test('intro starter level six respects four move slots and old growth',()=>{
 const before={speciesId:152,level:5,moves:['몸통박치기','꼬리흔들기','울음소리','빛의장막'],pp:{}};
 const after={...before,level:6,moves:[...before.moves]};
 const result=applyAdventureIntroStarterMoves(before,after);
 assert.deepEqual(result.mon.moves,before.moves);assert.deepEqual(result.pending,['나뭇잎']);
 const legacy=applyAdventureLevelMoves(before,{...before,level:6,moves:[...before.moves]});
 assert.ok(!legacy.pending.includes('나뭇잎'));
});
