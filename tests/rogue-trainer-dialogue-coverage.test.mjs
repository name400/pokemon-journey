import test from 'node:test';
import assert from 'node:assert/strict';
import index from '../data/rogue-trainer-dialogue-index.json' with {type:'json'};
import {classicTrainerDialogue,classicTrainerDialogueSourceStatus,resolveClassicTrainerDialogueReference,sourceDialoguePages} from '../lib/rogue-trainer-dialogue.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';
test('every source-indexed single and double reference resolves to its pinned Korean text',()=>{
 const refs=[...Object.values(index.trainers).flatMap(v=>v.flatMap(x=>Object.values(x).flat())),...Object.values(index.doubles).flatMap(x=>Object.values(x).flat())];
 assert.equal(Object.keys(index.trainers).length,252);assert.equal(refs.length,1380);
 for(const ref of refs)assert.ok(resolveClassicTrainerDialogueReference(ref)?.trim(),ref);
 assert.equal(resolveClassicTrainerDialogueReference('dialogue:notThere.encounter.1'),null);
});
test('trainers without original dialogue remain silent; unknown data stays explicitly unsupported',()=>{
 assert.equal(classicTrainerDialogueSourceStatus(222),'mapped');assert.equal(classicTrainerDialogueSourceStatus(17),'none-in-source');assert.equal(classicTrainerDialogueSourceStatus(9999),'unknown');
 assert.equal(classicTrainerDialogue({kind:'trainer',trainer:{id:17,name:'댄서'}},'intro'),null);
});
test('all trainer phases and source gender variants select exact source choices without changing combat RNG',()=>{
 for(const [id,variants]of Object.entries(index.trainers))for(const [variant,phases]of variants.entries())for(const [phase,sourcePhase]of [['intro','encounter'],['win','victory'],['loss','defeat']]){
  const encounter={kind:'trainer',rng:42,trainer:{id:Number(id),name:'원본 트레이너',variant}},before=JSON.stringify(encounter),out=classicTrainerDialogue(encounter,phase,{seed:'source-coverage',wave:100}),refs=(variant===1?phases[sourcePhase]:variants[0][sourcePhase])||variants[0][sourcePhase];
  assert.equal(JSON.stringify(encounter),before);if(!refs?.length){assert.equal(out,null);continue;}
  assert.ok(refs.some(ref=>JSON.stringify(sourceDialoguePages(resolveClassicTrainerDialogueReference(ref)))===JSON.stringify(out.pages)),`${id}/${variant}/${phase}`);
 }
});
test('Tate/Liza doubles use their paired dialogue rather than their alone-without-partner lines',()=>{
 for(const [id,key]of [[222,'tateLizaDouble'],[223,'lizaTateDouble']])for(const phase of ['intro','win']){
  const encounter={kind:'gym',doubles:true,trainer:{id,name:'풍 & 란'}},out=classicTrainerDialogue(encounter,phase);
  assert.ok(out.sourceKey.startsWith(key+'.'));assert.equal(out.speaker,'풍 & 란');
  assert.notEqual(out.sourceKey,classicTrainerDialogue({...encounter,doubles:false},phase)?.sourceKey);
 }
 assert.ok(classicTrainerDialogue({kind:'trainer',trainer:{id:63,name:'짧은 치마',variant:'female'}},'intro').sourceKey.startsWith('lass.'));
});
test('a naturally generated paired gym queues the new original dialogue before battle actions',()=>{
 let found=false;
 for(let seed=1;seed<=30&&!found;seed++){
  const doc={},state=ensureClassicState(doc),run={id:'source-paired-dialogue',seed:'pair',rng:seed*9973,wave:19,biome:22,biomeStep:9,gymStart:20,screen:'advance',npcDialogueRule:'source-v1',party:[makeReferenceMon(151,50,{boxId:'hero',moves:['Splash']})],modifiers:['lure','superlure','maxlure'].map(id=>({id,count:1,remaining:10})),tools:{},balls:{pokeball:5},money:1000,participants:[],awardedFoes:[],expNotices:[],pendingMoves:[],pendingGrowth:[],combat:null};state.slots[0]=run;
  applyClassicAction(doc,{action:'next'});if(![222,223].includes(run.encounter?.trainer?.id))continue;
  found=true;assert.equal(run.encounter.doubles,true);assert.match(run.npcDialogueQueue[0].sourceKey,/^(tateLizaDouble|lizaTateDouble)\.encounter$/);
  const view=classicGameView(doc);assert.ok(view.run.npcDialogueQueue[0].pages.length);assert.throws(()=>applyClassicAction(doc,{action:'turn',command:{type:'move',move:'splash'}}),/대화/);
  const copy=JSON.parse(JSON.stringify(doc));assert.deepEqual(copy.classic.slots[0].npcDialogueQueue,run.npcDialogueQueue);
 }
 assert.ok(found);
});
