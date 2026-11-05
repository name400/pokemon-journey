import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture({modern=true,reserve=false,fainted=false,doubles=false,dynamax=false,wild=false,ghost=false,mystery=false,trap=false,foeAbility='runaway',foePassive=null,wave=20}={}) {
 const mon=(id,boxId,moves)=>makeReferenceMon(id,50,{boxId,moves,ability:'runaway'});
 const hero=mon(143,'hero',['Splash']),ally=mon(7,'ally',['Splash']);
 const foe=mon(ghost?94:151,'foe',['Teleport','Splash']),foe2=mon(25,'foe2',['Splash']),bench=mon(1,'bench',['Splash']);
 foe.ability=ghost?'levitate':foeAbility;if(foePassive)foe.roguePassiveAbility=foePassive;
 const run={id:'teleport-ai',seed:'teleport-ai',rng:42,wave,screen:'battle',party:doubles?[hero,ally]:[hero],modifiers:[],tools:{},encounter:{kind:mystery?'mystery':wild?'wild':'trainer'},enemyAiRule:'source-ranked-v1',...(modern?{enemyAiTeleportRule:'trainer-source-v1',wildTeleportAiRule:'double-source-v1',wildTeleportWaveRule:'source-v1',wildTeleportTrapAiRule:'source-v1',wildTeleportRule:'single-source-v1',mysteryTeleportAiRule:'source-v1'}:{})};
 const team=[foe,...(doubles?[foe2]:[]),...(reserve?[bench]:[])];
 run.combat=createClassicCombat(run,team,{trainer:!wild&&!mystery,doubles});
 if(fainted||dynamax||trap){const b=restoreClassicNativeBattle(run.combat,run);if(fainted){const p=b.p2.pokemon.at(-1);p.hp=0;p.fainted=true;}if(dynamax)b.p2.active[0].addVolatile('dynamax');if(trap==='fairylock')b.field.addPseudoWeather('fairylock');else if(trap)b.p2.active[0].addVolatile('ingrain');run.combat.snapshot=snapshotClassicNativeBattle(b);}
 return run;
}
async function act(run) {
 const doc=await decodeGameData(await encodeGameData({run,other:{keep:true}}));
 const command=doc.run.party.length>1?{type:'turn',actions:[{actor:0,type:'move',move:'splash'},{actor:1,type:'move',move:'splash'}]}:{type:'move',move:'splash'};
 doc.run.combat=playClassicCombat(doc.run,command);assert.deepEqual(doc.other,{keep:true});
 return restoreClassicNativeBattle(doc.run.combat,doc.run);
}
for(const doubles of [false,true]) {
 test(`${doubles?'double':'single'}: no reserve avoids Teleport while legacy remains unchanged`,async()=>{
  const modern=await act(fixture({doubles})),old=await act(fixture({doubles,modern:false}));
  assert.ok(!modern.log.some(s=>s.includes('|Teleport|')),modern.log.join('\n'));
  assert.ok(old.log.some(s=>s.includes('|Teleport|')),old.log.join('\n'));
 });
 test(`${doubles?'double':'single'}: available reserve permits Teleport`,async()=>{
  const b=await act(fixture({doubles,reserve:true}));
  assert.ok(b.log.some(s=>s.includes('|Teleport|')),b.log.join('\n'));
  assert.ok(b.log.some(s=>s.startsWith('|switch|p2')&&s.includes('Bulbasaur')),b.log.join('\n'));
 });
 test(`${doubles?'double':'single'}: fainted reserve does not permit Teleport`,async()=>{
  const b=await act(fixture({doubles,reserve:true,fainted:true}));
  assert.ok(!b.log.some(s=>s.includes('|Teleport|')),b.log.join('\n'));
 });
}
test('Dynamax can still use Max Guard without a reserve',async()=>{
 const b=await act(fixture({dynamax:true}));assert.ok(b.log.some(s=>s.includes('|Max Guard|')),b.log.join('\n'));
});
test('new runs enable the rule without changing another slot',async()=>{
 const {ensureClassicState,startClassicRun}=await import('../lib/rogue-classic-state.mjs');
 const {starterCatalog}=await import('../lib/rogue-starter-system.mjs');
 const doc={},state=ensureClassicState(doc,{initialStarterId:1}),entry=starterCatalog(state.system).find(p=>p.id===1);
 state.slots[1]={keep:true};
 const run=startClassicRun(doc,[{id:1,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves}],{id:'teleport-ai',seed:'teleport-ai'});
 assert.equal(run.enemyAiTeleportRule,'trainer-source-v1');assert.equal(run.wildTeleportAiRule,'double-source-v1');assert.equal(run.mysteryTeleportAiRule,'source-v1');assert.equal(run.wildTeleportWaveRule,'source-v1');assert.equal(run.wildTeleportTrapAiRule,'source-v1');assert.deepEqual(state.slots[1],{keep:true});
});

test('wild doubles avoid Teleport even for Ghost or Run Away',async()=>{
 for(const ghost of [false,true]){
  const modern=await act(fixture({wild:true,doubles:true,ghost})),legacy=await act(fixture({wild:true,doubles:true,modern:false,ghost}));
  assert.ok(!modern.log.some(s=>s.includes('|Teleport|')),modern.log.join('\n'));
  assert.ok(legacy.log.some(s=>s.includes('|Teleport|')),legacy.log.join('\n'));
 }
});

test('wild mystery AI avoids Teleport when no reserve is available',async()=>{
 const modern=await act(fixture({mystery:true})),legacy=await act(fixture({mystery:true,modern:false}));
 assert.ok(!modern.log.some(s=>s.includes('|Teleport|')),modern.log.join('\n'));
 assert.ok(legacy.log.some(s=>s.includes('|Teleport|')),legacy.log.join('\n'));
});
test('wild mystery AI can Teleport with an eligible reserve',async()=>{
 const b=await act(fixture({mystery:true,reserve:true}));assert.ok(b.log.some(s=>s.includes('|Teleport|')),b.log.join('\n'));assert.ok(b.log.some(s=>s.startsWith('|switch|p2')&&s.includes('Bulbasaur')),b.log.join('\n'));
});

test('wild AI avoids Teleport on every tenth wave',async()=>{
 const modern=await act(fixture({wild:true})),legacy=await act(fixture({wild:true,modern:false}));
 assert.ok(!modern.log.some(s=>s.includes('|Teleport|')),modern.log.join('\n'));assert.ok(legacy.log.some(s=>s.includes('|Teleport|')),legacy.log.join('\n'));
});

test('wild AI avoids trapped Teleport, but Ghost and Run Away bypass the trap',async()=>{
 const opts={wild:true,wave:21,trap:true,foeAbility:'pressure'},blocked=await act(fixture(opts)),legacy=await act(fixture({...opts,modern:false}));
 assert.ok(!blocked.log.some(s=>s.includes('|Teleport|')),blocked.log.join('\n'));assert.ok(legacy.log.some(s=>s.includes('|Teleport|')),legacy.log.join('\n'));
 for(const bypass of [{ghost:true},{foeAbility:'runaway'}]){const battle=await act(fixture({...opts,...bypass}));assert.ok(battle.log.some(s=>s.includes('|Teleport|')),battle.log.join('\n'));}
});

test('wild AI evaluates Fairy Lock and its ability bypass',async()=>{
 const opts={wild:true,wave:21,trap:'fairylock',foeAbility:'pressure'},blocked=await act(fixture(opts)),bypass=await act(fixture({...opts,foeAbility:'runaway'}));
 assert.ok(!blocked.log.some(s=>s.includes('|Teleport|')),blocked.log.join('\n'));assert.ok(bypass.log.some(s=>s.includes('|Teleport|')),bypass.log.join('\n'));
});

test('wild AI sees the Run Away passive when deciding Teleport',async()=>{
 const b=await act(fixture({wild:true,wave:21,trap:true,foeAbility:'pressure',foePassive:'runaway'}));assert.ok(b.log.some(s=>s.includes('|Teleport|')),b.log.join('\n'));
});
