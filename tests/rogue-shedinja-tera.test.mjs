import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
const mon=makeReferenceMon(292,50,{boxId:'shedinja',moves:['Protect'],teraType:'Ghost'}),run={id:'shedinja-tera',wave:100,biome:1,rng:42,party:[mon],modifiers:[],tools:{teraOrb:true},teraCharged:true,encounter:{kind:'wild'}};
run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'foe',moves:['Splash']})]);assert.ok(run.combat.requests[0].specials.some(s=>s.key==='terastallize'));run.combat=playClassicCombat(run,{type:'move',move:'protect',special:'terastallize'});run.party=run.combat.teams[0];const p=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run).p1.active[0];assert.equal(p.terastallized,'Bug');assert.equal(p.hp,1);assert.equal(p.maxhp,1);assert.equal(p.ability,'wonderguard');assert.equal(run.teraCharged,false);
