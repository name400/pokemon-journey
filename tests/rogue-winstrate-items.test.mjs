import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
const build=move=>{const user=makeReferenceMon(150,100,{boxId:'user',moves:[move]}),target=makeReferenceMon(277,60,{boxId:'target',moves:['Splash']});target.item='flameorb';target.ability='guts';target.rogueNativeItemNontransferable=true;const run={id:'fixed-item',wave:101,biome:1,rng:5,screen:'battle',party:[user],balls:{},tools:{},modifiers:[],encounter:{kind:'mystery',trainer:{name:'Victor'}},participants:[],awardedFoes:[]};run.combat=createClassicCombat(run,[target],{trainer:true});return run;};
for(const move of ['Thief','Knock Off','Trick','Corrosive Gas']){const run=build(move);run.combat=playClassicCombat(run,{type:'move',move:move.toLowerCase().replaceAll(' ','')});const foe=run.combat.teams[1][0];assert.equal(foe.item,'flameorb',move);assert.notEqual(run.combat.teams[0][0].item,'flameorb',move);const loaded=JSON.parse(JSON.stringify(run)),b=restoreClassicNativeBattle(loaded.combat,loaded);assert.equal(b.p2.pokemon[0].item,'flameorb');assert.equal(b.p2.pokemon[0].takeItem(b.p1.pokemon[0]),false);}
// A trainer's bound orb still applies its normal residual status.
const run=build('Splash');run.combat=playClassicCombat(run,{type:'move',move:'splash'});assert.equal(run.combat.teams[1][0].item,'flameorb');assert.equal(run.combat.teams[1][0].status,'화상');
console.log('Winstrate bound native items: theft, removal, restore and self-use passed');
// Failed Trick must not destroy the attacker's own held item.
{const swap=build('Trick');swap.party[0].item='leftovers';swap.combat=createClassicCombat(swap,swap.combat.teams[1],{trainer:true});swap.combat=playClassicCombat(swap,{type:'move',move:'trick'});assert.equal(swap.combat.teams[0][0].item,'leftovers');assert.equal(swap.combat.teams[1][0].item,'flameorb');}
// Knock Off has no bonus when the target has no transferable item.
{const bound=build('Knock Off'),free=build('Knock Off');for(const r of [bound,free]){r.party[0].level=30;r.party[0].stats={...r.party[0].stats};r.combat.teams[1][0].level=100;}free.combat.teams[1][0].rogueNativeItemNontransferable=false;
 // Rebuild for coherent native stats and deterministic random streams.
 for(const r of [bound,free])r.combat=createClassicCombat(r,r.combat.teams[1],{trainer:true});const hp=bound.combat.teams[1][0].hp;bound.combat=playClassicCombat(bound,{type:'move',move:'knockoff'});free.combat=playClassicCombat(free,{type:'move',move:'knockoff'});const a=hp-bound.combat.teams[1][0].hp,b=hp-free.combat.teams[1][0].hp;assert.ok(a>0&&b>a,`bound ${a}, transferable ${b}`);}
