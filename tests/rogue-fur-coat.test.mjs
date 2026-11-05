import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
function fixture(move,ability='furcoat',modern=true,passive=false,breaker=false){
 const hero=makeReferenceMon(151,70,{boxId:'hero',moves:[move,'Splash'],ability:breaker?'moldbreaker':'pressure'});
 const foe=makeReferenceMon(151,100,{boxId:'foe',moves:['Splash'],ability:passive?'pressure':ability});if(passive)foe.roguePassiveAbility=ability;
 const r={id:'fur-coat',wave:30,biome:1,rng:1234,screen:'battle',party:[hero],modifiers:[],tools:{},balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'}};if(modern)r.furCoatRule='source-subset-v1';r.combat=createClassicCombat(r,[foe],{trainer:true});return r;
}
function hit(r){const b=restoreClassicNativeBattle(r.combat,r),foe=b.p2.active[0],before=foe.hp;b.makeChoices('move 1','move 1');return {damage:before-foe.hp,b};}
// Source Fur Coat checks move category, even for attacks using a different stat.
for(const passive of [false,true])for(const move of ['Tackle','Body Press','Foul Play','Water Gun','Psyshock','Psystrike','Secret Sword','Seismic Toss']){const baseline=hit(fixture(move,'pressure')).damage,source=hit(fixture(move,'furcoat',true,passive)).damage,legacy=hit(fixture(move,'furcoat',false,passive)).damage;
 if(['Tackle','Body Press','Foul Play'].includes(move))assert.equal(source,Math.max(1,Math.floor(baseline/2)),move);
 else assert.equal(source,baseline,move);
 if(['Psyshock','Psystrike','Secret Sword'].includes(move))assert.ok(legacy<source,move);
}
// Native suppression and ability ignoring still bypass the source reduction.
for(const passive of [false,true]){const baseline=hit(fixture('Tackle','pressure')).damage;assert.equal(hit(fixture('Tackle','furcoat',true,passive,true)).damage,baseline);const r=fixture('Tackle','furcoat',true,passive),b=restoreClassicNativeBattle(r.combat,r),foe=b.p2.active[0],before=foe.hp;foe.addVolatile('gastroacid');b.makeChoices('move 1','move 1');assert.equal(before-foe.hp,baseline);}
// The per-battle callback does not change the global ability catalog.
{const callback=Dex.abilities.get('furcoat').onModifyDef,r=fixture('Tackle'),b=restoreClassicNativeBattle(r.combat,r);assert.equal(b.dex.abilities.get('furcoat').onModifyDef,undefined);assert.equal(Dex.abilities.get('furcoat').onModifyDef,callback);}
// Full-save recovery keeps the category rule and protects other slots.
for(const passive of [false,true]){const {ensureClassicState}=await import('../lib/rogue-classic-state.mjs'),{encodeGameData,decodeGameData}=await import('../lib/game-storage.mjs');let r=fixture('Psyshock','furcoat',true,passive),b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 2','move 1');r.combat.snapshot=snapshotClassicNativeBattle(b);let doc={coins:5},state=ensureClassicState(doc);state.slots[0]=r;state.slots[1]={id:'other',party:[{safe:true}]};doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);r=state.slots[0];assert.equal(r.combat.furCoatRule,'source-subset-v1');const legacy=structuredClone(r);delete legacy.furCoatRule;delete legacy.combat.furCoatRule;assert.ok(hit(r).damage>hit(legacy).damage);assert.deepEqual(state.slots[1],{id:'other',party:[{safe:true}]});}
