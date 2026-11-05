import test from 'node:test';
import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import policy from '../data/rogue-called-move-policy.json' with {type:'json'};
import {rogueReferenceData,makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicMetronomeMoves,installClassicCalledMovePolicy} from '../lib/rogue-called-move-policy.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {syncNativeTeams} from '../lib/party-battle.mjs';
import {ensureClassicState,startClassicRun} from '../lib/rogue-classic-state.mjs';
import {starterCatalog} from '../lib/rogue-starter-system.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

const nativePool=()=>Dex.moves.all().filter(move=>(!move.isNonstandard||move.isNonstandard==='Unobtainable')&&move.flags.metronome).map(move=>move.id);
const nativeId=name=>name.replace(/__(PHYSICAL|SPECIAL)$/,'').toLowerCase().replaceAll('_','').replace('tenmillionvoltthunderbolt','10000000voltthunderbolt');
function fixture({modern=true,enemy=false,doubles=false,ability='runaway',targetAbility='runaway',lens=0,hardcore=false}={}){
 const party=[makeReferenceMon(151,100,{boxId:'caller',moves:['Metronome','Splash'],ability,teraType:'Stellar'})],foes=[makeReferenceMon(80,400,{boxId:'target',moves:['Splash'],ability:targetAbility})];
 if(doubles){party.push(makeReferenceMon(151,100,{boxId:'ally',moves:['Splash'],ability:'runaway'}));foes.push(makeReferenceMon(242,400,{boxId:'target2',moves:['Splash'],ability:'runaway'}));}
 const run={id:'source-call-pool',wave:30,biome:5,rng:42,screen:'battle',party:enemy?foes:party,modifiers:lens?[{id:'multilens',boxId:'caller',count:lens}]:[],tools:{},balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'},adaptabilityRule:'source-subset-v2',moveBalanceRule:'source-subset-v2',moveFlagRule:'source-subset-v1'};
 if(modern)run.calledMoveRule='source-pool-v1';if(hardcore){run.challengeEligibilityRule='source-subset-v1';run.challenges=[{id:9,value:1}];}
 run.combat=createClassicCombat(run,enemy?party:foes,{trainer:true,doubles});return run;
}
function probe(run,{called='silverwind',enemy=false}={}){
 const b=restoreClassicNativeBattle(run.combat,run),side=enemy?1:0,p=b.sides[side].active[0],sample=b.sample.bind(b),pools=[],seen=[],hits=[],calledInputs=[];
 b.sample=values=>{if(values===classicMetronomeMoves||values.some(move=>move?.id==='pound')){pools.push(values.map(move=>typeof move==='string'?move:move.id));return values.find(move=>move===called||move?.id===called)||sample(values);}return sample(values);};
 const useMove=b.actions.useMove;Object.defineProperty(b.actions,'useMove',{configurable:true,value(move,pokemon,...args){if(pokemon.side.n===side)calledInputs.push(typeof move==='string'?move:move.id);return useMove.call(this,move,pokemon,...args);}});
 b.onEvent('Accuracy',b.format,{priority:-100},()=>true);b.onEvent('PrepareHit',b.format,{priority:-100},function(source,target,move){if(source.side.n===side)seen.push({id:move.id,power:move.basePower,flags:{...move.flags}});});b.onEvent('DamagingHit',b.format,{priority:-100},function(damage,target,source,move){if(source.side.n===side)hits.push({damage,id:move.id,target:target.set.trainerToken});});
 return {b,p,pools,seen,hits,calledInputs,turn(command='move metronome',other='move splash'){b.makeChoices(...(enemy?[other,command]:[command,other]));}};
}
async function recover(run,b){
 run.combat.teams=syncNativeTeams(b,run.combat.teams);run.party=run.combat.teams[0];run.combat.snapshot=snapshotClassicNativeBattle(b);
 const doc={coins:73,adventure:{preserve:true}},state=ensureClassicState(doc);state.slots[0]=run;state.slots[1]={id:'other-slot',preserve:true};const restored=await decodeGameData(await encodeGameData(doc));assert.equal(restored.coins,73);assert.deepEqual(restored.adventure,{preserve:true});assert.deepEqual(restored.classic.slots[1],{id:'other-slot',preserve:true});return restored.classic.slots[0];
}

test('the source pool includes all794 eligible IDs and excludes the full86 unimplemented and43 banned sets',()=>{
 assert.equal(policy.sourceCommit,'7c0881255af5cd51992e513ff93c2f71adbe40e0');assert.equal(policy.sourceMoveCount,920);assert.equal(policy.unimplemented.length,86);assert.equal(policy.metronomeBanned.length,43);assert.equal(classicMetronomeMoves.length,794);assert.equal(new Set(classicMetronomeMoves).size,794);
 const denied=new Set([...policy.unimplemented,...policy.metronomeBanned]),expected=Object.entries(rogueReferenceData.enums.MoveId).filter(([name,id])=>typeof id==='number'&&id>0&&!denied.has(name)).sort((a,b)=>a[1]-b[1]).map(([name])=>nativeId(name));assert.deepEqual(classicMetronomeMoves,expected);
 for(const id of classicMetronomeMoves)assert.equal(Dex.moves.get(id).exists,true,id);
 for(const name of denied)assert.equal(classicMetronomeMoves.includes(nativeId(name)),false,name);
 for(const id of ['silverwind','astralbarrage','powershift','zippyzap'])assert.ok(classicMetronomeMoves.includes(id),id);
 for(const id of ['allyswitch','corrosivegas','fling','magicroom','recycle','wonderroom','revivalblessing','metronome','naturepower'])assert.equal(classicMetronomeMoves.includes(id),false,id);
 assert.equal(nativePool().length,581);
});

test('actual Metronome uses source candidates, numeric data and move flags instead of native Past filtering',()=>{
 const p=probe(fixture({targetAbility:'windrider'}));p.turn();assert.equal(p.pools.length,1);assert.deepEqual(p.pools[0],classicMetronomeMoves);assert.ok(p.calledInputs.includes('silverwind'));assert.equal(p.seen.find(move=>move.id==='silverwind').flags.wind,1);assert.equal(p.hits.length,0);assert.equal(p.b.p2.active[0].boosts.atk,1);assert.deepEqual(p.p.stellarBoostedTypes,['Bug']);
 const signature=probe(fixture(),{called:'astralbarrage'});signature.turn();assert.equal(signature.seen.find(move=>move.id==='astralbarrage').power,110);assert.ok(signature.hits.some(hit=>hit.id==='astralbarrage'));assert.deepEqual(signature.p.stellarBoostedTypes,['Ghost']);
});

test('enemy callers use the same policy and called spread moves retain native doubles targeting',()=>{
 const enemy=probe(fixture({enemy:true}),{enemy:true});enemy.turn();assert.equal(enemy.pools[0].length,794);assert.ok(enemy.hits.some(hit=>hit.id==='silverwind'&&hit.target==='target'));
 const spread=probe(fixture({doubles:true}),{called:'surf'});spread.turn('move metronome,move splash','move splash,move splash');for(const target of ['ally','target','target2'])assert.ok(spread.hits.some(hit=>hit.id==='surf'&&hit.target===target),target);
});

test('one actual source call consumes only Metronome PP through repeated codec recovery',async()=>{
 let run=fixture(),p=probe(run);const initial=p.p.moveSlots.map(move=>move.pp);
 for(let turn=1;turn<=3;turn++){p.turn();assert.equal(p.pools.length,1);assert.equal(p.calledInputs.filter(id=>id==='silverwind').length,1);assert.equal(p.p.moveSlots[0].pp,initial[0]-turn);assert.equal(p.p.moveSlots[1].pp,initial[1]);assert.equal(p.p.moveSlots.length,2);run=await recover(run,p.b);assert.equal(run.calledMoveRule,'source-pool-v1');assert.equal(run.combat.calledMoveRule,'source-pool-v1');p=probe(run);}
});

test('native sample progression and the next actual call match uninterrupted and saved execution',async t=>{
 t.mock.method(Date,'now',()=>1793836800000);
 const run=fixture(),a=restoreClassicNativeBattle(run.combat,run);a.makeChoices('move metronome','move splash');const saved=await recover(run,a),b=restoreClassicNativeBattle(saved.combat,saved);
 a.makeChoices('move metronome','move splash');b.makeChoices('move metronome','move splash');const original=snapshotClassicNativeBattle(a),recovered=snapshotClassicNativeBattle(b);assert.deepEqual(recovered.prng,original.prng);assert.deepEqual(recovered.log,original.log);assert.deepEqual(recovered.sides.map(s=>s.pokemon.map(p=>p.hp)),original.sides.map(s=>s.pokemon.map(p=>p.hp)));assert.equal(b.p1.active[0].moveSlots[0].pp,a.p1.active[0].moveSlots[0].pp);
});

test('real Classic commands and Hardcore preserve the source exclusions and saved rule',async()=>{
 let run=fixture({hardcore:true});const p=probe(run,{called:'revivalblessing'});p.turn();assert.equal(p.pools[0].length,794);assert.ok(!p.pools[0].includes('revivalblessing'));assert.ok(!p.calledInputs.includes('revivalblessing'));
 run=fixture();run.combat=playClassicCombat(run,{type:'move',move:'metronome'});assert.ok(run.combat.snapshot.log.some(line=>line.includes('|Metronome|')));assert.equal(run.combat.requests[0].moves.find(move=>move.id==='metronome').pp,9);run=await recover(run,restoreClassicNativeBattle(run.combat,run));run.combat=playClassicCombat(run,{type:'move',move:'metronome'});assert.equal(run.combat.calledMoveRule,'source-pool-v1');
});

test('called attacks retain additional-hit hooks without repeating Metronome or PP deductions',()=>{
 const p=probe(fixture({lens:1}),{called:'slash'});p.turn();assert.equal(p.pools.length,1);assert.equal(p.calledInputs.filter(id=>id==='slash').length,1);assert.equal(p.hits.filter(hit=>hit.id==='slash').length,2);assert.equal(p.p.moveSlots[0].pp,9);assert.equal(p.p.moveSlots[1].pp,40);assert.deepEqual(p.p.stellarBoostedTypes,['Normal']);
});

test('legacy snapshots and other battles keep native candidates and methods, and installing twice is inert',()=>{
 const native=Dex.moves.get('metronome').onHit,modern=probe(fixture()),dex=modern.b.dex;installClassicCalledMovePolicy(modern.b,modern.b.rogueCombat);installClassicCalledMovePolicy(modern.b,{calledMoveRule:'source-pool-v1'});assert.equal(modern.b.dex,dex);
 const legacy=probe(fixture({modern:false}));legacy.turn();assert.equal(legacy.pools[0].length,581);assert.ok(!legacy.calledInputs.includes('silverwind'));assert.equal(legacy.b.dex.moves.get('metronome').onHit,native);assert.equal(Dex.moves.get('metronome').onHit,native);assert.notEqual(modern.b.dex.moves.get('metronome'),legacy.b.dex.moves.get('metronome'));
 const doc={},state=ensureClassicState(doc,{initialStarterId:1}),starter=starterCatalog(state.system).find(p=>p.id===1),run=startClassicRun(doc,[{id:1,ability:starter.abilities[0].key,nature:starter.natures[0].key,gender:starter.genders[0],shiny:false,moves:starter.defaultMoves}]);assert.equal(run.calledMoveRule,'source-pool-v1');delete run.calledMoveRule;assert.equal(ensureClassicState(doc).slots[0].calledMoveRule,undefined);
});

test('all219 newly source-eligible candidates execute and their immediate native snapshot restores',()=>{
 const old=new Set(nativePool()),additional=classicMetronomeMoves.filter(id=>!old.has(id));assert.equal(additional.length,219);
 for(const called of additional){try{const run=fixture(),p=probe(run,{called});p.turn();assert.ok(p.calledInputs.includes(called));run.combat.snapshot=snapshotClassicNativeBattle(p.b);assert.doesNotThrow(()=>restoreClassicNativeBattle(run.combat,run));}catch(cause){throw new Error(`source Metronome candidate ${called}`,{cause});}}
});
