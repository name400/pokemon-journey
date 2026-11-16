import test from 'node:test';
import assert from 'node:assert/strict';
import {Battle} from '@pkmn/sim';
import {makeMon} from '../lib/game.mjs';
import {createCombat} from '../lib/party-battle.mjs';
import {createZAAbilityCombat} from '../lib/cloud-adventure/adventure-abilities.mjs';
import {adventurePlayCpu} from '../lib/adventure-tera-policy.mjs';
import {createMission10DoubleSnapshot,playMission10MultiTurn} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
import {createMission37TripleSnapshot,playMission37TriplePrototype} from '../lib/cloud-adventure/adventure-mission37-triple.mjs';
const mon=(id,boxId,moves)=>({...makeMon(id,50),boxId,moves,pp:{}});
test('new ZA singles keep starting weather, spend PP and retain saved data',()=>{
 const p=mon(25,'p',['쾌청']),f=mon(129,'f',['튀어오르기']);const before=structuredClone([p,f]);
 for(const weather of [undefined,'raindance']){
  const s=createZAAbilityCombat([p],[f],{weather}),next=adventurePlayCpu(JSON.parse(JSON.stringify(s)),{type:'move',move:'쾌청'});
  assert.equal(next.weather,weather||'');assert.equal(next.teams[0][0].pp.sunnyday,s.teams[0][0].pp.sunnyday-1);assert.deepEqual([p,f],before);
  const again=adventurePlayCpu(JSON.parse(JSON.stringify(next)),{type:'move',move:'쾌청'});assert.equal(again.weather,weather||'');
 }
 const legacy=adventurePlayCpu(createCombat([p],[f]),{type:'move',move:'쾌청'});assert.equal(legacy.weather,'sunnyday');
});
test('companion and triple battles cannot overwrite the inherited rain',()=>{
 const p=mon(25,'p',['쾌청']),ally=mon(129,'a',['튀어오르기']),foe=mon(129,'f',['튀어오르기']),other=mon(129,'g',['튀어오르기']);
 const multi=createMission10DoubleSnapshot([p],[ally],[foe,other],{weather:'raindance'}),next=playMission10MultiTurn(JSON.parse(JSON.stringify(multi)),{type:'move',move:'sunnyday'});assert.equal(next.snapshot.field.weather,'raindance');assert.equal(next.teams[0][0].pp.sunnyday,Battle.fromJSON(multi.snapshot).p1.active[0].baseMoveSlots[0].pp-1);
 const triple=createMission37TripleSnapshot([p],[ally],[mon(129,'b',['튀어오르기'])],[foe,other],{weather:'raindance'}),nextTriple=playMission37TriplePrototype(JSON.parse(JSON.stringify(triple)),{type:'move',move:'sunnyday'});assert.equal(nextTriple.snapshot.field.weather,'raindance');assert.equal(nextTriple.teams[0][0].pp.sunnyday,Battle.fromJSON(triple.snapshot).p1.active[0].baseMoveSlots[0].pp-1);
});
