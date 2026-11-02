import assert from 'node:assert/strict';
import {client} from './release-client.mjs';
import {moves} from '../lib/game.mjs';
const a=client(1);
let w=await a.call('/api/world');
if(w.battle)w=await a.call('/api/world',{action:'forfeit',revision:w.revision});
assert.equal(w.world.map[w.world.y][w.world.x],'H','local fixture must be at a center');
let p=w.box.find(m=>m.boxId===w.world.activeId);
let move=p.tutorMoves.find(m=>!p.moves.includes(m)&&!p.learnable.includes(m));
assert.ok(move,'a non-level-up compatible move is available');
const coins=w.wallet.coins;
w=await a.call('/api/world',{action:'tutor',move,slot:3,revision:w.revision});
assert.equal(w.wallet.coins,coins-1500);
assert.equal(w.box.find(m=>m.boxId===p.boxId).moves[3],move);
const revision=w.revision;
await a.call('/api/world',{action:'tutor',move:'constructor',slot:3,revision},409);
assert.equal((await a.call('/api/world')).revision,revision);
let r=await a.call('/api/rogue');
if(['battle','reward','choose'].includes(r.data.screen)&&r.data.run)r=await a.call('/api/rogue',{action:'abandon',revision:r.revision});
if(r.data.screen!=='choose')r=await a.call('/api/rogue',{action:'begin',revision:r.revision});
r=await a.call('/api/rogue');
const owned=r.data.collection.find(m=>m.id===150&&m.level===100);
assert.ok(owned,'requires the approved local full-run fixture');
r=await a.call('/api/rogue',{action:'choose',boxId:owned.boxId,revision:r.revision});
for(let i=0;r.data.screen==='battle'&&i<20;i++){
 const request=r.battle.requests[0];
 const best=request.moves.toSorted((a,b)=>(moves[b.name]?.power||0)-(moves[a.name]?.power||0))[0];
 r=await a.call('/api/rogue',{action:'battle',command:{type:'move',move:best.name},revision:r.revision});
}
assert.equal(r.data.screen,'reward');
p=r.data.run.party[0];move=p.tutorMoves.find(m=>!p.moves.includes(m)&&!p.learnable.includes(m));
const rogueCoins=r.data.coins;
r=await a.call('/api/rogue',{action:'tutor',boxId:p.boxId,move,slot:3,revision:r.revision});
assert.equal(r.data.coins,rogueCoins-1000);
assert.equal(r.data.run.party[0].moves[3],move);
assert.equal((await a.call('/api/world')).revision,revision);
console.log('Compatible TM/tutor moves, exact mode-specific costs, invalid move rejection and isolated saves: passed');

const fresh=client(3);let f=await fresh.call('/api/rogue');if(f.data.run&&['battle','reward'].includes(f.data.screen))f=await fresh.call('/api/rogue',{action:'abandon',revision:f.revision});if(f.data.screen!=='choose')f=await fresh.call('/api/rogue',{action:'begin',revision:f.revision});f=await fresh.call('/api/rogue',{action:'choose',species:f.data.choiceIds[0],revision:f.revision});const starter=f.data.run.party[0].boxId;assert.ok(f.data.collection.some(p=>p.boxId===starter));f=await fresh.call('/api/rogue',{action:'abandon',revision:f.revision});assert.ok((await fresh.call('/api/rogue')).data.collection.some(p=>p.boxId===starter));console.log('Random starter remains owned after ending a run: passed');
