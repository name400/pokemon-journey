import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {calculateStats} from '../lib/pokemon-config.mjs';
import {awardClassicExperience} from '../lib/rogue-classic-growth.mjs';
import {CLASSIC_REWARD_REGISTRY,chooseClassicReward,transferClassicModifier} from '../lib/rogue-classic-rewards.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle,captureClassicCombat} from '../lib/rogue-battle-engine.mjs';
const hero=makeReferenceMon(150,100,{boxId:'hero',moves:['Seismic Toss']}),other=makeReferenceMon(7,30,{boxId:'other',moves:['Splash']});
const run={id:'macho',wave:120,biome:1,rng:42,screen:'reward',party:[hero,other],balls:{},money:0,tools:{},modifiers:[],encounter:{kind:'wild'},participants:[],awardedFoes:[],pendingMoves:[],rewards:[{...CLASSIC_REWARD_REGISTRY.find(d=>d.id==='machobrace'),rewardId:'brace'}]};
const base=calculateStats(hero);chooseClassicReward(run,{rewardId:'brace',boxId:'hero'});assert.equal(hero.stats.hp,base.hp+2);assert.equal(hero.stats.atk,base.atk+1);assert.equal(run.modifiers[0].transferable,false);assert.throws(()=>transferClassicModifier(run,{fromBoxId:'hero',toBoxId:'other',id:'machobrace',quantity:1,kind:'modifier'}));
const weak=makeReferenceMon(19,1,{boxId:'weak',moves:['Splash']});weak.hp=1;run.screen='battle';run.combat=createClassicCombat(run,[weak]);run.combat=playClassicCombat(run,{type:'move',move:'seismictoss'});assert.equal(run.modifiers[0].count,2);assert.equal(run.combat.modifiers.find(m=>m.id==='machobrace').count,2);assert.equal(run.combat.teams[0][0].rogueMachoBraceCount,2);
const saved=JSON.parse(JSON.stringify(run));let native=restoreClassicNativeBattle(saved.combat,saved);assert.equal(native.p1.pokemon[0].storedStats.atk,saved.party[0].stats.atk);
const holder=saved.party.find(p=>p.boxId==='hero');saved.modifiers[0].count=49;holder.rogueMachoBraceCount=49;holder.stats=calculateStats(holder);holder.maxHp=holder.stats.hp;holder.hp=holder.maxHp;awardClassicExperience(saved,[weak],{participants:['hero']});assert.equal(saved.modifiers[0].count,50);assert.equal(holder.stats.atk,Math.floor((base.atk+50)*1.05));assert.equal(holder.maxHp,Math.floor((base.hp+100)*1.1));awardClassicExperience(saved,[weak],{participants:['hero']});assert.equal(saved.modifiers[0].count,50);
saved.modifiers[0].count=10;holder.rogueMachoBraceCount=10;awardClassicExperience(saved,[weak],{participants:['other']});assert.equal(saved.modifiers[0].count,10);awardClassicExperience(saved,[weak],{participants:['hero'],pokemonDefeated:false});assert.equal(saved.modifiers[0].count,10);holder.hp=0;awardClassicExperience(saved,[weak],{participants:['hero']});assert.equal(saved.modifiers[0].count,10);
console.log('Macho Brace: stats, combat growth, cap, ownership, non-transfer and restore passed');
// Only the living participant with the brace grows in a double battle.
{
 const a=makeReferenceMon(150,100,{boxId:'double-a',moves:['Seismic Toss']}),b=makeReferenceMon(7,30,{boxId:'double-b',moves:['Splash']}),x=makeReferenceMon(19,1,{boxId:'double-x',moves:['Splash']}),y=makeReferenceMon(143,100,{boxId:'double-y',moves:['Splash']});x.hp=1;
 const d={id:'macho-double',wave:120,biome:1,rng:42,party:[a,b],balls:{},tools:{},modifiers:[],encounter:{kind:'wild'},participants:[],awardedFoes:[],pendingMoves:[]};
 d.screen='reward';d.rewards=[{...CLASSIC_REWARD_REGISTRY.find(v=>v.id==='machobrace'),rewardId:'d'}];chooseClassicReward(d,{rewardId:'d',boxId:'double-a'});d.combat=createClassicCombat(d,[x,y],{doubles:true});
 d.combat=playClassicCombat(d,{type:'turn',actions:[{actor:0,type:'move',move:'seismictoss',target:1},{actor:1,type:'move',move:'splash'}]});
 assert.equal(d.modifiers[0].count,2);assert.equal(d.combat.modifiers[0].count,2);assert.equal(d.combat.teams[0][1].rogueMachoBraceCount,undefined);
}

// Capturing a wild Pokémon awards participation growth once and preserves it in the battle save.
{
 const a=makeReferenceMon(150,100,{boxId:'catcher',moves:['Splash']}),wild=makeReferenceMon(19,1,{boxId:'catch-target',moves:['Splash']});
 const c={id:'brace-capture',wave:120,biome:1,rng:42,screen:'reward',party:[a],balls:{masterball:1},money:0,tools:{},modifiers:[],encounter:{kind:'wild'},participants:[],awardedFoes:[],pendingMoves:[],rewards:[{...CLASSIC_REWARD_REGISTRY.find(v=>v.id==='machobrace'),rewardId:'capture-brace'}]};
 chooseClassicReward(c,{rewardId:'capture-brace',boxId:'catcher'});c.screen='battle';c.combat=createClassicCombat(c,[wild]);const result=captureClassicCombat(c,'masterball',{targetBoxId:'catch-target',rng:()=>0});assert.ok(result.caught);assert.equal(c.modifiers[0].count,2);assert.equal(result.combat.modifiers.find(m=>m.id==='machobrace').count,2);const restored=JSON.parse(JSON.stringify(result.combat));assert.equal(restored.teams[0].find(p=>p.boxId==='catcher').rogueMachoBraceCount,2);
}
