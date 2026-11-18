import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

// Pinned source applies HealStatusEffectAttr on the last hit, per hit target:
// https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/moves/move.ts#L3218
// https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/phases/move-effect-phase.ts#L269
async function trial({immune=false,lens=0,modern=true,protect=false,shield=false,substitute=false,solo=false,heroAbility='noguard'}={}){
 const mon=(id,boxId,move,ability='runaway')=>makeReferenceMon(id,100,{boxId,moves:[move],ability});
 const hero=mon(151,'hero','Sparkling Aria',heroAbility),ally=mon(143,'ally','Splash'),foe1=mon(143,'foe1',protect?'Protect':'Splash',immune?'waterabsorb':shield?'shielddust':'runaway'),foe2=mon(143,'foe2','Splash');
 for(const p of [ally,foe1,foe2])p.status='brn';
 const run={id:'aria-order',seed:'aria-order',rng:42,wave:20,screen:'battle',party:solo?[hero]:[hero,ally],modifiers:lens?[{id:'multilens',boxId:'hero',count:lens}]:[],tools:{},encounter:{kind:'trainer'},multiLensRule:'source-subset-v2',multiLensSpreadRule:'source-v1',multiLensSpreadFaintRule:'source-v1',...(modern?{sparklingAriaOrderRule:'source-v1'}:{}),spreadSecondaryOrderRule:'source-v3',ordinarySpreadFaintRule:'source-v1',multiLensFirstHitRule:'reviewed-spread-effects-v1'};
 run.combat=createClassicCombat(run,solo?[foe1]:[foe1,foe2],{trainer:true,doubles:!solo});assert.equal(run.combat.sparklingAriaOrderRule,modern?'source-v1':null);
 const battle=restoreClassicNativeBattle(run.combat,run);if(substitute){battle.p2.active[0].addVolatile('substitute');assert.ok(battle.p2.active[0].volatiles.substitute);}battle.makeChoices(solo?'move sparklingaria':'move sparklingaria,move splash',solo?(protect?'move protect':'move splash'):(protect?'move protect,move splash':'move splash,move splash'));run.combat.snapshot=snapshotClassicNativeBattle(battle);
 const saved=await decodeGameData(await encodeGameData({run,other:{safe:true}}));assert.deepEqual(saved.other,{safe:true});assert.equal(saved.run.combat.sparklingAriaOrderRule,modern?'source-v1':null);return restoreClassicNativeBattle(saved.run.combat,saved.run);
}
test('Sparkling Aria cures eligible surviving targets and preserves the result after restoring the battle',async()=>{
 const b=await trial();assert.equal(b.p1.pokemon[1].status,'');assert.equal(b.p2.pokemon[0].status,'');assert.equal(b.p2.pokemon[1].status,'');
});
test('Sparkling Aria does not cure a water-immune target but still cures the others',async()=>{
 const b=await trial({immune:true});assert.equal(b.p1.pokemon[1].status,'');assert.equal(b.p2.pokemon[0].status,'brn');assert.equal(b.p2.pokemon[1].status,'');
});
test('Apply each target’s burn cure after its final hit before proceeding to the next target, as in the pinned source',async()=>{
 const b=await trial(),log=b.log,lastDamage=log.findLastIndex(line=>line.includes('|-damage|')&&/p[12][ab]:/.test(line));
 const curesBeforeLastDamage=log.slice(0,lastDamage).filter(line=>line.includes('|-curestatus|')&&line.includes('|brn|'));assert.equal(curesBeforeLastDamage.length,2);
});
test('Multi Lens applies cures during the final hit, preserving all earlier hits',async()=>{
 const b=await trial({lens:2}),log=b.log,firstCure=log.findIndex(line=>line.includes('|-curestatus|')),damages=log.map((line,index)=>({line,index})).filter(x=>x.line.includes('|-damage|')&&/p[12][ab]:/.test(x.line));
 assert.ok(firstCure>0);assert.ok(damages.filter(x=>x.index<firstCure).length>=14);assert.ok(damages.some(x=>x.index>firstCure));assert.equal(b.p1.pokemon[1].status,'');assert.equal(b.p2.pokemon[0].status,'');assert.equal(b.p2.pokemon[1].status,'');
});
test('a protected target keeps its burn while other targets are cured',async()=>{const b=await trial({protect:true});assert.equal(b.p2.pokemon[0].status,'brn');assert.equal(b.p2.pokemon[1].status,'');assert.equal(b.p1.pokemon[1].status,'');});
test('Shield Dust on one spread target does not prevent the spread cure',async()=>{const b=await trial({shield:true});assert.equal(b.p2.pokemon[0].status,'');assert.equal(b.p2.pokemon[1].status,'');assert.equal(b.p1.pokemon[1].status,'');});
test('Shield Dust prevents the cure when it is the only target',async()=>{const b=await trial({shield:true,solo:true});assert.equal(b.p2.pokemon[0].status,'brn');});
test('a single target without Shield Dust is cured',async()=>{const b=await trial({solo:true});assert.equal(b.p2.pokemon[0].status,'');});
test('Multi Lens respects protection and water immunity',async()=>{for(const option of [{protect:true},{immune:true}]){const b=await trial({...option,lens:2});assert.equal(b.p2.pokemon[0].status,'brn');assert.equal(b.p2.pokemon[1].status,'');assert.equal(b.p1.pokemon[1].status,'');}});
test('Sheer Force preserves the existing suppression of the cure',async()=>{const b=await trial({heroAbility:'sheerforce'});assert.equal(b.p1.pokemon[1].status,'brn');assert.equal(b.p2.pokemon[0].status,'brn');assert.equal(b.p2.pokemon[1].status,'brn');});
test('the sound move cures through a substitute',async()=>{const b=await trial({substitute:true});assert.equal(b.p2.pokemon[0].status,'');assert.equal(b.p2.pokemon[1].status,'');});
test('legacy games retain their previous after-move order',async()=>{const b=await trial({modern:false}),log=b.log,lastDamage=log.findLastIndex(line=>line.includes('|-damage|')&&/p[12][ab]:/.test(line));assert.equal(log.slice(0,lastDamage).filter(line=>line.includes('|-curestatus|')&&line.includes('|brn|')).length,0);});
test('the normal turn command retains results and rule after save and reload',async()=>{
 const mon=(id,boxId,move)=>makeReferenceMon(id,50,{boxId,moves:[move],ability:'noguard'}),hero=mon(151,'hero','Sparkling Aria'),ally=mon(143,'ally','Splash'),foes=[mon(143,'foe1','Splash'),mon(143,'foe2','Splash')];for(const p of [ally,...foes])p.status='brn';
 const run={id:'aria-turn',seed:'aria-turn',rng:42,wave:20,screen:'battle',party:[hero,ally],modifiers:[],tools:{},encounter:{kind:'trainer'},sparklingAriaOrderRule:'source-v1',spreadSecondaryOrderRule:'source-v3',ordinarySpreadFaintRule:'source-v1'};
 run.combat=createClassicCombat(run,foes,{trainer:true,doubles:true});run.combat=playClassicCombat(run,{type:'turn',actions:[{actor:0,type:'move',move:'sparklingaria'},{actor:1,type:'move',move:'splash'}]});run.party=run.combat.teams[0];
 const saved=await decodeGameData(await encodeGameData({run,other:{safe:true}}));assert.deepEqual(saved.other,{safe:true});assert.equal(saved.run.combat.sparklingAriaOrderRule,'source-v1');const b=restoreClassicNativeBattle(saved.run.combat,saved.run);assert.equal(b.p1.pokemon[1].status,'');assert.equal(b.p2.pokemon[0].status,'');assert.equal(b.p2.pokemon[1].status,'');
});
test('new games enable the ordering without modifying the other save slot',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs'),{starterCatalog}=await import('../lib/rogue-starter-system.mjs'),doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};
 const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'aria-start'});assert.equal(run.sparklingAriaOrderRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});
