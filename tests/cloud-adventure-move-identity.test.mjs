import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {knowsAdventureMove,sameAdventureMove} from '../lib/cloud-adventure/adventure-move-identity.mjs';
import {applyAdventureLevelMoves,applyAdventureIntroStarterMoves,adventureLearnableMoves,teachAdventureMove} from '../lib/cloud-adventure/adventure-growth.mjs';
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

test('starter move relearning respects identity, level and old saves',()=>{
 const starter={...makeMon(152,6),boxId:'starter-1',origin:'starter'};
 const world={zaIntroStarterMovesV1:true,zaIntroStarterBoxId:'starter-1'};
 assert.ok(adventureLearnableMoves(starter,world).includes('나뭇잎'));
 assert.ok(adventureLearnableMoves(starter,world).includes('꼬리흔들기'));
 assert.ok(!adventureLearnableMoves({...starter,level:5},world).includes('나뭇잎'));
 assert.ok(!adventureLearnableMoves({...starter,boxId:'other'},world).includes('나뭇잎'));
 assert.ok(!adventureLearnableMoves(starter,{}).includes('나뭇잎'));
 assert.ok(adventureLearnableMoves(starter,{zaIntroStarterMovesV1:true,zaIntroStarterSpecies:152}).includes('나뭇잎'));
});

test('intro starters gain confirmed early Z-A moves while preserving legacy saves and move slots',()=>{
 for(const [speciesId,from,to,name] of [[152,8,9,'차밍보이스'],[152,13,14,'씨뿌리기'],[158,14,15,'거품광선'],[498,14,15,'화염바퀴']]){
  const mon={...makeMon(speciesId,from),origin:'starter',boxId:'chosen',moves:['몸통박치기','꼬리흔들기','방어','빛의장막'],pp:{tackle:3}};
  const next={...mon,level:to,moves:[...mon.moves],pp:{...mon.pp}},world={zaIntroStarterMovesV1:true,zaIntroStarterBoxId:'chosen'};
  const result=applyAdventureLevelMoves(mon,next,world);assert.ok(result.pending.includes(name),`${speciesId}: ${name}`);assert.deepEqual(result.mon.moves,mon.moves);assert.deepEqual(result.mon.pp,mon.pp);
  assert.ok(adventureLearnableMoves({...mon,level:to},world).includes(name));assert.ok(!adventureLearnableMoves({...mon,level:from},world).includes(name)||name==='씨뿌리기');
  const wrong={...world,zaIntroStarterBoxId:'other'},legacy=applyAdventureLevelMoves(mon,{...mon,level:to,moves:[...mon.moves]},wrong);assert.ok(!legacy.pending.includes(name));
 }
 const mon={...makeMon(152,8),origin:'starter',boxId:'chosen',moves:['몸통박치기'],pp:{tackle:3}},world={zaIntroStarterMovesV1:true,zaIntroStarterBoxId:'chosen'};
 const next=applyAdventureLevelMoves(mon,{...mon,level:9,moves:[...mon.moves]},world);assert.ok(next.learned.includes('차밍보이스'));assert.equal(next.mon.pp.tackle,3);
});
