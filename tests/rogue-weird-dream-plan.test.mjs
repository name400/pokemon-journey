import test from 'node:test';
import assert from 'node:assert/strict';
import {planWeirdDreamSpecies,WEIRD_DREAM_EXCLUDED_SPECIES} from '../lib/rogue-weird-dream.mjs';
function generator(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
test('weird dream avoids party, exclusions and repeated species while preserving order',()=>{
 const party=[{key:'a',speciesId:1,baseTotal:440},{key:'b',speciesId:2,baseTotal:460},{key:'c',speciesId:3,baseTotal:480}],pool=Array.from({length:140},(_,i)=>({speciesId:i+1,baseTotal:500+i}));
 for(let seed=1;seed<=100;seed++){const plan=planWeirdDreamSpecies(party,pool,[10,11,12],generator(seed));assert.deepEqual(plan.map(p=>p.key),['a','b','c']);assert.equal(new Set(plan.map(p=>p.speciesId)).size,3);assert.ok(plan.every(p=>![1,2,3,10,11,12].includes(p.speciesId)));const totals=plan.map(p=>pool.find(s=>s.speciesId===p.speciesId).baseTotal);assert.ok(totals.filter(n=>n>600).length<=1);assert.ok(totals.filter(n=>n>=570&&n<=600).length<=1);}
 assert.ok(WEIRD_DREAM_EXCLUDED_SPECIES.includes('ETERNATUS'));assert.throws(()=>planWeirdDreamSpecies(party,pool.slice(0,10),[],generator(2)));
});
test('refusal lowers levels and resets relative experience without mutating the old party',async()=>{
 const {lowerWeirdDreamPartyLevels}=await import('../lib/rogue-weird-dream.mjs');const {makeReferenceMon}=await import('../lib/rogue-reference.mjs');
 const party=[makeReferenceMon(151,101,{boxId:'one',moves:['Tackle']}),makeReferenceMon(4,10,{boxId:'two',moves:['Tackle']})];party[0].experience=123;party[0].hp=7;party[0].status='poison';party[1].hp=0;const saved=structuredClone(party),next=lowerWeirdDreamPartyLevels(party);
 assert.deepEqual(party,saved);assert.deepEqual(next.map(m=>m.level),[91,9]);assert.deepEqual(next.map(m=>m.experience),[0,0]);assert.equal(next[0].hp,Math.min(7,next[0].maxHp));assert.equal(next[0].status,'poison');assert.equal(next[1].hp,0);assert.deepEqual(next.map(m=>m.boxId),['one','two']);
 assert.throws(()=>lowerWeirdDreamPartyLevels([{...party[0],dynamaxed:true}]));
});
test('real source catalog produces valid plans with all excluded names resolved',async()=>{
 const {rogueSpecies,rogueReferenceData}=await import('../lib/rogue-reference.mjs');
 const excluded=WEIRD_DREAM_EXCLUDED_SPECIES.map(name=>rogueReferenceData.enums.SpeciesId[name]);assert.ok(excluded.every(Number.isInteger));
 const pool=[...rogueSpecies.values()].map(s=>({speciesId:s.sourceId,baseTotal:s.baseTotal}));
 const party=[1,4,7,25,151,448].map((id,index)=>({key:String(index),speciesId:id,baseTotal:rogueSpecies.get(id).baseTotal}));
 for(let seed=1;seed<=50;seed++){const choices=planWeirdDreamSpecies(party,pool,excluded,generator(seed));assert.equal(choices.length,party.length);assert.ok(choices.every(x=>!excluded.includes(x.speciesId)));}
});
test('dream move transfer keeps surviving PP and prevents egg move replacement',async()=>{
 const {weirdDreamMoves}=await import('../lib/rogue-weird-dream.mjs');const info={A:{id:'a',type:'Normal',pp:20},B:{id:'b',type:'Normal',pp:20},C:{id:'c',type:'Normal',pp:20},D:{id:'d',type:'Normal',pp:20},E:{id:'e',type:'Water',pp:15},F:{id:'f',type:'Fire',pp:10}},lookup=x=>info[x];
 const mon={moves:['A','B','C','D'],pp:{a:1,b:2,c:3,d:4},roguePPUps:{a:1,b:2,c:3,d:1}},original=structuredClone(mon),result=weirdDreamMoves(mon,['E',null,null,null],['F'],'Fire',generator(7),lookup);
 assert.deepEqual(mon,original);assert.ok(result.moves.includes('E'));assert.ok(result.moves.includes('F'));assert.equal(result.moves.length,4);assert.equal(result.pp.e,15);assert.equal(result.pp.f,10);
 for(const move of ['A','B','C','D']){const key=lookup(move).id;if(result.moves.includes(move)){assert.equal(result.pp[key],mon.pp[key]);assert.equal(result.roguePPUps[key],mon.roguePPUps[key]);}else{assert.equal(result.pp[key],undefined);assert.equal(result.roguePPUps[key],undefined);}}
});
test('dream IV inheritance does not inflate newly registered dex IVs or mutate the input system',async()=>{
 const {weirdDreamIvs,recordWeirdDreamDex}=await import('../lib/rogue-weird-dream.mjs');const {makeReferenceMon}=await import('../lib/rogue-reference.mjs');const {ensureStarterSystem}=await import('../lib/rogue-starter-system.mjs');
 const zero=Object.fromEntries(['hp','atk','def','spa','spd','spe'].map(k=>[k,0])),perfect=Object.fromEntries(Object.keys(zero).map(k=>[k,31])),iv=weirdDreamIvs(zero,perfect,()=>0);assert.deepEqual(iv.dexIvs,zero);assert.deepEqual(iv.partyIvs,perfect);
 const mon=makeReferenceMon(4,20,{boxId:'new',moves:['Tackle'],ivs:iv.partyIvs}),system={};ensureStarterSystem(system);const before=structuredClone(system),result=recordWeirdDreamDex(system,mon,iv.dexIvs,2);
 assert.deepEqual(system,before);assert.equal(result.dex['4'].caught,true);assert.deepEqual(result.dex['4'].ivs,zero);assert.equal(result.starterData['4'].candies,1);assert.equal(result.starterData['4'].eggMask&4,4);
 assert.deepEqual(recordWeirdDreamDex(system,mon,iv.dexIvs,2,{forBattle:true}),before);
});
test('dream held modifiers are copied, including nontransferable effects, with fresh ownership',async()=>{
 const {copyWeirdDreamHeldModifiers,weirdDreamOldGateauStats}=await import('../lib/rogue-weird-dream.mjs');const held=[{id:'machobrace',boxId:'old',count:2,transferable:false},{id:'berrylum',boxId:'old',count:1},{id:'berrysitrus',boxId:'other',count:1}],before=structuredClone(held);
 assert.deepEqual(copyWeirdDreamHeldModifiers(held,'old','new'),[{id:'machobrace',boxId:'new',count:2,transferable:false},{id:'berrylum',boxId:'new',count:1}]);assert.deepEqual(held,before);
 assert.deepEqual(weirdDreamOldGateauStats({hp:50,spe:50,atk:40,spa:60,def:70,spd:50}),['spe','atk','spd']);assert.throws(()=>copyWeirdDreamHeldModifiers([{id:'x',boxId:'old',count:0}],'old','new'));
});
test('prepared dream member retains HP ratio, status and moves without changing either original',async()=>{
 const {buildWeirdDreamMember}=await import('../lib/rogue-weird-dream.mjs');const {makeReferenceMon}=await import('../lib/rogue-reference.mjs');
 const old=makeReferenceMon(4,35,{boxId:'old',moves:['Tackle'],nature:'hardy'});old.hp=Math.ceil(old.maxHp/3);old.status='poison';old.rogueStatusState={kind:'psn'};old.pp={tackle:3};old.pokerus=true;old.luck=2;
 const fresh=makeReferenceMon(7,35,{boxId:'new',moves:['Tackle'],nature:'hardy'}),oldCopy=structuredClone(old),freshCopy=structuredClone(fresh),lookup=name=>({Tackle:{id:'tackle',type:'Normal',pp:35},Surf:{id:'surf',type:'Water',pp:15},Protect:{id:'protect',type:'Normal',pp:10}})[name];
 const result=buildWeirdDreamMember(old,fresh,{eggMoves:['Protect'],generatedMoves:['Surf'],primaryType:'Water',newSecondType:'페어리',random:generator(17),lookup});
 assert.deepEqual(old,oldCopy);assert.deepEqual(fresh,freshCopy);assert.equal(result.mon.hp,Math.ceil(old.hp/old.maxHp*result.mon.maxHp));assert.equal(result.mon.status,'poison');assert.equal(result.mon.pokerus,true);assert.equal(result.mon.luck,2);assert.deepEqual(result.mon.types,['물','페어리']);assert.equal(result.mon.pp.tackle,3);assert.ok(result.mon.moves.includes('Protect'));assert.ok(result.mon.moves.includes('Surf'));
 const battle=buildWeirdDreamMember(old,fresh,{eggMoves:['Protect'],generatedMoves:['Surf'],primaryType:'Water',newSecondType:'페어리',random:generator(17),lookup,forBattle:true});assert.equal(battle.mon.hp,battle.mon.maxHp);assert.notEqual(battle.mon.status,'poison');
});
test('uncaught non-shiny high-BST dream form does not create a dex record or candy',async()=>{
 const {recordWeirdDreamDex}=await import('../lib/rogue-weird-dream.mjs');const {makeReferenceMon}=await import('../lib/rogue-reference.mjs');
 const mon=makeReferenceMon(151,20,{boxId:'new',shiny:false}),system={dex:{},starterData:{},marker:'preserved'},before=structuredClone(system),next=recordWeirdDreamDex(system,mon,mon.ivs,0);
 assert.deepEqual(system,before);assert.deepEqual(next,before);
});
test('second dream hidden-ability roll respects charm boundaries and skips unnecessary draws',async()=>{
 const {weirdDreamHiddenAbility}=await import('../lib/rogue-weird-dream.mjs');const abilities=[{slot:'primary',key:'a'},{slot:'hidden',key:'b'}];
 for(const [charms,denominator] of [[0,256],[1,64],[2,32],[3,16],[4,8]]){assert.equal(weirdDreamHiddenAbility(abilities,'primary',charms,()=>0).key,'b');assert.equal(weirdDreamHiddenAbility(abilities,'primary',charms,()=>1/denominator).key,'a');}
 assert.equal(weirdDreamHiddenAbility(abilities,'hidden',0,()=>{throw Error('unexpected draw');}).key,'b');
});
test('dream draft, transferred held items and account record survive JSON restoration independently',async()=>{
 const {buildWeirdDreamMember,copyWeirdDreamHeldModifiers,recordWeirdDreamDex}=await import('../lib/rogue-weird-dream.mjs');const {makeReferenceMon}=await import('../lib/rogue-reference.mjs');const {ensureStarterSystem}=await import('../lib/rogue-starter-system.mjs');
 const old=makeReferenceMon(4,30,{boxId:'old',moves:['Tackle']}),fresh=makeReferenceMon(7,30,{boxId:'new'}),system={};ensureStarterSystem(system);const before=structuredClone({old,system});const lookup=name=>({Tackle:{id:'tackle',type:'Normal',pp:35},Surf:{id:'surf',type:'Water',pp:15},Protect:{id:'protect',type:'Normal',pp:10}})[name];
 const draft=buildWeirdDreamMember(old,fresh,{eggMoves:['Protect'],generatedMoves:['Surf'],primaryType:'Water',newSecondType:'불꽃',random:generator(14),lookup});
 const held=copyWeirdDreamHeldModifiers([{id:'berrylum',boxId:'old',count:1}],'old','new'),account=recordWeirdDreamDex(system,draft.mon,draft.dexIvs,draft.eggMoveIndex),payload={draft,held,account};assert.deepEqual(JSON.parse(JSON.stringify(payload)),payload);assert.deepEqual({old,system},before);assert.equal(held[0].boxId,draft.mon.boxId);assert.equal(account.dex['7'].caught,true);
});
test('whole-party draft stages atomically and keeps the original run and account intact',async()=>{
 const {stageWeirdDreamParty}=await import('../lib/rogue-weird-dream.mjs');const {makeReferenceMon}=await import('../lib/rogue-reference.mjs');const {ensureStarterSystem}=await import('../lib/rogue-starter-system.mjs');
 const old=makeReferenceMon(4,20,{boxId:'old',item:''}),mon=makeReferenceMon(7,20,{boxId:'new',item:''}),system={};ensureStarterSystem(system);const run={party:[old],modifiers:[{id:'berrylum',boxId:'old',count:1},{id:'expcharm',count:1}],formItems:{},money:123},before=structuredClone({run,system}),drafts=[{oldBoxId:'old',mon,dexIvs:mon.ivs,eggMoveIndex:0}];
 const staged=stageWeirdDreamParty(run,system,drafts);assert.deepEqual({run,system},before);assert.equal(staged.run.party[0].boxId,'new');assert.equal(staged.run.modifiers.find(m=>m.id==='berrylum').boxId,'new');assert.equal(staged.run.money,123);assert.equal(staged.system.dex['7'].caught,true);assert.deepEqual(JSON.parse(JSON.stringify(staged)),staged);
 const unsafe=structuredClone(run);unsafe.party[0].item='leftovers';assert.throws(()=>stageWeirdDreamParty(unsafe,system,drafts));assert.deepEqual({run,system},before);const collision=structuredClone(run);collision.modifiers.push({id:'berrylum',boxId:'new',count:1});assert.throws(()=>stageWeirdDreamParty(collision,system,drafts));assert.deepEqual({run,system},before);
});
