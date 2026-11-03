import test from 'node:test';import assert from 'node:assert/strict';
import {arenaProgress,arenaTrainer,awardArenaWin} from '../lib/adventure-arena.mjs';
import {trainerTeam} from '../lib/campaign.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
import {makeMon,moves,effectiveness} from '../lib/game.mjs';
import {configure} from '../lib/pokemon-config.mjs';

test('a fresh isolated test party can complete all 75 Z-to-A battles', {timeout:120000},()=>{
 const world={},ids=[150,384,493,383,382,483];let totalTurns=0;
 for(let match=0;match<75;match++){
  const trainer=arenaTrainer(world);assert.ok(trainer,`opponent ${match+1}`);
  const party=ids.map((id,index)=>configure({...makeMon(id,100),boxId:`test-${index}`,...(index===0?{moves:['화염방사','10만볼트','냉동빔','사이코키네시스']}:{})}));
  let c=createCombat(party,trainerTeam(trainer),{heals:0,strategy:trainer.strategy}),turns=0;
  while(!c.ended){
   assert.ok(turns++<150,`${trainer.title}: battle must finish`);
   const q=c.requests[0],p=c.teams[0][q.active],foe=c.teams[1][c.requests[1].active];
   const command=q.kind==='switch'?{type:'switch',slot:q.switches.slice().sort((a,b)=>b.hp-a.hp)[0].slot}:(()=>{
    const options=q.moves.filter(m=>!m.disabled&&m.pp>0).map(m=>({m,score:(moves[m.name]?.power||0)*effectiveness(moves[m.name]?.type,foe.types)*(p.types.includes(moves[m.name]?.type)?1.5:1)})).sort((a,b)=>b.score-a.score);
    assert.ok(options.length,`${trainer.title}: legal move`);return {type:'move',move:options[0].m.name};
   })();
   c=playCpu(c,command);
  }
  assert.equal(c.winner,0,`${trainer.title}: isolated level-100 test team lost`);assert.equal(awardArenaWin(world,trainer.id),true);totalTurns+=turns;
 }
 assert.equal(arenaProgress(world).complete,true);assert.deepEqual(world.pcCityArena,{rank:25,points:0,wins:75});console.log(`All 75 custom rank matches completed in ${totalTurns} turns with a replenished level-100 test party.`);
});
