import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon,moves} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
import {INFINITE_GRISELLE,INFINITE_FOLLOWUPS,infiniteRewardTeam,infiniteTrainerBattleTeam,infiniteTrainerVerified} from '../lib/cloud-adventure/adventure-infinite-royale.mjs';

const cases=[
 [INFINITE_FOLLOWUPS.find(t=>t.id==='infinite-tarragon'),'excadrite','excadrillmega',[73,73,73,73,75]],
 [INFINITE_FOLLOWUPS.find(t=>t.id==='infinite-lebanne'),'dragalgite','dragalgemega',[73,73,73,73,74]],
 [INFINITE_FOLLOWUPS.find(t=>t.id==='infinite-philippe'),'skarmorite','skarmorymega',[73,73,73,73,74]],
 [INFINITE_FOLLOWUPS.find(t=>t.id==='infinite-grisham'),'charizarditex','charizardmegax',[74,74,74,75,75,76]],
 [INFINITE_GRISELLE,'pyroarite','pyroarmega',[73,73,74,74,75]],
 [INFINITE_FOLLOWUPS.find(t=>t.id==='infinite-lida'),'starminite','starmiemega',[73,73,73,73,74]],
 [INFINITE_FOLLOWUPS.find(t=>t.id==='infinite-naveen'),'scraftinite','scraftymega',[73,73,73,73,74]],
 [INFINITE_FOLLOWUPS.find(t=>t.id==='infinite-emma'),'malamarite','malamarmega',[74,74,74,74,74,75]],
];
test('verified Infinite Royale opponents have available moves and Mega Stones at both stages',()=>{
 for(const [trainer,item,appearance,levels] of cases){
  const initial=infiniteTrainerBattleTeam(infiniteRewardTeam({zaInfiniteRewardWins:2},trainer));
  assert.deepEqual(initial.map(p=>[p.id,p.level]),trainer.team);assert.equal(initial.at(-1).item,item);assert.ok(initial.slice(0,-1).every(p=>!p.item));assert.ok(initial.every(p=>p.moves.every(m=>Object.hasOwn(moves,m))));assert.ok(infiniteTrainerVerified(trainer.id));if(trainer.id==='infinite-griselle')assert.deepEqual(initial[3].moves,['불릿펀치','사이코커터','지진','냉동펀치']);if(trainer.id==='infinite-lida')assert.deepEqual(initial.at(-1).moves,['사념의박치기','아쿠아브레이크','벌크업','눈보라']);if(trainer.id==='infinite-naveen')assert.deepEqual(initial[3].moves,['킹실드','섀도볼','러스터캐논','인파이트']);if(trainer.id==='infinite-emma')assert.deepEqual(initial[4].moves,['불릿펀치','신속','그로우펀치','스톤에지']);if(trainer.id==='infinite-tarragon')assert.deepEqual(initial.at(-1).moves,['칼춤','아이언헤드','드릴라이너','메가혼']);if(trainer.id==='infinite-lebanne')assert.deepEqual(initial.at(-1).moves,['오물폭탄','용의파동','하이드로펌프','방어']);if(trainer.id==='infinite-philippe')assert.deepEqual(initial[3].moves,['회복봉인','매지컬샤인','러스터캐논','빛의장막']);if(trainer.id==='infinite-grisham')assert.deepEqual(initial.at(-1).moves,['플레어드라이브','에어슬래시','드래곤다이브','방어']);
  const rematch=infiniteTrainerBattleTeam(infiniteRewardTeam({zaInfiniteRewardWins:20,zaMission42Complete:true},trainer));assert.deepEqual(rematch.map(p=>p.level),levels);assert.deepEqual(rematch.map(p=>p.moves),initial.map(p=>p.moves));
  const own={...makeMon(150,100),boxId:'own',moves:['방어'],pp:{}};const result=playCpu(JSON.parse(JSON.stringify(createCombat([own],[initial.at(-1)]))),{type:'move',move:'방어'});assert.equal(result.teams[1][0].battleAppearance,appearance,trainer.id);
 }
});
test('unverified opponents retain their existing generated team',()=>{
 const trainer=INFINITE_FOLLOWUPS.find(t=>t.id==='infinite-yvon');assert.equal(infiniteTrainerVerified(trainer.id),false);assert.equal(infiniteTrainerBattleTeam(trainer).at(-1).item,'sitrusberry');
});
