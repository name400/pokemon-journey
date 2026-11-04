import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {previewClassicDnaFusion,previewClassicDnaUnsplice} from '../lib/rogue-dna-fusion.mjs';
import {classicEvolutionOptions,evolveClassicPokemon} from '../lib/rogue-evolution.mjs';
import {classicChallengeBattleEligibility} from '../lib/rogue-challenge-eligibility.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
const mon=(id,boxId)=>makeReferenceMon(id,30,{boxId,moves:['Tackle']});
test('primary evolution keeps donor ability, fused types and unsplice data through save',async()=>{
 const a=mon(1,'a'),b=mon(7,'b'),f=previewClassicDnaFusion(a,b,{random:()=>0}).fused,run={screen:'reward',party:[f,mon(4,'c')],modifiers:[],evolutionItems:{},balls:{},pendingMoves:[]},other={safe:true};const key=classicEvolutionOptions(f,run,{}).find(x=>x.sourceId===2).key;const out=evolveClassicPokemon(run,{}, {boxId:'a',evolutionKey:key});assert.equal(out.after.rogueSourceId,2);assert.equal(out.after.fusionSpecies,7);assert.equal(out.after.ability,'torrent');assert.deepEqual(out.after.rogueTypes,['풀','물']);assert.equal(out.after.rogueFusion.primaryAbility,'overgrow');assert.equal(classicChallengeBattleEligibility(out.after,[{id:0,value:1}]),true);const doc=await decodeGameData(await encodeGameData({classic:{slots:[run,other]},adventure:{safe:true}}));assert.deepEqual(doc.classic.slots[1],other);const restored=previewClassicDnaUnsplice(doc.classic.slots[0].party[0]);assert.equal(restored.primary.rogueSourceId,2);assert.equal(restored.primary.ability,'overgrow');assert.deepEqual(restored.primary.rogueTypes,['풀','독']);assert.equal(restored.donorRestored,false);
});
test('unsupported fusion evolution rejects without altering the party',()=>{const f=previewClassicDnaFusion(mon(290,'a'),mon(7,'b'),{random:()=>0}).fused,run={screen:'reward',party:[f],modifiers:[],evolutionItems:{},balls:{pokeball:1},pendingMoves:[]},before=structuredClone(run),key=classicEvolutionOptions(f,run,{}).find(x=>x.sourceId===291).key;assert.throws(()=>evolveClassicPokemon(run,{}, {boxId:'a',evolutionKey:key}),/지원/);assert.deepEqual(run,before);});
