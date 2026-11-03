import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {applyClassicForm,classicFormOptions} from '../lib/rogue-transformations.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle,classicCombatView,continueClassicWild} from '../lib/rogue-battle-engine.mjs';
import {classicExpToNext,classicTotalExperience,gainClassicExperience} from '../lib/rogue-classic-growth.mjs';
import {createCombat} from '../lib/party-battle.mjs';
const mon=(id,level,boxId,patch={})=>makeReferenceMon(id,level,{boxId,...patch});
const run=(party,patch={})=>({id:'engine-test',wave:1,biome:'town',rng:42,party,modifiers:[],tools:{megaBracelet:true,dynamaxBand:true,teraOrb:true},teraCharged:true,...patch});

let r=run([mon(6,50,'charizard',{moves:['화염방사']})],{wave:70,formItems:{charizard:['maxmushrooms','charizarditex']}});
assert.equal(classicFormOptions(r.party[0],r).length,2);
r.party[0]=applyClassicForm(r.party[0],r,'maxmushrooms');
assert.equal(r.party[0].rogueBaseStats.hp,118);assert.equal(r.party[0].ability,'berserk');
r.combat=createClassicCombat(r,[mon(143,50,'snorlax',{moves:['튀어오르기']})]);
let b=restoreClassicNativeBattle(r.combat);
assert.equal(b.p1.active[0].species.id,'charizardgmax');assert.equal(b.p1.active[0].maxhp,r.party[0].maxHp);assert.equal(b.p1.active[0].baseMoveSlots[0].maxpp,15);
assert.equal(r.combat.teams[0][0].gigantamax,true);assert.equal(r.combat.teams[0][0].battleAppearance,'charizardgmax');
assert.equal(r.combat.requests[0].specials.some(s=>s.key==='terastallize'),false,'G-Max and Tera are mutually exclusive');
for(let i=0;i<4&&!r.combat.ended;i++){r.combat=playClassicCombat(r,{type:'move',move:'flamethrower'});r.party=r.combat.teams[0];}
assert.equal(r.combat.teams[0][0].gigantamax,true,'G-Max stays beyond three turns and JSON restores');

r=run([mon(6,50,'mega')],{wave:70,formItems:{mega:['charizarditex']}});r.party[0]=applyClassicForm(r.party[0],r,'charizarditex');r.combat=createClassicCombat(r,[mon(143,50,'foe')]);
assert.equal(r.combat.teams[0][0].battleAppearance,'charizardmegax');assert.equal(r.combat.teams[0][0].mega,true);assert.equal(r.combat.teams[0][0].currentAbility,'toughclaws');

r=run([mon(7,5,'squirtle',{moves:['물대포'],teraType:'물'})]);r.combat=createClassicCombat(r,[mon(143,30,'foe',{moves:['튀어오르기']})]);
assert.ok(r.combat.requests[0].specials.some(s=>s.key==='terastallize'));
r.combat=playClassicCombat(r,{type:'move',move:'watergun',special:'terastallize'});assert.equal(r.combat.teams[0][0].terastallized,'Water');assert.equal(r.teraCharged,false);assert.ok(r.combat.events.some(e=>e.kind==='form'&&e.pokemon.terastallized==='Water'));

r=run([mon(1,5,'bulba'),mon(7,5,'squirtle')]);r.combat=createClassicCombat(r,[mon(19,4,'a'),mon(16,4,'b')],{doubles:true});
assert.equal(r.combat.requests[0].actors.length,2);assert.equal(classicCombatView(r.combat).activeBySide[0].length,2);
const actions=r.combat.requests[0].actors.map(a=>({actor:a.slot,type:'move',move:a.moves[0].id,...(a.moves[0].targets.length?{target:a.moves[0].targets[0].target}:{})}));
r.combat=playClassicCombat(r,{type:'turn',actions});assert.ok(r.combat.turn>=2||r.combat.ended);

const growth=mon(1,5,'growth');assert.equal(classicTotalExperience(growth,5),125*.675+135*.325|0);assert.ok(classicExpToNext(growth)>0);
assert.equal(gainClassicExperience(growth,1e8,1).mon.level,10);assert.equal(gainClassicExperience(growth,1e8,1).mon.experience,0);
const ordinary=createCombat([mon(7,5,'normal')],[mon(19,4,'normalfoe')]);assert.equal(ordinary.classic,undefined);
// A real winning turn completes poison/field residual once, then preserves
// boosts and PP across the next encounter rather than recreating the hero.
r=run([mon(151,50,'carry',{moves:['つるぎのまい','じしん'],status:'독'})],{wave:61});
r.party[0].moves=['Swords Dance','Earthquake'];r.combat=createClassicCombat(r,[mon(19,2,'first',{moves:['Splash']})]);
r.combat=playClassicCombat(r,{type:'move',move:'swordsdance'});r.party=r.combat.teams[0];
r.combat=playClassicCombat(r,{type:'move',move:'earthquake'});r.party=r.combat.teams[0];assert.equal(r.combat.ended,true);
const oldHp=r.party[0].hp,oldPP=r.party[0].pp.earthquake;assert.ok(oldHp<r.party[0].maxHp);r.wave++;
r.combat=continueClassicWild(r,[mon(143,40,'next',{moves:['Splash']})]);b=restoreClassicNativeBattle(r.combat);
assert.equal(b.p1.active[0].boosts.atk,2);assert.equal(b.p1.active[0].hp,oldHp);assert.equal(b.p1.active[0].baseMoveSlots.find(m=>m.id==='earthquake').pp,oldPP);assert.equal(r.combat.teams[1].length,1);
console.log('Classic native engine: source G-Max stats/ability + persistence, real Mega/Tera visuals, base PP, doubles, source growth/cap and cartridge isolation passed');
