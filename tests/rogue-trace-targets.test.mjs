import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
const mon=(id,boxId,ability)=>makeReferenceMon(id,50,{boxId,moves:['Splash'],ability});
function fixture(modern=true,passive=false){
 const hero=mon(151,'hero',passive?'illuminate':'trace');if(passive)hero.roguePassiveAbility='trace';
 const r={id:'trace-targets',wave:30,biome:1,rng:1234,screen:'battle',party:[hero,mon(151,'ally','pressure')],modifiers:[],tools:{},balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'}};if(modern)r.traceTargetRule='source-subset-v1';r.combat=createClassicCombat(r,[mon(845,'foe','gulpmissile'),mon(845,'foe2','gulpmissile')],{trainer:true,doubles:true});return r;
}
// With only excluded opponents Trace stays available for later targets.
for(const passive of [true,false]){const r=fixture(true,passive),b=restoreClassicNativeBattle(r.combat,r);assert.equal(b.p1.active[0].ability,passive?'illuminate':'trace');assert.equal(b.dex.abilities.get('gulpmissile').flags.notrace,1);assert.ok(!Dex.abilities.get('gulpmissile').flags.notrace);}
// Introduce a valid second opponent in the saved field. Fix candidate selection
// to the first available target, exposing the old unsuccessful Gulp Missile choice.
for(const modern of [true,false]){const r=fixture(modern);r.combat.teams[1][1].ability='pressure';const saved=r.combat.snapshot.sides[1].pokemon[1];saved.ability='pressure';saved.baseAbility='pressure';const b=restoreClassicNativeBattle(r.combat,r),original=b.sample.bind(b),candidates=[];b.sample=items=>{if(items[0]?.side){candidates.push(items.map(p=>p.ability));return items[0];}return original(items);};b.makeChoices('move 1, move 1','move 1, move 1');assert.equal(b.p1.active[0].ability,modern?'pressure':'trace');if(!modern)assert.ok(candidates.some(ids=>ids[0]==='gulpmissile'));}
// Source explicitly allows tracing Wonder Guard despite its general copy restriction.
{const r=fixture();r.party=r.party.slice(0,1);r.combat=createClassicCombat(r,[mon(292,'foe','wonderguard')],{trainer:true});assert.equal(restoreClassicNativeBattle(r.combat,r).p1.active[0].ability,'wonderguard');}
// Normal initial entry selects the valid opponent without selecting Gulp Missile.
{const r=fixture();r.combat=createClassicCombat(r,[mon(845,'foe','gulpmissile'),mon(151,'foe2','pressure')],{trainer:true,doubles:true});assert.equal(restoreClassicNativeBattle(r.combat,r).p1.active[0].ability,'pressure');}
// Full-save restoration preserves the candidate rule and the successful copied ability.
{const {ensureClassicState}=await import('../lib/rogue-classic-state.mjs'),{encodeGameData,decodeGameData}=await import('../lib/game-storage.mjs');let r=fixture();r.combat.teams[1][1].ability='pressure';const saved=r.combat.snapshot.sides[1].pokemon[1];saved.ability='pressure';saved.baseAbility='pressure';let doc={coins:5},state=ensureClassicState(doc);state.slots[0]=r;state.slots[1]={id:'other',party:[{safe:true}]};doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);r=state.slots[0];assert.equal(r.combat.traceTargetRule,'source-subset-v1');let b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 1, move 1','move 1, move 1');assert.equal(b.p1.active[0].ability,'pressure');r.combat.snapshot=snapshotClassicNativeBattle(b);doc=await decodeGameData(await encodeGameData(doc));r=ensureClassicState(doc).slots[0];b=restoreClassicNativeBattle(r.combat,r);assert.equal(b.p1.active[0].ability,'pressure');assert.deepEqual(ensureClassicState(doc).slots[1],{id:'other',party:[{safe:true}]});}
