import test from 'node:test';
import assert from 'node:assert/strict';
import {species,makeMon} from '../lib/game.mjs';
import {isAdventureBattleOnlyForm} from '../lib/adventure-battle-forms.mjs';
import {isTemporaryBattleForm,ADVENTURE_CAPSULES} from '../lib/adventure-capsules.mjs';
import {validatePokemonEdit} from '../lib/admin-pokemon.mjs';
import {createCombat} from '../lib/party-battle.mjs';

const byName=name=>species.find(p=>p.identifier===name);
test('battle-only forms are omitted from selection and rejected by the server',()=>{
 for(const name of ['zacian-crowned','zamazenta-crowned','charizard-mega-x','clefable-mega','zygarde-complete','castform-sunny','aegislash-blade','mimikyu-busted','terapagos-stellar']){
  const mon=byName(name);assert.ok(mon,name);assert.equal(isAdventureBattleOnlyForm(mon),true,name);
  assert.throws(()=>validatePokemonEdit({species:mon.id,level:30}),/전투 조건/,name);
  assert.equal(isTemporaryBattleForm(mon),true,name);assert.ok(!ADVENTURE_CAPSULES.all.pool.includes(mon.id),name);
 }
});
test('normal and persistent forms remain available',()=>{
 for(const name of ['zacian','giratina-origin','deoxys-attack','zygarde-10','minior-red-meteor','rotom-wash']){
  const mon=byName(name);assert.ok(mon,name);assert.equal(isAdventureBattleOnlyForm(mon),false,name);
  assert.equal(validatePokemonEdit({species:mon.id,level:30}).id,mon.id,name);
 }
});
test('Zacian stays base in stored data while its sword changes battle appearance',()=>{
 const mon={...validatePokemonEdit({species:888,level:50,item:'rustedsword'}),boxId:'hero'},copy=structuredClone(mon);
 const c=createCombat([mon],[{...makeMon(4,10),boxId:'enemy'}]);assert.equal(c.teams[0][0].battleAppearance,'zaciancrowned');assert.equal(c.teams[0][0].id,888);assert.deepEqual(mon,copy);
});

test('ordinary encounters and legacy capsules do not create permanent battle forms',async()=>{
 const {encounterPool}=await import('../lib/campaign.mjs'),{GACHA}=await import('../lib/world.mjs');
 for(let area=0;area<=9;area++)assert.ok(encounterPool(area).every(p=>!isAdventureBattleOnlyForm(p)),`area ${area}`);
 for(const capsule of Object.values(GACHA))for(const id of capsule.pool)assert.equal(isAdventureBattleOnlyForm(species.find(p=>p.id===id)),false,`capsule ${id}`);
});

test('base Charizard can still Mega Evolve through the battle command',async()=>{
 const {playCpu}=await import('../lib/party-battle.mjs');const mon={...validatePokemonEdit({species:6,level:50,item:'charizarditex'}),boxId:'hero'},enemy={...makeMon(7,50),boxId:'foe'};
 const battle=createCombat([mon],[enemy]);assert.ok(battle.requests[0].specials.some(x=>x.key==='mega'));
 const next=playCpu(battle,{type:'move',move:battle.requests[0].moves[0].name,special:'mega'});assert.equal(next.teams[0][0].id,6);assert.equal(next.teams[0][0].mega,true);
});
