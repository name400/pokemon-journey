import assert from 'node:assert/strict';import {makeMon} from '../lib/game.mjs';import {createCombat,playCpu} from '../lib/party-battle.mjs';
const mon=(id,moves,extra={})=>({...makeMon(id,50),moves,...extra});let a=mon(25,['튀어오르기']),dead=mon(1,['몸통박치기']);dead.hp=0;let c=createCombat([{...a,boxId:'alive'},{...dead,boxId:'dead'}],[mon(150,['사이코키네시스'])]);for(let i=0;i<10&&!c.ended;i++)c=playCpu(c,{type:'move',move:'튀어오르기'});assert.equal(c.ended,true);assert.equal(c.winner,1);
let injured=mon(143,['튀어오르기']);injured.hp=20;c=createCombat([mon(7,['튀어오르기'])],[injured],{heals:1});c=playCpu(c,{type:'move',move:'튀어오르기'});assert.equal(c.cpuSupplies,0);assert.ok(c.teams[1][0].hp>20);
c=createCombat([mon(25,['칼춤'])],[mon(7,['튀어오르기'])]);c=playCpu(c,{type:'move',move:'칼춤'});assert.ok(!c.events.filter(e=>e.side===0).some(e=>e.hit),'self boost must not hit opponent');
let exhausted=mon(25,['전기쇼크'],{pp:{thundershock:0}});c=createCombat([exhausted],[mon(7,['튀어오르기'])]);assert.equal(c.requests[0].moves[0].id,'struggle');
console.log('Initially fainted bench, NPC recovery, self-buff visuals and persistent PP exhaustion: passed');
