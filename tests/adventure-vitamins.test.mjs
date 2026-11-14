import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {useAdventureVitamin} from '../lib/cloud-adventure/adventure-vitamins.mjs';

test('vitamins cap EVs without altering unrelated Pokémon data',()=>{
 const mon={...makeMon(1,100),hp:42,friendship:99,custom:{saved:true},evs:{hp:250,atk:0,def:0,spa:0,spd:0,spe:0}};
 const r=useAdventureVitamin(mon,'hpup');assert.equal(r.gain,2);assert.equal(r.mon.evs.hp,252);assert.equal(r.mon.friendship,103);assert.equal(r.mon.maxHp-r.mon.hp,mon.maxHp-mon.hp);assert.deepEqual(r.mon.custom,mon.custom);assert.equal(mon.evs.hp,250);
 assert.throws(()=>useAdventureVitamin(r.mon,'hpup'),/노력치/);
 const capped={...mon,evs:{hp:252,atk:252,def:5,spa:0,spd:0,spe:0}};assert.equal(useAdventureVitamin(capped,'carbos').gain,1);assert.throws(()=>useAdventureVitamin({...capped,evs:{...capped.evs,spe:1}},'carbos'),/노력치/);
 assert.equal(useAdventureVitamin({...mon,hp:0},'protein').mon.hp,0);assert.equal(useAdventureVitamin({...mon,friendship:160},'protein').mon.friendship,160);assert.throws(()=>useAdventureVitamin(makeMon(292,20),'hpup'),/껍질몬/);
 for(const [id,stat] of [['protein','atk'],['iron','def'],['calcium','spa'],['zinc','spd'],['carbos','spe']])assert.equal(useAdventureVitamin(mon,id).mon.evs[stat],10);
});

test('Swift Feather raises Speed by one, applies friendship tiers and respects limits',()=>{
 const mon={...makeMon(1,50),hp:0,friendship:99,custom:{kept:true},evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:250}};
 const first=useAdventureVitamin(mon,'swiftwing');assert.equal(first.gain,1);assert.equal(first.mon.evs.spe,251);assert.equal(first.mon.friendship,101);assert.equal(first.mon.hp,0);assert.deepEqual(first.mon.custom,mon.custom);assert.equal(mon.evs.spe,250);
 const second=useAdventureVitamin(first.mon,'swiftwing');assert.equal(second.mon.evs.spe,252);assert.equal(second.mon.friendship,102);assert.throws(()=>useAdventureVitamin(second.mon,'swiftwing'),/노력치/);
 assert.equal(useAdventureVitamin({...mon,friendship:160},'swiftwing').mon.friendship,160);
 const capped={...mon,evs:{hp:252,atk:252,def:6,spa:0,spd:0,spe:0}};assert.throws(()=>useAdventureVitamin(capped,'swiftwing'),/노력치/);
});
