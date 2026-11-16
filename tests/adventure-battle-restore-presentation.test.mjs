import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu,combatView} from '../lib/party-battle.mjs';
import {restoreAdventureBattlePresentation} from '../lib/cloud-adventure/adventure-battle-presentation.mjs';

test('restored single battle shows committed turn instead of replaying its move',()=>{
 const hero={...makeMon(7,30),boxId:'hero'},enemy={...makeMon(4,30),boxId:'enemy'};
 const initial=createCombat([hero],[enemy]),move=initial.requests[0].moves.find(entry=>entry.pp>0&&!entry.disabled);
 const played=playCpu(initial,{type:'move',move:move.name}),saved=JSON.parse(JSON.stringify(played));
 const actionView=combatView(played),restoredView=combatView(saved);
 assert.ok(actionView.events.some(event=>event.kind==='move'),'Actual action still has its animation events');
 assert.ok(restoredView.events.some(event=>event.kind==='move'),'Saved single combat retains the preceding turn');
 const before=structuredClone(restoredView),clean=restoreAdventureBattlePresentation(restoredView);
 assert.deepEqual(clean.events,[]);assert.deepEqual(clean.teams,actionView.teams);assert.deepEqual(clean.active,actionView.active);
 assert.deepEqual(restoredView,before,'The persisted state and action response are not changed');
});
test('restored multi battle clears only its presentation events',()=>{
 const battle={adventureMultiEventsV1:true,teams:[[{boxId:'a',hp:7}],[]],activeBySide:[[0],[]],events:[{kind:'switch',boxId:'a'}]};
 const restored=restoreAdventureBattlePresentation(battle);
 assert.deepEqual(restored.events,[]);assert.deepEqual(restored.teams,battle.teams);assert.equal(battle.events.length,1);
 assert.equal(restoreAdventureBattlePresentation(null),null);
});
