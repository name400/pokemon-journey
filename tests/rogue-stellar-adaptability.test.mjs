import assert from 'node:assert/strict';import test from 'node:test';import{Dex}from'@pkmn/sim';
import{makeReferenceMon}from'../lib/rogue-reference.mjs';import{createClassicCombat,restoreClassicNativeBattle,snapshotClassicNativeBattle}from'../lib/rogue-battle-engine.mjs';import{ensureClassicState,startClassicRun}from'../lib/rogue-classic-state.mjs';import{starterCatalog}from'../lib/rogue-starter-system.mjs';import{encodeGameData,decodeGameData}from'../lib/game-storage.mjs';import{previewClassicDnaFusion}from'../lib/rogue-dna-fusion.mjs';
function fixture({ability='adaptability',passive=false,duplicate=false,species=151,rule='source-subset-v2',stellar=true,move='Psychic',enemy=false,doubles=false,weather='',fusion=false,defenderMove='Splash'}={}){
 let user=makeReferenceMon(species,100,{boxId:'user',moves:[move,'Water Pulse','Zen Headbutt','Splash'],ability:passive?'pressure':ability,teraType:'Stellar'});if(passive||duplicate)user.roguePassiveAbility=ability;
 if(fusion){user=previewClassicDnaFusion(user,makeReferenceMon(1024,100,{boxId:'donor',moves:['Splash']})).fused;user.roguePassiveAbility=ability;}
 if(enemy&&stellar)user.rogueInstantTera=true;
 const foes=[makeReferenceMon(242,400,{boxId:'target',moves:[defenderMove],ability:'pressure'})];if(doubles)foes.push(makeReferenceMon(242,400,{boxId:'target2',moves:['Splash'],ability:'pressure'}));
 const party=[user];if(doubles)party.push(makeReferenceMon(151,100,{boxId:'ally',moves:['Splash'],ability:'pressure'}));
 const r={id:'stellar-adaptability',wave:30,biome:1,rng:1234,screen:'battle',party:enemy?foes:party,modifiers:[],tools:{teraOrb:stellar},teraCharged:stellar,balls:{},participants:[],awardedFoes:[],expNotices:[],encounter:{kind:'trainer'}};if(rule)r.adaptabilityRule=rule;r.combat=createClassicCombat(r,enemy?party:foes,{trainer:true,doubles,weather});return r;
}
function probe(r,{enemy=false,control=null,suppress=false,miss=false,crit=false,burn=false,item=''}={}){
 const b=restoreClassicNativeBattle(r.combat,r),side=enemy?1:0,p=b.sides[side].active[0],chance=b.randomChance.bind(b),random=b.random.bind(b);b.randomChance=(n,d)=>n===1&&d===24?crit:chance(n,d);b.random=(...args)=>{const value=random(...args);return args.length===1&&args[0]===16?0:value;};b.onEvent('ModifyMove',b.format,{priority:100},move=>{if(move.multihit)move.multihit=3;});if(burn)p.setStatus('brn');if(item)p.setItem(item);b.onEvent('Accuracy',b.format,{priority:-100},()=>miss?0:true);if(control!==null)b.onEvent('ModifySTAB',b.format,{priority:100},()=>control);if(suppress)p.addVolatile('gastroacid');let events=[];b.onEvent('DamagingHit',b.format,{priority:-100},function(damage,target,source){if(source.side.n===side)events.push(damage);});return{b,p,hit(command='move 1',opponent='move 1'){events=[];b.makeChoices(...(enemy?[opponent,command]:[command,opponent]));return [...events];}};
}
function oracle(move,stab,options={}){return probe(fixture({...options,move,ability:'pressure',stellar:false}),{control:stab});}

test('Stellar Adaptability boosts original physical/special types on first and later uses',()=>{
 for(const passive of[false,true])for(const move of['Psychic','Zen Headbutt']){const actual=probe(fixture({passive,move}));assert.deepEqual(actual.hit('move 1 terastallize'),oracle(move,2.25).hit());assert.deepEqual(actual.hit(),oracle(move,2).hit());assert.deepEqual(actual.hit(),oracle(move,2).hit());}
});
test('new types use only the one-time Stellar boost, and type histories are independent',()=>{
 for(const passive of[false,true]){const p=probe(fixture({passive}));assert.deepEqual(p.hit('move 1 terastallize'),oracle('Psychic',2.25).hit());assert.deepEqual(p.hit('move 2'),oracle('Water Pulse',1.2).hit());assert.deepEqual(p.hit('move 1'),oracle('Psychic',2).hit());assert.deepEqual(p.hit('move 2'),oracle('Water Pulse',1).hit());assert.deepEqual([...new Set(p.p.stellarBoostedTypes)].sort(),['Psychic','Water']);}
});
test('ordinary and passive enemy holders and duplicate components share the same rule',()=>{
 for(const passive of[false,true]){const p=probe(fixture({passive,enemy:true}),{enemy:true});const control=probe(fixture({ability:'pressure',stellar:false,enemy:true}),{enemy:true,control:2.25});assert.deepEqual(p.hit('move 1 terastallize'),control.hit());}
 const p=probe(fixture({duplicate:true})),single=probe(fixture());assert.deepEqual(p.hit('move 1 terastallize'),single.hit('move 1 terastallize'));
});
test('suppression removes Adaptability but keeps first-use Stellar type consumption',()=>{
 for(const passive of[false,true])for(const gas of[false,true]){const p=probe(fixture({passive}),{suppress:!gas});if(gas)p.b.p2.active[0].setAbility('neutralizinggas');assert.deepEqual(p.hit('move 1 terastallize'),oracle('Psychic',2).hit());if(gas)p.b.p2.active[0].setAbility('pressure');else p.p.removeVolatile('gastroacid');assert.deepEqual(p.hit(),oracle('Psychic',2).hit());}
});
test('Terapagos and validated Terapagos donors retain repeated type bonuses',()=>{
 for(const options of[{species:1024,move:'Body Slam'},{fusion:true,move:'Psychic'}]){const p=probe(fixture(options));for(let i=0;i<3;i++)assert.deepEqual(p.hit('move 1'+(i===0?' terastallize':'')),oracle(options.move,2.25,options).hit());for(let i=0;i<2;i++)assert.deepEqual(p.hit('move 2'),oracle('Water Pulse',1.2,options).hit());}
});
test('multi-hit consumes the original-type first-use bonus after its first strike',()=>{
 const p=probe(fixture({species:102,move:'Bullet Seed'})),control=oracle('Bullet Seed',2,{species:102});p.p.setAbility('adaptability');const actual=p.hit('move 1 terastallize'),regular=control.hit();assert.ok(actual.length>=2);assert.equal(actual.length,regular.length);assert.ok(actual[0]>regular[0]);assert.deepEqual(actual.slice(1),regular.slice(1));
});
test('spread targets share a strike bonus, while later turns use the consumed type',()=>{
 const p=probe(fixture({species:9,move:'Surf',doubles:true}));const command='move 1 terastallize, move splash';assert.deepEqual(p.hit(command,'move splash, move splash'),oracle('Surf',2.25,{species:9,doubles:true}).hit('move 1, move splash','move splash, move splash'));assert.deepEqual(p.hit('move 1, move splash','move splash, move splash'),oracle('Surf',2,{species:9,doubles:true}).hit('move 1, move splash','move splash, move splash'));
});
test('completed misses and fixed-damage moves consume a type without consuming it on status moves',()=>{
 const missed=probe(fixture(),{miss:true});assert.deepEqual(missed.hit('move 1 terastallize'),[]);assert.ok(missed.p.stellarBoostedTypes.includes('Psychic'));
 const fixed=probe(fixture({move:'Seismic Toss'}));fixed.hit('move 1 terastallize');assert.ok(fixed.p.stellarBoostedTypes.includes('Fighting'));fixed.hit('move 4');assert.ok(!fixed.p.stellarBoostedTypes.includes('Normal'));
});
test('weather, critical hits, burn and held items retain their native damage stages',()=>{
 for(const options of[{species:6,move:'Flamethrower',weather:'sunnyday'},{species:151,move:'Zen Headbutt',burn:true}]){
  const {burn=false,...setup}=options,actual=probe(fixture(setup),{crit:true,burn,item:'lifeorb'}),control=probe(fixture({...setup,stellar:false,ability:'pressure'}),{control:2.25,crit:true,burn,item:'lifeorb'});
  assert.deepEqual(actual.hit('move 1 terastallize'),control.hit());
 }
});
test('immunity and Protect consume types, while sleep and charging setup do not',()=>{
 for(const options of[{move:'Shadow Ball'},{defenderMove:'Protect'}]){const p=probe(fixture(options));assert.deepEqual(p.hit('move 1 terastallize'),[]);assert.ok(p.p.stellarBoostedTypes.includes(options.move?'Ghost':'Psychic'));}
 const sleeping=probe(fixture());sleeping.p.setStatus('slp');sleeping.hit('move 1 terastallize');assert.ok(!sleeping.p.stellarBoostedTypes.includes('Psychic'));
 const charging=probe(fixture({species:102,move:'Solar Beam'})),control=oracle('Solar Beam',2.25,{species:102});assert.deepEqual(charging.hit('move 1 terastallize'),[]);assert.ok(!charging.p.stellarBoostedTypes.includes('Grass'));control.hit();assert.deepEqual(charging.hit(),control.hit());assert.ok(charging.p.stellarBoostedTypes.includes('Grass'));
});
test('pre-Tera damaging use counts, and save recovery preserves type histories and other slots',async()=>{
 for(const passive of[false,true]){let r=fixture({passive}),p=probe(r);p.hit();r.combat.snapshot=snapshotClassicNativeBattle(p.b);let doc={coins:17},state=ensureClassicState(doc);state.slots[0]=r;state.slots[1]={id:'other',party:[{safe:true}]};doc=await decodeGameData(await encodeGameData(doc));r=ensureClassicState(doc).slots[0];assert.equal(r.combat.adaptabilityRule,'source-subset-v2');p=probe(r);assert.deepEqual(p.hit('move 1 terastallize'),oracle('Psychic',2).hit());assert.deepEqual(p.hit('move 2'),oracle('Water Pulse',1.2).hit());r.combat.snapshot=snapshotClassicNativeBattle(p.b);doc=await decodeGameData(await encodeGameData(doc));p=probe(doc.classic.slots[0]);assert.deepEqual(p.hit('move 2'),oracle('Water Pulse',1).hit());assert.deepEqual(doc.classic.slots[1],{id:'other',party:[{safe:true}]});assert.equal(doc.coins,17);}
});
test('switching away and returning does not restore a consumed type bonus',()=>{
 const r=fixture();r.party.push(makeReferenceMon(151,100,{boxId:'backup',moves:['Splash'],ability:'pressure'}));r.combat=createClassicCombat(r,r.combat.teams[1],{trainer:true});const p=probe(r);
 p.hit('move 1 terastallize');p.hit('switch 2');p.hit('switch 2');assert.deepEqual(p.hit(),oracle('Psychic',2).hit());
});
test('Stellar does not apply the nonmatching-type 60-power floor or change move priority',()=>{
 for(const [move,stab]of [['Confusion',2.25],['Water Gun',1.2],['Gust',1.2],['Vacuum Wave',1.2]]){
  const p=probe(fixture({move})),priority=p.b.actions.dex.moves.get(move).priority;
  assert.deepEqual(p.hit('move 1 terastallize'),oracle(move,stab).hit(),move);assert.equal(p.b.actions.dex.moves.get(move).priority,priority);assert.equal(Dex.moves.get(move).priority,priority);
 }
});
test('an exception after randomization cannot leak a Stellar correction into later calculations',()=>{
 const p=probe(fixture()),b=p.b;b.actions.terastallize(p.p);const move=b.dex.getActiveMove('psychic'),target=b.p2.active[0],nativeHasType=p.p.hasType;move.hit=1;
 p.p.hasType=()=>{throw new Error('forced STAB failure');};assert.throws(()=>b.actions.modifyDamage(100,p.p,target,move),/forced STAB failure/);p.p.hasType=nativeHasType;
 assert.equal(b.modify(100,2),200);assert.ok(b.actions.modifyDamage(100,p.p,target,move)>200);assert.equal(b.modify(100,2),200);
 const descriptor=Object.getOwnPropertyDescriptor(b,'runEvent');Object.defineProperty(b,'runEvent',{configurable:true,value(...args){const result=descriptor.value.apply(this,args);if(args[0]==='BasePower')throw new Error('forced power failure');return result;}});assert.throws(()=>b.actions.getDamage(p.p,target,b.dex.getActiveMove('confusion')),/forced power failure/);Object.defineProperty(b,'runEvent',descriptor);assert.equal(b.actions.dex.moves.get('confusion').priority,0);
});
test('v1 snapshots keep legacy Stellar behavior and new runs select v2',()=>{
 const old=probe(fixture({rule:'source-subset-v1'}));assert.deepEqual(old.hit('move 1 terastallize'),oracle('Psychic',2).hit());assert.deepEqual(old.hit(),oracle('Psychic',1.5).hit());
 const original=Dex.abilities.get('adaptability').onModifySTAB;assert.equal(typeof original,'function');const doc={},state=ensureClassicState(doc,{initialStarterId:4}),starter=starterCatalog(state.system).find(p=>p.id===4),r=startClassicRun(doc,[{id:4,ability:starter.abilities[0].key,nature:starter.natures[0].key,gender:starter.genders[0],shiny:false,moves:starter.defaultMoves}]);assert.equal(r.adaptabilityRule,'source-subset-v2');r.adaptabilityRule='source-subset-v1';assert.equal(ensureClassicState(doc).slots[0].adaptabilityRule,'source-subset-v1');assert.equal(Dex.abilities.get('adaptability').onModifySTAB,original);
});
