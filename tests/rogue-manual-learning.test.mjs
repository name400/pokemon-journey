import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {moves} from '../lib/game.mjs';
import {makeReferenceMon,rogueSpecies,sourceMove} from '../lib/rogue-reference.mjs';
import {chooseClassicReward} from '../lib/rogue-classic-rewards.mjs';
import {classicRelearnMoves,restoreClassicParty} from '../lib/rogue-classic-services.mjs';
const fresh=()=>makeReferenceMon(1,50,{boxId:'learner',moves:['몸통박치기']});
const mon=fresh(),record=rogueSpecies.get(1);
const tm=record.tms.map(sourceMove).find(name=>name&&!mon.moves.includes(name)&&Dex.moves.get(moves[name]?.key||name).exists);
assert.ok(tm,'test fixture must find an eligible TM');const tier=Math.min(2,Math.floor((Dex.moves.get(moves[tm]?.key||tm).basePower||0)/60));
function rewardRun(p){return {screen:'reward',wave:5,party:[p],modifiers:[],tools:{},balls:{},rewards:[{rewardId:'tm-test',id:'tm'+tier,name:'기술머신',effect:'tm',target:true,tier,moveName:tm}]};}
let run=rewardRun(mon);chooseClassicReward(run,{rewardId:'tm-test',boxId:'learner'},{});assert.deepEqual(mon.moves,['몸통박치기',tm]);
const full=fresh();full.moves=['몸통박치기','울음소리','덩굴채찍','성장'].filter(name=>name!==tm);while(full.moves.length<4)full.moves.push('독가루');run=rewardRun(full);assert.throws(()=>chooseClassicReward(run,{rewardId:'tm-test',boxId:'learner'},{}),/자리/);assert.equal(full.moves.length,4);chooseClassicReward(run,{rewardId:'tm-test',boxId:'learner',replaceIndex:1},{});assert.equal(full.moves[1],tm);
const remember=fresh(),learnable=classicRelearnMoves(remember);assert.ok(learnable.length);const relearned=restoreClassicParty([remember],'memorymushroom',{boxId:'learner',moveName:learnable[0]})[0];assert.deepEqual(relearned.moves,['몸통박치기',learnable[0]]);
const fullMemory=fresh();fullMemory.moves=['몸통박치기','울음소리','덩굴채찍','성장'];const remembered=classicRelearnMoves(fullMemory)[0];assert.ok(remembered);assert.throws(()=>restoreClassicParty([fullMemory],'memorymushroom',{boxId:'learner',moveName:remembered}),/자리/);assert.equal(restoreClassicParty([fullMemory],'memorymushroom',{boxId:'learner',moveName:remembered,replaceIndex:2})[0].moves[2],remembered);
console.log('TM and remembered moves fill an empty slot without replacement; full move sets require a choice.');
