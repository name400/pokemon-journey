import assert from 'node:assert/strict';
import {test} from 'node:test';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,captureClassicCombat,continueClassicWild,playClassicCombat,reconcileClassicCaptureParty,restoreClassicNativeBattle,snapshotClassicNativeBattle,classicCombatView} from '../lib/rogue-battle-engine.mjs';
import {classicGameView} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

const mon=(id,boxId)=>makeReferenceMon(id,50,{boxId,moves:['Splash','Water Gun']});
function fixture({orb=false,charged=orb,size=1,doubles=false}={}){
 const run={id:'tera-access',wave:49,biome:1,rng:42,screen:'battle',party:Array.from({length:size},(_,i)=>mon(i?7:150,'hero-'+i)),modifiers:[],tools:{teraOrb:orb},balls:{masterball:1},teraCharged:charged,encounter:{kind:'wild'}};
 run.combat=createClassicCombat(run,[mon(54,'duck'),...(doubles?[mon(143,'other-foe')]:[])],{doubles});run.party=run.combat.teams[0];return run;
}
function play(run,command){run.combat=playClassicCombat(run,command);run.party=run.combat.teams[0];}
function catchDuck(run){const result=captureClassicCombat(run,'masterball',{targetBoxId:'duck'});run.combat=result.combat;run.party=run.combat.teams[0];return result;}
function nextWild(run){run.wave++;run.combat=continueClassicWild(run,[mon(143,'next-foe')]);run.party=run.combat.teams[0];}
const canTera=actor=>actor.specials.some(s=>s.key==='terastallize');
const tera={type:'move',move:'splash',special:'terastallize'};

test('a captured Psyduck cannot gain Tera without an Orb in the next wild battle',async()=>{
 let run=fixture();catchDuck(run);assert.equal(restoreClassicNativeBattle(run.combat,run).p1.pokemon[1].canTerastallize,null);
 run=await decodeGameData(await encodeGameData(run));nextWild(run);play(run,{type:'switch',slot:2});
 assert.equal(canTera(classicCombatView(run.combat).requests[0]),false);const before=JSON.stringify(run);
 assert.throws(()=>playClassicCombat(run,tera),/변화/);assert.equal(JSON.stringify(run),before);assert.equal(run.party[1].terastallized,null);
});
test('full-party replacement and doubles capture both reapply the player Orb gate',()=>{
 const full=fixture({size:6}),caught=catchDuck(full);assert.equal(caught.autoAdded,false);
 full.combat=reconcileClassicCaptureParty(full,[caught.caught,...full.party.slice(1)]);full.party=full.combat.teams[0];nextWild(full);
 assert.equal(canTera(classicCombatView(full.combat).requests[0]),false);assert.throws(()=>playClassicCombat(full,tera),/변화/);
 const doubles=fixture({size:2,doubles:true});catchDuck(doubles);
 play(doubles,{type:'turn',actions:[{actor:0,type:'switch',slot:3},{actor:1,type:'move',move:'splash'}]});
 assert.equal(canTera(classicCombatView(doubles.combat).requests[0].actors[0]),false);
 assert.throws(()=>playClassicCombat(doubles,{type:'turn',actions:[{actor:0,...tera},{actor:1,type:'move',move:'splash'}]}),/변화/);
});
test('a spent Orb does not grant a captured replacement another use',()=>{
 const run=fixture({orb:true,charged:false});catchDuck(run);nextWild(run);play(run,{type:'switch',slot:2});
 assert.equal(canTera(classicCombatView(run.combat).requests[0]),false);assert.throws(()=>playClassicCombat(run,tera),/변화/);
});
test('an available Orb permits the captured member and preserves legitimate Tera across save and wild boundaries',async()=>{
 let run=fixture({orb:true});catchDuck(run);nextWild(run);play(run,{type:'switch',slot:2});assert.equal(canTera(classicCombatView(run.combat).requests[0]),true);
 const chosenType=run.party[1].teraType;assert.ok(chosenType);play(run,tera);assert.equal(run.party[1].terastallized,chosenType);assert.equal(run.teraCharged,false);
 run=await decodeGameData(await encodeGameData(run));assert.equal(restoreClassicNativeBattle(run.combat,run).p1.active[0].terastallized,chosenType);
 // A one-hit knockout is unnecessary here: use a low-HP next foe and a real turn.
 const b=restoreClassicNativeBattle(run.combat,run);b.p2.active[0].hp=1;run.combat.snapshot=snapshotClassicNativeBattle(b);play(run,{type:'move',move:'watergun'});assert.ok(run.combat.ended);
 nextWild(run);assert.equal(run.party[1].terastallized,chosenType);assert.equal(run.party[1].teraType,chosenType);assert.equal(canTera(classicCombatView(run.combat).requests[0]),false);
 play(run,{type:'switch',slot:2});assert.throws(()=>playClassicCombat(run,tera),/변화/);
});
test('acquiring the Orb between wild encounters enables the existing party without creating another battle',()=>{
 const run=fixture();catchDuck(run);run.tools.teraOrb=true;run.teraCharged=true;nextWild(run);
 assert.equal(canTera(classicCombatView(run.combat).requests[0]),true);const chosenType=run.party[0].teraType;assert.ok(chosenType);play(run,tera);assert.equal(run.party[0].terastallized,chosenType);
});
test('legacy permissive snapshots are gated by actual run tools in GET view and server commands',()=>{
 const run=fixture(),b=restoreClassicNativeBattle(run.combat,run);b.p1.active[0].canTerastallize='Psychic';run.combat.snapshot=snapshotClassicNativeBattle(b);delete run.combat.teraOrb;delete run.combat.teraCharged;
 const document={adventure:{untouched:true}},state=ensureClassicState(document);state.slots[0]=run;state.activeSlot=0;const before=JSON.stringify({party:run.party,snapshot:run.combat.snapshot,adventure:document.adventure});
 assert.equal(canTera(classicGameView(document).battle.requests[0]),false);assert.throws(()=>playClassicCombat(run,tera),/변화/);
 assert.equal(JSON.stringify({party:run.party,snapshot:run.combat.snapshot,adventure:document.adventure}),before);
});
test('new wild opponents remain gated while designated trainer Tera still works',()=>{
 const run=fixture();catchDuck(run);nextWild(run);assert.equal(restoreClassicNativeBattle(run.combat,run).p2.active[0].canTerastallize,null);
 const enemy={...mon(54,'tera-trainer'),rogueInstantTera:true};run.encounter={kind:'trainer'};run.combat=createClassicCombat(run,[enemy],{trainer:true});run.party=run.combat.teams[0];play(run,{type:'move',move:'splash'});assert.equal(run.combat.teams[1][0].terastallized,enemy.teraType);assert.equal(run.party[0].terastallized,null);
});
test('restored Mega and temporary Dynamax forms cannot bypass Tera form restrictions',()=>{
 const run=fixture({orb:true}),b=restoreClassicNativeBattle(run.combat,run);b.p1.active[0].formeChange('Mewtwo-Mega-X',null,true);run.combat.snapshot=snapshotClassicNativeBattle(b);run.party[0].rogueBattleSpecies='mewtwomegax';run.combat.teams[0]=structuredClone(run.party);
 assert.equal(restoreClassicNativeBattle(run.combat,run).p1.active[0].canTerastallize,null);assert.throws(()=>playClassicCombat(run,tera),/변화/);
 const giant=fixture({orb:true});giant.tools.dynamaxBand=true;play(giant,{type:'move',move:'splash',special:'dynamax'});assert.equal(canTera(classicCombatView(giant.combat).requests[0]),false);assert.throws(()=>playClassicCombat(giant,tera),/변화/);
});
