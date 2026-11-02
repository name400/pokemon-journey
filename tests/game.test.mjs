import assert from 'node:assert/strict';
import {species,moves,stages,makeMon,attack,turn,effectiveness} from '../lib/game.mjs';
assert.equal(species.length,12); assert.equal(stages.length,7);
for (const s of species) for (const m of s.moves) assert.ok(moves[m], `${s.name}: ${m}`);
for (const stage of stages) for (const id of stage.ids) assert.ok(species.some(s=>s.id===id));
assert.equal(effectiveness('물','불꽃'),2); assert.equal(effectiveness('노말','고스트'),0);
let p=makeMon(7,5), e=makeMon(4,5); let hp=e.hp; let logs=attack(p,e,'물대포',()=>0.5); assert.ok(e.hp<hp); assert.ok(logs.join('').includes('굉장'));
e=makeMon(92,5); hp=e.hp; attack(p,e,'몸통박치기',()=>0.5); assert.equal(e.hp,hp);
p=makeMon(43,5);e=makeMon(7,5);attack(p,e,'독가루',()=>0);assert.equal(e.status,'독');
p=makeMon(25,5);e=makeMon(7,5);const original=p.hp;const result=turn(p,e,'10만볼트',()=>.5);assert.equal(p.hp,original);assert.ok(result.enemy.hp<e.hp);assert.notEqual(result.player,p);
// A repeatable run proves the rules can reach the final win without assuming every random run is winnable.
let mon=makeMon(147,5), won=0, potions=2;mon.maxHp*=2;mon.hp=mon.maxHp;for(let i=0;i<stages.length;i++){for(const id of stages[i].ids){let foe=makeMon(id,4+i*2);for(let n=0;n<100&&mon.hp>0&&foe.hp>0;n++){if(mon.hp<mon.maxHp*.55&&potions){mon.hp=Math.min(mon.maxHp,mon.hp+35);potions--} let result=turn(mon,foe,'용의숨결',()=>.5);mon=result.player;foe=result.enemy}assert.equal(foe.hp,0,`stage ${i+1}`);assert.ok(mon.hp>0,`stage ${i+1}`)}won++;mon.level+=2;mon.maxHp+=6;mon.hp=mon.maxHp;mon.status=null}assert.equal(won,7);
console.log('Game rules and seven-stage route: passed');


