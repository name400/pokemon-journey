import test from 'node:test';
import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import policy from '../data/rogue-called-move-policy.json' with {type:'json'};
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicCalledMoveAllowed} from '../lib/rogue-called-move-policy.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {syncNativeTeams} from '../lib/party-battle.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

const mon=(id,boxId,moves,ability='runaway',level=100)=>makeReferenceMon(id,level,{boxId,moves,ability});
function fixture({modern=true,doubles=false,performer='Chatter',targetAbility='runaway',backups=false}={}){
 const party=doubles?[mon(151,'instructor',['Instruct','Splash']),mon(151,'performer',[performer,'Splash'])]:[mon(151,'mirror',['Mirror Move','Splash'])],foes=doubles?[mon(80,'target',['Splash'],'runaway',400),mon(80,'target2',['Splash'],'runaway',400)]:[mon(151,'target',['Metronome','Splash'],targetAbility)];
 if(backups)foes.push(mon(242,'backup',['Splash']));
 const run={id:'source-mirror-instruct',wave:30,biome:5,rng:42,screen:'battle',party,modifiers:[],tools:{},balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'},adaptabilityRule:'source-subset-v2',moveBalanceRule:'source-subset-v2',moveFlagRule:'source-subset-v1'};
 if(modern)run.calledMoveRule='source-pool-v1';run.combat=createClassicCombat(run,foes,{trainer:true,doubles});return run;
}
function probe(run,{called='slash',speed='enemy'}={}){
 const b=restoreClassicNativeBattle(run.combat,run),sample=b.sample.bind(b),inputs=[],attempts=[],hits=[];
 b.sample=values=>values.find(move=>move===called||move?.id===called)||sample(values);
 b.onEvent('ModifySpe',b.format,{priority:100},(value,p)=>speed==='enemy'?(p.side.n===1?10000:value):speed==='own'?(p.side.n===0?10000:value):speed==='performer'?(p.side.n===0?p.position===1?10000:9000:value):speed==='instructor'?(p.side.n===0?p.position===0?10000:9000:value):value);
 b.onEvent('BeforeMove',b.format,{priority:999},(p,t,m)=>{attempts.push({side:p.side.n,token:p.set.trainerToken,id:m.id});});
 b.onEvent('Accuracy',b.format,{priority:-100},()=>true);b.onEvent('DamagingHit',b.format,{priority:-100},(damage,target,source,move)=>{hits.push({side:source.side.n,token:source.set.trainerToken,id:move.id,target:target.set.trainerToken,damage});});
 const native=b.actions.useMove;Object.defineProperty(b.actions,'useMove',{configurable:true,value(move,p,...args){inputs.push({side:p.side.n,token:p.set.trainerToken,id:typeof move==='string'?move:move.id});return native.call(this,move,p,...args);}});
 return {b,inputs,attempts,hits,turn(a='move mirrormove',other='move splash'){b.makeChoices(a,other);}};
}
async function recover(run,b){run.combat.teams=syncNativeTeams(b,run.combat.teams);run.party=run.combat.teams[0];run.combat.snapshot=snapshotClassicNativeBattle(b);const doc={coins:67,adventure:{safe:true}},s=ensureClassicState(doc);s.slots[0]=run;s.slots[1]={id:'other',safe:true};const saved=await decodeGameData(await encodeGameData(doc));assert.equal(saved.coins,67);assert.deepEqual(saved.adventure,{safe:true});assert.deepEqual(saved.classic.slots[1],{id:'other',safe:true});return saved.classic.slots[0];}
const ownInputs=(p,id,token='mirror')=>p.inputs.filter(move=>move.side===0&&move.token===token&&move.id===id);

test('Mirror Move69 and Instruct53 source bans retain registered/unimplemented/Z/Max/Hardcore guards',()=>{
 assert.equal(policy.callers.mirrormove.banned.length,69);assert.equal(policy.callers.instruct.banned.length,53);assert.equal(policy.callers.mirrormove.nativeFlagExceptions.length,113);assert.equal(policy.callers.instruct.nativeFlagExceptions.length,13);assert.deepEqual(policy.callers.instruct.chargeExceptions,['razorwind']);
 for(const caller of ['mirrormove','instruct'])for(const name of [...policy.callers[caller].banned,...policy.unimplemented]){const id=name.replace(/__(PHYSICAL|SPECIAL)$/,'').toLowerCase().replaceAll('_','').replace('tenmillionvoltthunderbolt','10000000voltthunderbolt');assert.equal(classicCalledMoveAllowed(caller,Dex.moves.get(id)),false,`${caller}:${name}`);}
});

test('actual Mirror Move copies the target Metronome follow-up instead of its banned caller, while legacy still fails',()=>{
 for(const modern of [true,false]){const p=probe(fixture({modern}));p.turn('move mirrormove','move metronome');assert.equal(ownInputs(p,'slash').length,modern?1:0);assert.equal(p.hits.filter(hit=>hit.side===0&&hit.id==='slash').length,modern?1:0);assert.equal(p.b.p1.active[0].moveSlots[0].pp,19);assert.equal(p.b.p1.active[0].moveSlots.length,2);if(modern)assert.deepEqual(p.b.p2.active[0].m.rogueCalledHistory,{normal:'metronome',mirror:'slash'});else assert.equal(p.b.p2.active[0].m.rogueCalledHistory,undefined);}
});

test('source follow-up history survives codec and pre-recorder snapshots retain the native-field fallback',async()=>{
 for(const clearRecord of [false,true]){let run=fixture(),p=probe(run);p.turn('move splash','move metronome');if(clearRecord)delete p.b.p2.active[0].m.rogueCalledHistory;run=await recover(run,p.b);p=probe(run,{speed:'own'});p.turn();assert.equal(ownInputs(p,'slash').length,1);assert.ok(p.hits.some(hit=>hit.side===0&&hit.id==='slash'));assert.equal(p.b.p1.active[0].moveSlots[0].pp,19);}
});

test('Mirror Move uses source self-targeted Roost and refuses source-banned Future Sight',()=>{
 for(const modern of [true,false]){let p=probe(fixture({modern}),{speed:'own'});p.b.p1.active[0].hp=100;p.b.p2.active[0].lastMove=p.b.dex.getActiveMove('roost');p.turn();assert.equal(ownInputs(p,'roost').length,modern?1:0);assert.equal(p.b.p1.active[0].hp>100,modern);
  p=probe(fixture({modern}),{speed:'own'});p.b.p2.active[0].lastMove=p.b.dex.getActiveMove('futuresight');p.turn();assert.equal(ownInputs(p,'futuresight').length,0);}
});

test('a later failed normal sleep action replaces old follow-up history for Mirror Move',()=>{
 const p=probe(fixture());p.turn('move splash','move metronome');p.b.p2.active[0].setStatus('slp');p.b.p2.active[0].statusState.time=5;p.turn('move mirrormove','move splash');assert.equal(ownInputs(p,'slash').length,0);assert.equal(ownInputs(p,'splash').length,2);assert.deepEqual(p.b.p2.active[0].m.rogueCalledHistory,{normal:'splash',mirror:'splash'});
});

test('Dancer and reflected actions do not overwrite the target source follow-up view',()=>{
 for(const reflected of [false,true]){
  const run=fixture({doubles:true});run.party=[mon(151,'performer',[reflected?'Toxic':'Revelation Dance']),mon(151,'mirror',['Mirror Move'])];const foes=[mon(151,'target',['Metronome'],reflected?'magicbounce':'dancer'),mon(242,'target2',['Splash'])];run.combat=createClassicCombat(run,foes,{trainer:true,doubles:true});const p=probe(run,{speed:'none'});p.b.onEvent('ModifySpe',p.b.format,{priority:101},(speed,user)=>user.side.n===1?(user.position===0?10000:100):user.position===0?9000:8000);p.turn(`move ${reflected?'toxic 1':'revelationdance 1'},move mirrormove 1`,'move metronome,move splash');assert.equal(ownInputs(p,'slash').length,1);assert.equal(p.b.p2.active[0].m.rogueCalledHistory.mirror,'slash');assert.equal(p.b.p2.active[0].lastMoveUsed.id,reflected?'toxic':'revelationdance');
 }
});

test('source history is cleared when the target leaves and re-enters, including codec restoration',async()=>{
 let run=fixture({backups:true}),p=probe(run);p.turn('move splash','move metronome');p.turn('move splash','switch 2');run=await recover(run,p.b);p=probe(run,{speed:'own'});p.turn('move mirrormove','switch 2');assert.equal(ownInputs(p,'slash').length,0);assert.equal(p.b.p2.active[0].set.trainerToken,'target');assert.equal(p.b.p2.active[0].m.rogueCalledHistory,undefined);
});

test('a failed Mirror Move does not replace the prior source battle move before another Copycat, including codec',async()=>{
 for(const modern of [true,false]){let run=fixture({modern,doubles:true});run.party=[mon(151,'switcher',['Splash']),mon(151,'copy',['Copycat','Splash']),mon(151,'backup',['Splash'])];run.combat=createClassicCombat(run,[mon(151,'target',['Mirror Move','Splash'])],{trainer:true,doubles:true});let p=probe(run);p.turn('move splash,move splash','move splash');assert.equal(p.b.lastMove.id,'splash');run=await recover(run,p.b);p=probe(run);p.turn('switch 3,move copycat','move mirrormove 1');assert.equal(ownInputs(p,'splash','copy').length,modern?1:0);assert.equal(p.b.p1.active[1].moveSlots[0].pp,19);assert.equal(p.b.lastMove.id,modern?'splash':'copycat');}
});

test('actual Instruct repeats source-allowed Chatter once and consumes performer PP normally through codec',async()=>{
 for(const modern of [true,false]){let run=fixture({modern,doubles:true}),p=probe(run,{speed:'performer'});p.turn('move instruct -2,move chatter 1','move splash,move splash');assert.equal(ownInputs(p,'chatter','performer').length,modern?2:1);assert.equal(p.b.p1.active[1].moveSlots[0].pp,modern?18:19);assert.equal(p.b.p1.active[0].moveSlots[0].pp,14);run=await recover(run,p.b);p=probe(run,{speed:'performer'});p.turn('move instruct -2,move chatter 1','move splash,move splash');assert.equal(ownInputs(p,'chatter','performer').length,modern?2:1);assert.equal(p.b.p1.active[1].moveSlots[0].pp,modern?16:18);}
});

test('Instruct requires an actual known slot with PP, and excludes the follow-up from a different caller',()=>{
 for(const modern of [true,false]){const run=fixture({modern,doubles:true,performer:'Splash'}),p=probe(run,{speed:'instructor'});p.b.p1.active[1].lastMove=p.b.dex.getActiveMove('slash');p.turn('move instruct -2,move splash','move splash,move splash');assert.equal(p.attempts.some(move=>move.token==='performer'&&move.id==='slash'),!modern);}
 const run=fixture({doubles:true,performer:'Metronome'});run.party[1].moves.push('Slash');run.combat=createClassicCombat(run,run.combat.teams[1],{trainer:true,doubles:true});const p=probe(run,{speed:'performer'});p.turn('move instruct -2,move metronome','move splash,move splash');assert.equal(ownInputs(p,'slash','performer').length,1);assert.equal(p.b.p1.active[1].moveSlots.find(move=>move.id==='slash').pp,20);assert.deepEqual(p.b.p1.active[1].m.rogueCalledHistory,{normal:'metronome',mirror:'slash'});
 const noPP=probe(fixture({doubles:true}),{speed:'instructor'});noPP.b.p1.active[1].lastMove=noPP.b.dex.getActiveMove('chatter');noPP.b.p1.active[1].moveSlots[0].pp=0;noPP.turn('move instruct -2,move splash','move splash,move splash');assert.equal(ownInputs(noPP,'chatter','performer').length,0);
});

test('Instruct releases source-allowed Razor Wind early without a third lock, extra PP or duplicate damage',async()=>{
 let run=fixture({doubles:true,performer:'Razor Wind'}),p=probe(run,{speed:'performer'});p.turn('move instruct -2,move razorwind','move splash,move splash');assert.equal(ownInputs(p,'razorwind','performer').length,2);assert.equal(p.hits.filter(hit=>hit.token==='performer'&&hit.id==='razorwind').length,2);assert.equal(p.b.p1.active[1].moveSlots[0].pp,9);assert.equal(p.b.p1.active[1].volatiles.twoturnmove,undefined);run=await recover(run,p.b);p=probe(run,{speed:'performer'});p.turn('move splash,move splash','move splash,move splash');assert.equal(ownInputs(p,'razorwind','performer').length,0);assert.equal(p.b.p1.active[1].moveSlots[0].pp,9);
 const legacy=probe(fixture({modern:false,doubles:true,performer:'Razor Wind'}),{speed:'performer'});legacy.turn('move instruct -2,move razorwind','move splash,move splash');assert.equal(ownInputs(legacy,'razorwind','performer').length,1);assert.ok(legacy.b.p1.active[1].volatiles.twoturnmove);
});

test('every113 Mirror Move and13 Instruct native-flag exception reaches a source-approved attempt and restores',()=>{
 for(const called of policy.callers.mirrormove.nativeFlagExceptions){try{const run=fixture(),p=probe(run,{speed:'own'});p.b.p2.active[0].lastMove=p.b.dex.getActiveMove(called);p.turn();assert.equal(ownInputs(p,called).length,1);run.combat.snapshot=snapshotClassicNativeBattle(p.b);assert.doesNotThrow(()=>restoreClassicNativeBattle(run.combat,run));}catch(cause){throw new Error(`Mirror Move source exception ${called}`,{cause});}}
 for(const called of policy.callers.instruct.nativeFlagExceptions){try{const run=fixture({doubles:true,performer:called}),p=probe(run,{speed:'instructor'});p.b.p1.active[1].lastMove=p.b.dex.getActiveMove(called);p.turn('move instruct -2,move splash','move splash,move splash');assert.ok(p.attempts.some(move=>move.token==='performer'&&move.id===called));run.combat.snapshot=snapshotClassicNativeBattle(p.b);assert.doesNotThrow(()=>restoreClassicNativeBattle(run.combat,run));}catch(cause){throw new Error(`Instruct source exception ${called}`,{cause});}}
});

test('new local callbacks leave native shared Mirror Move/Instruct and legacy action state unchanged',()=>{
 const nativeMirror=Dex.moves.get('mirrormove').onTryHit,nativeInstruct=Dex.moves.get('instruct').onHit,p=probe(fixture({modern:false}));p.turn('move mirrormove','move metronome');assert.equal(p.b.dex.moves.get('mirrormove').onTryHit,nativeMirror);assert.equal(p.b.dex.moves.get('instruct').onHit,nativeInstruct);assert.equal(p.b.p1.active[0].m.rogueCalledHistory,undefined);assert.equal(Dex.moves.get('mirrormove').onTryHit,nativeMirror);assert.equal(Dex.moves.get('instruct').onHit,nativeInstruct);
});
test('Instruct redirects a repeated single-target attack after the original foe faints',async()=>{let run=fixture({doubles:true,performer:'Slash'}),p=probe(run,{speed:'performer'});p.b.p2.active[0].hp=1;p.turn('move instruct -2,move slash 1','move splash,move splash');const hits=p.hits.filter(hit=>hit.token==='performer'&&hit.id==='slash');assert.deepEqual(hits.map(hit=>hit.target),['target','target2']);assert.equal(p.b.p1.active[1].moveSlots[0].pp,18);run=await recover(run,p.b);assert.equal(restoreClassicNativeBattle(run.combat,run).p1.pokemon.find(mon=>mon.set.trainerToken==='performer').moveSlots[0].pp,18);});
test('Instruct does not redirect an attack whose original ally target fainted',()=>{const run=fixture({doubles:true});run.party=[mon(151,'instructor',['Instruct','Splash']),mon(151,'ally',['Splash'])];run.combat=createClassicCombat(run,[mon(151,'performer',['Slash','Splash']),mon(151,'partner',['Splash'])],{trainer:true,doubles:true});const p=probe(run);p.b.p2.active[1].hp=1;p.turn('move instruct 1,move splash','move slash -2,move splash');const hits=p.hits.filter(hit=>hit.token==='performer'&&hit.id==='slash');assert.deepEqual(hits.map(hit=>hit.target),['partner']);assert.equal(p.b.p2.active[0].moveSlots[0].pp,18);});
