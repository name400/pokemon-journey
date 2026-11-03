import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {configure} from '../lib/pokemon-config.mjs';
import {playCpu} from '../lib/party-battle.mjs';
import {createAdventureCombat} from '../lib/adventure-combat.mjs';
import {zaPartnerStone} from '../lib/adventure-mz.mjs';

test('all three Z-A partner families map to usable manual Mega Evolutions',()=>{
 for(const [family,stone] of [[[152,153,154],'meganiumite'],[[498,499,500],'emboarite'],[[158,159,160],'feraligite']]){
  for(const id of family)assert.equal(zaPartnerStone(id),stone);
  const player=configure({...makeMon(family[2],100),item:stone,boxId:`player-${family[2]}`});
  const foe=configure({...makeMon(25,20),boxId:'foe'}),combat=createAdventureCombat([player],[foe]);
  assert.ok(combat.requests[0].specials.some(item=>item.key==='mega'));
  const attack=combat.requests[0].moves.find(move=>move.power>0);assert.ok(attack);
  const next=playCpu(combat,{type:'move',move:attack.name,special:'mega'});assert.equal(next.teams[0][0].mega,true);
 }
 assert.equal(zaPartnerStone(25),'');
});
