import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';

test('revive consumes an action and restores a fainted reserve through the saved simulator',()=>{
 const lead={...makeMon(1,50),boxId:'lead'},reserve={...makeMon(4,20),boxId:'reserve',hp:0},foe={...makeMon(7,10),boxId:'foe'};
 const start=createCombat([lead,reserve],[foe]);const next=playCpu(start,{type:'item',item:'adventure-revive',boxId:'reserve'});
 assert.equal(start.teams[0].find(m=>m.boxId==='reserve').hp,0);
 const revived=next.teams[0].find(m=>m.boxId==='reserve');assert.equal(revived.hp,Math.max(1,Math.floor(revived.maxHp/2)));assert.ok(next.turn>start.turn);
 assert.ok(next.events.some(e=>e.kind==='heal'&&e.targetBoxId==='reserve'));const choice=next.requests[0].switches.find(p=>p.index===1);assert.ok(choice);
 const switched=playCpu(structuredClone(next),{type:'switch',slot:choice.slot});assert.equal(switched.teams[0][switched.requests[0].active].boxId,'reserve');
 assert.throws(()=>playCpu(start,{type:'item',item:'adventure-revive',boxId:'lead'}));assert.throws(()=>playCpu(start,{type:'item',item:'adventure-revive',boxId:'foe'}));
 const full=playCpu(start,{type:'item',item:'adventure-max-revive',boxId:'reserve'});assert.equal(full.teams[0].find(m=>m.boxId==='reserve').hp,reserve.maxHp);
});
