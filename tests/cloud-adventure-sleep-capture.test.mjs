import test from 'node:test';
import assert from 'node:assert/strict';
import { adventureCaptureAttempt } from '../lib/cloud-adventure/adventure-balls.mjs';
import { createCombat } from '../lib/party-battle.mjs';
import { makeMon } from '../lib/game.mjs';

const roll=()=>400/65536;
const wild={speciesId:9999,maxHp:100,hp:100,captureRate:45};
const attempt=(mon,context={})=>adventureCaptureAttempt(mon,'pokeball',context,roll);
test('sleep in the turn-based battle receives the drowsy capture bonus',()=>{
 assert.equal(attempt(wild).caught,false);
 for(const status of ['잠듦','slp','졸음','drowsy','얼음','frz'])assert.equal(attempt({...wild,status}).caught,true,status);
});
test('catch-window bonus overrides sleep and does not stack with it',()=>{
 assert.equal(attempt({...wild,status:'잠듦'},{catchWindow:true}).caught,false);
 assert.equal(attempt({...wild,status:'slp'},{catchWindow:true}).caught,false);
});
test('a sleeping opponent survives combat save and gets the bonus',()=>{
 const own={...makeMon(1,10),boxId:'own'},foe={...makeMon(19,10),boxId:'foe',status:'잠듦'};
 const battle=JSON.parse(JSON.stringify(createCombat([own],[foe]))),saved=battle.teams[1][0];
 assert.equal(saved.status,'잠듦');
 const lowRate={...saved,speciesId:9999,captureRate:45,hp:saved.maxHp};
 assert.equal(attempt(lowRate).caught,true);
});
