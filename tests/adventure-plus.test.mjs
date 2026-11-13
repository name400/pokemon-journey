import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu,combatView} from '../lib/party-battle.mjs';

test('Plus moves require mastery and spend a persistent gauge only on execution',()=>{
 const player={...makeMon(1,20),boxId:'plus-p',moves:['몸통박치기','울음소리'],adventurePlusMastered:['tackle']};
 const foe={...makeMon(143,60),boxId:'plus-e',moves:['튀어오르기']};
 const legacy={...createCombat([player],[foe]),disableCpuTera:true};
 assert.equal(combatView(legacy).adventurePlusGauge,undefined);
 assert.throws(()=>playCpu(legacy,{type:'move',move:'몸통박치기',plus:true}));
 const c={...legacy,adventurePlusGaugeV1:{charge:1,max:3}};
 assert.equal(combatView(c).requests[0].moves.find(m=>m.id==='tackle').plusReady,true);
 assert.throws(()=>playCpu(c,{type:'move',move:'울음소리',plus:true}));
 const ordinary=playCpu(structuredClone(c),{type:'move',move:'몸통박치기'});
 const plus=playCpu(structuredClone(c),{type:'move',move:'몸통박치기',plus:true});
 assert.ok(plus.teams[1][0].hp<ordinary.teams[1][0].hp,'same simulator seed inflicts more damage');
 assert.equal(plus.adventurePlusGaugeV1.charge,0);assert.equal(ordinary.adventurePlusGaugeV1.charge,2);
 assert.throws(()=>playCpu(plus,{type:'move',move:'몸통박치기',plus:true}));
 const reloaded=playCpu(JSON.parse(JSON.stringify(plus)),{type:'move',move:'몸통박치기'});
 assert.equal(reloaded.adventurePlusGaugeV1.charge,1);assert.deepEqual(reloaded.teams[0][0].adventurePlusMastered,['tackle']);
});

test('Mega evolution uses the same gauge in new battles and legacy battles remain unchanged',async()=>{
 const {validatePokemonEdit}=await import('../lib/admin-pokemon.mjs');
 const mon={...validatePokemonEdit({species:6,level:50,item:'charizarditex'}),boxId:'mega'},foe={...makeMon(143,70),boxId:'foe',moves:['튀어오르기']};
 const legacy=createCombat([mon],[foe]),move=legacy.requests[0].moves[0].name;
 const fresh={...legacy,adventurePlusGaugeV1:{charge:1,max:3}};
 assert.ok(!combatView(fresh).requests[0].specials.some(s=>s.key==='mega'));
 assert.throws(()=>playCpu(fresh,{type:'move',move,special:'mega'}));
 const ready={...fresh,adventurePlusGaugeV1:{charge:3,max:3}};
 const evolved=playCpu(ready,{type:'move',move,special:'mega'});
 assert.equal(evolved.teams[0][0].mega,true);assert.equal(evolved.adventurePlusGaugeV1.charge,0);
 assert.ok(!combatView(evolved).requests[0].moves.some(m=>m.plusReady));
 assert.equal(playCpu(legacy,{type:'move',move,special:'mega'}).teams[0][0].mega,true);
});
