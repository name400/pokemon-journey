import assert from 'node:assert/strict';
import {makeReferenceMon,sourceSpeciesFor} from '../lib/rogue-reference.mjs';
import {applyClassicEggForm} from '../lib/rogue-egg-forms.mjs';
import {ensureStarterSystem,registerStarterCaught,starterCatalog,buildStarterParty} from '../lib/rogue-starter-system.mjs';
import {classicChallengeBattleEligibility} from '../lib/rogue-challenge-eligibility.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
const mon=(id,boxId,moves)=>makeReferenceMon(id,50,{boxId,moves});
function fixture({move='U-turn',enemy='Splash',reserve=true}={}){const run={id:'challenge-switch',wave:10,biome:1,rng:9823,party:[mon(1,'lead',[move]),...(reserve?[mon(43,'legal',['Splash'])]:[]),mon(25,'illegal',['Splash'])],modifiers:[],tools:{},encounter:{kind:'wild'},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],challengeEligibilityRule:'source-subset-v1',challenges:[{id:1,value:12}]};run.combat=createClassicCombat(run,[mon(143,'foe',[enemy])]);run.party=run.combat.teams[0];return run;}
// Pivot and Baton Pass present only the legal substitute, including after reload.
for(const move of ['U-turn','Baton Pass']){let r=fixture({move});r.combat=playClassicCombat(r,{type:'move',move:move==='U-turn'?'uturn':'batonpass'});r.party=r.combat.teams[0];const request=r.combat.requests[0].actors.find(a=>a.kind==='switch');assert.ok(request,move);assert.deepEqual(request.switches.map(s=>r.party[s.index].boxId),['legal']);r=JSON.parse(JSON.stringify(r));r.combat=playClassicCombat(r,{type:'switch',slot:request.switches[0].slot});assert.equal(restoreClassicNativeBattle(r.combat,r).p1.active[0].set.trainerToken,'legal');}
// An illegal reserve must not turn a pivot move into a forced switch.
for(const move of ['U-turn','Baton Pass']){let r=fixture({move,reserve:false});r.combat=playClassicCombat(r,{type:'move',move:move==='U-turn'?'uturn':'batonpass'});r.party=r.combat.teams[0];assert.ok(!r.combat.requests[0].actors.some(a=>a.kind==='switch'));assert.equal(restoreClassicNativeBattle(r.combat,r).p1.active[0].set.trainerToken,'lead');}
// Opponent Roar may drag a legal reserve, never the ineligible one.
{let r=fixture({move:'Splash',enemy:'Roar'});r.combat=playClassicCombat(r,{type:'move',move:'splash'});r.party=r.combat.teams[0];assert.equal(restoreClassicNativeBattle(r.combat,r).p1.active[0].set.trainerToken,'legal');}
{let r=fixture({move:'Splash',enemy:'Roar',reserve:false});r.combat=playClassicCombat(r,{type:'move',move:'splash'});r.party=r.combat.teams[0];assert.equal(restoreClassicNativeBattle(r.combat,r).p1.active[0].set.trainerToken,'lead');}
// A newly selected special-form starter keeps the source form key for subsequent checks.
{const system={initialStarterId:1};ensureStarterSystem(system);const base=mon(479,'base',['Tackle']),frost=applyClassicEggForm(base,sourceSpeciesFor(base),()=>.6);registerStarterCaught(system,frost,{kind:'hatch'});const entry=starterCatalog(system).find(p=>p.sourceId===479&&p.formIndex===3);assert.ok(entry?.unlocked);const choice={id:entry.id,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves};const starter=buildStarterParty(system,[choice],{challenges:[{id:1,value:15}]}).party[0];assert.equal(starter.rogueFormKey,'frost');assert.equal(classicChallengeBattleEligibility(starter,[{id:1,value:15}]),true);}
console.log('Challenge pivot, Baton Pass, forced drag and restoration passed');
