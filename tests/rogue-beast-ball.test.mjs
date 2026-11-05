import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {CLASSIC_BALL_TYPES} from '../lib/rogue-ball-types.mjs';
import {classicIsUltraBeast,classicCaptureOdds} from '../lib/rogue-classic-capture.mjs';
import {CLASSIC_REWARD_REGISTRY,generateClassicRewardsWithTiers,chooseClassicReward} from '../lib/rogue-classic-rewards.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';
import {createClassicCombat,captureClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {fixture} from './fixtures/dna-persistent.mjs';
const ids=[793,794,795,796,797,798,799,803,804,805,806];
const mon=(id,boxId,patch={})=>{const p=makeReferenceMon(id,50,{boxId,moves:['Splash'],...patch});if(Object.hasOwn(patch,'hp'))p.hp=patch.hp;return p;};
function captureFixture({full=false,doubles=false,fetch=false,guaranteed=false}={}){
 const out=fixture([mon(fetch?835:151,'hero')]);if(full)for(let i=0;i<5;i++)out.run.party.push(mon(7,'bench-'+i));out.run.balls={pokeball:4,ultraball:3,beastball:1};out.run.screen='battle';out.run.biome=0;
 out.run.combat=createClassicCombat(out.run,[mon(793,'ultra-beast',guaranteed?{hp:1,status:'slp'}:{}),...(doubles?[mon(19,'ordinary')]:[])],{doubles});return out;
}
test('Beast Ball recognizes all eleven original Ultra Beasts, excludes related legends and preserves five existing bonuses',()=>{
 for(const id of ids){const p=mon(id,'ub');assert.equal(classicIsUltraBeast(p),true);assert.equal(classicCaptureOdds(p,'beastball').multiplier,5);for(const [ball,expected]of[['pokeball',1],['greatball',1.5],['ultraball',2],['rogueball',3],['masterball',-1]])assert.equal(classicCaptureOdds(p,ball).multiplier,expected);}
 for(const id of[132,150,789,790,791,792,800]){const p=mon(id,'other',{battleAppearance:'nihilego'});assert.equal(classicIsUltraBeast(p),false);assert.equal(classicCaptureOdds(p,'beastball').multiplier,.1);}
 assert.equal(CLASSIC_BALL_TYPES.find(b=>b.id==='beastball').name,'울트라볼');assert.equal(CLASSIC_BALL_TYPES.find(b=>b.id==='ultraball').name,'하이퍼볼');assert.throws(()=>classicCaptureOdds(mon(793,'ub'),'constructor'));
});
test('a real weighted reward can grant Beast Ball to an older save and stock limits stay atomic',async()=>{
 let selected;for(let seed=1;seed<=512;seed++){const out=fixture([mon(151,'hero')]);out.run.rng=Math.imul(seed,0x9e3779b1)>>>0;out.run.balls={pokeball:7,ultraball:2};generateClassicRewardsWithTiers(out.run,[2],out.state.system);if(out.run.rewards[0].id==='beastball'){selected=out;break;}}
 assert.ok(selected,'requested ball must actually enter the weighted pool');let {doc,state,run}=selected;const reward=classicGameView(doc).run.rewards[0];assert.equal(reward.name,'울트라볼');assert.match(reward.description,/5배.*0.1배/);assert.match(reward.image,/beast-ball\.png$/);applyClassicAction(doc,{action:'reward',rewardId:reward.id});assert.equal(run.balls.beastball,1);assert.equal(run.balls.pokeball,7);assert.equal(run.balls.ultraball,2);doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);run=state.slots[0];assert.equal(run.balls.beastball,1);assert.deepEqual(state.slots[1],{id:'other'});assert.deepEqual(doc.adventure,{safe:true});assert.equal(doc.coins,37);
 const definition=CLASSIC_REWARD_REGISTRY.find(r=>r.id==='beastball');run.screen='reward';run.rewards=[{...definition,rewardId:'cap'}];run.balls.beastball=98;chooseClassicReward(run,{rewardId:'cap'},state.system);assert.equal(run.balls.beastball,99);run.rewards=[{...definition,rewardId:'full'}];const before=structuredClone(run);assert.throws(()=>chooseClassicReward(run,{rewardId:'full'},state.system));assert.deepEqual(run,before);
});
test('failed native throws consume exactly one Beast Ball and survive recovery without changing other ball stocks',async()=>{
 let {doc,run}=captureFixture();const result=captureClassicCombat(run,'beastball',{rng:()=>.999999});assert.equal(result.caught,null);assert.equal(run.balls.beastball,0);assert.equal(run.balls.pokeball,4);assert.equal(run.balls.ultraball,3);assert.equal(result.combat.events[0].ballId,'beastball');run.combat=result.combat;run.party=result.combat.teams[0];doc=await decodeGameData(await encodeGameData(doc));run=ensureClassicState(doc).slots[0];assert.equal(run.balls.beastball,0);const before=structuredClone(run);assert.throws(()=>captureClassicCombat(run,'beastball'));assert.deepEqual(run,before);
});
test('full-party captures retain Beast Ball origin through save, replacement and release without resetting other slots',async()=>{
 for(const release of[false,true]){let {doc,run}=captureFixture({full:true,guaranteed:true});const old=run.party.map(p=>p.boxId),control=structuredClone(doc),controlRun=ensureClassicState(control).slots[0];controlRun.balls.masterball=1;applyClassicAction(control,{action:'capture',ballId:'masterball',boxId:'ultra-beast'});applyClassicAction(control,{action:'acceptCapture',...(release?{release:true}:{replaceBoxId:old[2]})});applyClassicAction(doc,{action:'capture',ballId:'beastball',boxId:'ultra-beast'});assert.equal(run.screen,'capture');assert.equal(run.pendingCapture.originBall,'beastball');assert.equal(run.balls.beastball,0);doc=await decodeGameData(await encodeGameData(doc));run=ensureClassicState(doc).slots[0];applyClassicAction(doc,{action:'acceptCapture',...(release?{release:true}:{replaceBoxId:old[2]})});assert.equal(run.party.length,6);if(release)assert.deepEqual(run.party.map(p=>p.boxId),old);else{assert.ok(run.party.some(p=>p.originBall==='beastball'&&p.rogueSourceId===793));assert.ok(!run.party.some(p=>p.boxId===old[2]));}assert.equal(!!ensureClassicState(doc).system.dex[793].caught,true);assert.deepEqual(ensureClassicState(doc).slots[1],{id:'other'});assert.deepEqual(doc.adventure,{safe:true});assert.equal(doc.coins,control.coins);}
});
test('trainer, no-capture, boss-bar and ambiguous double targets reject before consuming stock or RNG',()=>{
 for(const change of[r=>r.encounter.trainer={name:'test'},r=>r.encounter.noCapture=true]){const {run}=captureFixture();change(run);const before=structuredClone(run);assert.throws(()=>captureClassicCombat(run,'beastball',{rng:()=>{throw Error('RNG must not run');}}));assert.deepEqual(run,before);}
 const {run}=captureFixture();run.combat=createClassicCombat(run,[mon(793,'boss',{rogueBoss:true,rogueBossSegments:3})]);const before=structuredClone(run);assert.throws(()=>captureClassicCombat(run,'beastball'),/마지막 HP/);assert.deepEqual(run,before);
 const double=captureFixture({doubles:true,guaranteed:true});assert.throws(()=>captureClassicCombat(double.run,'beastball'),/선택/);assert.equal(double.run.balls.beastball,1);const result=captureClassicCombat(double.run,'beastball',{targetBoxId:'ultra-beast',rng:()=>0});assert.equal(result.caught.originBall,'beastball');assert.equal(result.combat.ended,false);assert.ok(result.combat.teams[1].find(p=>p.boxId==='ordinary').hp>0);
});
test('Ball Fetch returns a failed Beast Ball only once per battle across the real save codec',async()=>{
 let {doc,run}=captureFixture({fetch:true});let result=captureClassicCombat(run,'beastball',{rng:()=>.999999});assert.equal(result.caught,null);assert.equal(run.balls.beastball,1);assert.deepEqual(result.combat.ballFetchUsed,['hero']);run.combat=result.combat;run.party=result.combat.teams[0];doc=await decodeGameData(await encodeGameData(doc));run=ensureClassicState(doc).slots[0];result=captureClassicCombat(run,'beastball',{rng:()=>.999999});assert.equal(result.caught,null);assert.equal(run.balls.beastball,0);assert.deepEqual(result.combat.ballFetchUsed,['hero']);
});
