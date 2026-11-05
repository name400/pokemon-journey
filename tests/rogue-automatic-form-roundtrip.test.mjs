import test from 'node:test';import assert from 'node:assert/strict';
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {calculateStats} from '../lib/pokemon-config.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
function fixture(id,moves=['Splash'],patch={}){const r={wave:21,party:[makeReferenceMon(id,50,{boxId:'hero',moves,...patch})],modifiers:[],tools:{},encounter:{kind:'wild'},rng:42};r.combat=createClassicCombat(r,[makeReferenceMon(143,50,{boxId:'foe',moves:['Splash']})]);r.party=r.combat.teams[0];return {r,b:restoreClassicNativeBattle(r.combat,r)};}
test('two Stance transitions within one native battle apply both source species and stats immediately',()=>{
 const {r,b}=fixture(681,['Slash',"King's Shield"],{roguePassiveAbility:'battlearmor'}),p=b.p1.active[0];b.makeChoices('move slash','move splash');assert.equal(p.species.id,'aegislashblade');assert.equal(p.hasAbility('sharpness'),true);b.makeChoices('move kingsshield','move splash');assert.equal(p.species.id,'aegislash');assert.equal(p.hasAbility('battlearmor'),true);assert.equal(p.storedStats.atk,calculateStats(r.party[0]).atk);r.combat.snapshot=snapshotClassicNativeBattle(b);assert.equal(restoreClassicNativeBattle(r.combat,r).p1.active[0].species.id,'aegislash');
});
test('repeated weather changes in one native battle do not reuse the preceding source-form snapshot',()=>{
 const {r,b}=fixture(351),p=b.p1.active[0];for(const [weather,index,key]of [['sunnyday',1,'castformsunny'],['raindance',2,'castformrainy'],['snow',3,'castformsnowy']]){b.field.setWeather(weather,p);assert.equal(p.species.id,key);assert.equal(r.party[0].rogueFormIndex,index);assert.deepEqual(p.species.baseStats,rogueSpecies.get(351).formList[index].baseStats);}b.field.clearWeather();assert.equal(p.species.id,'castform');assert.equal(r.party[0].rogueFormIndex,0);
});
test('Schooling round trips apply Flip HP deltas only once in the same native instance',()=>{
 const {r,b}=fixture(746,['Splash'],{rogueFlipStats:true}),p=b.p1.active[0];p.hp=1;let max=p.maxhp;b.makeChoices('move splash','move splash');assert.equal(p.species.id,'wishiwashi');assert.equal(p.maxhp,calculateStats(r.party[0]).hp);assert.equal(p.hp,1+Math.max(0,p.maxhp-max));p.hp=p.maxhp;const hp=p.hp;max=p.maxhp;b.makeChoices('move splash','move splash');assert.equal(p.species.id,'wishiwashischool');assert.equal(p.maxhp,calculateStats(r.party[0]).hp);assert.equal(p.hp,Math.min(p.maxhp,hp+Math.max(0,p.maxhp-max)));r.combat.snapshot=snapshotClassicNativeBattle(b);const restored=restoreClassicNativeBattle(r.combat,r);assert.equal(restored.p1.active[0].maxhp,p.maxhp);assert.equal(restored.p1.active[0].hp,p.hp);
});
