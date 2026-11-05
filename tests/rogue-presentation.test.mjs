import test from 'node:test';
import assert from 'node:assert/strict';
import {classicBattlePresentationKey,classicDialoguePresentation} from '../lib/rogue-presentation.mjs';
import {createFixture} from './browser/ui-readability/fixture.mjs';
import {classicGameView,applyClassicAction,activeClassicRun} from '../lib/rogue-classic-game.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
test('real trainer intro stays visible while battle entry waits, even across dialogue-only save changes',()=>{
 const doc=createFixture('trainer'),view=classicGameView(doc),dialogue=view.run.npcDialogueQueue[0],key=classicBattlePresentationKey(view.run,view.battle);assert.equal(dialogue.phase,'intro');assert.deepEqual(classicDialoguePresentation(dialogue,view.battle,key,''),{visible:true,intro:true});
 const copy=JSON.parse(JSON.stringify(doc));activeClassicRun(copy).npcDialogueQueue[0].index++;const next=classicGameView(copy);assert.equal(classicBattlePresentationKey(next.run,next.battle),key);
});
test('real final damage and faint presentation precedes the victory queue through save recovery',async()=>{
 let doc=createFixture('victory');const before=classicGameView(doc),oldKey=classicBattlePresentationKey(before.run,before.battle);assert.equal(before.run.npcDialogueQueue.length,0);const result=applyClassicAction(doc,{action:'turn',command:{type:'move',move:'seismictoss'}});assert.ok(result.finishedBattle.events.some(e=>e.kind==='faint'));
 doc=await decodeGameData(await encodeGameData(doc));const view=classicGameView(doc),dialogue=view.run.npcDialogueQueue[0],battle=result.finishedBattle,key=classicBattlePresentationKey(view.run,battle);assert.equal(dialogue.phase,'win');assert.notEqual(key,oldKey);assert.equal(classicDialoguePresentation(dialogue,battle,key,oldKey).visible,false);assert.equal(classicDialoguePresentation(dialogue,battle,key,key).visible,true);assert.equal(classicBattlePresentationKey(view.run,JSON.parse(JSON.stringify(battle))),key);
});
test('nonbattle narration does not wait for playback and an entry knockout still allows its intro first',()=>{
 assert.equal(classicDialoguePresentation({phase:'outro'},null,'','').visible,true);assert.equal(classicDialoguePresentation({phase:'outro'},{events:[]},'new','old').visible,true);assert.equal(classicDialoguePresentation({phase:'intro'},{ended:true,events:[{kind:'faint'}]},'new','old').visible,true);assert.equal(classicDialoguePresentation({phase:''},{ended:true,events:[{kind:'faint'}]},'new','old').visible,false);
});
