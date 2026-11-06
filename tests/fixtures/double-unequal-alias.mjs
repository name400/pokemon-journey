import {activeLeadAliasFixture} from './active-lead-alias.mjs';
import {createClassicCombat} from '../../lib/rogue-battle-engine.mjs';
import {makeReferenceMon} from '../../lib/rogue-reference.mjs';
import {applyClassicAction} from '../../lib/rogue-classic-game.mjs';
export function doubleUnequalAliasFixture({boxId='one',separated=false,targetSlot=0}={}){
 const doc=activeLeadAliasFixture({boxId,kind:'trainer'}),run=doc.classic.slots[0];if(separated)run.party[0].moves=separated==='later'?['Growl','Tackle','몸통박치기']:['Tackle','Growl','몸통박치기'];if(targetSlot===1)run.party.reverse();run.party.push(makeReferenceMon(4,50,{boxId:'reserve',moves:['Splash']}));run.combat=createClassicCombat(run,[makeReferenceMon(143,30,{boxId:'foe1',moves:['Splash']}),makeReferenceMon(129,30,{boxId:'foe2',moves:['Splash']})],{trainer:true,doubles:true});run.party=run.combat.teams[0];
 const turn=command=>({type:'turn',actions:[command,{actor:1-targetSlot,type:'move',move:'splash'}]});const move=run.combat.requests[0].actors[targetSlot].moves.find(m=>m.id==='tackle');applyClassicAction(doc,{action:'turn',command:turn({actor:targetSlot,type:'move',move:'tackle',...(move.targets.length?{target:move.targets[0].target}:{})})});for(const id of ['reserve',boxId]){const choice=run.combat.requests[0].actors[targetSlot].switches.find(s=>run.party[s.index].boxId===id);if(!choice)throw Error('double test switch missing');applyClassicAction(doc,{action:'turn',command:turn({actor:targetSlot,type:'switch',slot:choice.slot})});}return doc;
}
