import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
function fixture(modern=true,passive=false,foeAbility='pressure'){
 const hero=makeReferenceMon(151,50,{boxId:'hero',moves:['Pollen Puff','Splash'],ability:passive?'pressure':'triage'});if(passive)hero.roguePassiveAbility='triage';
 const foe=makeReferenceMon(135,70,{boxId:'foe',moves:['Tackle'],ability:foeAbility});
 const r={id:'pollen-triage',wave:30,biome:1,rng:1234,screen:'battle',party:[hero],modifiers:[],tools:{},balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'}};if(modern)r.triageRule='source-subset-v1';r.combat=createClassicCombat(r,[foe],{trainer:true});return r;
}
const firstMover=b=>b.log.find(line=>line.startsWith('|move|'))?.split('|')[2];
// Source priority applies to both ordinary and passive Triage, even on offense.
for(const modern of [true,false])for(const passive of [true,false]){const r=fixture(modern,passive),b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 1','move 1');assert.ok(firstMover(b).startsWith(modern?'p1':'p2'));}
// Suppression cancels priority for both components.
for(const passive of [true,false]){const r=fixture(true,passive),b=restoreClassicNativeBattle(r.combat,r);b.p1.active[0].addVolatile('gastroacid');b.makeChoices('move 1','move 1');assert.ok(firstMover(b).startsWith('p2'));}
// Dazzling and grounded Psychic Terrain block the newly prioritized attack.
for(const modern of [true,false])for(const blocker of ['dazzling','terrain']){const r=fixture(modern,false,blocker==='terrain'?'pressure':blocker),b=restoreClassicNativeBattle(r.combat,r),foe=b.p2.active[0],before=foe.hp;if(blocker==='terrain')b.field.setTerrain('psychicterrain',foe);b.makeChoices('move 1','move 1');assert.equal(foe.hp===before,modern);}
// Ally healing retains its effect and gains source Triage priority in doubles.
for(const modern of [true,false]){const r=fixture(modern,true);r.party.push(makeReferenceMon(151,50,{boxId:'ally',moves:['Splash'],ability:'pressure'}));const foes=[0,1].map(i=>makeReferenceMon(135,70,{boxId:'foe'+i,moves:['Splash'],ability:'pressure'}));r.combat=createClassicCombat(r,foes,{trainer:true,doubles:true});const b=restoreClassicNativeBattle(r.combat,r),ally=b.p1.active[1];ally.hp=Math.floor(ally.maxhp*.3);const before=ally.hp;b.makeChoices('move 1 -2, move 1','move 1, move 1');assert.ok(firstMover(b).startsWith(modern?'p1':'p2'));assert.equal(ally.hp,before+Math.floor(ally.maxhp/2));}
// The source priority rule survives actual save encoding and leaves other slots alone.
{const {ensureClassicState}=await import('../lib/rogue-classic-state.mjs'),{encodeGameData,decodeGameData}=await import('../lib/game-storage.mjs');let r=fixture(true,true),b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 2','move 1');r.combat.snapshot=snapshotClassicNativeBattle(b);let doc={coins:5},state=ensureClassicState(doc);state.slots[0]=r;state.slots[1]={id:'other',party:[{safe:true}]};doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);r=state.slots[0];assert.equal(r.combat.triageRule,'source-subset-v1');b=restoreClassicNativeBattle(r.combat,r);const start=b.log.length;b.makeChoices('move 1','move 1');assert.ok(b.log.slice(start).find(line=>line.startsWith('|move|'))?.split('|')[2].startsWith('p1'));assert.deepEqual(state.slots[1],{id:'other',party:[{safe:true}]});}
