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

test('multi and triple assign direct attacks to their true opponent and protect companions',()=>{
 for(const format of ['mission10-multi-v1','mission37-triples-prototype-v1']){
  const player=mon('p',20,120),ally=mon('a',20,120),foes=[mon('weak',25,0),mon('strong',50,0)];
  const before={format,adventureFaintFriendshipV1:true,owners:{player:['p'],ally:['a'],first:['a']},teams:format==='mission10-multi-v1'?[[player],[foes[0]],[ally],[foes[1]]]:[[player,ally],foes]};
  const after={...before,teams:before.teams.map(team=>team.map(x=>({...x,hp:0}))),before:[ [player,ally],foes],beforeActiveBySide:[[0,1],[0,1]],events:[{kind:'damage',targetSide:0,targetBoxId:'p',hp:0,hit:true,actorBoxId:'strong'},faint('p'),faint('a')]};
  const result=applyAdventureFaintFriendship(before,after);
  assert.equal(result.teams[0][0].friendship,110,format);
  if(format==='mission37-triples-prototype-v1')assert.equal(result.teams[0][1].friendship,120);
  const indirect={...after,events:[{kind:'damage',targetSide:0,targetBoxId:'p',hp:0,hit:false},faint('p')]};
  assert.equal(applyAdventureFaintFriendship(before,indirect).teams[0][0].friendship,119);
  assert.equal(applyAdventureFaintFriendship({...before,adventureFaintFriendshipV1:undefined},after),after);
 }
});

test('actual multi and triple turns save player fainting without changing companions',async()=>{
 const {makeMon}=await import('../lib/game.mjs');
 const {createMission10DoubleSnapshot,playMission10MultiTurn}=await import('../lib/cloud-adventure/adventure-mission10-double.mjs');
 const {createMission37TripleSnapshot,playMission37TriplePrototype}=await import('../lib/cloud-adventure/adventure-mission37-triple.mjs');
 const mk=(id,level,move,hp)=>{const m=makeMon(id,level);return {...m,boxId:crypto.randomUUID(),friendship:120,moves:[move],pp:{},...(hp?{hp}: {})};};
 for(const triple of [false,true]){
  const p=mk(1,5,'튀어오르기',1),a=mk(25,30,'튀어오르기'),b=mk(25,30,'튀어오르기'),enemies=[mk(382,50,'파도타기'),mk(382,50,'파도타기'),mk(382,50,'파도타기')];
  const c=triple?createMission37TripleSnapshot([p],[a],[b],enemies):createMission10DoubleSnapshot([p],[a],enemies.slice(0,2));c.snapshot.prng='1,2,3,4';
  const next=triple?playMission37TriplePrototype(c,{type:'move',move:'splash'}):playMission10MultiTurn(c,{type:'move',move:'splash'});
  assert.ok(next.events.some(e=>e.kind==='faint'&&e.targetBoxId===p.boxId),triple?'triple':'multi');
  const result=applyAdventureFaintFriendship(c,next),owned=result.teams[0].find(x=>x.boxId===p.boxId);
  assert.equal(owned.friendship,110);
  const partner=(triple?result.teams[0]:result.teams[2]).find(x=>x.boxId===a.boxId);assert.equal(partner.friendship,120);
  assert.equal(JSON.parse(JSON.stringify(result)).teams[0].find(x=>x.boxId===p.boxId).friendship,110);
 }
});
