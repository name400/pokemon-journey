import assert from 'node:assert/strict';
import {applyClassicEnemyBerries} from '../lib/rogue-enemy-berries.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
const sequence=values=>()=>{assert.ok(values.length,'unexpected RNG call');return values.shift();};
const mon=id=>({boxId:id,rogueFixedModifiers:[]});
// Legacy encounters do not mutate, draw RNG, or gain phantom items.
{const e={kind:'wild',trainer:null,team:[mon('foe')]},before=structuredClone(e);applyClassicEnemyBerries(e,{wave:100},()=>{throw Error('legacy RNG changed')});assert.deepEqual(e,before);}
// Source normal wild chance and common-pool Sitrus branch.
{const e={kind:'wild',trainer:null,team:[mon('foe')]};applyClassicEnemyBerries(e,{wave:1,enemyBerryRule:'source-v1'},sequence([0,.9,.5,0]));assert.deepEqual(e.team[0].rogueFixedModifiers,[{id:'berrysitrus',count:1,typeBoost:null}]);}
// Boss minimum grants one roll at wave 21 even when all three chance rolls miss.
{const e={kind:'wild',trainer:null,team:[{...mon('foe'),rogueBoss:true}]};applyClassicEnemyBerries(e,{wave:21,enemyBerryRule:'source-v1'},sequence([.9,.9,.9,.9,.5,.2]));assert.equal(e.team[0].rogueFixedModifiers[0].id,'berrylum');}
// Trainer common pool 8/11 berry branch and 3/11 unsupported booster branch.
{const e={kind:'trainer',trainer:{id:1},team:[mon('foe')]};applyClassicEnemyBerries(e,{wave:1,enemyBerryRule:'source-v1'},sequence([0,.9,.5,.2,.4]));assert.equal(e.team[0].rogueFixedModifiers[0].id,'berryleppa');}
{const e={kind:'trainer',trainer:{id:1},team:[mon('foe')]};applyClassicEnemyBerries(e,{wave:1,enemyBerryRule:'source-v1'},sequence([0,.9,.5,.9]));assert.equal(e.team[0].rogueFixedModifiers.length,0);}
// Source rare-berry generator and per-type stack cap.
{const e={kind:'wild',trainer:null,team:[mon('foe')]};applyClassicEnemyBerries(e,{wave:1,enemyBerryRule:'source-v1'},sequence([0,.9,.5,.9,.99]));assert.equal(e.team[0].rogueFixedModifiers[0].id,'berrystarf');}
{const e={kind:'wild',trainer:null,team:[{boxId:'foe',rogueFixedModifiers:[{id:'berrysitrus',count:2}]}]};applyClassicEnemyBerries(e,{wave:1,enemyBerryRule:'source-v1'},sequence([0,.9,.5,0]));assert.equal(e.team[0].rogueFixedModifiers[0].count,2);}
// Generated held berries are real battle modifiers and activate on their owner.
{const hero=makeReferenceMon(151,50,{boxId:'hero',moves:['Splash']}),foe=makeReferenceMon(143,50,{boxId:'foe',moves:['Splash']});foe.hp=Math.floor(foe.maxHp*.2);foe.rogueFixedModifiers=[{id:'berrysitrus',count:1}];const run={id:'enemy',wave:1,biome:1,party:[hero],modifiers:[],tools:{},encounter:{kind:'wild'},participants:[],awardedFoes:[],expNotices:[]};run.combat=createClassicCombat(run,[foe]);run.combat=playClassicCombat(run,{type:'move',move:'splash'});assert.equal(run.combat.teams[1][0].hp,foe.hp+Math.floor(foe.maxHp/4));assert.equal(run.combat.modifiers.find(m=>m.boxId==='foe'&&m.id==='berrysitrus').count,0);}
console.log('Enemy berry generation: legacy, source common branches, boss floor, cap and real battle passed');
// Real new-rule encounters attach generated berries to actual wild Pokémon.
{const {classicEncounter}=await import('../lib/rogue-classic-world.mjs'),hero=makeReferenceMon(1,5,{boxId:'hero',moves:['Tackle']});let found=false;for(let seed=1;seed<=250&&!found;seed++){const run={id:'generated-'+seed,seed:'generated-'+seed,wave:1,biome:0,rng:seed,enemyBerryRule:'source-v1',party:[hero],modifiers:[],tools:{}};const e=classicEncounter(run);found=e.team.some(p=>(p.rogueFixedModifiers||[]).some(m=>m.id.startsWith('berry')));}assert.equal(found,true);}
// Trainer boss status applies the guaranteed minimum to every party member.
{const e={kind:'trainer',trainer:{id:1},rogueTrainerBoss:true,team:[mon('first'),mon('second')]};const rolls=[.9,.9,.9,.9,.5,0,0,.9,.9,.9,.9,.5,0,0];applyClassicEnemyBerries(e,{wave:21,enemyBerryRule:'source-v1'},sequence(rolls));assert.equal(e.team[0].rogueFixedModifiers[0].id,'berrysitrus');assert.equal(e.team[1].rogueFixedModifiers[0].id,'berrysitrus');}
