import assert from 'node:assert/strict';
import {classicWildShiny} from '../lib/rogue-trainer-generation.mjs';
import {classicEncounter} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,captureClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {starterCatalog,registerStarterCaught,starterProgress,buildStarterParty} from '../lib/rogue-starter-system.mjs';
import {classicLuck} from '../lib/rogue-classic-rules.mjs';
const random=(...v)=>()=>{assert.ok(v.length,'unexpected RNG call');return v.shift();};
for(const [charms,threshold] of [[0,1],[1,4],[2,8],[3,16],[4,32]]){assert.equal(classicWildShiny(1,charms,random((threshold-.5)/1024,.9)).shiny,true);assert.deepEqual(classicWildShiny(1,charms,random(threshold/1024)),{shiny:false,variant:0});}
for(const [roll,variant] of [[.0,2],[.1,1],[.3,1],[.4,0]])assert.equal(classicWildShiny(1,0,random(0,roll)).variant,variant);
assert.deepEqual(classicWildShiny(16,0,random(0)),{shiny:true,variant:0});
const run={id:'wild-shiny',wave:2,biome:4,rng:187,gymStart:20,party:[makeReferenceMon(151,100,{boxId:'p',moves:['Splash']})],modifiers:[{id:'shinycharm',count:4}],tools:{},balls:{masterball:1},seed:'fixture',wildVariantRule:'source-v1'};run.encounter=classicEncounter(run);const wild=run.encounter.team[0];assert.equal(wild.rogueSourceId,132);assert.equal(wild.shiny,true);assert.equal(wild.variant,2);run.combat=createClassicCombat(run,run.encounter.team);const capture=captureClassicCombat(run,'masterball');assert.equal(capture.caught.variant,2);assert.equal(classicLuck([capture.caught]),3);
const doc={collection:[]},system=ensureClassicState(doc,{initialStarterId:1}).system,award=registerStarterCaught(system,capture.caught,{kind:'capture'});assert.equal(award.candies,20);assert.equal(system.dex[132].shinyVariantMask,4);assert.equal(starterProgress(system,132).candies,20);
registerStarterCaught(system,makeReferenceMon(1,5,{shiny:true,variant:2}),{kind:'capture'});const starter=starterCatalog(system).find(p=>p.id===1),choice={id:1,ability:starter.abilities[0].key,nature:starter.natures[0].key,gender:starter.genders[0],moves:starter.defaultMoves};const normal=buildStarterParty(system,[{...choice,shiny:false}]).party[0],shiny=buildStarterParty(system,[{...choice,shiny:true}]).party[0];assert.equal(normal.luck,0);assert.equal(classicLuck([normal]),0);assert.equal(shiny.variant,2);assert.equal(shiny.luck,3);assert.equal(classicLuck([shiny]),3);
const old={...run,rng:187,party:[makeReferenceMon(151,100,{boxId:'p'})]};delete old.wildVariantRule;const legacy=classicEncounter(old).team[0];assert.equal(legacy.shiny,true);assert.equal(legacy.variant,undefined);
console.log('Wild shiny charm thresholds, variants, actual capture/candy/dex and starter luck passed.');
