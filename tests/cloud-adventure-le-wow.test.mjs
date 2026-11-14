import test from 'node:test';
import assert from 'node:assert/strict';
import {leWowAvailable,leWowCourseTeam,LE_WOW_COURSE_COUNT} from '../lib/cloud-adventure/adventure-le-wow.mjs';
import {storyTm} from '../lib/cloud-adventure/adventure-story-tm.mjs';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';

test('Le Wow teams and unlock follow the ten course structure',()=>{
 assert.equal(LE_WOW_COURSE_COUNT,10);assert.equal(leWowAvailable({zaRoyaleRank:'B'}),false);assert.equal(leWowAvailable({zaMission31Started:true}),true);assert.equal(leWowAvailable({zaMission30Complete:true}),true);for(const s of [{zaRoyaleRank:'S'},{zaMission37Complete:true},{zaMission38Complete:true},{zaLeWowCompleted:true}])assert.equal(leWowAvailable(s),true);
 const teams=Array.from({length:10},(_,i)=>leWowCourseTeam(i));assert.deepEqual(teams[0].map(p=>p.speciesId),[71,545,569]);assert.deepEqual(teams[9].map(p=>p.speciesId),[780,227,248]);assert.ok(teams.every(team=>team.length===3&&team.every(p=>p.level===55&&p.moves.length===4)));assert.throws(()=>leWowCourseTeam(10));
 assert.deepEqual(teams.map(team=>team.map(p=>p.item)),[['poisonbarb','poisonbarb','poisonbarb'],['shellbell','shellbell','shellbell'],['fairyfeather','fairyfeather','fairyfeather'],['rockyhelmet','rockyhelmet','rockyhelmet'],['expertbelt','expertbelt','expertbelt'],['leftovers','leftovers','leftovers'],['quickclaw','quickclaw','quickclaw'],['bigroot','bigroot','bigroot'],['lifeorb','lifeorb','lifeorb'],['leftovers','rockyhelmet','tyranitarite']]);
 const tm=storyTm('za-tm045');assert.equal(tm.move,'탁쳐서떨구기');assert.ok(tm.learners.includes(71));assert.ok(!tm.learners.includes(25));
});

test('final course items work and Tyranitar can mega evolve in the existing battle engine',()=>{
 const player={...makeMon(150,100),boxId:'player',moves:['튀어오르기'],pp:{}};
 const mega=createCombat([player],[leWowCourseTeam(9)[2]],{heals:0});assert.ok(mega.requests[1].specials.some(x=>x.key==='mega'));const changed=playCpu(mega,{type:'move',move:'튀어오르기'});assert.equal(changed.teams[1][0].mega,true);assert.equal(changed.teams[1][0].battleAppearance,'tyranitarmega');
 const legacy=createCombat([player],[{...leWowCourseTeam(9)[2],item:''}],{heals:0}),restored=playCpu(structuredClone(legacy),{type:'move',move:'튀어오르기'});assert.equal(restored.teams[1][0].item,'');assert.equal(restored.teams[1][0].mega,false);assert.equal(restored.teams[0][0].item,legacy.teams[0][0].item);
 const healed=leWowCourseTeam(9)[0];healed.hp=Math.floor(healed.maxHp/2);healed.moves=['방어'];const rest=createCombat([player],[healed],{heals:0}),after=playCpu(rest,{type:'move',move:'튀어오르기'});assert.ok(after.teams[1][0].hp>rest.teams[1][0].hp);
 const attacker={...player,moves:['전광석화']},helmet={...leWowCourseTeam(9)[1],moves:['튀어오르기']},contact=createCombat([attacker],[helmet],{heals:0}),result=playCpu(contact,{type:'move',move:'전광석화'});assert.ok(result.teams[0][0].hp<contact.teams[0][0].hp);
});
