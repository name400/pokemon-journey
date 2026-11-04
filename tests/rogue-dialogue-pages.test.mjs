import test from 'node:test';
import assert from 'node:assert/strict';
import {dialogueSegments,dialoguePosition} from '../lib/rogue-dialogue-pages.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {applyClassicAction,activeClassicRun,classicGameView} from '../lib/rogue-classic-game.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {starterCatalog} from '../lib/rogue-starter-system.mjs';
const pages=['오, 찾았다! 떠나려는 건 알고 있었지만 인사도 없이 가려는 건 아니겠지?\n함께 배틀을 해 보자.','다음 만남에서도 네 파트너와 함께 힘내! 🌟'];
test('new source-page rule keeps the entire original page intact',()=>{assert.deepEqual(dialogueSegments(pages[0],'source-pages-v1'),[pages[0]]);for(const rule of ['legacy','words-v1','source-pages-v1'])assert.equal(dialogueSegments(pages.join('\n'),rule).join(''),pages.join('\n'));});
test('UI pagination and the real next-message action agree across save/load for old and new rules',()=>{
 for(const rule of [undefined,'words-v1','source-pages-v1']){
  let doc={},state=ensureClassicState(doc);state.slots[0]={id:'dialogue-pagination',wave:1,screen:'battle',party:[makeReferenceMon(1,5)],pendingMoves:[],npcDialogueQueue:[{id:'entry',speaker:'라이벌',pages:[...pages],index:0,...(rule?{segmentRule:rule}:{})}]};
  const seen=[],text=[];let total;
  for(let step=0;step<100;step++){
   const entry=activeClassicRun(doc).npcDialogueQueue[0];if(!entry)break;
   const position=dialoguePosition(entry);total??=position.total;assert.equal(position.total,total);seen.push(position.current);text.push(position.text);
   applyClassicAction(doc,{action:'npcDialogueNext',dialogueId:entry.id,index:entry.index,segmentIndex:entry.segmentIndex||0});doc=JSON.parse(JSON.stringify(doc));
  }
  assert.deepEqual(seen,Array.from({length:total},(_,i)=>i+1));assert.equal(text.join(''),pages.join(''));assert.equal(activeClassicRun(doc).npcDialogueQueue.length,0);
 }
});
test('new trainer conversations use source page boundaries and stale page input is rejected',()=>{
 const doc={},state=ensureClassicState(doc,{initialStarterId:1}),starter=starterCatalog(state.system).find(s=>s.id===1);applyClassicAction(doc,{action:'start',selection:[{id:1,ability:starter.abilities[0].key,nature:starter.natures[0].key,gender:starter.genders[0],shiny:false,moves:starter.defaultMoves}]});
 const run=activeClassicRun(doc);run.seed='dialogue-test';run.rng=42;run.wave=4;run.screen='advance';run.party=[makeReferenceMon(150,100,{boxId:'tester',moves:['Ice Beam']})];applyClassicAction(doc,{action:'next'});
 const entry=run.npcDialogueQueue[0];assert.equal(entry.segmentRule,'legacy');assert.equal(entry.pageMode,'source-pages-v1');assert.equal(dialoguePosition(entry).total,entry.pages.length);
 const old={action:'npcDialogueNext',dialogueId:entry.id,index:entry.index,segmentIndex:0,dialogueProtocol:'source-pages-v1'};applyClassicAction(doc,old);assert.throws(()=>applyClassicAction(doc,old),/변경|진행 중/);
 classicGameView(doc);
});

function compatibleQueue(){const doc={},state=ensureClassicState(doc);state.slots[0]={id:'dialogue-compat',wave:1,screen:'battle',party:[makeReferenceMon(1,5)],pendingMoves:[],npcDialogueQueue:[{id:'compat-entry',speaker:'라이벌',pages:[...pages],index:0,segmentRule:'legacy',pageMode:'source-pages-v1'}]};return doc;}
test('a previously opened client can still read every segment from a new queue without losing text',()=>{const doc=compatibleQueue(),read=[];for(let step=0;step<100;step++){const entry=activeClassicRun(doc).npcDialogueQueue[0];if(!entry)break;read.push(dialogueSegments(entry.pages[entry.index],entry.segmentRule)[entry.segmentIndex||0]);applyClassicAction(doc,{action:'npcDialogueNext',dialogueId:entry.id,index:entry.index,segmentIndex:entry.segmentIndex||0});}assert.equal(read.join(''),pages.join(''));assert.equal(activeClassicRun(doc).npcDialogueQueue.length,0);});
test('after an older client reads a segment, the new UI shows the exact remainder and advances once',()=>{const doc=compatibleQueue();let entry=activeClassicRun(doc).npcDialogueQueue[0];const alreadyRead=dialogueSegments(entry.pages[0],entry.segmentRule)[0];applyClassicAction(doc,{action:'npcDialogueNext',dialogueId:entry.id,index:0,segmentIndex:0});entry=activeClassicRun(doc).npcDialogueQueue[0];assert.equal(entry.index,0);assert.equal(entry.segmentIndex,1);const position=dialoguePosition(entry);assert.equal(position.current,1);assert.equal(position.total,pages.length);assert.equal(alreadyRead+position.text,pages[0]);applyClassicAction(doc,{action:'npcDialogueNext',dialogueId:entry.id,index:0,segmentIndex:1,dialogueProtocol:'source-pages-v1'});entry=activeClassicRun(doc).npcDialogueQueue[0];assert.equal(entry.index,1);assert.equal(entry.segmentIndex,undefined);assert.equal(dialoguePosition(entry).text,pages[1]);});
test('a whole-page client without a segment field clears an old continuation when advancing',()=>{const doc=compatibleQueue(),entry=activeClassicRun(doc).npcDialogueQueue[0];entry.segmentIndex=1;applyClassicAction(doc,{action:'npcDialogueNext',dialogueId:entry.id,index:0});assert.equal(entry.index,1);assert.equal(entry.segmentIndex,undefined);assert.equal(dialoguePosition(entry).text,pages[1]);});
