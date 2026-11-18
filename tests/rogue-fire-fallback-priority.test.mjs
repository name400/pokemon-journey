import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {previewClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {classicMysteryCalmTarget} from '../lib/rogue-mystery.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

const mon=(id,boxId,ability)=>makeReferenceMon(id,20,{boxId,moves:['Tackle'],...(ability?{ability}:{})});
test('modern fallback prefers a living fire type over an earlier resistant ability',async()=>{
 const fused=previewClassicDnaFusion(mon(10,'primary'),mon(7,'donor'),{random:()=>0}).fused;
 let {doc,run}=fixture([mon(143,'snorlax','thickfat'),mon(58,'fire'),fused]);
 Object.assign(run,{wave:42,biome:18,screen:'mystery',encounter:{kind:'mystery',key:'fiery-fallout'},mystery:{type:'fiery-fallout',stage:'choose',selection:null},mysteryRule:'part-timer-v19',mysteryGuideFireRule:'source-subset-v2',mysteryFireMixedRule:'source-subset-v1',challengeEligibilityRule:'source-subset-v1',challenges:[{id:1,value:11,severity:0}]});
 assert.equal(classicMysteryCalmTarget(run)?.boxId,'fire');
 applyClassicAction(doc,{action:'mysterySelect',job:'calm',boxId:'fire'});
 doc=await decodeGameData(await encodeGameData(doc));run=doc.classic.slots[0];
 assert.equal(run.mystery.selection.boxId,'fire');applyClassicAction(doc,{action:'mysteryConfirm'});assert.equal(run.screen,'reward');
 assert.ok(run.expNotices.some(e=>e.boxId==='fire'));assert.deepEqual(doc.adventure,{safe:true});assert.equal(doc.classic.slots[1].id,'other');
});
test('unverified or older fallback parties keep their existing selection',()=>{
 const fused=previewClassicDnaFusion(mon(10,'primary'),mon(7,'donor'),{random:()=>0}).fused;
 const {run}=fixture([mon(143,'snorlax','thickfat'),mon(58,'fire'),fused]);
 Object.assign(run,{mystery:{type:'fiery-fallout',stage:'choose'},mysteryGuideFireRule:'source-subset-v2',mysteryFireMixedRule:'source-subset-v1'});
 run.party[2]=structuredClone(fused);run.party[2].rogueTypes=['Fire'];assert.equal(classicMysteryCalmTarget(run)?.boxId,'snorlax');
 run.party[2]=fused;run.party[0].hp=0;assert.equal(classicMysteryCalmTarget(run)?.boxId,'fire');
 run.party[0]=mon(143,'snorlax','thickfat');delete run.mysteryGuideFireRule;assert.equal(classicMysteryCalmTarget(run)?.boxId,'snorlax');
});
