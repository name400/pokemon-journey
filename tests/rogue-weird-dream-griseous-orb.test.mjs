import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicDreamNativeItem} from '../lib/rogue-dream-native-items.mjs';
import {prepareWeirdDreamEncounter} from '../lib/rogue-weird-dream.mjs';
import {stageClassicDnaFusion} from '../lib/rogue-dna-fusion-stage.mjs';
import {validatedClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {applyClassicAction,activeClassicRun} from '../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';

function dream(rule='reviewed-native-v3',fused=false){
 let {doc,run}=fixture([4,1,25].map((id,i)=>makeReferenceMon(id,50,{boxId:'old'+i,item:i===0?'griseousorb':'',moves:['Splash']})));
 if(fused){run.party.push(makeReferenceMon(7,50,{boxId:'donor',moves:['Splash']}));run=stageClassicDnaFusion(run,{primaryBoxId:'old0',donorBoxId:'donor'}).run;run.weirdDreamFusionRule='validated-v1';doc.classic.slots[0]=run;}
 if(rule)run.dreamNativeItemsRule=rule;else delete run.dreamNativeItemsRule;const prepared=prepareWeirdDreamEncounter(run);if(!prepared)return {doc,run};
 run.rng=prepared.rng;run.combat=null;run.screen='mystery';run.encounter={kind:'mystery',key:'weird-dream'};
 const drafts=run.party.map((old,i)=>{const mon=makeReferenceMon([487,10,16][i],50,{boxId:'new'+i,moves:i===0?['Shadow Ball']:['Splash']});return {oldBoxId:old.boxId,mon,dexIvs:mon.ivs,eggMoveIndex:null};});
 run.mystery={type:'weird-dream',stage:'choose',drafts,alternateTrainer:prepared.alternateTrainer};return {doc,run};
}
for(const job of ['transform','battle','leave'])test(`reviewed Griseous Orb survives ${job} event choice and codec`,async()=>{
 let {doc}=dream();const adventure=structuredClone(doc.adventure),other=structuredClone(doc.classic.slots[1]);
 applyClassicAction(doc,{action:'mysterySelect',job});doc=await decodeGameData(await encodeGameData(doc));applyClassicAction(doc,{action:'mysteryConfirm'});doc=await decodeGameData(await encodeGameData(doc));const run=activeClassicRun(doc);
 assert.equal(run.party[0].item,'griseousorb');if(job==='transform'){assert.equal(run.party[0].boxId,'new0');assert.equal(run.screen,'reward');}else if(job==='battle'){assert.equal(run.screen,'battle');assert.equal(run.combat.teams[1][0].item,'griseousorb');assert.equal(run.combat.teams[1][0].rogueNativeItemNontransferable,true);}else assert.equal(run.party[0].boxId,'old0');
 assert.deepEqual(doc.adventure,adventure);assert.deepEqual(doc.classic.slots[1],other);
});
test('Griseous Orb keeps its Giratina-specific Ghost damage effect after transformation and save',async()=>{
 let {doc}=dream();applyClassicAction(doc,{action:'mysterySelect',job:'transform'});applyClassicAction(doc,{action:'mysteryConfirm'});doc=await decodeGameData(await encodeGameData(doc));const run=activeClassicRun(doc);run.party=[run.party[0]];run.screen='battle';run.encounter={kind:'wild'};
 const damage=(item,species=487)=>{const copy=structuredClone(run);if(species!==487)copy.party[0]=makeReferenceMon(species,50,{boxId:'new0',moves:['Shadow Ball']});copy.party[0].item=item;copy.party[0].ability='noguard';copy.combat=createClassicCombat(copy,[makeReferenceMon(151,100,{boxId:'foe',moves:['Splash'],ability:'runaway'})]);const b=restoreClassicNativeBattle(copy.combat,copy);b.randomizer=n=>n;b.randomChance=()=>false;const target=b.p2.active[0],before=target.hp;b.makeChoices('move shadowball','move splash');assert.equal(b.p1.active[0].species.num,species);assert.equal(b.p1.active[0].species.id,species===487?'giratina':'mew');assert.ok(before-target.hp>0,JSON.stringify({log:b.log.slice(-10),moves:b.p1.active[0].moves,item:b.p1.active[0].item}));return before-target.hp;};
 const withOrb=damage('griseousorb'),withoutOrb=damage('');assert.ok(withOrb>withoutOrb,JSON.stringify({withOrb,withoutOrb}));assert.equal(damage('griseousorb',151),damage('',151));
});
test('legacy policies and unreviewed form items remain unchanged',()=>{
 for(const rule of [null,'reviewed-native-v2']){const {doc,run}=dream(rule),before=structuredClone(doc);assert.equal(prepareWeirdDreamEncounter(run),null);assert.deepEqual(doc,before);}
 assert.equal(classicDreamNativeItem({item:'rustedsword'},{dreamNativeItemsRule:'reviewed-native-v3'}),null);assert.equal(classicDreamNativeItem({item:'griseouscore'},{dreamNativeItemsRule:'reviewed-native-v3'}),null);
});
test('fresh run opts in without altering another slot',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs');const {starterCatalog}=await import('../lib/rogue-starter-system.mjs');const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);state.slots[1]={keep:true};const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'orb',seed:'orb'});assert.equal(run.dreamNativeItemsRule,'reviewed-native-v3');assert.deepEqual(state.slots[1],{keep:true});
});

for(const job of ['transform','battle','leave'])test(`fused party safely retains Griseous Orb through ${job}`,async()=>{
 let {doc}=dream('reviewed-native-v3',true);const old=structuredClone(activeClassicRun(doc).party[0]),other=structuredClone(doc.classic.slots[1]);assert.ok(validatedClassicDnaFusion(old));
 applyClassicAction(doc,{action:'mysterySelect',job});doc=await decodeGameData(await encodeGameData(doc));applyClassicAction(doc,{action:'mysteryConfirm'});doc=await decodeGameData(await encodeGameData(doc));const run=activeClassicRun(doc);assert.equal(run.party[0].item,'griseousorb');
 if(job==='transform'){assert.equal(run.party[0].boxId,'new0');assert.equal(run.party[0].fusionSpecies,undefined);}else{assert.equal(run.party[0].boxId,'old0');assert.ok(validatedClassicDnaFusion(run.party[0]));if(job==='battle')assert.equal(run.combat.teams[1][0].item,'griseousorb');}
 assert.deepEqual(doc.classic.slots[1],other);
});

test('new policy preserves every previously reviewed native item',async()=>{
 const {default:policy}=await import('../data/rogue-dream-native-item-policy.json',{with:{type:'json'}});for(const {id} of policy.items.filter(item=>item.allowed))assert.equal(classicDreamNativeItem({item:id},{dreamNativeItemsRule:'reviewed-native-v3'}),id,id);
});
test('dream opponent retains the Giratina-specific item effect after reconnect',async()=>{
 let {doc}=dream();applyClassicAction(doc,{action:'mysterySelect',job:'battle'});applyClassicAction(doc,{action:'mysteryConfirm'});doc=await decodeGameData(await encodeGameData(doc));const run=activeClassicRun(doc);
 const damage=keep=>{const b=restoreClassicNativeBattle(run.combat,run),opponent=b.p2.active[0],target=b.p1.active[0];assert.equal(opponent.species.id,'giratina');assert.equal(opponent.item,'griseousorb');if(!keep){opponent.setItem('');assert.equal(opponent.item,'');}b.randomizer=n=>n;b.randomChance=()=>true;target.maxhp=10000;target.hp=10000;const before=target.hp;b.makeChoices('move splash','move shadowball');assert.ok(before-target.hp>0,b.log.slice(-10).join('\n'));return before-target.hp;};
 const withOrb=damage(true),withoutOrb=damage(false);assert.ok(withOrb>withoutOrb,JSON.stringify({withOrb,withoutOrb}));
});
