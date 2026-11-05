import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture({modern=true,history=null,pp=35,move='Tackle',dynamax=false,doubles=true}={}) {
 const hero=makeReferenceMon(143,50,{boxId:'hero',moves:['Splash'],ability:'runaway'});
 const ally=makeReferenceMon(7,50,{boxId:'ally',moves:['Splash'],ability:'runaway'});
 const foe=makeReferenceMon(151,50,{boxId:'foe',moves:['Instruct','Splash'],ability:'runaway'});
 const partner=makeReferenceMon(143,50,{boxId:'partner',moves:[move],ability:'runaway'});
 const run={id:'instruct-ai',seed:'instruct-ai',rng:42,wave:20,screen:'battle',party:doubles?[hero,ally]:[hero],modifiers:[],tools:{},encounter:{kind:'trainer'},enemyAiRule:'source-ranked-v1',calledMoveRule:'source-pool-v1',...(modern?{enemyAiInstructRule:'source-v1'}:{})};
 run.combat=createClassicCombat(run,doubles?[foe,partner]:[foe],{trainer:true,doubles});
 const b=restoreClassicNativeBattle(run.combat,run);
 const target=doubles?b.p2.active[1]:b.p1.active[0];
 if(history)target.m.rogueCalledHistory=history;
 if(doubles)target.moveSlots[0].pp=pp;
 if(dynamax)b.p2.active[0].addVolatile('dynamax');
 run.combat.snapshot=snapshotClassicNativeBattle(b);
 return run;
}
async function act(run) {
 const doc=await decodeGameData(await encodeGameData({run,other:{keep:true}}));
 doc.run.combat=playClassicCombat(doc.run,doc.run.party.length>1?{type:'turn',actions:[{actor:0,type:'move',move:'splash'},{actor:1,type:'move',move:'splash'}]}:{type:'move',move:'splash'});
 assert.deepEqual(doc.other,{keep:true});
 return restoreClassicNativeBattle(doc.run.combat,doc.run);
}
test('AI avoids Instruct without a last move, retaining legacy behavior',async()=>{
 const modern=await act(fixture()),legacy=await act(fixture({modern:false}));
 assert.ok(!modern.log.some(s=>s.includes('|Instruct|')),modern.log.join('\n'));
 assert.ok(legacy.log.some(s=>s.includes('|Instruct|')),legacy.log.join('\n'));
});
test('AI can target a partner whose last direct move is usable',async()=>{
 const b=await act(fixture({history:{normal:'tackle',mirror:'flamethrower'}}));
 assert.ok(b.log.some(s=>s.includes('|Instruct|p2b:')),b.log.join('\n'));
});
test('AI rejects a last move no longer in the target moveset',async()=>{
 const b=await act(fixture({history:{normal:'flamethrower',mirror:'tackle'}}));
 assert.ok(!b.log.some(s=>s.includes('|Instruct|')),b.log.join('\n'));
});
test('AI rejects a last move with no PP or forbidden by source policy',async()=>{
 for(const options of [{history:{normal:'tackle',mirror:'tackle'},pp:0},{history:{normal:'metronome',mirror:'metronome'},move:'Metronome'}]) {
  const b=await act(fixture(options));
  assert.ok(!b.log.some(s=>s.includes('|Instruct|')),b.log.join('\n'));
 }
});
test('Dynamax still selects Max Guard with no last move',async()=>{
 const b=await act(fixture({dynamax:true}));
 assert.ok(b.log.some(s=>s.includes('|Max Guard|')),b.log.join('\n'));
});
test('single battle evaluates opponent history',async()=>{
 const b=await act(fixture({doubles:false}));
 assert.ok(!b.log.some(s=>s.includes('|Instruct|')),b.log.join('\n'));
});
test('new runs enable the rule and preserve another slot',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs');
 const {starterCatalog}=await import('../lib/rogue-starter-system.mjs');
 const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);
 state.slots[1]={keep:true};
 const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'instruct-ai',seed:'instruct-ai'});
 assert.equal(run.enemyAiInstructRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});
