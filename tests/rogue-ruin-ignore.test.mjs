import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
function fixture(ruin,move,breaker='moldbreaker',modern=true,passive=false,attackerPassive=false){
 const hero=makeReferenceMon(151,70,{boxId:'hero',moves:[move,'Splash'],ability:attackerPassive?'pressure':breaker});
 if(attackerPassive)hero.roguePassiveAbility=breaker;
 const foe=makeReferenceMon(151,100,{boxId:'foe',moves:['Splash'],ability:passive?'pressure':ruin});if(passive)foe.roguePassiveAbility=ruin;
 const r={id:'ruin',wave:30,biome:1,rng:1234,screen:'battle',party:[hero],modifiers:[],tools:{},balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'}};if(modern)r.ruinIgnoreRule='source-subset-v1';r.combat=createClassicCombat(r,[foe],{trainer:true});return r;
}
function hit(r){const b=restoreClassicNativeBattle(r.combat,r),foe=b.p2.active[0],before=foe.hp;b.makeChoices('move 1','move 1');return {damage:before-foe.hp,b};}
for(const [ruin,move] of [['vesselofruin','Water Gun'],['tabletsofruin','Tackle']])for(const passive of [false,true]){
 const baseline=hit(fixture('pressure',move)).damage;
 const ordinary=hit(fixture(ruin,move,'pressure',true,passive)).damage;assert.ok(ordinary<baseline);
 for(const breaker of ['moldbreaker','teravolt','turboblaze'])for(const attackerPassive of [false,true]){const legacy=hit(fixture(ruin,move,breaker,false,passive,attackerPassive)).damage,modern=hit(fixture(ruin,move,breaker,true,passive,attackerPassive)).damage;assert.equal(modern,baseline,`${ruin} ${breaker} passive=${passive}`);assert.equal(legacy,ordinary);}
 assert.ok(!Dex.abilities.get(ruin).flags.breakable,'shared ability catalog stays unchanged');
}
// Suppressing Mold Breaker restores the Ruin reduction.
for(const passive of [false,true]){const r=fixture('tabletsofruin','Tackle','moldbreaker',true,false,passive),b=restoreClassicNativeBattle(r.combat,r),foe=b.p2.active[0],before=foe.hp;b.p1.active[0].addVolatile('gastroacid');b.makeChoices('move 1','move 1');const ordinary=hit(fixture('tabletsofruin','Tackle','pressure')).damage;assert.equal(before-foe.hp,ordinary);}
// Full-save restoration retains both the rule and passive components.
{const {ensureClassicState}=await import('../lib/rogue-classic-state.mjs'),{encodeGameData,decodeGameData}=await import('../lib/game-storage.mjs');let r=fixture('vesselofruin','Water Gun','moldbreaker',true,true,true),b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 2','move 1');r.combat.snapshot=snapshotClassicNativeBattle(b);let doc={coins:5},state=ensureClassicState(doc);state.slots[0]=r;state.slots[1]={id:'other',party:[{safe:true}]};doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);r=state.slots[0];assert.equal(r.combat.ruinIgnoreRule,'source-subset-v1');b=restoreClassicNativeBattle(r.combat,r);const baseline=hit(fixture('pressure','Water Gun')).damage,foe=b.p2.active[0],before=foe.hp;b.makeChoices('move 1','move 1');assert.ok(before-foe.hp>hit(fixture('vesselofruin','Water Gun','pressure')).damage);assert.ok(Math.abs((before-foe.hp)-baseline)<=Math.ceil(baseline*.15));assert.deepEqual(state.slots[1],{id:'other',party:[{safe:true}]});}
// Moves that ignore abilities also bypass the source-designated Ruin effects.
for(const [ruin,move] of [['tabletsofruin','Sunsteel Strike'],['vesselofruin','Moongeist Beam']]){const baseline=hit(fixture('pressure',move,'pressure')).damage,legacy=hit(fixture(ruin,move,'pressure',false)).damage,modern=hit(fixture(ruin,move,'pressure',true)).damage;assert.equal(modern,baseline);assert.ok(legacy<modern);}
