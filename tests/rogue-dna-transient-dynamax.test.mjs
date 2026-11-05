import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture,forms,member} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {stageClassicDnaFusion} from '../lib/rogue-dna-fusion-stage.mjs';
import {validatedClassicDnaFusion,previewClassicDnaFusion,previewClassicDnaUnsplice} from '../lib/rogue-dna-fusion.mjs';
import {normalizeClassicTransientDynamax} from '../lib/rogue-transient-dynamax.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {classicChallengeBattleEligibility} from '../lib/rogue-challenge-eligibility.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';
import {calculateStats} from '../lib/pokemon-config.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {maybeClassicMystery} from '../lib/rogue-mystery.mjs';
import {prepareWeirdDreamEncounter} from '../lib/rogue-weird-dream.mjs';

const plain=(id,boxId,moves=['Tackle','Protect'])=>makeReferenceMon(id,50,{boxId,moves});
function setup({doubles=false,weak=false}={}){
 const f=fixture([plain(151,'primary'),plain(7,'donor'),plain(7,'bench',['Splash'])]);f.run=stageClassicDnaFusion(f.run,{primaryBoxId:'primary',donorBoxId:'donor'}).run;f.state.slots[0]=f.run;
 Object.assign(f.run,{screen:'battle',challengeEligibilityRule:'source-subset-v1',challenges:[{id:0,value:1,severity:0}]});
 const foe=(boxId)=>makeReferenceMon(weak?19:242,weak?1:100,{boxId,moves:['Splash'],...(weak?{hp:1}:{})});delete f.run.unspliceFreshBattle;f.run.combat=createClassicCombat(f.run,doubles?[foe('foe'),foe('foe2')]:[foe('foe')],{doubles});return f;
}
async function reload(doc){return decodeGameData(await encodeGameData(doc));}
function command(run,special){const actors=run.combat.requests[0].actors,actions=actors.map((a,i)=>({actor:a.slot,type:'move',move:i?'splash':'tackle',...(i?{}:{...(actors.length>1?{target:1}:{}),...(special?{special}:{})})}));return actors.length>1?{type:'turn',actions}:actions[0];}

for(const doubles of [false,true])test(`fused Dynamax survives challenge turns, actual codec and expiry (doubles ${doubles})`,async()=>{
 let {doc,run}=setup({doubles});const base=run.party[0].maxHp,proof=structuredClone(run.party[0].rogueFusion);
 applyClassicAction(doc,{action:'turn',command:command(run,'dynamax')});run=ensureClassicState(doc).slots[0];assert.equal(run.party[0].dynamaxed,true);assert.equal(run.party[0].maxHp,base*2);assert.ok(validatedClassicDnaFusion(run.party[0]));assert.equal(classicChallengeBattleEligibility(run.party[0],run.challenges),true);assert.equal(classicGameView(doc).run.party[0].canUnsplice,true);
 for(let i=0;i<2;i++){doc=await reload(doc);run=ensureClassicState(doc).slots[0];assert.ok(validatedClassicDnaFusion(run.party[0]));assert.ok(!run.combat.requests[0].actors[0].specials.some(s=>s.key==='dynamax'));applyClassicAction(doc,{action:'turn',command:command(run)});}
 run=ensureClassicState(doc).slots[0];const b=restoreClassicNativeBattle(run.combat,run);assert.equal(run.party[0].dynamaxed,false);assert.equal(run.party[0].maxHp,base);assert.equal(b.p1.active[0].volatiles.dynamax,undefined);assert.deepEqual(run.party[0].rogueFusion,proof);assert.ok(validatedClassicDnaFusion(run.party[0]));assert.deepEqual(doc.adventure,{safe:true});assert.deepEqual(ensureClassicState(doc).slots[1],{id:'other'});
});
test('a saved fused Max victory continues to the next wild wave with the remaining turns',async()=>{
 let {doc,run}=setup({weak:true});const base=run.party[0].maxHp;applyClassicAction(doc,{action:'turn',command:command(run,'dynamax')});assert.equal(run.screen,'reward');assert.ok(run.combat.ended);assert.equal(run.party[0].dynamaxed,true);doc=await reload(doc);let found=false;for(let seed=1;seed<=50;seed++){const candidate=structuredClone(doc),next=ensureClassicState(candidate).slots[0];next.seed='fused-dmax-carry-'+seed;next.rng=Math.imul(seed,0x9e3779b9)>>>0;applyClassicAction(candidate,{action:'skipReward'});if(next.encounter.kind==='wild'&&!next.combat.doubles){doc=candidate;run=next;found=true;break;}}assert.ok(found);assert.equal(run.wave,22);assert.ok(validatedClassicDnaFusion(run.party[0]));const b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p1.active[0].maxhp,base*2);assert.equal(b.p1.active[0].volatiles.dynamax.turns,2);assert.ok(!run.combat.requests[0].actors[0].specials.some(s=>s.key==='dynamax'));
});
test('switching or a fresh trainer battle ends fused Dynamax without losing the normal HP ratio',async()=>{
 for(const how of ['switch','trainer']){let {doc,run}=setup();applyClassicAction(doc,{action:'turn',command:command(run,'dynamax')});doc=await reload(doc);run=ensureClassicState(doc).slots[0];const normal=normalizeClassicTransientDynamax(run.party[0]);if(how==='switch')applyClassicAction(doc,{action:'turn',command:{type:'switch',slot:2}});else{run.combat=createClassicCombat(run,[plain(143,'trainer-foe',['Splash'])],{trainer:true});run.party=run.combat.teams[0];}const p=run.party.find(p=>p.boxId==='primary');assert.equal(p.dynamaxed,false);assert.equal(p.hp,normal.hp);assert.equal(p.maxHp,normal.maxHp);assert.ok(validatedClassicDnaFusion(p));}
});
test('reward fusion normalizes temporary HP for either input before modifier transfer and preserves the input save',async()=>{
 for(const role of ['primary','donor']){const p=plain(151,'primary'),d=plain(7,'donor'),f=fixture(role==='primary'?[p,d]:[d,p]);f.run.screen='battle';f.run.modifiers=[{id:'souldew',boxId:'donor',count:1,typeBoost:null}];f.run.party.find(p=>p.boxId==='donor').rogueNatureDewCount=1;f.run.party[0].hp-=3;f.run.combat=createClassicCombat(f.run,[makeReferenceMon(143,51,{boxId:'foe',moves:['Night Shade']})]);f.run.combat=playClassicCombat(f.run,{type:'move',move:'tackle',special:'dynamax'});f.run.party=f.run.combat.teams[0];f.run.screen='reward';let doc=await reload(f.doc),run=ensureClassicState(doc).slots[0];assert.equal(run.party[0].hp%2,1);const before=structuredClone(run),normal=run.party.map(normalizeClassicTransientDynamax),expected=previewClassicDnaFusion(normal.find(p=>p.boxId==='primary'),normal.find(p=>p.boxId==='donor')).fused;run=stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}).run;assert.deepEqual(ensureClassicState(doc).slots[0],before);assert.equal(run.party[0].hp,expected.hp);assert.equal(run.party[0].maxHp,expected.maxHp);assert.equal(run.party[0].dynamaxed,false);assert.ok(validatedClassicDnaFusion(run.party[0]));assert.equal(run.party[0].rogueNatureDewCount,1);assert.ok(run.modifiers.some(m=>m.id==='souldew'&&m.boxId==='primary'&&m.count===1));assert.deepEqual(run.party[0].rogueFusion.donor,before.party.find(p=>p.boxId==='donor'));}
});
test('unsplice and a persistent form action cancel transient HP on copies without changing other saves',async()=>{
 for(const action of ['unsplice','form']){let {doc,run}=setup();if(action==='form'){run.party[0]=previewClassicDnaFusion(plain(6,'primary'),plain(7,'donor')).fused;run.formItems.primary=['charizarditex'];run.combat=createClassicCombat(run,[plain(143,'foe',['Splash'])]);}applyClassicAction(doc,{action:'turn',command:command(run,'dynamax')});doc=await reload(doc);run=ensureClassicState(doc).slots[0];const before=normalizeClassicTransientDynamax(run.party[0]);run.screen='reward';applyClassicAction(doc,action==='form'?{action,boxId:'primary',item:'charizarditex'}:{action,boxId:'primary',confirm:true});const p=run.party[0];assert.equal(p.dynamaxed,false);assert.equal(p.maxHp,calculateStats(p).hp);assert.equal(p.hp,Math.min(p.maxHp,before.hp+Math.max(0,p.maxHp-before.maxHp)));assert.equal(!!p.mega,action==='form');assert.equal(!!p.fusionSpecies,action==='form');assert.deepEqual(ensureClassicState(doc).slots[1],{id:'other'});}
});
test('Dream prepares a normalized fused copy and keeps the original temporary battle untouched',async()=>{
 const {run}=setup();run.combat=playClassicCombat(run,{type:'move',move:'tackle',special:'dynamax'});run.party=run.combat.teams[0];run.party.push(plain(1,'extra',['Splash']));const before=structuredClone(run),prepared=prepareWeirdDreamEncounter(run);assert.ok(prepared);assert.ok(prepared.normalizedParty);assert.deepEqual(run,before);const mon=prepared.normalizedParty[0];assert.equal(mon.dynamaxed,false);assert.equal(mon.hp,Math.ceil(run.party[0].hp/2));assert.ok(validatedClassicDnaFusion(mon));
});
test('natural fused Dynamax Dream entry normalizes once and all three choices recover through saves',async()=>{
 const {doc,run}=setup();run.combat=playClassicCombat(run,{type:'move',move:'tackle',special:'dynamax'});run.party=run.combat.teams[0];run.party.push(plain(1,'extra',['Splash']));const hp=run.party[0].hp,normalMax=calculateStats(run.party[0]).hp;
 Object.assign(run,{wave:82,challenges:[],darkDealRule:'source-subset-v1',weirdDreamRule:'source-subset-v1',mysteryRule:'part-timer-v19',mysteryState:{spawnWeight:256,history:[]}});let spawned;
 for(let i=1;i<=2000;i++){const candidate=structuredClone(doc),r=ensureClassicState(candidate).slots[0];r.rng=Math.imul(i,1234567)>>>0;if(maybeClassicMystery(r,ensureClassicState(candidate).system)&&r.mystery.type==='weird-dream'){spawned=candidate;break;}}
 assert.ok(spawned);assert.equal(run.party[0].dynamaxed,true);assert.equal(run.party[0].hp,hp);
 for(const job of ['transform','battle','leave']){let saved=await reload(spawned),r=ensureClassicState(saved).slots[0];assert.equal(r.party[0].dynamaxed,false);assert.equal(r.party[0].maxHp,normalMax);assert.equal(r.party[0].hp,Math.ceil(hp/2));assert.ok(validatedClassicDnaFusion(r.party[0]));applyClassicAction(saved,{action:'mysterySelect',job});saved=await reload(saved);applyClassicAction(saved,{action:'mysteryConfirm'});r=ensureClassicState(saved).slots[0];if(job==='transform')assert.ok(r.party.every(p=>!p.fusionSpecies&&!p.dynamaxed));else{assert.ok(validatedClassicDnaFusion(r.party[0]));assert.equal(r.party[0].dynamaxed,false);if(job==='battle')assert.equal(restoreClassicNativeBattle(r.combat,r).p1.active[0].volatiles.dynamax,undefined);}assert.deepEqual(saved.adventure,{safe:true});assert.deepEqual(ensureClassicState(saved).slots[1],{id:'other'});}
});
test('temporary one-HP fusions use the actual native body for HP scaling',()=>{
 for(const [a,b,max]of [[292,151,1],[151,292,2]]){const {run}=fixture([plain(a,'primary'),plain(b,'donor')]),r=stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}).run;r.combat=createClassicCombat(r,[plain(143,'foe',['Splash'])]);r.combat=playClassicCombat(r,{type:'move',move:'tackle',special:'dynamax'});r.party=r.combat.teams[0];assert.equal(r.party[0].maxHp,max);assert.ok(validatedClassicDnaFusion(r.party[0]));assert.equal(normalizeClassicTransientDynamax(r.party[0]).maxHp,1);}
});
test('damaged temporary HP and persistent-form contradictions do not gain fusion permission',()=>{
 const {run}=setup();run.combat=playClassicCombat(run,{type:'move',move:'tackle',special:'dynamax'});run.party=run.combat.teams[0];
 for(const mutate of [p=>p.maxHp++,p=>p.hp=p.maxHp+1,p=>p.hp=.5,p=>p.mega=true,p=>p.terastallized='Water',p=>p.rogueFormKey='gigantamax',p=>p.rogueFusion.baseStats.hp++]){const p=structuredClone(run.party[0]);mutate(p);assert.equal(validatedClassicDnaFusion(p),null);}
 const mega=member(forms.find(r=>r.kind==='mega'),'primary');mega.dynamaxed=true;assert.throws(()=>normalizeClassicTransientDynamax(mega));
});
test('source unsplice HP adjustment adds only max-HP increases, clamps decreases and never revives',()=>{
 for(const [a,b]of [[151,7],[7,151],[151,292],[292,151]])for(const fainted of [false,true]){
  const fused=previewClassicDnaFusion(plain(a,'primary'),plain(b,'donor')).fused;fused.hp=fainted?0:Math.max(1,Math.floor(fused.maxHp*.3));const before=structuredClone(fused),result=previewClassicDnaUnsplice(fused);assert.deepEqual(fused,before);assert.equal(result.primary.hp,fainted?0:Math.min(result.primary.maxHp,fused.hp+Math.max(0,result.primary.maxHp-fused.maxHp)));assert.equal(result.donorRestored,false);assert.equal(result.primary.ability,plain(a,'comparison').ability);
 }
});
