import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseAdventureAttack} from '../scripts/adventure-battle-strategy.mjs';
import {makeMon} from '../lib/game.mjs';
import {createZAAbilityCombat} from '../lib/cloud-adventure/adventure-abilities.mjs';
import {combatView,playCpu} from '../lib/party-battle.mjs';

test('continuous play helper uses only available Mega or mastered Plus actions',()=>{
 const lead={types:['격투']},moves=[{name:'깨뜨리다',pp:8,power:75,type:'격투',effectiveness:4,plusReady:true},{name:'제비반환',pp:8,power:60,type:'비행',effectiveness:1}];
 assert.deepEqual(chooseAdventureAttack({moves,specials:[]},lead),{type:'move',move:'깨뜨리다',plus:true});
 assert.deepEqual(chooseAdventureAttack({moves,specials:[{key:'mega'}]},lead),{type:'move',move:'깨뜨리다',special:'mega'});
 assert.deepEqual(chooseAdventureAttack({moves:[{...moves[0],plusReady:false}],specials:[]},lead),{type:'move',move:'깨뜨리다'});
 assert.deepEqual(chooseAdventureAttack({moves:[{...moves[0],pp:0},moves[1]],specials:[{key:'terastallize'}]},lead),{type:'move',move:'제비반환'});
 assert.throws(()=>chooseAdventureAttack({moves:[{...moves[0],disabled:true}]},lead),/No selectable move/);
});

test('helper command is accepted by a real Rogue battle snapshot',()=>{
 const player={...makeMon(500,56),boxId:'player',moves:['인파이트'],pp:{}},foe={...makeMon(10049,70),boxId:'boss',moves:['튀어오르기'],pp:{}};
 const combat=createZAAbilityCombat([player],[foe],{heals:0});
 combat.adventurePlusGaugeV1={charge:1,max:3};combat.adventureRogueAuraV1={targets:['boss']};combat.adventureRogueWeaknessV1={targets:['boss']};
 const view=combatView(combat),command=chooseAdventureAttack(view.requests[0],view.teams[0][view.active[0]]);
 assert.equal(command.plus,true);const result=playCpu(combat,command);
 assert.ok(result.teams[1][0].hp<foe.hp);assert.equal(combat.teams[1][0].hp,foe.hp);
});
