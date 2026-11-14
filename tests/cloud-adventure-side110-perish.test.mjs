import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
const mon=(id,level,boxId,moves)=>({...makeMon(id,level),boxId,moves,pp:{}});
function battle(){const c=createCombat([mon(150,100,'hero',['protect']),mon(1,100,'reserve',['protect'])],[mon(359,5,'foe',['perishsong','nightslash'])]);c.cpuOpeningMoveV1='perishsong';return c;}
test('mission opening uses Perish Song and preserves its turn countdown on reload',()=>{
 let c=battle();c=playCpu(c,{type:'move',move:'protect'});assert.ok(c.events.some(e=>e.side===1&&e.moveId==='perishsong'));c=structuredClone(c);
 for(let i=0;i<3;i++)c=playCpu(c,{type:'move',move:'protect'});
 assert.ok(c.log.some(line=>line.includes('쓰러졌다')));assert.equal(c.teams[0][0].hp,0);
});
test('switching clears the original Perish Song countdown for the replacement',()=>{
 let c=battle();c=playCpu(c,{type:'move',move:'protect'});c=playCpu(c,{type:'switch',slot:2});c=structuredClone(c);for(let i=0;i<3&&!c.ended;i++)c=playCpu(c,{type:'move',move:'protect'});assert.ok(c.teams[0].find(m=>m.boxId==='reserve').hp>0);
});
