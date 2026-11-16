import test from 'node:test';
import assert from 'node:assert/strict';
import {species,moves} from '../lib/game.mjs';
import {fieldMap,fieldDialogue,fieldPath} from '../lib/cloud-adventure/adventure-world.mjs';
import {ROYALE_W_TRAINERS,ROYALE_W_EXTRA_POSITIONS,royaleWWins,ROYALE_X_TRAINERS,ROYALE_X_EXTRA_POSITIONS} from '../lib/cloud-adventure/adventure-royale.mjs';
test('rank W trainers have valid teams and accessible draft positions without replacing saved tiles',()=>{
 assert.equal(ROYALE_W_TRAINERS.length,12);assert.equal(new Set(ROYALE_W_TRAINERS.map(t=>t.id)).size,12);assert.equal(ROYALE_W_EXTRA_POSITIONS.length,8);
 for(const [tile,x,y,index] of ROYALE_W_EXTRA_POSITIONS){
  const trainer=ROYALE_W_TRAINERS[index];assert.equal(trainer.team.length,trainer.moves.length);for(const [id] of trainer.team)assert.ok(species.some(p=>p.id===id));for(const name of trainer.moves.flat())assert.ok(moves[name],`${trainer.id}: ${name}`);
  const base={area:3,district:'lumiose-royale',interior:null,zaRoyaleRank:'W',zaLidaStage:2,x:11,y:14,facing:'up'},map=fieldMap(base);assert.equal(map[y][x],tile);
  const neighbours=[[0,1,'up'],[0,-1,'down'],[-1,0,'right'],[1,0,'left']];const candidate=neighbours.find(([dx,dy])=>{const tx=x+dx,ty=y+dy;return map[ty]?.[tx]==='.'&&fieldPath(map,base,{x:tx,y:ty}).length>0;});assert.ok(candidate,`${trainer.id} reachable`);const [dx,dy,facing]=candidate,world={...base,x:x+dx,y:y+dy,facing};assert.equal(fieldDialogue(world,fieldMap(world)).action,`royaleWExtra${index}`);
  const saved={...base,x,y};assert.equal(fieldMap(saved)[y][x],'.');
 }
 assert.deepEqual(royaleWWins({zaRoyaleWSessionWins:['future','royale-w-nicolo','royale-w-nicolo']}),['royale-w-nicolo']);
});

test('rank X additions have supported moves and reachable positions without trapping saves',()=>{
 assert.equal(ROYALE_X_EXTRA_POSITIONS.length,6);
 for(const [tile,x,y,index] of ROYALE_X_EXTRA_POSITIONS){const t=ROYALE_X_TRAINERS[index];for(const [id] of t.team)assert.ok(species.some(p=>p.id===id));for(const move of t.moves.flat())assert.ok(moves[move],`${t.id}: ${move}`);const base={area:3,district:'lumiose-royale',interior:null,zaRoyaleRank:'X',zaNaveenComplete:true,x:11,y:14,facing:'up'},map=fieldMap(base);assert.equal(map[y][x],tile);const candidate=[[0,1,'up'],[0,-1,'down'],[-1,0,'right'],[1,0,'left']].find(([dx,dy])=>map[y+dy]?.[x+dx]==='.'&&fieldPath(map,base,{x:x+dx,y:y+dy}).length>0);assert.ok(candidate,`${t.id} reachable`);const [dx,dy,facing]=candidate,world={...base,x:x+dx,y:y+dy,facing};assert.equal(fieldDialogue(world,fieldMap(world)).action,`royaleXExtra${index}`);assert.equal(fieldMap({...base,x,y})[y][x],'.');}
});
