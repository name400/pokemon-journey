import assert from 'node:assert/strict';import {makeMon} from '../lib/game.mjs';import {fullTurn,startBattle,itemTurn} from '../lib/full-battle.mjs';import {validatePokemonEdit} from '../lib/admin-pokemon.mjs';import {configure} from '../lib/pokemon-config.mjs';
function mon(id,level,moves,extra={}){return {...makeMon(id,level),moves,...extra}}
let a=mon(74,50,['지진']),b=mon(92,50,['튀어오르기']);let r=fullTurn(a,b,'지진');assert.equal(r.enemy.hp,r.enemy.maxHp,'Levitate must block Ground');
a=mon(25,50,['튀어오르기'],{item:'leftovers'});a.hp-=20;b=mon(7,50,['튀어오르기']);r=fullTurn(a,b,'튀어오르기');assert.ok(r.player.hp>a.hp,'Leftovers must recover HP');
a=mon(383,100,['지진']);b=mon(25,1,['튀어오르기'],{item:'focussash'});r=fullTurn(a,b,'지진');assert.equal(r.enemy.hp,1);assert.equal(r.enemy.item,'');
a=mon(186,50,['물대포'],{ability:'drizzle'});b=mon(4,50,['튀어오르기']);let battle=startBattle(a,b);assert.equal(battle.field.weather,'raindance');r=fullTurn(a,b,'물대포',battle.toJSON());assert.equal(r.snapshot.field.weather,'raindance');
a=mon(785,50,['전기쇼크'],{ability:'electricsurge'});battle=startBattle(a,mon(7,50,['튀어오르기']));assert.equal(battle.field.terrain,'electricterrain');
const base=makeMon(25,50),fast=validatePokemonEdit({species:25,level:50,nature:'timid',evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:252}});assert.ok(fast.stats.spe>base.stats.spe);assert.throws(()=>validatePokemonEdit({species:25,level:50,ability:'levitate'}));assert.equal(makeMon(1,100).id,1);assert.throws(()=>makeMon(1,101));
r=fullTurn(mon(1,50,['몸통박치기']),mon(4,50,['할퀴기']),'몸통박치기');const before=r.enemy.hp;r=itemTurn(r.player,r.enemy,r.snapshot,'potion');assert.equal(r.enemy.hp,before,'Potion turn must not attack opponent');
console.log('Ability immunity, held items, weather/terrain snapshots, nature/EV stats, level100 and item turn rules: passed');
