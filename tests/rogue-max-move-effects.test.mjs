import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
const mon=(id,boxId,moves)=>makeReferenceMon(id,50,{boxId,moves,ability:'runaway'});
function setup(move,foeMove='Splash'){
 const run={id:'max-effect-isolated',wave:20,rng:42,screen:'battle',party:[mon(151,'hero',[move,'Splash'])],modifiers:[],tools:{dynamaxBand:true},encounter:{kind:'trainer'}};
 run.combat=createClassicCombat(run,[makeReferenceMon(242,100,{boxId:'foe',moves:[foeMove],ability:'runaway'})],{trainer:true});run.party=run.combat.teams[0];return run;
}
for(const [move,expected,weather] of [['flamethrower','Max Flare','sunnyday'],['watergun','Max Geyser','raindance'],['icebeam','Max Hailstorm','hail']])test(`${expected} sets weather and consumes base PP through save`,async()=>{
 let run=setup(move),before=restoreClassicNativeBattle(run.combat,run),pp=before.p1.active[0].moveSlots[0].pp;
 run.combat=playClassicCombat(run,{type:'move',move,special:'dynamax'});run.party=run.combat.teams[0];const saved=await decodeGameData(await encodeGameData({run,other:{safe:true}}));assert.deepEqual(saved.other,{safe:true});run=saved.run;const b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.field.weather,weather);assert.equal(b.p1.active[0].moveSlots[0].pp,pp-1);assert.ok(b.log.some(l=>l.includes(`|${expected}|`)));assert.ok(b.p1.active[0].volatiles.dynamax);
});
test('Max Strike lowers the target speed and spends the base move PP',async()=>{let run=setup('tackle');const pp=restoreClassicNativeBattle(run.combat,run).p1.active[0].moveSlots[0].pp;run.combat=playClassicCombat(run,{type:'move',move:'tackle',special:'dynamax'});run.party=run.combat.teams[0];run=(await decodeGameData(await encodeGameData({run}))).run;const b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p2.active[0].boosts.spe,-1);assert.equal(b.p1.active[0].moveSlots[0].pp,pp-1);});
test('Max Guard blocks an attack and uses the selected status move PP',()=>{const run=setup('protect','Tackle'),before=restoreClassicNativeBattle(run.combat,run),hp=before.p1.active[0].hp,pp=before.p1.active[0].moveSlots[0].pp;run.combat=playClassicCombat(run,{type:'move',move:'protect',special:'dynamax'});const b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p1.active[0].hp,hp*2);assert.equal(b.p1.active[0].moveSlots[0].pp,pp-1);assert.ok(b.log.some(l=>l.includes('|Max Guard|')));assert.ok(b.log.some(l=>l.includes('|-activate|')&&l.includes('Max Guard')));});
