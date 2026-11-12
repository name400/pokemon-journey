import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle} from '@pkmn/sim';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playDuel} from '../lib/party-battle.mjs';

test('research TMs retain core effects in the existing turn-based simulator',()=>{
 const foe={...makeMon(129,30),boxId:'foe',moves:['튀어오르기']};
 const wall={...makeMon(25,30),boxId:'wall',moves:['빛의장막']};
 let combat=createCombat([wall],[foe]);
 combat=playDuel(combat,[{type:'move',move:'빛의장막'},{type:'move',move:'튀어오르기'}]);
 assert.ok(Battle.fromJSON(combat.snapshot).p1.sideConditions.lightscreen);
 const plant={...makeMon(1,30),boxId:'plant',moves:['기가드레인']};plant.hp=Math.floor(plant.maxHp/2);
 combat=createCombat([plant],[foe]);const before=combat.teams[0][0].hp;
 combat=playDuel(combat,[{type:'move',move:'기가드레인'},{type:'move',move:'튀어오르기'}]);
 assert.ok(combat.teams[0][0].hp>before);assert.ok(combat.teams[1][0].hp<foe.hp);
});
