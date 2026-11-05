import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
const mon=(boxId,ability='pressure')=>makeReferenceMon(151,50,{boxId,moves:['Splash'],ability});
function fixture(ability,modern=true,passive=false,gas=false){
 const hero=mon('hero',passive?'pressure':ability);if(passive)hero.roguePassiveAbility=ability;
 const r={id:'entry-boosts',wave:30,biome:1,rng:1234,screen:'battle',party:[hero,mon('reserve')],modifiers:[],tools:{},balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'}};if(modern)r.entryBoostRule='source-subset-v1';r.combat=createClassicCombat(r,[mon('foe',gas?'neutralizinggas':'pressure'),mon('foereserve')],{trainer:true});return r;
}
for(const [ability,stat] of [['intrepidsword','atk'],['dauntlessshield','def']])for(const modern of [false,true])for(const passive of [false,true]){
 const r=fixture(ability,modern,passive),b=restoreClassicNativeBattle(r.combat,r);assert.equal(b.p1.active[0].boosts[stat],1);
 for(let entry=0;entry<2;entry++){b.makeChoices('switch 2','move 1');b.makeChoices('switch 2','move 1');assert.equal(b.p1.active[0].set.trainerToken,'hero');assert.equal(b.p1.active[0].boosts[stat],modern?1:0);}
}
// Gas removal reactivates the source entry bonus, including passive abilities.
for(const [ability,stat] of [['intrepidsword','atk'],['dauntlessshield','def']])for(const modern of [false,true])for(const passive of [false,true]){
 const r=fixture(ability,modern,passive,true),b=restoreClassicNativeBattle(r.combat,r),hero=b.p1.active[0];assert.equal(hero.boosts[stat],0);
 b.makeChoices('move 1','switch 2');assert.equal(hero.boosts[stat],1);
 b.makeChoices('move 1','switch 2');assert.equal(hero.boosts[stat],1);
 b.makeChoices('move 1','switch 2');assert.equal(hero.boosts[stat],modern?2:1);
}
// The source override belongs to this battle, leaving global simulator data alone.
{const callback=Dex.abilities.get('intrepidsword').onStart,r=fixture('intrepidsword'),b=restoreClassicNativeBattle(r.combat,r);assert.notEqual(b.dex.abilities.get('intrepidsword').onStart,callback);assert.equal(Dex.abilities.get('intrepidsword').onStart,callback);}
// Matching base and passive abilities still trigger once per entry.
for(const [ability,stat] of [['intrepidsword','atk'],['dauntlessshield','def']]){const r=fixture(ability);r.party[0].roguePassiveAbility=ability;r.combat=createClassicCombat(r,[mon('foe')],{trainer:true});const b=restoreClassicNativeBattle(r.combat,r);assert.equal(b.p1.active[0].boosts[stat],1);b.makeChoices('switch 2','move 1');b.makeChoices('switch 2','move 1');assert.equal(b.p1.active[0].boosts[stat],1);}
// Restore an inactive owner, switch it in, then restore again without duplicating the bonus.
for(const [ability,stat] of [['intrepidsword','atk'],['dauntlessshield','def']])for(const passive of [false,true]){const {ensureClassicState}=await import('../lib/rogue-classic-state.mjs'),{encodeGameData,decodeGameData}=await import('../lib/game-storage.mjs');let r=fixture(ability,true,passive),b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('switch 2','move 1');r.combat.snapshot=snapshotClassicNativeBattle(b);let doc={coins:5},state=ensureClassicState(doc);state.slots[0]=r;state.slots[1]={id:'other',party:[{safe:true}]};doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);r=state.slots[0];assert.equal(r.combat.entryBoostRule,'source-subset-v1');b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('switch 2','move 1');assert.equal(b.p1.active[0].boosts[stat],1);r.combat.snapshot=snapshotClassicNativeBattle(b);doc=await decodeGameData(await encodeGameData(doc));r=ensureClassicState(doc).slots[0];b=restoreClassicNativeBattle(r.combat,r);assert.equal(b.p1.active[0].boosts[stat],1);assert.deepEqual(ensureClassicState(doc).slots[1],{id:'other',party:[{safe:true}]});}
// A continuing active battler is not a fresh entry at the next wild encounter.
for(const [ability,stat] of [['intrepidsword','atk'],['dauntlessshield','def']])for(const passive of [false,true]){const r=fixture(ability,true,passive);r.combat=createClassicCombat(r,[mon('newfoe')],{carryActive:[{id:'hero',boosts:{[stat]:3}}]});assert.equal(restoreClassicNativeBattle(r.combat,r).p1.active[0].boosts[stat],3);}
