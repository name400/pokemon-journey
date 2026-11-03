// Synthetic ability fixture isolates phase mechanics; this is not a natural
// balance/playthrough claim or a player-accessible illegal-ability route.
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
const heroes=[151,59].map((id,i)=>makeReferenceMon(id,100,{boxId:'hero-'+i,ability:'intimidate',roguePassiveAbility:'wonderguard',moves:['Night Shade','Spore','Swords Dance','Recover'],roguePPUps:{nightshade:3}}));
const run={id:'final-fixture',wave:200,biome:50,rng:1000,party:heroes,modifiers:[],tools:{},encounter:{kind:'final',phase:1},teraCharged:false};
const boss=makeReferenceMon(890,100,{boxId:'eternatus',moves:['Eternabeam','Sludge Bomb','Flamethrower','Cosmic Power'],ability:'pressure',rogueBossSegments:4,sourceImage:'old-boss-front',sourceBackImage:'old-boss-back'});
run.combat=createClassicCombat(run,[boss]);let native=restoreClassicNativeBattle(run.combat,run);native.p1.active[0].boosts.atk=2;run.combat.snapshot=snapshotClassicNativeBattle(native);
for(let i=0;i<12&&run.encounter.phase===1;i++){run.combat=playClassicCombat(run,{type:'move',move:'nightshade'});run.party=run.combat.teams[0];if(i===0)assert.equal(run.encounter.phase,1,'The first 75%-HP boundary never transforms');}
assert.equal(run.encounter.phase,2);assert.notEqual(run.combat.teams[1][0].sourceImage,'old-boss-front');assert.notEqual(run.combat.teams[1][0].sourceBackImage,'old-boss-back');native=restoreClassicNativeBattle(run.combat,run);assert.equal(native.rogueFinal.transitionCount,1);assert.equal(native.p2.active[0].species.id,'eternatuseternamax');assert.equal(native.p2.active[0].maxhp,651);assert.equal(native.p2.active[0].hp,651);assert.equal(native.p2.active[0].getAbility().id,'pressure');
assert.equal(native.p2.active[0].baseMoveSlots.find(m=>m.id==='recover').maxpp,1);assert.equal(native.p1.active.length,2);assert.equal(native.p2.active.length,1);assert.equal(native.p1.active[0].boosts.atk,2);assert.equal(run.combat.requests[0].actors.length,2);assert.ok(run.combat.events.some(e=>e.kind==='form'));
run.modifiers.push({id:'luckyegg',boxId:'hero-0',count:2});run.combat.modifiers.push({id:'luckyegg',boxId:'hero-0',count:2});
const commands=run.combat.requests[0].actors.filter(a=>a.kind==='move').map(a=>{const move=a.moves.find(m=>m.id==='nightshade');return {actor:a.slot,type:'move',move:move.id,target:1};});
run.combat=playClassicCombat(run,{type:'turn',actions:commands});assert.equal(run.encounter.phase,2);native=restoreClassicNativeBattle(run.combat,run);assert.equal(native.rogueFinal.transitionCount,1);assert.equal(native.p2.active.length,1);
// Complete the synthetic final encounter through the public game-action path.
// Re-inject the pending move on each turn so it is present on the winning turn;
// discard it on earlier turns to keep this fixture focused on the victory boundary.
const document={coins:0,collection:[]},state=ensureClassicState(document);state.slots[0]=run;run.screen='battle';run.money=0;for(let i=0;i<30&&!run.combat.ended;i++){run.party=run.combat.teams[0];run.pendingMoves=[{boxId:'hero-0',move:'Tackle',level:100}];const actions=run.combat.requests[0].actors.filter(a=>a.kind==='move').map(a=>{const m=a.moves.find(m=>m.id==='nightshade')||a.moves.find(m=>m.id==='swordsdance');assert.ok(m);return {actor:a.slot,type:'move',move:m.id,...(m.targets.length?{target:1}:{})};});applyClassicAction(document,{action:'turn',command:{type:'turn',actions}});if(!run.combat.ended&&run.screen==='learn'){run.pendingMoves=[];run.screen='battle';}}
assert.equal(run.combat.ended,true);assert.equal(run.combat.winner,0);assert.equal(run.screen,'learn');assert.equal(run.afterLearn,'victory');assert.equal(document.coins,22100);applyClassicAction(document,{action:'learn',boxId:'hero-0',move:'Tackle',slot:0});assert.equal(run.screen,'victory');assert.ok(run.party.find(p=>p.boxId==='hero-0').moves.includes('Tackle'));assert.equal(run.coinRewards.filter(wave=>wave===200).length,1);
assert.throws(()=>applyClassicAction(document,{action:'turn',command:{type:'move',move:'nightshade'}}),/전투 중/);assert.equal(document.coins,22100);
console.log('Same-actor final transition at last shield: 4→5 shields, E-Max HP651/Pressure/Recover1PP, preserved lead boosts/PP, second ally only, asymmetric 2v1 and resumed real turn passed');
