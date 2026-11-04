import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
const mon=(id,token,level=20,moves=['Splash'])=>makeReferenceMon(id,level,{boxId:token,moves});
const build=(challenge=true,doubles=false,extra=true)=>{const party=[mon(25,'illegal'),mon(1,'lead',5),...(extra?[mon(43,'reserve',5)]:[])],foe=[mon(150,'foe',100,['Psychic']),...(doubles?[mon(150,'foe2',100,['Psychic'])]:[])],run={id:'challenge',wave:5,biome:1,rng:42,party,modifiers:[],tools:{},encounter:{kind:'wild'},participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],...(challenge?{challengeEligibilityRule:'source-subset-v1',challenges:[{id:1,value:12}]}:{})};run.combat=createClassicCombat(run,foe,{doubles});run.party=run.combat.teams[0];return run;};
// Grass challenge: electric Pikachu stays alive in storage but cannot lead or switch.
{let r=build(),a=r.combat.requests[0].actors[0];assert.equal(r.party[a.active].boxId,'lead');assert.deepEqual(a.switches.map(s=>r.party[s.index].boxId),['reserve']);assert.throws(()=>playClassicCombat(r,{type:'switch',slot:r.party.findIndex(p=>p.boxId==='illegal')+1}),/교체/);r=JSON.parse(JSON.stringify(r));const b=restoreClassicNativeBattle(r.combat,r);assert.equal(b.p1.pokemonLeft,2);assert.deepEqual(b.possibleSwitches(b.p1).map(p=>p.set.trainerToken),['reserve']);r.combat=playClassicCombat(r,{type:'move',move:'splash'});r.party=r.combat.teams[0];assert.ok(r.party.find(p=>p.boxId==='lead').hp<=0);assert.equal(r.combat.ended,false);a=r.combat.requests[0].actors.find(x=>x.kind==='switch');assert.ok(a);assert.deepEqual(a.switches.map(s=>r.party[s.index].boxId),['reserve']);r=JSON.parse(JSON.stringify(r));r.combat=playClassicCombat(r,{type:'switch',slot:a.switches[0].slot});assert.equal(r.combat.ended,false);}
// If the only eligible fighter faints, the remaining ineligible one cannot avert defeat.
{let r=build(true,false,false);r.combat=playClassicCombat(r,{type:'move',move:'splash'});assert.equal(r.combat.ended,true);assert.equal(r.combat.winner,1);assert.ok(r.combat.teams[0].find(p=>p.boxId==='illegal').hp>0);}
// Unknown restrictions in a saved battle cannot be mistaken for a defeat.
{const r=build();r.combat.challengeRestrictions=[{id:99,value:1}];assert.throws(()=>restoreClassicNativeBattle(r.combat,r),/확인할 수 없는/);}
// Ordinary battles remain unrestricted.
{const r=build(false,false,false),a=r.combat.requests[0].actors[0];assert.equal(r.party[a.active].boxId,'illegal');assert.ok(a.switches.some(s=>r.party[s.index].boxId==='lead'));}
// Two legal active Pokémon never expose the ineligible reserve in doubles.
{const r=build(true,true,true),actors=r.combat.requests[0].actors;assert.deepEqual(actors.map(a=>r.party[a.active].boxId),['lead','reserve']);assert.ok(actors.every(a=>a.switches.length===0));const b=restoreClassicNativeBattle(r.combat,r);assert.equal(b.p1.pokemonLeft,2);assert.equal(b.possibleSwitches(b.p1).length,0);r.combat=playClassicCombat(r,{type:'turn',actions:actors.map(a=>({actor:a.slot,type:'move',move:'splash'}))});assert.equal(r.combat.ended,true);assert.equal(r.combat.winner,1);assert.ok(r.combat.teams[0].find(p=>p.boxId==='illegal').hp>0);}
// An unverified one-legal versus two-enemy setup must not silently send an illegal partner.
assert.throws(()=>build(true,true,false),/한 자리/);
// Unknown rule data cannot activate the experimental gate.
{const r=build();r.challenges=[{id:99,value:1}];assert.throws(()=>createClassicCombat(r,[mon(19,'foe')]),/확인할 수 없는/);}
console.log('Challenge combat eligibility: lead, manual/forced switch, defeat, restore and ordinary battle passed');
