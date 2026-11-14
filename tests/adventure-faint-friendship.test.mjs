import test from 'node:test';
import assert from 'node:assert/strict';
import {applyAdventureFaintFriendship} from '../lib/cloud-adventure/adventure-friendship.mjs';
import {restoreAdventurePokemon} from '../lib/cloud-adventure/adventure-battle.mjs';

const mon=(boxId,level,friendship,hp=10)=>({boxId,level,friendship,hp});
const faint=id=>({kind:'faint',targetSide:0,targetBoxId:id,hp:0});
function battle(player,opponents,events){const before={adventureFaintFriendshipV1:true,teams:[player,opponents],requests:[{active:0},{active:0}]};return [before,{...before,teams:[player.map(p=>({...p,hp:0})),opponents],events}];}
test('new Lumiose battles reduce only fainted owned party friendship, respecting level thresholds',()=>{
 const [before,after]=battle([mon('a',20,99),mon('b',20,100),mon('c',20,0)],[mon('foe',50,70)],[faint('a'),faint('b'),faint('c')]);
 const result=applyAdventureFaintFriendship(before,after);
 assert.deepEqual(result.teams[0].map(p=>p.friendship),[94,90,0]);
 assert.equal(before.teams[0][0].friendship,99);
});
test('opponent switch, revival, duplicate faint and legacy snapshots are handled',()=>{
 const [before,after]=battle([mon('a',20,120),mon('bench',20,80)],[mon('weak',49,0),mon('strong',50,0)],[faint('a'),faint('a'),{kind:'heal',targetSide:0,targetBoxId:'a',hp:5},{kind:'switch',targetSide:1,targetBoxId:'strong'},faint('a')]);
 const result=applyAdventureFaintFriendship(before,after);
 assert.equal(result.teams[0][0].friendship,109);
 assert.equal(result.teams[0][1].friendship,80);
 assert.equal(applyAdventureFaintFriendship({...before,adventureFaintFriendshipV1:undefined},after),after);
 assert.equal(applyAdventureFaintFriendship({...before,format:'mission10-multi-v1'},after),after);
});

test('a real single battle faint survives combat restoration and JSON reconnect',async()=>{
 const {makeMon}=await import('../lib/game.mjs');
 const {createCombat,playCpu}=await import('../lib/party-battle.mjs');
 const player={...makeMon(1,5),boxId:'player',friendship:120,moves:['튀어오르기'],hp:1};
 const foe={...makeMon(25,50),boxId:'foe',moves:['스피드스타'],pp:{}};
 const combat={...createCombat([player],[foe]),adventureFaintFriendshipV1:true,disableCpuTera:true};
 const next=playCpu(combat,{type:'move',move:'튀어오르기'});
 assert.ok(next.events.some(e=>e.kind==='faint'&&e.targetBoxId==='player'));
 const result=applyAdventureFaintFriendship(combat,next);
 const restored=restoreAdventurePokemon(JSON.parse(JSON.stringify(result)).teams[0][0],{});
 assert.equal(restored.friendship,110);
 assert.equal(restored.hp,0);
});
