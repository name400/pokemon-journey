import test from 'node:test';
import assert from 'node:assert/strict';
import {ballMultiplier,captureAttempt,friendshipGain} from '../lib/capture.mjs';

test('adventure ball effects use turn, current type, night and capture origin',()=>{
 assert.equal(ballMultiplier('quickball',{turn:1}),5);
 assert.equal(ballMultiplier('quickball',{turn:2}),1);
 assert.equal(ballMultiplier('timerball',{turn:20}),4);
 assert.equal(ballMultiplier('netball',{types:['물']}),3.5);
 assert.equal(ballMultiplier('duskball',{night:true}),3);
 const mon={hp:50,maxHp:50,captureRate:3,types:['풀'],currentTypes:['물']};
 assert.equal(captureAttempt(mon,'netball',{},()=>.999).multiplier,3.5);
 assert.equal(captureAttempt(mon,'masterball',{},()=>.999).caught,true);
 assert.equal(friendshipGain({friendship:70,originBall:'luxuryball'},15),86);
 assert.equal(friendshipGain({friendship:255,originBall:'luxuryball'},1),255);
});

test('adventure Z-A modifiers and catalog do not change shared rogue rules',async()=>{
 const {ADVENTURE_BALLS,adventureCaptureAttempt}=await import('../lib/adventure-balls.mjs');
 const mon={hp:20,maxHp:20,captureRate:45,types:['풀']};
 const attempt=(ball,count)=>adventureCaptureAttempt(mon,ball,{moveCount:count},()=>.999);
 assert.equal(attempt('quickball',0).multiplier,3);
 assert.equal(attempt('quickball',1).multiplier,1);
 assert.equal(attempt('timerball',10).multiplier,1);
 assert.equal(attempt('timerball',11).multiplier,2);
 assert.equal(attempt('timerball',21).multiplier,3);
 assert.equal(attempt('timerball',31).multiplier,4);
 assert.equal(adventureCaptureAttempt(mon,'pokeball',{},()=>.0045).caught,false);
 assert.equal(adventureCaptureAttempt({...mon,status:'독'},'pokeball',{},()=>.0045).caught,true);
 assert.equal(adventureCaptureAttempt({...mon,status:'얼음'},'pokeball',{},()=>.007).caught,true);
 assert.equal(adventureCaptureAttempt({...mon,status:'독'},'pokeball',{},()=>.007).caught,false);
 const checks=values=>{let i=0;const result=adventureCaptureAttempt(mon,'pokeball',{},()=>values[i++]);assert.equal(i,3);return result;};
 assert.equal(checks([.999,0,.999]).caught,true);
 assert.equal(checks([.999,.999,.999]).caught,false);
 assert.equal(checks([.999,.999,.999]).shakes,3);
 assert.equal(adventureCaptureAttempt({...mon,shiny:true},'pokeball',{},()=>.01).caught,true);
 assert.equal(adventureCaptureAttempt(mon,'pokeball',{},()=>.01).caught,false);
 assert.equal(adventureCaptureAttempt({...mon,captureRate:255},'pokeball',{},()=>.999).caught,true);
 assert.throws(()=>attempt('quickball',undefined),/이전 전투/);
 assert.equal(ADVENTURE_BALLS.find(x=>x.id==='quickball').price,1000);
 assert.equal(ADVENTURE_BALLS.find(x=>x.id==='healball').price,300);
 assert.equal(ADVENTURE_BALLS.find(x=>x.id==='luxuryball').price,3000);
 assert.equal(ADVENTURE_BALLS.find(x=>x.id==='masterball').sale,false);
 assert.equal(ADVENTURE_BALLS.find(x=>x.id==='ultraball').sale,false);
 assert.equal(ballMultiplier('quickball',{turn:1}),5);
});

test('Z-A species and explicitly recorded Royale rank adjust only adventure captures',async()=>{
 const {adventureCaptureRate,adventureRankPenalty,adventureCaptureAttempt}=await import('../lib/adventure-balls.mjs');
 const beldum={speciesId:374,captureRate:3,level:16,hp:20,maxHp:20,types:['강철']};
 assert.equal(adventureCaptureRate(beldum),20);
 assert.equal(adventureCaptureRate({speciesId:25,captureRate:190}),190);
 assert.equal(adventureCaptureRate({speciesId:718,captureRate:3}),255);
 assert.equal(adventureRankPenalty('Z',15),1);assert.equal(adventureRankPenalty('Z',16),.7);
 assert.equal(adventureRankPenalty('Z',66),.1);assert.equal(adventureRankPenalty('G',26),1);
 assert.equal(adventureRankPenalty('D',51),.5);assert.equal(adventureRankPenalty('A',100),1);
 assert.equal(adventureRankPenalty(undefined,90),1);
 assert.equal(adventureCaptureAttempt(beldum,'pokeball',{},()=>.0005).caught,true);
 assert.equal(adventureCaptureAttempt(beldum,'pokeball',{royaleRank:'Z'},()=>.0005).caught,false);
 assert.equal(adventureCaptureAttempt(beldum,'pokeball',{alpha:true},()=>.0005).caught,false);
});

test('ZA back strike and unnoticed bonuses apply only outside battle',async()=>{
 const {adventureCaptureAttempt}=await import('../lib/adventure-balls.mjs');
 const m={hp:20,maxHp:20,captureRate:45,types:['노말'],level:24};const rng=()=>.004;
 assert.equal(adventureCaptureAttempt(m,'pokeball',{alpha:true},rng).caught,false);
 assert.equal(adventureCaptureAttempt(m,'pokeball',{alpha:true,unaware:true,backstrike:true},rng).caught,false);
 assert.equal(adventureCaptureAttempt(m,'pokeball',{alpha:true,overworld:true,unaware:true,backstrike:true},rng).caught,true);
});
