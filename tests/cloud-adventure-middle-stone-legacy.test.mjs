import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldDialogue,fieldMap} from '../lib/cloud-adventure/adventure-world.mjs';

test('explicit pending rewards show without parent stages while unstarted battles remain closed',()=>{
 for(const [n,district,x,y,action] of [
  [16,'lumiose-mission16-roof',18,6,'claimMission15Stone'],[17,'lumiose-magenta-sector3-roof',18,6,'claimMission15Stone'],[18,'lumiose-jaune-sector9',14,9,'claimMission15Stone'],
  [21,'lumiose-magenta-sector6-roof',18,6,'mission20ClaimStone'],[22,'lumiose-mission22-tunnel',17,5,'mission20ClaimStone'],[23,'lumiose-mission23-roof',18,4,'mission20ClaimStone'],
 ]){
  const base={area:3,district,interior:null,x,y,facing:'up',zaMission15Stage:null,zaMission20Stage:null};
  const pending={...base,[`zaMission${n}RewardPending`]:true};assert.equal(fieldDialogue(pending,fieldMap(pending))?.action,action);
  const none=fieldDialogue(base,fieldMap(base));assert.notEqual(none?.action,action);assert.notEqual(none?.action,'mission20CaseBattle');assert.notEqual(none?.action,'battleMission15Case');
 }
});
