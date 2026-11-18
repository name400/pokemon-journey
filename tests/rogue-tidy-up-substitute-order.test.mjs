import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

// Source uses effective speed, reversing under Trick Room, with an independent seeded tie shuffle:
// https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/utils/speed-order.ts#L19
async function trial({modern=true,trick=false,doubles=false,taunt=false,runCommand=false,tie=false,boost=false}={}){
 const mon=(id,boxId,move)=>makeReferenceMon(id,100,{boxId,moves:[move],ability:'runaway'}),hero=mon(143,'hero','Tidy Up'),ally=mon(95,'ally','Splash'),foes=[mon(tie?143:150,'foe1','Splash'),mon(94,'foe2','Splash')],run={id:'tidy-speed',seed:'tidy-speed',rng:42,wave:20,screen:'battle',party:doubles?[hero,ally]:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},tidyUpOrderRule:'source-v1',...(modern?{tidyUpSubstituteOrderRule:'source-v1'}:{})};
 run.combat=createClassicCombat(run,doubles?foes:[foes[0]],{trainer:true,doubles});const before=restoreClassicNativeBattle(run.combat,run);if(boost)before.p1.active[0].boosts.spe=6;if(trick)before.field.addPseudoWeather('trickroom',before.p1.active[0]);if(taunt)before.p1.active[0].addVolatile('taunt',before.p2.active[0]);for(const side of before.sides)for(const p of side.active)assert.ok(p.addVolatile('substitute'));before.p1.addSideCondition('spikes',before.p2.active[0]);const pp=before.p1.active[0].moveSlots[0].pp;run.combat.snapshot=snapshotClassicNativeBattle(before);
 if(runCommand){run.combat=playClassicCombat(run,{type:'move',move:'tidyup'});run.party=run.combat.teams[0];}else {before.makeChoices(doubles?'move tidyup,move splash':'move tidyup',doubles?'move splash,move splash':'move splash');run.combat.snapshot=snapshotClassicNativeBattle(before);}
 const saved=await decodeGameData(await encodeGameData({run,other:{safe:true}})),b=restoreClassicNativeBattle(saved.run.combat,saved.run),order=b.log.filter(s=>s.startsWith('|-end|')&&s.includes('|Substitute')).map(s=>s.split('|')[2].slice(0,3));return {b,order,saved,pp};
}
test('substitutes end in effective speed order, reversing under Trick Room',async()=>{for(const trick of [false,true]){const {order}=await trial({trick});assert.deepEqual(order,trick?['p1a','p2a']:['p2a','p1a']);}});
test('doubles order respects distinct speeds on all four actors',async()=>{const {order}=await trial({doubles:true});assert.deepEqual(order,['p2a','p2b','p1b','p1a']);});
test('old saves retain the previous side order',async()=>{const {order}=await trial({modern:false});assert.deepEqual(order,['p1a','p2a']);});
test('blocked move leaves all substitutes intact',async()=>{const {b,order}=await trial({taunt:true});assert.deepEqual(order,[]);for(const s of b.sides)for(const p of s.active)assert.ok(p.volatiles.substitute);});
test('actual turn and save retain rule, cleared effects and PP',async()=>{const {b,saved,pp,order}=await trial({runCommand:true});assert.deepEqual(order,['p2a','p1a']);assert.equal(saved.run.combat.tidyUpSubstituteOrderRule,'source-v1');assert.deepEqual(saved.other,{safe:true});assert.equal(b.p1.pokemon[0].moveSlots[0].pp,pp-1);assert.equal(!!b.p1.sideConditions.spikes,false);for(const s of b.sides)for(const p of s.active)assert.equal(!!p.volatiles.substitute,false);});

test('equal speed preserves native ordering and battle RNG',async()=>{const modern=await trial({tie:true}),legacy=await trial({tie:true,modern:false});assert.deepEqual(modern.order,legacy.order);assert.deepEqual(modern.b.prng.getSeed(),legacy.b.prng.getSeed());});
test('ordering does not consume battle RNG for distinct speeds',async()=>{const modern=await trial(),legacy=await trial({modern:false});assert.deepEqual(modern.b.prng.getSeed(),legacy.b.prng.getSeed());});
test('speed boosts affect the removal order',async()=>{const {order}=await trial({boost:true});assert.deepEqual(order,['p1a','p2a']);});
test('new games enable substitute ordering and preserve another slot',async()=>{const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs'),doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'tidy-sub-start'});assert.equal(run.tidyUpSubstituteOrderRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});});
test('Trick Room reverses the four distinct double-battle speeds',async()=>{const {order}=await trial({doubles:true,trick:true});assert.deepEqual(order,['p1a','p1b','p2b','p2a']);});
