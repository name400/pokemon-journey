import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
function fixture({modern=true,ability='pressure',passive=false,item='',terrain='',move='Body Press',heroId=151}={}){
 const hero=makeReferenceMon(heroId,70,{boxId:'hero',moves:[move,'Splash'],ability:passive?'pressure':ability,item});if(passive)hero.roguePassiveAbility=ability;
 const foe=makeReferenceMon(151,100,{boxId:'foe',moves:['Splash'],ability:'pressure'});
 const r={id:'body-press',wave:30,biome:1,rng:1234,screen:'battle',party:[hero],modifiers:[],tools:{},balls:{},participants:[],awardedFoes:[],expNotices:[],furCoatRule:'source-subset-v1',encounter:{kind:'trainer'}};if(modern)r.bodyPressStatRule='source-subset-v1';r.combat=createClassicCombat(r,[foe],{trainer:true,terrain});return r;
}
function hit(r){const b=restoreClassicNativeBattle(r.combat,r),original=b.randomChance.bind(b);b.randomChance=(n,d)=>n===1&&d===24?false:original(n,d);let damage=0;b.onEvent('DamagingHit',b.format,{priority:-100},function(amount,target){if(target.side.n===1)damage+=amount;});b.makeChoices('move 1','move 1');return {damage,b};}
// Attack stat multipliers do not boost source Body Press, but still boost Tackle.
for(const ability of ['hugepower','purepower','hustle','gorillatactics'])for(const passive of [false,true]){const base=hit(fixture()).damage,modern=hit(fixture({ability,passive})).damage,legacy=hit(fixture({ability,passive,modern:false})).damage;assert.equal(modern,base,ability);assert.ok(legacy>modern,ability);assert.ok(hit(fixture({move:'Tackle',ability,passive})).damage>hit(fixture({move:'Tackle'})).damage);}
// Source Defense modifiers instead affect Body Press.
for(const passive of [false,true]){const base=hit(fixture({terrain:'grassyterrain'})).damage,modern=hit(fixture({ability:'grasspelt',passive,terrain:'grassyterrain'})).damage,legacy=hit(fixture({ability:'grasspelt',passive,terrain:'grassyterrain',modern:false})).damage;assert.ok(modern>base);assert.equal(legacy,base);}
// Choice Band no longer boosts source Body Press; Eviolite boosts an eligible user's Defense.
{const base=hit(fixture()).damage;assert.equal(hit(fixture({item:'choiceband'})).damage,base);assert.ok(hit(fixture({item:'choiceband',modern:false})).damage>base);const small=hit(fixture({heroId:1})).damage;assert.ok(hit(fixture({heroId:1,item:'eviolite'})).damage>small);assert.equal(hit(fixture({heroId:1,item:'eviolite',modern:false})).damage,small);}
// The temporary Defense boost is offensive for Body Press; Attack boost is not.
for(const modern of [false,true]){const base=hit(fixture({modern})).damage;for(const id of ['xattack','xdefense']){const r=fixture({modern});r.modifiers=[{id,count:1,remaining:5}];r.combat.modifiers=structuredClone(r.modifiers);const damage=hit(r).damage;assert.equal(damage>base,modern?id==='xdefense':id==='xattack');}}
// Unaware negates the temporary stage boost unless the attacker bypasses it.
for(const breaker of [false,true]){const r=fixture();if(breaker)r.party[0].ability='moldbreaker';const foes=structuredClone(r.combat.teams[1]);foes[0].ability='unaware';r.combat=createClassicCombat(r,foes,{trainer:true});const base=hit(r).damage;r.modifiers=[{id:'xdefense',count:1,remaining:5}];r.combat.modifiers=structuredClone(r.modifiers);assert.equal(hit(r).damage>base,breaker);}
// Save restoration retains the Defense rule, both source modifiers, and other slots.
{const {ensureClassicState}=await import('../lib/rogue-classic-state.mjs'),{encodeGameData,decodeGameData}=await import('../lib/game-storage.mjs');let r=fixture({ability:'grasspelt',passive:true,terrain:'grassyterrain'}),b=restoreClassicNativeBattle(r.combat,r);b.makeChoices('move 2','move 1');r.combat.snapshot=snapshotClassicNativeBattle(b);let doc={coins:5},state=ensureClassicState(doc);state.slots[0]=r;state.slots[1]={id:'other',party:[{safe:true}]};doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);r=state.slots[0];assert.equal(r.combat.bodyPressStatRule,'source-subset-v1');const legacy=structuredClone(r);delete legacy.bodyPressStatRule;delete legacy.combat.bodyPressStatRule;assert.ok(hit(r).damage>hit(legacy).damage);assert.deepEqual(state.slots[1],{id:'other',party:[{safe:true}]});}
// Source Fur Coat is a damage reduction, so it does not boost the user's Body Press.
for(const passive of [false,true])assert.equal(hit(fixture({ability:'furcoat',passive})).damage,hit(fixture()).damage);
