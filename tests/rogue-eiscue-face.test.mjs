import assert from 'node:assert/strict';
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {rogueFormArt} from '../lib/rogue-form-art.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {configure,calculateStats} from '../lib/pokemon-config.mjs';
for(const shiny of [false,true]){
 const forms=rogueSpecies.get(875).formList,base=forms.find(f=>f.formKey===''),broken=forms.find(f=>f.formKey==='no-ice'),mon=makeReferenceMon(875,50,{boxId:'ice',moves:['Splash'],shiny,...rogueFormArt(base,shiny)}),run={id:'ice-face',wave:50,biome:1,rng:42,party:[mon],modifiers:[],tools:{},encounter:{kind:'wild'},teraCharged:false};
 run.combat=createClassicCombat(run,[makeReferenceMon(19,50,{boxId:'foe',moves:['Tackle']})]);run.combat=playClassicCombat(run,{type:'move',move:'splash'});run.party=run.combat.teams[0];let native=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run),p=native.p1.active[0];assert.equal(p.species.id,'eiscuenoice');assert.equal(p.hp,p.maxhp);assert.equal(run.party[0].sourceImage,rogueFormArt(broken,shiny).sourceImage);const speed=p.storedStats.spe;
 run.combat=playClassicCombat(run,{type:'move',move:'splash'});run.party=run.combat.teams[0];native=restoreClassicNativeBattle(run.combat,run);assert.equal(native.p1.active[0].species.id,'eiscuenoice');assert.ok(native.p1.active[0].hp<native.p1.active[0].maxhp,'the next physical hit is not blocked');
 const leveled=configure(run.party[0],{level:51,hp:run.party[0].hp}),leveledNative=restoreClassicNativeBattle(run.combat,{...run,party:[leveled]});assert.equal(leveledNative.p1.active[0].level,51);assert.equal(leveledNative.p1.active[0].storedStats.spe,calculateStats({...leveled,rogueBaseStats:broken.baseStats}).spe);
 native.field.setWeather('hail',native.p1.active[0],native.dex.moves.get('hail'));assert.equal(native.p1.active[0].species.id,'eiscue');assert.ok(native.p1.active[0].storedStats.spe<speed);run.combat.snapshot=snapshotClassicNativeBattle(native);native=restoreClassicNativeBattle(run.combat,run);assert.equal(native.p1.active[0].species.id,'eiscue');
}
